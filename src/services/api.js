// 통합 API: Firebase 가 설정되어 있으면 Firebase 를, 아니면 localStorage 를 사용합니다.
// 화면(컴포넌트)에서는 이 모듈만 import 하면 됩니다.

import { isFirebaseConfigured, auth, db } from '../firebase';
import {
  localAuth,
  localProducts,
  localReviews,
  localOrders,
  seedIfEmpty,
} from './localStore';

seedIfEmpty();

// ─── Auth API ───────────────────────────────────────────────
export const AuthAPI = {
  async signUp(email, password) {
    if (!isFirebaseConfigured) return localAuth.signUp(email, password);
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return { email: cred.user.email, isAdmin: false };
  },
  async signIn(email, password) {
    if (!isFirebaseConfigured) return localAuth.signIn(email, password);
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { email: cred.user.email, isAdmin: false };
  },
  async signOut() {
    if (!isFirebaseConfigured) return localAuth.signOut();
    const { signOut } = await import('firebase/auth');
    return signOut(auth);
  },
  current() {
    if (!isFirebaseConfigured) return localAuth.current();
    return auth?.currentUser
      ? { email: auth.currentUser.email, isAdmin: false }
      : null;
  },
  async onChange(cb) {
    if (!isFirebaseConfigured) {
      // localStorage 모드에서는 storage 이벤트로 동기화
      const handler = () => cb(localAuth.current());
      window.addEventListener('storage', handler);
      cb(localAuth.current());
      return () => window.removeEventListener('storage', handler);
    }
    const { onAuthStateChanged } = await import('firebase/auth');
    return onAuthStateChanged(auth, (u) =>
      cb(u ? { email: u.email, isAdmin: false } : null),
    );
  },
};

// ─── Products API ───────────────────────────────────────────
export const ProductsAPI = {
  async list() {
    if (!isFirebaseConfigured) return localProducts.list();
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async hot() {
    if (!isFirebaseConfigured) return localProducts.hot();
    const { collection, query, where, getDocs } = await import(
      'firebase/firestore'
    );
    const q = query(collection(db, 'products'), where('isHot', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async get(id) {
    if (!isFirebaseConfigured) return localProducts.get(id);
    const { doc, getDoc } = await import('firebase/firestore');
    const ref = doc(db, 'products', id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },
  async add(product) {
    if (!isFirebaseConfigured) return localProducts.add(product);
    const { collection, addDoc } = await import('firebase/firestore');
    const ref = await addDoc(collection(db, 'products'), product);
    return { id: ref.id, ...product };
  },
  async remove(id) {
    if (!isFirebaseConfigured) return localProducts.remove(id);
    const { doc, deleteDoc } = await import('firebase/firestore');
    return deleteDoc(doc(db, 'products', id));
  },
};

// ─── Reviews API ────────────────────────────────────────────
export const ReviewsAPI = {
  async forProduct(productId) {
    if (!isFirebaseConfigured) return localReviews.forProduct(productId);
    const { collection, query, where, getDocs, orderBy } = await import(
      'firebase/firestore'
    );
    const q = query(
      collection(db, 'reviews'),
      where('productId', '==', productId),
      orderBy('createdAt', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async byUser(email) {
    if (!isFirebaseConfigured) return localReviews.byUser(email);
    const { collection, query, where, getDocs } = await import(
      'firebase/firestore'
    );
    const q = query(collection(db, 'reviews'), where('userEmail', '==', email));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async add(review) {
    if (!isFirebaseConfigured) return localReviews.add(review);
    const { collection, addDoc } = await import('firebase/firestore');
    const payload = { ...review, createdAt: Date.now() };
    const ref = await addDoc(collection(db, 'reviews'), payload);
    return { id: ref.id, ...payload };
  },
};

// ─── Orders API (간단 버전) ─────────────────────────────────
export const OrdersAPI = {
  async byUser(email) {
    if (!isFirebaseConfigured) return localOrders.byUser(email);
    const { collection, query, where, getDocs } = await import(
      'firebase/firestore'
    );
    const q = query(collection(db, 'orders'), where('userEmail', '==', email));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  async add(order) {
    if (!isFirebaseConfigured) return localOrders.add(order);
    const { collection, addDoc } = await import('firebase/firestore');
    const payload = { ...order, createdAt: Date.now() };
    const ref = await addDoc(collection(db, 'orders'), payload);
    return { id: ref.id, ...payload };
  },
};

// 평균 별점 계산 유틸 (공유)
export function average(reviews) {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return sum / reviews.length;
}

export { isFirebaseConfigured };
