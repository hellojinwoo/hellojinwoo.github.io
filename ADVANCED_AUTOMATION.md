# 고급 자동화: Notion 글 작성 시 즉시 배포

## 현재 자동화 상태

✅ **매일 자동 동기화**: 매일 자정(UTC)에 자동으로 Notion과 동기화하고 배포
✅ **수동 트리거**: GitHub Actions에서 언제든 수동으로 실행 가능

## 즉시 배포를 위한 옵션들

### 옵션 1: 동기화 주기 변경 (가장 간단)

`.github/workflows/deploy.yml` 파일의 cron 스케줄을 변경:

```yaml
# 매일 자정 (현재 설정)
- cron: '0 0 * * *'

# 3시간마다
- cron: '0 */3 * * *'

# 1시간마다
- cron: '0 * * * *'

# 30분마다 (GitHub 제한으로 권장하지 않음)
- cron: '*/30 * * * *'
```

**장점**: 설정이 간단
**단점**: 여전히 지연 시간이 있음

### 옵션 2: GitHub Repository Dispatch (권장)

외부에서 GitHub Actions를 트리거할 수 있게 설정

#### 2-1. Workflow 파일 수정

\`\`\`yaml
on:
  push:
    branches: ["main"]
  workflow_dispatch:
  schedule:
    - cron: '0 0 * * *'
  repository_dispatch:  # 이 부분 추가
    types: [notion-update]
\`\`\`

#### 2-2. Personal Access Token 생성

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. 권한: `repo` 전체 선택
4. 토큰 복사 (한 번만 표시됨!)

#### 2-3. Zapier/Make.com으로 자동화

**Zapier 워크플로우:**
1. Trigger: Notion - New Database Item
2. Action: Webhooks - POST Request
   - URL: `https://api.github.com/repos/YOUR-USERNAME/blog/dispatches`
   - Headers:
     - `Authorization`: `Bearer YOUR_GITHUB_TOKEN`
     - `Accept`: `application/vnd.github+json`
   - Body:
     ```json
     {
       "event_type": "notion-update"
     }
     ```

**Make.com 시나리오:**
1. Notion Watch Database Items
2. HTTP Make a Request
   - 위와 동일한 설정

### 옵션 3: Cloudflare Workers (완전 자동)

Cloudflare Workers를 사용하여 Notion webhook 처리:

\`\`\`javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Notion에서 webhook 받기
  // GitHub Actions 트리거
  const response = await fetch(
    'https://api.github.com/repos/YOUR-USERNAME/blog/dispatches',
    {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_GITHUB_TOKEN',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'notion-update'
      })
    }
  )

  return new Response('OK', { status: 200 })
}
\`\`\`

### 옵션 4: Vercel/Netlify로 변경

Vercel이나 Netlify는 webhook을 네이티브로 지원:

1. Vercel/Netlify에 배포
2. Deploy Hook URL 생성
3. Zapier/Make.com에서 Notion → Deploy Hook 연결

## 추천 설정

### 초보자/개인 블로그
- **매일 자정 자동 동기화** (현재 설정)
- 급하면 GitHub Actions에서 수동 실행

### 중급자
- **3시간마다 자동 동기화**
- `.github/workflows/deploy.yml`의 cron만 변경

### 고급/팀 블로그
- **Zapier + Repository Dispatch**
- Notion에 글 작성 시 즉시 배포
- 월 $20 정도 비용

## 현재 권장 워크플로우

1. **일반 글 작성**
   - Notion에서 글 작성
   - 다음날 자정에 자동 배포

2. **긴급 배포가 필요할 때**
   - Notion에서 글 작성
   - GitHub → Actions → "Run workflow" 클릭
   - 1-2분 후 배포 완료

3. **로컬에서 미리보기**
   - Notion에서 글 작성
   - 로컬에서 `npm start` 실행
   - `npm run server`로 미리보기
   - 확인 후 자동 배포 대기

## 비용 비교

| 방법 | 비용 | 즉시성 | 난이도 |
|------|------|--------|--------|
| 매일 자동 (현재) | 무료 | 최대 24시간 | ⭐ |
| 3시간마다 자동 | 무료 | 최대 3시간 | ⭐ |
| 수동 트리거 | 무료 | 즉시 (수동) | ⭐ |
| Zapier | $20/월 | 즉시 (자동) | ⭐⭐ |
| Make.com | $9/월 | 즉시 (자동) | ⭐⭐ |
| Cloudflare Workers | 무료 | 즉시 (자동) | ⭐⭐⭐⭐ |

## 결론

**대부분의 개인 블로그에는 현재 설정(매일 자동)이 충분합니다!**

- 블로그는 뉴스가 아니므로 24시간 지연은 문제없음
- 급한 경우 GitHub에서 수동으로 1분 안에 배포 가능
- 무료이고 설정이 간단함
