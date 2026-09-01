import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const runtimeModules = process.env.RUNTIME_NODE_MODULES;
if (!runtimeModules) throw new Error('RUNTIME_NODE_MODULES가 필요합니다.');
const require = createRequire(path.join(runtimeModules, 'package.json'));
const sharp = require('sharp');
const publicRoot = path.resolve(import.meta.dirname, '../public');
const source = await fs.readFile(path.join(publicRoot, 'course-data.js'), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const weeks = context.window.COURSE_WEEKS;
const errors = [];
let count = 0;

if (weeks.length !== 15) errors.push(`주차 수 불일치: ${weeks.length}`);
for (const week of weeks) {
  const weekData = JSON.parse(await fs.readFile(path.join(publicRoot, 'course-weeks', `${week.id}.json`), 'utf8'));
  const expectedSlideCount = weekData.slides.length;
  if (week.slideCount !== expectedSlideCount) errors.push(`${week.id} 장수 불일치: 목록 ${week.slideCount}, 실제 ${expectedSlideCount}`);
  for (const slide of weekData.slides) {
    count += 1;
    const imagePath = path.join(publicRoot, slide.image.replace(/^\//, ''));
    try {
      const metadata = await sharp(imagePath).metadata();
      if (!metadata.width || !metadata.height) errors.push(`${week.id} ${slide.number}: 이미지 크기 없음`);
      if (!slide.notes) errors.push(`${week.id} ${slide.number}: 발표자 노트 없음`);
    } catch (error) {
      errors.push(`${week.id} ${slide.number}: 이미지 읽기 실패`);
    }
  }
}
if (count !== 692 || context.window.COURSE_TOTAL_SLIDES !== 692) errors.push(`전체 슬라이드 수 불일치: JSON ${count}, 수업 화면 ${context.window.COURSE_TOTAL_SLIDES}`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(JSON.stringify({ weeks: weeks.length, slides: count, images: count, notes: count, status: 'ok' }, null, 2));
