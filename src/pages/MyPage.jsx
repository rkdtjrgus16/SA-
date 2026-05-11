import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReviewsAPI, OrdersAPI, ProductsAPI } from '../services/api';
import StarRating from '../components/StarRating';

export default function MyPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const [rs, os, ps] = await Promise.all([
        ReviewsAPI.byUser(user.email),
        OrdersAPI.byUser(user.email),
        ProductsAPI.list(),
      ]);
      setReviews(rs);
      setOrders(os);
      setProductMap(Object.fromEntries(ps.map((p) => [p.id, p])));
      setLoading(false);
    })();
  }, [user]);

  if (!user) return null;
  if (loading) return <div className="loading">불러오는 중...</div>;

  return (
    <div className="container">
      <h1 className="page-title">마이페이지</h1>

      <div className="card profile-card">
        <div className="avatar">{user.email.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{user.email}</h2>
          <p className="muted">
            {user.isAdmin ? '관리자 계정' : '일반 회원'}
          </p>
        </div>
      </div>

      <section>
        <h2 className="section-title">주문 내역 ({orders.length})</h2>
        {orders.length === 0 ? (
          <div className="card empty">
            <p>주문 내역이 없습니다.</p>
            <Link to="/" className="btn btn-primary">
              쇼핑하러 가기
            </Link>
          </div>
        ) : (
          <ul className="order-list">
            {orders.map((o) => (
              <li key={o.id} className="card">
                <p>{new Date(o.createdAt).toLocaleString('ko-KR')}</p>
                <p>총 {o.total?.toLocaleString()}원</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-title">내가 쓴 리뷰 ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="card empty">
            <p>작성한 리뷰가 없습니다.</p>
          </div>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => {
              const p = productMap[r.productId];
              return (
                <li key={r.id} className="card review-item">
                  <div className="review-head">
                    <StarRating value={r.rating} size={16} />
                    <span className="muted small">
                      {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  {p ? (
                    <Link to={`/products/${p.id}`} className="review-product">
                      {p.name}
                    </Link>
                  ) : (
                    <span className="muted small">(삭제된 상품)</span>
                  )}
                  <p className="review-text">{r.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
