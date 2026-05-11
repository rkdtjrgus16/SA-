# 🛒 마이샵 (My Shop)

React + Firebase 기반의 학습용 인터넷 쇼핑몰 데모입니다.
Firebase 키 발급 없이도 **로컬에서 즉시 실행**되며, 키를 입력하면 자동으로 실제 Firebase 와 연동됩니다.

## ✨ 핵심 기능

| 기능              | 설명                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| 회원가입 / 로그인 | 이메일+비밀번호 인증 (Firebase Auth / localStorage 폴백)             |
| 메인 페이지       | 🔥 인기 상품 섹션 + 전체 상품 그리드 + 검색                          |
| 상품 상세         | 이미지/설명 + 별점 평균 + 리뷰 리스트 + 리뷰 작성 폼 (별점 클릭 입력) |
| 관리자 페이지     | 상품 등록(이름/가격/이미지/카테고리/재고/인기여부) + 등록 상품 관리  |
| 마이페이지        | 내 정보 + 주문 내역 + 내가 쓴 리뷰                                   |
| 🤖 AI 상품 추천   | 우하단 플로팅 챗봇 → 자연어로 원하는 상품 묻기                       |
| 🤖 AI 리뷰 요약   | 상품 상세에서 리뷰 한방 분석 (요약/장점/단점)                        |
| 🤖 AI 설명 생성   | 관리자 페이지에서 상품명만으로 설명 카피 자동 작성                   |

## 🚀 빠른 시작

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 자동으로 열립니다.

> ⚠️ **Windows + 한글 경로 주의**
> 현재 폴더 경로에 한글 또는 공백/괄호가 포함되어 있으면 (`바이브코딩 (기초반)`, `인터넷 쇼핑몰` 등)
> Vite 가 사용하는 `@rollup/rollup-win32-x64-msvc` 네이티브 바이너리 로드가
> Node.js 22 에서 **access violation(0xC0000005)** 으로 크래시하는 이슈가 있습니다.
>
> 해결: 프로젝트를 영문 경로로 복사한 뒤 거기서 실행하세요.
>
> PowerShell에서 한 번에:
> ```powershell
> $src = "$HOME\Desktop\바이브코딩 (기초반)\인터넷 쇼핑몰"
> $dst = "$HOME\my-shop"
> robocopy $src $dst /E /XD node_modules | Out-Null
> cd $dst
> npm install --ignore-scripts
> npm run dev
> ```
> 소스 편집은 원래 폴더에서 해도 되고, 위 명령을 다시 실행하면 동기화됩니다.
> (`Notepad` 등으로 보면 인코딩 문제가 보일 수 있는데 코드는 UTF-8 이라 VS Code/Cursor 에서는 정상.)

### 🧪 데모 계정

처음 실행하면 자동으로 시드 데이터(상품 6개 + 리뷰 3개)가 주입됩니다.

- **관리자 데모 계정**: `demo@user.com` / `demo1234`
- 새 계정을 만들고 싶다면 회원가입 페이지에서 가입

> 데모 모드(=Firebase 미연동)에서는 우상단에 `데모 모드` 배지가 표시됩니다.
> 모든 데이터는 브라우저의 localStorage 에 저장되므로 다른 기기와는 공유되지 않습니다.

## 🤖 AI 기능 사용하기

4가지 AI 기능을 모두 쓰려면 OpenAI API 키 1개만 있으면 됩니다.

### 🥇 방법 A: `.env` 파일에 키 넣기 (권장 — 한 번만 설정)

1. https://platform.openai.com/api-keys 에서 키 생성 (`sk-` 로 시작)
2. 프로젝트 루트의 **`.env`** 파일을 열고 한 줄만 교체:
   ```env
   VITE_OPENAI_API_KEY=sk-여기에_본인의_키_붙여넣기
   ```
3. 개발 서버를 재시작 (`npm run dev`)
4. 끝! 사이트의 모든 AI 기능이 즉시 작동합니다.

> `.env` 파일은 `.gitignore` 에 포함되어 있어 깃에 올라가지 않습니다.
> `.env.example` 은 양식 참고용이니 그대로 두세요.

### 🥈 방법 B: 웹 UI 에서 키 입력 (임시 사용 시)

1. 웹앱 우상단 **설정** 메뉴 → API 키 붙여넣기 → 저장
2. 키는 브라우저 localStorage 에 저장됩니다.

> `.env` 에 키가 설정되어 있으면 그쪽이 우선 적용되고, 설정 페이지의 입력은 비활성화됩니다.

기본 모델은 `gpt-4o-mini` (저렴 + 빠름). `.env` 의 `VITE_OPENAI_MODEL` 또는 설정 페이지에서 변경 가능.

### 각 기능의 진입점

| 기능          | 사용 위치                                                          |
| ------------- | ------------------------------------------------------------------ |
| 🛒 상품 추천   | 모든 페이지 우하단 🤖 플로팅 버튼 → "상품 추천" 탭                  |
| 💬 고객 응대   | 우하단 🤖 플로팅 버튼 → "고객 응대" 탭 (배송·반품·결제 등 FAQ)      |
| 📝 리뷰 요약   | 상품 상세 페이지 > 리뷰 섹션 상단 `✨ N개 리뷰 요약하기` 버튼      |
| ✍️ 설명 생성   | 관리자 페이지 > 상품 등록 폼의 설명 옆 `✨ AI로 설명 생성` 버튼   |

> ⚠️ **보안 주의**: 이 데모는 브라우저에서 직접 OpenAI 를 호출합니다
> (`dangerouslyAllowBrowser: true`). 실제 서비스에서는 반드시 백엔드
> (Firebase Functions 등)를 통해 키를 숨기고 호출하세요.

## 🔌 Firebase 연동하기

실제 Firebase 와 연결하려면 다음 단계를 따라 주세요.

### 1) Firebase 프로젝트 만들기

1. https://console.firebase.google.com 접속
2. **프로젝트 추가** → 이름 입력 → 생성
3. 프로젝트 메인에서 **웹앱(`</>` 아이콘)** 클릭 → 앱 등록
4. 표시되는 `firebaseConfig` 객체의 값을 복사

### 2) `src/firebase.js` 에 키 입력

```js
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef',
};
```

키가 모두 채워지면 자동으로 Firebase 모드로 동작합니다.

### 3) Firebase 콘솔에서 두 가지 활성화

- **Authentication** → "시작하기" → **이메일/비밀번호** 토글 ON
- **Firestore Database** → "데이터베이스 만들기" → **테스트 모드**로 시작
  - 컬렉션은 코드가 자동으로 생성합니다: `products`, `reviews`, `orders`

### 4) (운영용) Firestore 보안 규칙 예시

기본 테스트 모드 규칙은 30일 후 만료됩니다. 실제 배포 시에는 아래처럼 강화하세요.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null; // 관리자만 허용하려면 추가 조건
    }
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null
                    && request.resource.data.userEmail == request.auth.token.email;
      allow update, delete: if false;
    }
    match /orders/{orderId} {
      allow read, create: if request.auth != null
                          && resource.data.userEmail == request.auth.token.email;
    }
  }
}
```

## 📁 폴더 구조

```
src/
├── main.jsx                # 진입점
├── App.jsx                 # 라우터 정의 + 가드
├── firebase.js             # Firebase 설정 (config 비어 있으면 localStorage 모드)
├── context/
│   └── AuthContext.jsx     # 로그인 상태 전역 관리
├── services/
│   ├── api.js              # 통합 API (Firebase ↔ localStorage 자동 분기)
│   ├── localStore.js       # localStorage 어댑터
│   └── ai.js               # OpenAI 래퍼 (설명 생성 / 리뷰 요약 / 추천)
├── data/
│   └── seed.js             # 초기 시드 데이터 (상품/리뷰)
├── components/
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   ├── StarRating.jsx      # 읽기/입력 모드 모두 지원
│   ├── ReviewSummary.jsx   # AI 리뷰 요약 카드
│   └── AIChatbot.jsx       # 우하단 플로팅 AI 챗봇
├── pages/
│   ├── Home.jsx            # 인기상품 + 전체상품 + 검색
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── ProductDetail.jsx   # 상세 + 리뷰 + 별점 작성 + AI 요약
│   ├── Admin.jsx           # 상품 등록/삭제 + AI 설명 생성
│   ├── MyPage.jsx          # 마이페이지
│   ├── Settings.jsx        # OpenAI API 키 입력
│   └── NotFound.jsx
└── styles/
    └── global.css
```

## 🧠 학습 포인트

이 프로젝트에서 핵심으로 배울 수 있는 것:

1. **React 라우터** - `react-router-dom` v6 로 페이지 전환 + 인증 가드(`<RequireAuth>`)
2. **Context API** - `AuthContext` 로 로그인 상태 전역 공유
3. **Firebase 추상화** - 한 곳(`services/api.js`)에서 백엔드를 갈아끼울 수 있게 설계
4. **별점 평균 계산** - 리뷰의 `rating` 필드를 합산하여 평균 표시 (`average()` 유틸)
5. **Optimistic UI** - 리뷰 등록 후 화면을 즉시 갱신

## 🛠 사용 기술

- **React 18** + **Vite 5** (CRA 보다 빠른 최신 표준)
- **react-router-dom 6**
- **firebase 10** (Auth + Firestore)

## 📝 다음 단계 아이디어

- 장바구니(Cart) + 결제 흐름 추가
- 상품 이미지 업로드 (Firebase Storage)
- 관리자 권한 분리 (Firestore `users/{uid}.role`)
- 무한 스크롤 / 페이지네이션
- 카테고리별 필터 / 가격 정렬
- 다크 모드 토글

---

💡 **연습의 한마디**
"로그인 → 상품 리스트 → 리뷰" 순서로 하나씩 기능을 완성해 나가는 것을 추천드려요.
처음부터 모든 걸 완벽하게 짜려고 하면 에러가 날 때 찾기 힘들거든요!
