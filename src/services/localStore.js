// localStorage 어댑터: Firebase 미연동 시 fallback 으로 사용됩니다.
// products / reviews / users / currentUser 키를 사용합니다.

import { SEED_PRODUCTS, SEED_REVIEWS } from '../data/seed';

const KEYS = {
  products: 'shop:products',
  reviews: 'shop:reviews',
  users: 'shop:users',
  currentUser: 'shop:currentUser',
  orders: 'shop:orders',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function seedIfEmpty() {
  if (!localStorage.getItem(KEYS.products)) {
    write(KEYS.products, SEED_PRODUCTS);
  }
  if (!localStorage.getItem(KEYS.reviews)) {
    write(KEYS.reviews, SEED_REVIEWS);
  }
  if (!localStorage.getItem(KEYS.users)) {
    write(KEYS.users, [
      { email: 'demo@user.com', password: 'demo1234', isAdmin: true },
    ]);
  }
}

/** 시드에 정의된 상품 id에 대해 이미지 URL을 최신 시드와 맞춥니다(기존 localStorage 데이터 갱신용). */
export function syncSeedProductImages() {
  const products = read(KEYS.products, []);
  if (!products.length) return;
  const seedMap = Object.fromEntries(SEED_PRODUCTS.map((p) => [p.id, p.image]));
  let changed = false;
  const next = products.map((p) => {
    const img = seedMap[p.id];
    if (img && p.image !== img) {
      changed = true;
      return { ...p, image: img };
    }
    return p;
  });
  if (changed) write(KEYS.products, next);
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Auth ───────────────────────────────────────────────────
export const localAuth = {
  signUp(email, password) {
    const users = read(KEYS.users, []);
    if (users.find((u) => u.email === email)) {
      return Promise.reject(new Error('이미 가입된 이메일입니다.'));
    }
    const user = { email, password, isAdmin: false };
    users.push(user);
    write(KEYS.users, users);
    write(KEYS.currentUser, { email: user.email, isAdmin: false });
    return Promise.resolve({ email: user.email, isAdmin: false });
  },
  signIn(email, password) {
    const users = read(KEYS.users, []);
    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) return Promise.reject(new Error('이메일 또는 비밀번호가 올바르지 않습니다.'));
    const session = { email: user.email, isAdmin: !!user.isAdmin };
    write(KEYS.currentUser, session);
    return Promise.resolve(session);
  },
  signOut() {
    localStorage.removeItem(KEYS.currentUser);
    return Promise.resolve();
  },
  current() {
    return read(KEYS.currentUser, null);
  },
};

// ─── Products ───────────────────────────────────────────────
export const localProducts = {
  list() {
    return Promise.resolve(read(KEYS.products, []));
  },
  hot() {
    return Promise.resolve(read(KEYS.products, []).filter((p) => p.isHot));
  },
  get(id) {
    return Promise.resolve(read(KEYS.products, []).find((p) => p.id === id) || null);
  },
  add(product) {
    const products = read(KEYS.products, []);
    const newProduct = { id: uid('p'), ...product };
    products.unshift(newProduct);
    write(KEYS.products, products);
    return Promise.resolve(newProduct);
  },
  remove(id) {
    const products = read(KEYS.products, []).filter((p) => p.id !== id);
    write(KEYS.products, products);
    return Promise.resolve();
  },
};

// ─── Reviews ────────────────────────────────────────────────
export const localReviews = {
  forProduct(productId) {
    return Promise.resolve(
      read(KEYS.reviews, [])
        .filter((r) => r.productId === productId)
        .sort((a, b) => b.createdAt - a.createdAt),
    );
  },
  byUser(email) {
    return Promise.resolve(
      read(KEYS.reviews, [])
        .filter((r) => r.userEmail === email)
        .sort((a, b) => b.createdAt - a.createdAt),
    );
  },
  add(review) {
    const reviews = read(KEYS.reviews, []);
    const newReview = { id: uid('r'), createdAt: Date.now(), ...review };
    reviews.push(newReview);
    write(KEYS.reviews, reviews);
    return Promise.resolve(newReview);
  },
};

// ─── Orders (간단한 마이페이지용) ─────────────────────────
export const localOrders = {
  byUser(email) {
    return Promise.resolve(
      read(KEYS.orders, [])
        .filter((o) => o.userEmail === email)
        .sort((a, b) => b.createdAt - a.createdAt),
    );
  },
  add(order) {
    const orders = read(KEYS.orders, []);
    const newOrder = { id: uid('o'), createdAt: Date.now(), ...order };
    orders.push(newOrder);
    write(KEYS.orders, orders);
    return Promise.resolve(newOrder);
  },
};
