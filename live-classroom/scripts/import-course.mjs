import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const runtimeModules = process.env.RUNTIME_NODE_MODULES;
if (!runtimeModules) throw new Error('RUNTIME_NODE_MODULES가 필요합니다.');
const require = createRequire(path.join(runtimeModules, 'package.json'));
const JSZip = require('jszip');

const courseRoot = path.resolve(import.meta.dirname, '../..');
const outputPath = path.resolve(import.meta.dirname, '../public/course-data.js');
const pptRoot = path.join(courseRoot, '개정본/PPT');
const decks = [
  ['week01', '01주차', 'MLOps 개요와 클라우드 첫걸음', '클라우드MLOps_PPT_01주차_MLOps개요와클라우드첫걸음_학생주도활동추가.pptx'],
  ['week02', '02주차', '리눅스와 EC2 개발환경 구축', '클라우드MLOps_PPT_02주차_리눅스와EC2개발환경구축.pptx'],
  ['week03', '03주차', '데이터 파이프라인과 문제 정의', '클라우드MLOps_PPT_03주차_데이터파이프라인과문제정의.pptx'],
  ['week04', '04주차', '베이스라인 모델 만들기', '클라우드MLOps_PPT_04주차_베이스라인모델만들기.pptx'],
  ['week05', '05주차', '실험 관리와 MLflow', '클라우드MLOps_PPT_05주차_실험관리MLflow.pptx'],
  ['week06', '06주차', '컨테이너 기초와 Docker·ECR', '클라우드MLOps_PPT_06주차_컨테이너기초Docker와ECR.pptx'],
  ['week07', '07주차', '모델 서빙 API', '클라우드MLOps_PPT_07주차_모델서빙API.pptx'],
  ['week08', '08주차', '배포와 데모 화면 중간점검', '클라우드MLOps_PPT_08주차_배포와데모화면_중간점검.pptx'],
  ['week09', '09주차', '프로젝트 통합 보강', '클라우드MLOps_PPT_09주차_프로젝트통합보강.pptx'],
  ['week10', '10주차', '관리형 ML 서비스 SageMaker', '클라우드MLOps_PPT_10주차_관리형ML서비스SageMaker.pptx'],
  ['week11', '11주차', '생성형 AI 활용과 Bedrock', '클라우드MLOps_PPT_11주차_생성형AI활용Bedrock.pptx'],
  ['week12', '12주차', '배포 자동화와 GitHub Actions', '클라우드MLOps_PPT_12주차_배포자동화GitHubActions.pptx'],
  ['week13', '13주차', '모니터링과 운영', '클라우드MLOps_PPT_13주차_모니터링과운영.pptx'],
  ['week14', '14주차', '프로젝트 집중 워크숍', '클라우드MLOps_PPT_14주차_프로젝트집중워크숍.pptx'],
  ['week15', '15주차', '최종 발표와 마무리', '클라우드MLOps_PPT_15주차_최종발표및마무리.pptx'],
];

function decodeXml(value = '') {
  return value.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&amp;', '&');
}

function textRuns(xml = '') {
  return [...xml.matchAll(/<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)]
    .map(match => decodeXml(match[1]).replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function externalLinks(xml = '') {
  const links = [...xml.matchAll(/Target="([^"]+)"[^>]*TargetMode="External"/g)]
    .map(match => decodeXml(match[1]))
    .filter(url => /^https?:\/\//i.test(url));
  return [...new Set(links)].map(url => {
    const host = new URL(url).hostname;
    const label = host.includes('console.aws.amazon.com') ? 'AWS 콘솔' : host.includes('docs.aws.amazon.com') ? 'AWS 공식 문서' : host.includes('github.com') ? 'GitHub 자료' : '관련 자료';
    return { label, url };
  });
}

function slideTitle(texts, fallback) {
  return texts.find(text => text.length > 2 && !/^클라우드 MLOps\s*[·|]/i.test(text) && !/^\d+$/.test(text)) || fallback;
}

const weeks = [];
for (const [id, label, title, filename] of decks) {
  const deckPath = path.join(pptRoot, filename);
  const zip = await JSZip.loadAsync(await fs.readFile(deckPath));
  const slideNumbers = Object.keys(zip.files)
    .map(name => name.match(/^ppt\/slides\/slide(\d+)\.xml$/))
    .filter(Boolean)
    .map(match => Number(match[1]))
    .sort((a, b) => a - b);
  const slides = [];
  for (const number of slideNumbers) {
    const slideXml = await zip.file(`ppt/slides/slide${number}.xml`).async('string');
    const noteFile = zip.file(`ppt/notesSlides/notesSlide${number}.xml`);
    const relFile = zip.file(`ppt/slides/_rels/slide${number}.xml.rels`);
    const texts = textRuns(slideXml);
    const rawNotes = noteFile ? textRuns(await noteFile.async('string')) : [];
    const notes = rawNotes.filter(text => text !== String(number)).join('\n');
    const links = relFile ? externalLinks(await relFile.async('string')) : [];
    slides.push({
      number,
      title: slideTitle(texts, `${label} ${number}번 슬라이드`),
      image: `/assets/decks/${id}/slide-${number}.webp`,
      notes: notes || '이 슬라이드의 핵심 내용을 학생의 실습 결과와 연결해 설명합니다.',
      links,
    });
  }
  weeks.push({ id, label, title, source: filename, slides });
}

const totalSlides = weeks.reduce((sum, week) => sum + week.slides.length, 0);
const output = `// 개정 PPTX에서 자동 생성한 15주차 수업 데이터입니다.\nwindow.COURSE_WEEKS=${JSON.stringify(weeks)};\nwindow.COURSE_TOTAL_SLIDES=${totalSlides};\n`;
await fs.writeFile(outputPath, output, 'utf8');
console.log(JSON.stringify({ weeks: weeks.length, totalSlides, outputPath }, null, 2));
