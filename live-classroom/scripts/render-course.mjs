import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const runtimeModules = process.env.RUNTIME_NODE_MODULES;
const runtimePython = process.env.RUNTIME_PYTHON;
const skillDir = process.env.PRESENTATIONS_SKILL_DIR;
if (!runtimeModules || !runtimePython || !skillDir) throw new Error('워크스페이스 런타임 환경변수가 필요합니다.');
const require = createRequire(path.join(runtimeModules, 'package.json'));
const sharp = require('sharp');

const courseRoot = path.resolve(import.meta.dirname, '../..');
const pptRoot = path.join(courseRoot, '개정본/PPT');
const assetRoot = path.resolve(import.meta.dirname, '../public/assets/decks');
const renderRoot = path.join(os.tmpdir(), 'cloud-mlops-course-render');
const renderScript = path.join(skillDir, 'container_tools/render_slides.py');
const decks = [
  ['week01', '클라우드MLOps_PPT_01주차_MLOps개요와클라우드첫걸음_학생주도활동추가.pptx'],
  ['week02', '클라우드MLOps_PPT_02주차_리눅스와EC2개발환경구축.pptx'],
  ['week03', '클라우드MLOps_PPT_03주차_데이터파이프라인과문제정의.pptx'],
  ['week04', '클라우드MLOps_PPT_04주차_베이스라인모델만들기.pptx'],
  ['week05', '클라우드MLOps_PPT_05주차_실험관리MLflow.pptx'],
  ['week06', '클라우드MLOps_PPT_06주차_컨테이너기초Docker와ECR.pptx'],
  ['week07', '클라우드MLOps_PPT_07주차_모델서빙API.pptx'],
  ['week08', '클라우드MLOps_PPT_08주차_배포와데모화면_중간점검.pptx'],
  ['week09', '클라우드MLOps_PPT_09주차_프로젝트통합보강.pptx'],
  ['week10', '클라우드MLOps_PPT_10주차_관리형ML서비스SageMaker.pptx'],
  ['week11', '클라우드MLOps_PPT_11주차_생성형AI활용Bedrock.pptx'],
  ['week12', '클라우드MLOps_PPT_12주차_배포자동화GitHubActions.pptx'],
  ['week13', '클라우드MLOps_PPT_13주차_모니터링과운영.pptx'],
  ['week14', '클라우드MLOps_PPT_14주차_프로젝트집중워크숍.pptx'],
  ['week15', '클라우드MLOps_PPT_15주차_최종발표및마무리.pptx'],
];

await fs.mkdir(renderRoot, { recursive: true });
await fs.mkdir(assetRoot, { recursive: true });

for (const [weekId, filename] of decks) {
  const input = path.join(pptRoot, filename);
  const rendered = path.join(renderRoot, weekId);
  const assets = path.join(assetRoot, weekId);
  await fs.mkdir(rendered, { recursive: true });
  await fs.mkdir(assets, { recursive: true });
  console.log(`[${weekId}] PPTX 렌더링`);
  const result = spawnSync(runtimePython, [renderScript, input, '--output_dir', rendered, '--width', '1440', '--height', '810'], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) throw new Error(`${weekId} 렌더링 실패`);
  const pngFiles = (await fs.readdir(rendered)).filter(name => /^slide-\d+\.png$/.test(name)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  for (const png of pngFiles) {
    const number = Number(png.match(/\d+/)[0]);
    await sharp(path.join(rendered, png)).resize(1440, 810, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 72, effort: 4 }).toFile(path.join(assets, `slide-${number}.webp`));
  }
  console.log(`[${weekId}] ${pngFiles.length}장 변환 완료`);
}

console.log('15주차 슬라이드 이미지 변환 완료');
