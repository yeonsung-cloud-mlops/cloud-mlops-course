const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      const roomId = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
      const teacherKey = crypto.randomUUID();
      const room = env.CLASSROOMS.getByName(roomId);
      const initialized = await room.fetch("https://classroom.internal/init", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teacherKey }),
      });
      if (!initialized.ok) return json({ error: "수업을 만들지 못했습니다." }, 500);
      return json({ roomId, teacherKey }, 201);
    }

    const match = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/ws$/i);
    if (match) {
      const roomId = match[1].toUpperCase();
      const room = env.CLASSROOMS.getByName(roomId);
      const target = new URL("https://classroom.internal/ws");
      target.search = url.search;
      return room.fetch(new Request(target, request));
    }

    if (url.pathname.startsWith("/api/")) return json({ error: "요청 경로를 찾지 못했습니다." }, 404);
    return env.ASSETS.fetch(request);
  },
};

export class Classroom {
  constructor(ctx) {
    this.ctx = ctx;
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/init") {
      if (await this.ctx.storage.get("teacherKey")) return json({ error: "이미 사용 중인 수업 코드입니다." }, 409);
      const { teacherKey } = await request.json();
      const state = { slide: 0, revealed: false, timerEnd: null, deck: "week01", revision: 1 };
      await this.ctx.storage.put({ teacherKey, state });
      await this.ctx.storage.setAlarm(Date.now() + 12 * 60 * 60 * 1000);
      return json({ ok: true });
    }

    if (url.pathname !== "/ws" || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket 연결이 필요합니다.", { status: 426 });
    }

    const requestedRole = url.searchParams.get("role") === "teacher" ? "teacher" : "student";
    const teacherKey = await this.ctx.storage.get("teacherKey");
    if (!teacherKey) return new Response("수업 코드가 없거나 만료되었습니다.", { status: 404 });
    if (requestedRole === "teacher" && url.searchParams.get("key") !== teacherKey) {
      return new Response("강사용 키가 올바르지 않습니다.", { status: 403 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ role: requestedRole, completed: false, joinedAt: Date.now() });
    const state = await this.ctx.storage.get("state");
    server.send(JSON.stringify({ type: "state", state }));
    this.broadcastPresence();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    let payload;
    try { payload = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message)); }
    catch { return; }

    const connection = ws.deserializeAttachment() || { role: "student", completed: false };
    if (payload.type === "complete" && connection.role === "student") {
      connection.completed = Boolean(payload.completed);
      ws.serializeAttachment(connection);
      this.broadcastPresence();
      return;
    }

    if (payload.type !== "control" || connection.role !== "teacher") return;
    const current = await this.ctx.storage.get("state");
    const next = {
      ...current,
      slide: Number.isInteger(payload.slide) ? Math.max(0, Math.min(11, payload.slide)) : current.slide,
      revealed: typeof payload.revealed === "boolean" ? payload.revealed : current.revealed,
      timerEnd: payload.timerEnd === null || Number.isFinite(payload.timerEnd) ? payload.timerEnd : current.timerEnd,
      revision: current.revision + 1,
    };
    if (next.slide !== current.slide) next.revealed = false;
    await this.ctx.storage.put("state", next);
    await this.ctx.storage.setAlarm(Date.now() + 12 * 60 * 60 * 1000);
    this.broadcast({ type: "state", state: next });
  }

  webSocketClose() { this.broadcastPresence(); }
  webSocketError() { this.broadcastPresence(); }

  broadcast(payload) {
    const message = JSON.stringify(payload);
    for (const socket of this.ctx.getWebSockets()) {
      try { socket.send(message); } catch { /* closed socket */ }
    }
  }

  broadcastPresence() {
    const connections = this.ctx.getWebSockets().map(socket => socket.deserializeAttachment() || {});
    const students = connections.filter(item => item.role === "student");
    this.broadcast({
      type: "presence",
      students: students.length,
      completed: students.filter(item => item.completed).length,
      teachers: connections.filter(item => item.role === "teacher").length,
    });
  }

  async alarm() {
    this.broadcast({ type: "expired" });
    for (const socket of this.ctx.getWebSockets()) socket.close(1000, "수업이 종료되었습니다.");
    await this.ctx.storage.deleteAll();
  }
}
