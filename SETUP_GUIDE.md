# 설정 가이드

## 완료된 작업

다음 작업이 완료되었습니다:

1. ✅ Hugo 사이트 생성
2. ✅ Blowfish 테마 설치
3. ✅ 다국어(i18n) 설정 (한국어, 프랑스어, 영어)
4. ✅ Notion-Hugo 통합 설정
5. ✅ Notion API 연동
6. ✅ 환경 변수 설정
7. ✅ GitHub Actions 자동 배포 설정

## 다음 단계

### 1. Notion 데이터베이스 설정 확인

현재 연결된 Notion 데이터베이스:
- URL: https://www.notion.so/Notion-Blog-297711b8a78880018f67d0883832583b
- Integration Token: (실제 토큰은 `.env` 파일에 보관)

필요한 데이터베이스 속성:
- **제목** (Title) - 필수
- **작성일** (Date)
- **카테고리** (Select)
- **태그** (Multi-select)
- **공개여부** (Checkbox)
- **요약** (Rich Text)

### 2. 로컬에서 테스트

```bash
# Notion에서 콘텐츠 가져오기
npm start

# 개발 서버 시작
npm run server

# 브라우저에서 http://localhost:1313 접속
```

### 3. 다국어 콘텐츠 추가 (선택사항)

프랑스어와 영어 콘텐츠를 추가하려면:

1. Notion에서 프랑스어 데이터베이스 생성
2. Notion에서 영어 데이터베이스 생성
3. `notion-hugo.config.ts` 파일 수정:

```typescript
databases: [
    // Korean database
    {
        database_id: '297711b8a78880018f67d0883832583b',
        target_folder: '.'
    },
    // French database (선택사항)
    // {
    //     database_id: 'your-french-database-id',
    //     target_folder: 'fr'
    // },
    // English database (선택사항)
    // {
    //     database_id: 'your-english-database-id',
    //     target_folder: 'en'
    // }
]
```

### 4. GitHub에 푸시

```bash
# Git 저장소로 이동
cd "/Users/jinwoo/Blog/Hugo Blog"

# 모든 파일 추가 (.gitignore에 따라 자동 필터링됨)
git add .

# 커밋
git commit -m "Initial commit: Hugo blog with Notion CMS"

# GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/your-username/your-repo.git

# 푸시
git push -u origin main
```

### 5. GitHub Pages 배포 설정

1. GitHub 저장소로 이동
2. **Settings** → **Secrets and variables** → **Actions** 클릭
3. **New repository secret** 클릭
4. Name: `NOTION_TOKEN`
5. Value: `your_notion_token_here` (실제 Notion API 토큰 입력)
6. **Add secret** 클릭

7. **Settings** → **Pages** 클릭
8. **Source**: GitHub Actions 선택

이제 다음과 같이 자동 배포됩니다:
- `main` 브랜치에 푸시할 때마다
- 매일 자정 (Notion과 자동 동기화)
- 수동으로 Actions 탭에서 실행

### 6. 블로그 커스터마이징

#### 사이트 정보 수정

[config/_default/languages.ko.toml](config/_default/languages.ko.toml) 파일 수정:

```toml
title = "내 블로그 이름"

[params]
  displayName = "KO"
  # description = "내 블로그 설명"
  # copyright = "Copyright © 2025 Your Name"

# [params.author]
#   name = "당신의 이름"
#   email = "youremail@example.com"
#   bio = "자기소개"
```

#### 메뉴 수정

[config/_default/menus.ko.toml](config/_default/menus.ko.toml) 파일에서 메뉴 항목 수정

#### 테마 설정

[config/_default/params.toml](config/_default/params.toml) 파일에서 테마 색상, 폰트 등 수정

자세한 설정 방법은 [Blowfish 문서](https://blowfish.page/docs/)를 참고하세요.

### 7. 운영 팁

#### 새 글 작성
1. Notion 데이터베이스에서 새 페이지 작성
2. 로컬: `npm start` 실행
3. GitHub: 자동으로 매일 자정에 동기화되거나, 수동으로 Actions에서 실행

#### 글 수정
1. Notion에서 페이지 수정
2. 로컬 또는 GitHub Actions에서 동기화

#### 글 삭제
1. Notion에서 페이지 삭제 또는 "공개여부" 체크박스 해제
2. 동기화 시 자동으로 로컬/배포 사이트에서 제거됨

## 문제 해결

### Notion 동기화 실패

1. `.env` 파일의 `NOTION_TOKEN` 확인
2. Notion 데이터베이스가 Integration에 연결되어 있는지 확인
3. `npm start` 실행 시 오류 메시지 확인

### Hugo 빌드 실패

1. `hugo version` 확인 (0.141.0 이상 필요)
2. `config/_default/hugo.toml` 설정 확인
3. 테마가 제대로 설치되었는지 확인: `ls themes/blowfish`

### 다국어 메뉴가 보이지 않음

1. 각 언어별 `languages.*.toml` 파일 확인
2. 각 언어별 콘텐츠가 있는지 확인 (`content/ko`, `content/fr`, `content/en`)

## 참고 자료

- [README.md](README.md) - 기본 사용 방법
- [Hugo 문서](https://gohugo.io/documentation/)
- [Blowfish 테마 문서](https://blowfish.page/docs/)
- [Notion API 문서](https://developers.notion.com/)
- [Notion-Hugo 저장소](https://github.com/HEIGE-PCloud/Notion-Hugo)

## 지원

문제가 발생하면 다음을 확인하세요:
1. [Hugo 커뮤니티](https://discourse.gohugo.io/)
2. [Blowfish 이슈](https://github.com/nunocoracao/blowfish/issues)
3. [Notion-Hugo 이슈](https://github.com/HEIGE-PCloud/Notion-Hugo/issues)
