# 🌳 Logic Tree Generator - Vercel 배포 가이드

## 📋 사전 준비

### 1. Gemini API Key 발급
1. [Google AI Studio](https://aistudio.google.com/apikey) 접속
2. **"Create API Key"** 클릭
3. 발급된 API Key 복사해두기

### 2. 필요 도구
- [Node.js](https://nodejs.org/) (v18 이상)
- [Git](https://git-scm.com/)
- [GitHub](https://github.com) 계정
- [Vercel](https://vercel.com) 계정 (GitHub로 로그인 가능)

---

## 🚀 배포 방법

### Step 1: 프로젝트 폴더 준비
```bash
# 프로젝트 폴더로 이동
cd C:\Users\ksajh\코워크\로직트리

# 의존성 설치 (로컬 테스트 시)
npm install
```

### Step 2: 로컬 테스트 (선택사항)
```bash
# .env.local 파일 생성
echo GEMINI_API_KEY=여기에_API_KEY_입력 > .env.local

# 개발 서버 실행
npm run dev
```
→ http://localhost:3000 에서 확인

### Step 3: GitHub 저장소 생성 및 Push
```bash
# Git 초기화
git init
git add .
git commit -m "🌳 Logic Tree Generator 초기 배포"

# GitHub에 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/logic-tree-generator.git
git branch -M main
git push -u origin main
```

### Step 4: Vercel 배포
1. [Vercel 대시보드](https://vercel.com/dashboard) 접속
2. **"Add New → Project"** 클릭
3. GitHub 저장소 **"logic-tree-generator"** 선택
4. **"Import"** 클릭

5. **⚠️ 중요: Environment Variables 설정**
   - **"Environment Variables"** 섹션 펼치기
   - Name: `GEMINI_API_KEY`
   - Value: Step 1에서 발급받은 API Key 붙여넣기
   - **"Add"** 클릭

6. **"Deploy"** 클릭 → 약 1~2분 후 배포 완료!

### Step 5: 배포 확인
- Vercel이 제공하는 URL (예: `https://logic-tree-generator.vercel.app`)로 접속
- 로직트리 유형 선택 → 상황 입력 → 생성 테스트

---

## 🔧 환경 변수 수정 (배포 후)
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings → Environment Variables**
3. `GEMINI_API_KEY` 수정 가능

---

## 📁 프로젝트 구조
```
logic-tree-app/
├── package.json          # 프로젝트 설정
├── next.config.mjs       # Next.js 설정
├── .env.local.example    # 환경변수 예시
├── .gitignore            # Git 제외 파일
├── jsconfig.json         # JS 경로 설정
├── app/
│   ├── layout.js         # 루트 레이아웃
│   ├── page.js           # 메인 페이지 (UI + 트리 렌더링)
│   ├── globals.css       # 전역 스타일
│   └── api/
│       └── generate/
│           └── route.js  # Gemini AI API 라우트
└── DEPLOY_GUIDE.md       # 이 파일
```

---

## 🎯 주요 기능
- ✅ 3가지 Logic Tree 유형 지원 (문제정의 / 원인분석 / 해결방안)
- ✅ 1차 분류 카테고리 수 지정 (2~7개)
- ✅ AI 자동 생성 (Google Gemini API)
- ✅ 인터랙티브 가로형 트리 시각화
- ✅ 노드 클릭 → 상세 정보 팝업
- ✅ 줌 인/아웃 컨트롤
- ✅ 재생성 기능

---

© 2026 JJ CREATIVE Edu with AI. All Rights Reserved.
