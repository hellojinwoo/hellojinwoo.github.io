# GitHub Pages 배포 가이드

## 1단계: GitHub 저장소 생성

### 방법 A: GitHub 웹사이트에서 생성

1. https://github.com/new 접속
2. Repository name: `blog` (또는 원하는 이름)
3. Public 선택
4. **"Initialize this repository with a README" 체크 해제** (중요!)
5. "Create repository" 클릭

### 방법 B: GitHub CLI 사용 (gh 설치되어 있는 경우)

```bash
cd "/Users/jinwoo/Blog/Hugo Blog"
gh repo create blog --public --source=. --remote=origin
```

## 2단계: 로컬 Git 설정 및 푸시

```bash
cd "/Users/jinwoo/Blog/Hugo Blog"

# Git 초기화 (이미 되어 있음)
# git init 는 이미 실행되어 있습니다

# 원격 저장소 추가 (본인의 GitHub 계정명으로 변경)
git remote add origin https://github.com/YOUR-USERNAME/blog.git

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: Hugo blog with Notion CMS"

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

## 3단계: GitHub Secrets 설정

1. GitHub 저장소 페이지로 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 클릭
4. Secret 추가:
   - Name: `NOTION_TOKEN`
   - Value: `your_notion_token_here` (실제 Notion API 토큰 입력)
5. **Add secret** 클릭

## 4단계: GitHub Pages 활성화

1. GitHub 저장소에서 **Settings** → **Pages** 클릭
2. **Source** 섹션에서:
   - Source: **GitHub Actions** 선택 (NOT "Deploy from a branch")

## 5단계: 자동 배포 확인

1. **Actions** 탭으로 이동
2. "Deploy Hugo site to Pages" 워크플로우가 실행 중인지 확인
3. 완료되면 녹색 체크마크 표시
4. 약 1-2분 후 사이트 접속 가능

## 배포된 사이트 URL

- **기본 URL**: `https://YOUR-USERNAME.github.io/blog/`
- **커스텀 도메인** 설정 가능 (Settings → Pages → Custom domain)

## 자동 배포 트리거

다음 경우에 자동으로 배포됩니다:

1. **코드 푸시**: `main` 브랜치에 푸시할 때마다
2. **매일 자동**: 매일 자정(UTC)에 Notion과 동기화 후 배포
3. **수동 실행**: Actions 탭에서 "Run workflow" 클릭

## 배포 프로세스

1. Notion 데이터베이스에서 최신 콘텐츠 가져오기
2. Hugo로 정적 사이트 빌드
3. GitHub Pages에 배포

## 문제 해결

### 배포 실패 시

1. **Actions** 탭에서 실패한 워크플로우 클릭
2. 에러 메시지 확인
3. 주요 체크 사항:
   - `NOTION_TOKEN` 시크릿이 올바르게 설정되었는지
   - Notion 데이터베이스가 Integration에 연결되어 있는지
   - `notion-hugo.config.ts`의 database_id가 정확한지

### 사이트가 404 에러

- GitHub Pages 설정이 "GitHub Actions"로 되어 있는지 확인
- 첫 배포 후 5-10분 정도 기다려보기
- 캐시 삭제 후 새로고침

### 콘텐츠가 업데이트되지 않음

1. Notion에서 글 작성/수정
2. 방법 1 (자동): 다음날 자정까지 대기
3. 방법 2 (수동): GitHub → Actions → "Run workflow" 클릭
4. 방법 3 (로컬): `npm start && git add . && git commit -m "Update content" && git push`

## 로컬 테스트

배포 전에 로컬에서 테스트:

```bash
# Notion 동기화
npm start

# 로컬 서버 실행
npm run server

# 브라우저에서 http://localhost:1313 확인

# 프로덕션 빌드 테스트
hugo

# public 폴더 확인
```

## 다음 단계

1. ✅ GitHub 저장소 생성
2. ✅ 코드 푸시
3. ✅ Secrets 설정
4. ✅ GitHub Pages 활성화
5. ✅ 배포 확인
6. 🎉 블로그 운영 시작!
