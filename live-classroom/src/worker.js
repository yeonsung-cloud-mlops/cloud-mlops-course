const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

const deckSlideCounts = { week01: 94, week02: 37, week03: 36, week04: 36, week05: 35, week06: 37, week07: 37, week08: 72, week09: 31, week10: 68, week11: 51, week12: 46, week13: 47, week14: 42, week15: 47 };
const registryName = "__active_classrooms__";
const roomLifetime = 8 * 7 * 24 * 60 * 60 * 1000;
const publicActivitySources = new Set(["week01:10"]);

const cleanName = value => String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
const cleanStudentId = value => String(value || "").trim();

function privateCohorts(env) {
  try {
    const cohorts = JSON.parse(env.STUDENT_COHORTS_JSON || "[]");
    return Array.isArray(cohorts) ? cohorts.filter(cohort => cohort && /^[a-zA-Z0-9_-]{1,24}$/.test(String(cohort.id || "")) && Array.isArray(cohort.roster)) : [];
  } catch { return []; }
}

function instructorAuthorized(request, env) {
  if (!env.INSTRUCTOR_ACCESS_CODE) return false;
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") && authorization.slice(7) === env.INSTRUCTOR_ACCESS_CODE;
}

async function registerRoom(env, room) {
  const registry = env.CLASSROOMS.getByName(registryName);
  return registry.fetch("https://classroom.internal/registry/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(room),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/demo/predict") {
      const body = await request.json().catch(() => ({}));
      const originalPrice = Number(body.originalPrice);
      const years = Number(body.years);
      const battery = Number(body.battery);
      if (![originalPrice, years, battery].every(Number.isFinite) || originalPrice <= 0 || years < 0 || battery < 0 || battery > 100) {
        return json({ error: "입력값을 확인해 주세요." }, 400);
      }
      const calculatedPrice = Math.max(90000, Math.round(originalPrice * Math.pow(0.78, years) * (0.72 + battery / 350) * 0.88 / 10000) * 10000);
      return json({
        calculatedPrice,
        calculatorVersion: "rule-demo-v2",
        modelUsed: false,
        requestId: crypto.randomUUID(),
        processedAt: new Date().toISOString(),
      });
    }

    if (url.pathname.startsWith("/api/instructor/") || (request.method === "POST" && url.pathname === "/api/rooms")) {
      if (!env.INSTRUCTOR_ACCESS_CODE) return json({ error: "강사 접근 코드가 아직 설정되지 않았습니다." }, 503);
      if (!instructorAuthorized(request, env)) return json({ error: "강사 접근 코드가 올바르지 않습니다." }, 401);
    }

    if (request.method === "GET" && url.pathname === "/api/instructor/rooms") {
      const registry = env.CLASSROOMS.getByName(registryName);
      const response = await registry.fetch("https://classroom.internal/registry/list");
      const { rooms = [] } = await response.json();
      const active = (await Promise.all(rooms.map(async room => {
        const classroom = env.CLASSROOMS.getByName(room.roomId);
        const summary = await classroom.fetch(`https://classroom.internal/summary?key=${encodeURIComponent(room.teacherKey)}`);
        if (!summary.ok) return null;
        return { ...room, ...(await summary.json()) };
      }))).filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
      return json({ rooms: active });
    }

    if (request.method === "GET" && url.pathname === "/api/instructor/cohorts") {
      return json({ cohorts: privateCohorts(env).map(cohort => ({ id: cohort.id, label: cleanName(cohort.label), count: cohort.roster.length })) });
    }

    if (request.method === "POST" && url.pathname === "/api/instructor/register") {
      const body = await request.json().catch(() => ({}));
      const roomId = String(body.roomId || "").trim().toUpperCase();
      const teacherKey = String(body.teacherKey || "").trim();
      if (!/^[A-Z0-9]{6}$/.test(roomId) || !teacherKey) return json({ error: "수업 코드와 강사용 키를 확인해 주세요." }, 400);
      const classroom = env.CLASSROOMS.getByName(roomId);
      const summary = await classroom.fetch(`https://classroom.internal/summary?key=${encodeURIComponent(teacherKey)}`);
      if (!summary.ok) return json({ error: "수업을 찾지 못했거나 강사용 키가 올바르지 않습니다." }, summary.status === 404 ? 404 : 403);
      const details = await summary.json();
      await registerRoom(env, { roomId, teacherKey, createdAt: details.createdAt || Date.now() });
      return json({ room: { roomId, teacherKey, ...details } }, 201);
    }

    if (request.method === "POST" && url.pathname === "/api/rooms") {
      const body = await request.json().catch(() => ({}));
      const cohort = privateCohorts(env).find(item => item.id === String(body.cohortId || ""));
      if (!cohort) return json({ error: "등록된 반 명단을 찾지 못했습니다." }, 400);
      const roomId = crypto.randomUUID().replaceAll("-", "").slice(0, 6).toUpperCase();
      const teacherKey = crypto.randomUUID();
      const room = env.CLASSROOMS.getByName(roomId);
      const initialized = await room.fetch("https://classroom.internal/init", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ teacherKey, cohort }),
      });
      if (!initialized.ok) return json({ error: "수업을 만들지 못했습니다." }, 500);
      const createdAt = Date.now();
      await registerRoom(env, { roomId, teacherKey, createdAt });
      return json({ roomId, teacherKey, createdAt, className: cleanName(cohort.label), rosterCount: cohort.roster.length }, 201);
    }

    const joinMatch = url.pathname.match(/^\/api\/rooms\/([A-Z0-9]{6})\/join$/i);
    if (joinMatch && request.method === "POST") {
      const room = env.CLASSROOMS.getByName(joinMatch[1].toUpperCase());
      const response = await room.fetch("https://classroom.internal/authorize-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(await request.json().catch(() => ({}))),
      });
      return new Response(response.body, response);
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
    if (url.pathname === "/registry/register" && request.method === "POST") {
      const room = await request.json();
      const rooms = await this.ctx.storage.get("registryRooms") || {};
      const cutoff = Date.now() - roomLifetime;
      for (const [id, item] of Object.entries(rooms)) if (!item.createdAt || item.createdAt < cutoff) delete rooms[id];
      rooms[room.roomId] = { roomId: room.roomId, teacherKey: room.teacherKey, createdAt: room.createdAt || Date.now() };
      await this.ctx.storage.put("registryRooms", rooms);
      return json({ ok: true });
    }

    if (url.pathname === "/registry/list" && request.method === "GET") {
      const rooms = await this.ctx.storage.get("registryRooms") || {};
      const cutoff = Date.now() - roomLifetime;
      let changed = false;
      for (const [id, item] of Object.entries(rooms)) if (!item.createdAt || item.createdAt < cutoff) { delete rooms[id]; changed = true; }
      if (changed) await this.ctx.storage.put("registryRooms", rooms);
      return json({ rooms: Object.values(rooms) });
    }

    if (request.method === "POST" && url.pathname === "/init") {
      if (await this.ctx.storage.get("teacherKey")) return json({ error: "이미 사용 중인 수업 코드입니다." }, 409);
      const { teacherKey, cohort } = await request.json();
      if (!cohort?.label || !Array.isArray(cohort.roster) || !cohort.roster.length) return json({ error: "반 명단이 필요합니다." }, 400);
      const state = { slide: 0, revealed: false, showResponses: false, timerEnd: null, deck: "week01", revision: 1 };
      const createdAt = Date.now();
      const expiresAt = createdAt + roomLifetime;
      const roster = cohort.roster.map(item => ({ studentId: cleanStudentId(item.studentId), name: cleanName(item.name) }));
      await this.ctx.storage.put({ teacherKey, state, createdAt, expiresAt, className: cleanName(cohort.label), roster });
      await this.ctx.storage.setAlarm(expiresAt);
      return json({ ok: true });
    }

    if (request.method === "POST" && url.pathname === "/authorize-student") {
      const roster = await this.ctx.storage.get("roster");
      if (!roster) return json({ error: "수업을 찾지 못했거나 만료되었습니다." }, 404);
      const body = await request.json().catch(() => ({}));
      const studentId = cleanStudentId(body.studentId);
      const suppliedName = cleanName(body.name);
      const clientId = String(body.clientId || "").trim();
      const registered = roster.find(item => item.studentId === studentId);
      if (!/^\d{8,12}$/.test(studentId) || !suppliedName || !/^[a-zA-Z0-9-]{8,64}$/.test(clientId)) {
        return json({ error: "학번과 이름을 확인해 주세요." }, 400);
      }
      const admittedName = registered?.name || suppliedName;
      const joinTokens = await this.ctx.storage.get("joinTokens") || {};
      const now = Date.now();
      for (const [token, item] of Object.entries(joinTokens)) if (item.expiresAt < now) delete joinTokens[token];
      const token = crypto.randomUUID();
      const expiresAt = await this.ctx.storage.get("expiresAt");
      joinTokens[token] = { studentId, name: admittedName, clientId, expiresAt };
      await this.ctx.storage.put("joinTokens", joinTokens);
      return json({ token, name: admittedName, className: await this.ctx.storage.get("className"), expiresAt });
    }

    if (request.method === "GET" && url.pathname === "/summary") {
      const teacherKey = await this.ctx.storage.get("teacherKey");
      if (!teacherKey) return json({ error: "수업을 찾지 못했습니다." }, 404);
      if (url.searchParams.get("key") !== teacherKey) return json({ error: "강사용 키가 올바르지 않습니다." }, 403);
      const state = await this.ctx.storage.get("state");
      const connections = this.ctx.getWebSockets().map(socket => socket.deserializeAttachment() || {});
      const createdAt = await this.ctx.storage.get("createdAt");
      const expiresAt = await this.ctx.storage.get("expiresAt") || createdAt + roomLifetime;
      await this.ctx.storage.put("expiresAt", expiresAt);
      await this.ctx.storage.setAlarm(expiresAt);
      return json({
        createdAt,
        expiresAt,
        state,
        className: await this.ctx.storage.get("className") || "",
        rosterCount: (await this.ctx.storage.get("roster") || []).length,
        students: connections.filter(item => item.role === "student").length,
        attendance: Object.keys(await this.ctx.storage.get("students") || {}).length,
        teachers: connections.filter(item => item.role === "teacher").length,
        presenters: connections.filter(item => item.role === "presenter").length,
      });
    }

    if (url.pathname !== "/ws" || request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("WebSocket 연결이 필요합니다.", { status: 426 });
    }

    const roleParam = url.searchParams.get("role");
    const requestedRole = roleParam === "teacher" ? "teacher" : roleParam === "presenter" ? "presenter" : "student";
    const teacherKey = await this.ctx.storage.get("teacherKey");
    if (!teacherKey) return new Response("수업 코드가 없거나 만료되었습니다.", { status: 404 });
    if (requestedRole === "teacher" && url.searchParams.get("key") !== teacherKey) {
      return new Response("강사용 키가 올바르지 않습니다.", { status: 403 });
    }
    let verifiedStudent = null;
    if (requestedRole === "student") {
      const token = url.searchParams.get("token") || "";
      const joinTokens = await this.ctx.storage.get("joinTokens") || {};
      verifiedStudent = joinTokens[token];
      if (!verifiedStudent || verifiedStudent.expiresAt < Date.now()) return new Response("입장 인증이 없거나 만료되었습니다.", { status: 403 });
    }
    const createdAt = await this.ctx.storage.get("createdAt");
    const expiresAt = await this.ctx.storage.get("expiresAt") || createdAt + roomLifetime;
    await this.ctx.storage.put("expiresAt", expiresAt);
    await this.ctx.storage.setAlarm(expiresAt);

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.ctx.acceptWebSocket(server);
    const state = await this.ctx.storage.get("state");
    const attachment = verifiedStudent
      ? { role: "student", completed: false, participantId: verifiedStudent.clientId, clientId: verifiedStudent.clientId, studentId: verifiedStudent.studentId, name: verifiedStudent.name, joinedAt: Date.now() }
      : { role: requestedRole, completed: false, participantId: crypto.randomUUID().slice(0, 8), joinedAt: Date.now() };
    server.serializeAttachment(attachment);
    if (verifiedStudent) {
      const now = Date.now();
      await this.updateStudent(verifiedStudent.clientId, verifiedStudent.name, student => {
        student.studentId = verifiedStudent.studentId;
        student.firstJoinedAt ||= now;
        student.lastActiveAt = now;
        this.addUnique(student.visitedSlides, this.slideKey(state));
      });
      await this.sendMyQuestions(server, verifiedStudent.clientId);
      await this.broadcastDashboard();
    }
    server.send(JSON.stringify({ type: "state", state }));
    server.send(JSON.stringify(await this.teamPayload({ role: requestedRole })));
    const publishedSummary = await this.publishedActivityForReview(state.deck, state.slide);
    if (publishedSummary) server.send(JSON.stringify(publishedSummary));
    if (requestedRole !== "student") server.send(JSON.stringify({ type: "activity", deck: state.deck, slide: state.slide, responses: await this.activityFor(state.deck, state.slide, requestedRole === "presenter") }));
    if (requestedRole === "teacher") server.send(JSON.stringify(await this.dashboardPayload()));
    await this.broadcastPresence();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, message) {
    let payload;
    try { payload = JSON.parse(typeof message === "string" ? message : new TextDecoder().decode(message)); }
    catch { return; }

    const connection = ws.deserializeAttachment() || { role: "student", completed: false };
    if (payload.type === "identify" && connection.role === "student") {
      if (connection.studentId) return;
      const clientId = String(payload.clientId || "").trim();
      const name = String(payload.name || "").trim().replace(/\s+/g, " ").slice(0, 24);
      if (!/^[a-zA-Z0-9-]{8,64}$/.test(clientId) || !name) return;
      const now = Date.now();
      ws.serializeAttachment({ ...connection, clientId, participantId: clientId, name, joinedAt: connection.joinedAt || now });
      const state = await this.ctx.storage.get("state");
      await this.updateStudent(clientId, name, student => {
        student.firstJoinedAt ||= now;
        student.lastActiveAt = now;
        this.addUnique(student.visitedSlides, this.slideKey(state));
      });
      await this.sendMyQuestions(ws, clientId);
      await this.broadcastDashboard();
      await this.broadcastPresence();
      return;
    }

    if (payload.type === "team" && connection.role === "student" && connection.clientId) {
      await this.handleStudentTeamAction(ws, connection, payload);
      return;
    }

    if (payload.type === "team-admin" && connection.role === "teacher") {
      await this.handleTeacherTeamAction(ws, payload);
      return;
    }

    if (payload.type === "complete" && connection.role === "student") {
      connection.completed = Boolean(payload.completed);
      ws.serializeAttachment(connection);
      if (connection.clientId) {
        const current = await this.ctx.storage.get("state");
        await this.updateStudent(connection.clientId, connection.name, student => {
          student.lastActiveAt = Date.now();
          if (connection.completed) this.addUnique(student.completedSlides, this.slideKey(current));
        });
        await this.broadcastDashboard();
      }
      await this.broadcastPresence();
      return;
    }

    if (payload.type === "activity" && connection.role === "student") {
      const current = await this.ctx.storage.get("state");
      if (payload.deck !== current.deck || payload.slide !== current.slide || !payload.fields || typeof payload.fields !== "object") return;
      const storageKey = `activity:${current.deck}:${current.slide}`;
      const responses = await this.ctx.storage.get(storageKey) || {};
      const cleanFields = Object.fromEntries(Object.entries(payload.fields).slice(0, 24).map(([key, value]) => [String(key).slice(0, 40), String(value).trim().slice(0, 120)]));
      responses[connection.participantId] = { name: connection.name || "이름 미입력", fields: cleanFields, updatedAt: Date.now() };
      await this.ctx.storage.put(storageKey, responses);
      await this.broadcastActivity(current.deck, current.slide);
      if (connection.clientId) {
        await this.updateStudent(connection.clientId, connection.name, student => {
          student.lastActiveAt = Date.now();
          this.addUnique(student.responseSlides, this.slideKey(current));
        });
        await this.broadcastDashboard();
      }
      await this.broadcastPresence();
      return;
    }

    if (payload.type === "question" && connection.role === "student" && connection.clientId) {
      const text = String(payload.text || "").trim().replace(/\s+/g, " ").slice(0, 300);
      const current = await this.ctx.storage.get("state");
      if (!text || payload.deck !== current.deck || payload.slide !== current.slide) return;
      const questions = await this.ctx.storage.get("questions") || [];
      questions.push({ id: crypto.randomUUID(), clientId: connection.clientId, name: connection.name, text, deck: current.deck, slide: current.slide, createdAt: Date.now(), answer: "", answeredAt: null });
      await this.ctx.storage.put("questions", questions.slice(-150));
      await this.updateStudent(connection.clientId, connection.name, student => { student.lastActiveAt = Date.now(); student.questionCount = (student.questionCount || 0) + 1; });
      await this.sendMyQuestions(ws, connection.clientId);
      await this.broadcastDashboard();
      return;
    }

    if (payload.type === "answer-question" && connection.role === "teacher") {
      const questionId = String(payload.questionId || "");
      const answer = String(payload.answer || "").trim().replace(/\s+/g, " ").slice(0, 500);
      if (!questionId || !answer) return;
      const questions = await this.ctx.storage.get("questions") || [];
      const question = questions.find(item => item.id === questionId);
      if (!question) return;
      question.answer = answer;
      question.answeredAt = Date.now();
      await this.ctx.storage.put("questions", questions);
      await this.broadcastDashboard();
      await this.broadcastStudentQuestions(question.clientId);
      return;
    }

    if (payload.type !== "control" || connection.role !== "teacher") return;
    const current = await this.ctx.storage.get("state");
    const deck = typeof payload.deck === "string" && deckSlideCounts[payload.deck] ? payload.deck : current.deck;
    const maxSlide = deckSlideCounts[deck] - 1;
    const next = {
      ...current,
      deck,
      slide: Number.isInteger(payload.slide) ? Math.max(0, Math.min(maxSlide, payload.slide)) : Math.min(current.slide, maxSlide),
      revealed: typeof payload.revealed === "boolean" ? payload.revealed : current.revealed,
      showResponses: typeof payload.showResponses === "boolean" ? payload.showResponses : current.showResponses,
      timerEnd: payload.timerEnd === null || Number.isFinite(payload.timerEnd) ? payload.timerEnd : current.timerEnd,
      revision: current.revision + 1,
    };
    const moved = next.deck !== current.deck || next.slide !== current.slide;
    if (moved) { next.revealed = false; next.showResponses = false; }
    await this.ctx.storage.put("state", next);
    const createdAt = await this.ctx.storage.get("createdAt");
    await this.ctx.storage.setAlarm(await this.ctx.storage.get("expiresAt") || createdAt + roomLifetime);
    this.broadcast({ type: "state", state: next });
    if (moved) {
      if (publicActivitySources.has(`${current.deck}:${current.slide}`)) {
        const summary = await this.buildPublicActivitySummary(current.deck, current.slide);
        await this.ctx.storage.put(`published-activity:${current.deck}:${current.slide}`, summary);
        this.broadcast(summary);
      }
      for (const socket of this.ctx.getWebSockets()) {
        const attachment = socket.deserializeAttachment() || {};
        if (attachment.role === "student" && attachment.completed) socket.serializeAttachment({ ...attachment, completed: false });
      }
      await this.broadcastActivity(next.deck, next.slide);
      await this.markViewedForConnectedStudents(next);
      await this.broadcastDashboard();
      await this.broadcastPresence();
    }
  }

  async webSocketClose() { await this.broadcastDashboard(); await this.broadcastPresence(); }
  async webSocketError() { await this.broadcastDashboard(); await this.broadcastPresence(); }

  broadcast(payload) {
    const message = JSON.stringify(payload);
    for (const socket of this.ctx.getWebSockets()) {
      try { socket.send(message); } catch { /* closed socket */ }
    }
  }

  broadcastToRoles(payload, roles) {
    const message = JSON.stringify(payload);
    for (const socket of this.ctx.getWebSockets()) {
      const connection = socket.deserializeAttachment() || {};
      if (!roles.includes(connection.role)) continue;
      try { socket.send(message); } catch { /* closed socket */ }
    }
  }

  slideKey(state) { return state ? `${state.deck}:${state.slide}` : ""; }

  addUnique(list, value) {
    if (value && !list.includes(value)) list.push(value);
  }

  async getTeamState() {
    const stored = await this.ctx.storage.get("teams") || {};
    return { locked: Boolean(stored.locked), items: stored.items && typeof stored.items === "object" ? stored.items : {} };
  }

  cleanTeamName(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 24);
  }

  resetTeam(team) {
    team.readyIds = [];
    team.confirmed = false;
  }

  removeMember(teamState, clientId) {
    for (const [teamId, team] of Object.entries(teamState.items)) {
      if (!team.memberIds?.includes(clientId)) continue;
      team.memberIds = team.memberIds.filter(id => id !== clientId);
      this.resetTeam(team);
      if (!team.memberIds.length) delete teamState.items[teamId];
    }
  }

  teamCode(teamState) {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const used = new Set(Object.values(teamState.items).map(team => team.code));
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const bytes = crypto.getRandomValues(new Uint8Array(4));
      const code = Array.from(bytes, value => alphabet[value % alphabet.length]).join("");
      if (!used.has(code)) return code;
    }
    return crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  }

  async sendTeamError(ws, message) {
    try { ws.send(JSON.stringify({ type: "team-error", message })); } catch { /* closed socket */ }
  }

  async handleStudentTeamAction(ws, connection, payload) {
    const teamState = await this.getTeamState();
    if (teamState.locked) return this.sendTeamError(ws, "강사가 팀 구성을 잠갔습니다.");
    const action = String(payload.action || "");
    if (action === "create") {
      const name = this.cleanTeamName(payload.name);
      if (!name) return this.sendTeamError(ws, "팀 이름을 입력해 주세요.");
      this.removeMember(teamState, connection.clientId);
      const id = crypto.randomUUID().slice(0, 8);
      teamState.items[id] = { id, code: this.teamCode(teamState), name, memberIds: [connection.clientId], readyIds: [], confirmed: false, createdAt: Date.now() };
    } else if (action === "join") {
      const code = String(payload.code || "").trim().toUpperCase();
      const team = Object.values(teamState.items).find(item => item.code === code);
      if (!team) return this.sendTeamError(ws, "팀 코드를 찾지 못했습니다.");
      if (team.memberIds.includes(connection.clientId)) return;
      if (team.memberIds.length >= 4 && !team.memberIds.includes(connection.clientId)) return this.sendTeamError(ws, "이미 네 명이 참여한 팀입니다.");
      this.removeMember(teamState, connection.clientId);
      team.memberIds.push(connection.clientId);
      this.resetTeam(team);
    } else if (action === "leave") {
      this.removeMember(teamState, connection.clientId);
    } else if (action === "ready") {
      const team = Object.values(teamState.items).find(item => item.memberIds?.includes(connection.clientId));
      if (!team) return this.sendTeamError(ws, "먼저 팀을 만들거나 참여해 주세요.");
      team.readyIds ||= [];
      if (payload.ready) this.addUnique(team.readyIds, connection.clientId);
      else team.readyIds = team.readyIds.filter(id => id !== connection.clientId);
      team.confirmed = team.memberIds.length >= 3 && team.memberIds.length <= 4 && team.memberIds.every(id => team.readyIds.includes(id));
    } else return;
    await this.ctx.storage.put("teams", teamState);
    await this.broadcastTeams();
    await this.broadcastDashboard();
  }

  async handleTeacherTeamAction(ws, payload) {
    const teamState = await this.getTeamState();
    const action = String(payload.action || "");
    if (action === "lock") {
      teamState.locked = Boolean(payload.locked);
    } else if (action === "create") {
      const name = this.cleanTeamName(payload.name);
      if (!name) return this.sendTeamError(ws, "팀 이름을 입력해 주세요.");
      const id = crypto.randomUUID().slice(0, 8);
      teamState.items[id] = { id, code: this.teamCode(teamState), name, memberIds: [], readyIds: [], confirmed: false, createdAt: Date.now() };
    } else if (action === "assign") {
      const clientId = String(payload.clientId || "");
      const target = payload.teamId ? teamState.items[String(payload.teamId)] : null;
      if (target?.memberIds.includes(clientId)) return;
      if (target && target.memberIds.length >= 4 && !target.memberIds.includes(clientId)) return this.sendTeamError(ws, "대상 팀에 이미 네 명이 있습니다.");
      this.removeMember(teamState, clientId);
      if (target) { target.memberIds.push(clientId); this.resetTeam(target); }
    } else if (action === "confirm") {
      const team = teamState.items[String(payload.teamId || "")];
      if (!team) return;
      if (payload.confirmed && (team.memberIds.length < 3 || team.memberIds.length > 4)) return this.sendTeamError(ws, "팀 확정은 세 명 또는 네 명일 때만 가능합니다.");
      team.confirmed = Boolean(payload.confirmed);
      team.readyIds = team.confirmed ? [...team.memberIds] : [];
    } else if (action === "rename") {
      const team = teamState.items[String(payload.teamId || "")];
      const name = this.cleanTeamName(payload.name);
      if (!team || !name) return;
      team.name = name;
    } else if (action === "dissolve") {
      delete teamState.items[String(payload.teamId || "")];
    } else if (action === "merge") {
      const sourceId = String(payload.sourceId || ""), targetId = String(payload.targetId || "");
      const source = teamState.items[sourceId], target = teamState.items[targetId];
      if (!source || !target || sourceId === targetId) return;
      const members = [...new Set([...(target.memberIds || []), ...(source.memberIds || [])])];
      if (members.length > 4) return this.sendTeamError(ws, "합친 팀이 네 명을 초과합니다.");
      target.memberIds = members;
      this.resetTeam(target);
      delete teamState.items[sourceId];
    } else return;
    await this.ctx.storage.put("teams", teamState);
    await this.broadcastTeams();
    await this.broadcastDashboard();
  }

  async teamPayload(viewer = {}) {
    const teamState = await this.getTeamState();
    const students = await this.ctx.storage.get("students") || {};
    return this.serializeTeamPayload(teamState, students, viewer);
  }

  serializeTeamPayload(teamState, students, viewer = {}) {
    const sorted = Object.values(teamState.items).sort((a, b) => a.name.localeCompare(b.name, "ko"));
    const items = sorted.map((team, index) => {
      const memberIds = team.memberIds || [];
      const canSeeMembers = viewer.role === "teacher" || (viewer.role === "student" && memberIds.includes(viewer.clientId));
      return {
        id: team.id,
        code: viewer.role === "presenter" ? "" : team.code,
        name: viewer.role === "presenter" ? `팀 ${index + 1}` : team.name,
        confirmed: Boolean(team.confirmed),
        readyCount: team.readyIds?.length || 0,
        memberCount: memberIds.length,
        members: canSeeMembers ? memberIds.map(clientId => ({ clientId, name: students[clientId]?.name || "이름 미입력", ready: team.readyIds?.includes(clientId) || false })) : [],
      };
    });
    return { type: "teams", locked: teamState.locked, items };
  }

  async broadcastTeams() {
    const teamState = await this.getTeamState();
    const students = await this.ctx.storage.get("students") || {};
    for (const socket of this.ctx.getWebSockets()) {
      const connection = socket.deserializeAttachment() || {};
      try { socket.send(JSON.stringify(this.serializeTeamPayload(teamState, students, connection))); } catch { /* closed socket */ }
    }
  }

  async updateStudent(clientId, name, mutate) {
    const students = await this.ctx.storage.get("students") || {};
    const student = students[clientId] || { clientId, name, firstJoinedAt: Date.now(), lastActiveAt: Date.now(), visitedSlides: [], completedSlides: [], responseSlides: [], questionCount: 0 };
    student.name = String(name || student.name || "이름 미입력").slice(0, 24);
    student.visitedSlides ||= [];
    student.completedSlides ||= [];
    student.responseSlides ||= [];
    student.questionCount ||= 0;
    mutate(student);
    students[clientId] = student;
    await this.ctx.storage.put("students", students);
  }

  async markViewedForConnectedStudents(state) {
    const now = Date.now();
    const students = await this.ctx.storage.get("students") || {};
    let changed = false;
    for (const socket of this.ctx.getWebSockets()) {
      const connection = socket.deserializeAttachment() || {};
      if (connection.role !== "student" || !connection.clientId || !students[connection.clientId]) continue;
      const student = students[connection.clientId];
      student.visitedSlides ||= [];
      this.addUnique(student.visitedSlides, this.slideKey(state));
      student.lastActiveAt = now;
      changed = true;
    }
    if (changed) await this.ctx.storage.put("students", students);
  }

  async dashboardPayload() {
    const records = await this.ctx.storage.get("students") || {};
    const questions = await this.ctx.storage.get("questions") || [];
    const online = new Set(this.ctx.getWebSockets().map(socket => socket.deserializeAttachment() || {}).filter(item => item.role === "student" && item.clientId).map(item => item.clientId));
    const students = Object.values(records).map(student => {
      const visitedCount = student.visitedSlides?.length || 0;
      const completedCount = student.completedSlides?.length || 0;
      const responseCount = student.responseSlides?.length || 0;
      const questionCount = student.questionCount || 0;
      const base = visitedCount ? Math.round(((completedCount + responseCount) / (visitedCount * 2)) * 90) : 0;
      return { clientId: student.clientId, studentId: student.studentId || "", name: student.name, firstJoinedAt: student.firstJoinedAt, lastActiveAt: student.lastActiveAt, online: online.has(student.clientId), visitedCount, completedCount, responseCount, questionCount, participationScore: Math.min(100, base + Math.min(10, questionCount * 2)) };
    }).sort((a, b) => Number(b.online) - Number(a.online) || a.name.localeCompare(b.name, "ko"));
    const registered = await this.ctx.storage.get("roster") || [];
    const byStudentId = new Map(students.filter(student => student.studentId).map(student => [student.studentId, student]));
    const enrollment = registered.map(item => ({ studentId: item.studentId, name: item.name, attended: byStudentId.has(item.studentId), online: byStudentId.get(item.studentId)?.online || false }));
    return { type: "dashboard", className: await this.ctx.storage.get("className") || "", students, enrollment, questions, teams: (await this.teamPayload({ role: "teacher" })).items };
  }

  async broadcastDashboard() {
    const payload = JSON.stringify(await this.dashboardPayload());
    for (const socket of this.ctx.getWebSockets()) {
      const connection = socket.deserializeAttachment() || {};
      if (connection.role === "teacher") try { socket.send(payload); } catch { /* closed socket */ }
    }
  }

  async sendMyQuestions(socket, clientId) {
    const questions = (await this.ctx.storage.get("questions") || []).filter(item => item.clientId === clientId);
    try { socket.send(JSON.stringify({ type: "my-questions", questions })); } catch { /* closed socket */ }
  }

  async broadcastStudentQuestions(clientId) {
    for (const socket of this.ctx.getWebSockets()) {
      const connection = socket.deserializeAttachment() || {};
      if (connection.role === "student" && connection.clientId === clientId) await this.sendMyQuestions(socket, clientId);
    }
  }

  async activityFor(deck, slide, anonymous = false) {
    const responses = await this.ctx.storage.get(`activity:${deck}:${slide}`) || {};
    return Object.values(responses).map((item, index) => {
      const response = item?.fields ? item : { name: "이름 미입력", fields: item || {}, updatedAt: null };
      return anonymous ? { ...response, name: `학생 ${index + 1}` } : response;
    });
  }

  async broadcastActivity(deck, slide) {
    this.broadcastToRoles({ type: "activity", deck, slide, responses: await this.activityFor(deck, slide) }, ["teacher"]);
    this.broadcastToRoles({ type: "activity", deck, slide, responses: await this.activityFor(deck, slide, true) }, ["presenter"]);
  }

  async buildPublicActivitySummary(deck, slide) {
    const responses = await this.activityFor(deck, slide);
    const counts = {};
    for (const response of responses) {
      for (const [label, value] of Object.entries(response.fields || {})) {
        if (!value) continue;
        counts[label] ||= {};
        counts[label][value] = (counts[label][value] || 0) + 1;
      }
    }
    return { type: "activity-summary", deck, slide, total: responses.length, counts, publishedAt: Date.now() };
  }

  async publishedActivityForReview(deck, slide) {
    if (deck !== "week01" || slide !== 11) return null;
    return await this.ctx.storage.get("published-activity:week01:10") || null;
  }

  async broadcastPresence() {
    const connections = this.ctx.getWebSockets().map(socket => socket.deserializeAttachment() || {});
    const students = connections.filter(item => item.role === "student");
    const state = await this.ctx.storage.get("state");
    const responses = state ? await this.activityFor(state.deck, state.slide) : [];
    this.broadcast({
      type: "presence",
      students: students.length,
      completed: students.filter(item => item.completed).length,
      responded: responses.filter(item => Object.values(item.fields || item).some(Boolean)).length,
      teachers: connections.filter(item => item.role === "teacher").length,
      presenters: connections.filter(item => item.role === "presenter").length,
    });
  }

  async alarm() {
    this.broadcast({ type: "expired" });
    for (const socket of this.ctx.getWebSockets()) socket.close(1000, "수업이 종료되었습니다.");
    await this.ctx.storage.deleteAll();
  }
}
