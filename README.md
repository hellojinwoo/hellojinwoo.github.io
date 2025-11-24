# Hugo Blog with Notion CMS

Notion을 CMS로 사용하는 다국어 Hugo 블로그입니다.

## 기능

- **CMS**: Notion을 CMS로 사용
- **테마**: [Blowfish](https://github.com/nunocoracao/blowfish)
- **다국어 지원**: 한국어(기본), 프랑스어, 영어
- **자동 동기화**: Notion 데이터베이스에서 콘텐츠 자동 가져오기

## 설정

### 환경 변수

`.env` 파일에 다음 환경 변수를 설정하세요:

```env
NOTION_TOKEN=your_notion_integration_token
HUGO_VERSION=0.152.0
NODE_VERSION=22.12.0
```

### Notion 설정

1. [Notion Integrations](https://www.notion.so/my-integrations)에서 새 통합 생성
2. "Read Content" 권한 부여
3. Notion 데이터베이스를 통합에 연결
4. 통합 토큰을 `.env` 파일의 `NOTION_TOKEN`에 설정

### Notion 데이터베이스 구조

데이터베이스에 다음 속성이 필요합니다:

- **제목** (Title): 글 제목
- **작성일** (Date): 작성 날짜
- **카테고리** (Select): 카테고리
- **태그** (Multi-select): 태그
- **공개여부** (Checkbox): 공개/비공개
- **요약** (Rich Text): 글 요약

## 사용법

### Notion에서 콘텐츠 가져오기

```bash
npm start
```

이 명령어는 Notion 데이터베이스에서 모든 페이지를 가져와 `content/` 폴더에 마크다운 파일로 저장합니다.

### 로컬 개발 서버 실행

```bash
npm run server
```

또는

```bash
hugo server --buildDrafts --disableFastRender
```

브라우저에서 http://localhost:1313/ 접속

### 프로덕션 빌드

```bash
hugo
```

빌드된 사이트는 `public/` 폴더에 생성됩니다.

## 프로젝트 구조

```
Hugo Blog/
├── config/_default/          # Hugo 설정 파일
│   ├── hugo.toml            # 메인 설정
│   ├── languages.ko.toml    # 한국어 설정
│   ├── languages.fr.toml    # 프랑스어 설정
│   ├── languages.en.toml    # 영어 설정
│   ├── menus.ko.toml        # 한국어 메뉴
│   ├── menus.fr.toml        # 프랑스어 메뉴
│   ├── menus.en.toml        # 영어 메뉴
│   └── params.toml          # 테마 파라미터
├── content/                  # 마크다운 콘텐츠 (Notion에서 생성됨)
├── src/                      # Notion-Hugo 소스 코드
├── themes/blowfish/          # Blowfish 테마
├── notion-hugo.config.ts    # Notion-Hugo 설정
├── package.json             # Node.js 의존성
├── .env                     # 환경 변수 (git에 커밋하지 마세요!)
└── .env.example             # 환경 변수 예제
```

## 워크플로우

1. Notion 데이터베이스에서 글 작성
2. `npm start`로 콘텐츠 동기화
3. `npm run server`로 로컬 미리보기
4. `hugo`로 프로덕션 빌드
5. `public/` 폴더를 호스팅 서비스에 배포

## 배포

### GitHub Actions를 사용한 자동 배포 (권장)

`.github/workflows/deploy.yml` 파일을 생성하여 자동 배포를 설정할 수 있습니다:

1. GitHub 저장소 Settings → Secrets → Actions에서 `NOTION_TOKEN` 추가
2. 매일 자동으로 Notion과 동기화하고 배포

### Cloudflare Pages

- 빌드 명령: `npm install && npm start && hugo`
- 출력 디렉토리: `public`
- 환경 변수: `NOTION_TOKEN` 설정

### Netlify

- 빌드 명령: `npm install && npm start && hugo`
- 게시 디렉토리: `public`
- 환경 변수: `NOTION_TOKEN` 설정

## 참고 자료

- [Hugo 문서](https://gohugo.io/documentation/)
- [Blowfish 테마 문서](https://blowfish.page/docs/)
- [Notion API 문서](https://developers.notion.com/)
- [Notion-Hugo 저장소](https://github.com/HEIGE-PCloud/Notion-Hugo)

## 라이선스

이 프로젝트는 개인 블로그용으로 설정되었습니다.
