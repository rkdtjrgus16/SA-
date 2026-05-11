// Firebase 설정 파일
// ─────────────────────────────────────────────────────────────
// 사용 방법:
// 1) https://console.firebase.google.com 에서 프로젝트 생성
// 2) 프로젝트 설정 > 내 앱 > 웹앱 등록 후 SDK 설정 복사
// 3) 아래 firebaseConfig 의 모든 값을 본인 값으로 교체
// 4) Authentication > 시작하기 > 이메일/비밀번호 사용 설정
// 5) Firestore Database > 데이터베이스 만들기 (테스트 모드로 시작)
//
// ⚠️ 값이 비어 있거나 placeholder 그대로면 자동으로 localStorage 모드로
//    동작하기 때문에 키 발급 없이도 데모를 즉시 사용할 수 있습니다.
// ─────────────────────────────────────────────────────────────

const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (v) => typeof v === 'string' && v.trim().length > 0,
);

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  // 실제 Firebase 사용 시에만 동적으로 import (번들 크기 최적화)
  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db };
