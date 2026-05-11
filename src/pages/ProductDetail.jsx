import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductsAPI, ReviewsAPI, average } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ReviewSummary from '../components/ReviewSummary';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    const [p, rs] = await Promise.all([
      ProductsAPI.get(id),
      ReviewsAPI.forProduct(id),
    ]);
    setProduct(p);
    setReviews(rs);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('리뷰를 작성하려면 로그인이 필요합니다.');
      return;
    }
    if (!text.trim()) {
      setError('리뷰 내용을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      await ReviewsAPI.add({
        productId: id,
        userEmail: user.email,
        rating: Number(rating),
        text: text.trim(),
      });
      setText('');
      setRating(5);
      await load();
    } catch (err) {
      setError(err.message || '리뷰 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">상품 정보를 불러오는 중...</div>;
  if (!product)
    return (
      <div className="container">
        <div className="card empty">
          <h2>상품을 찾을 수 없습니다</h2>
          <Link to="/" className="btn btn-primary">
            홈으로
          </Link>
        </div>
      </div>
    );

  const avg = average(reviews);

  return (
    <div className="container">
      <div className="product-detail">
        <div className="product-detail-image">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src =
                'https://via.placeholder.com/600x600?text=No+Image';
            }}
          />
          {product.isHot && <span className="hot-tag">HOT</span>}
        </div>

        <div className="product-detail-info">
          <p className="muted small">{product.category}</p>
          <h1>{product.name}</h1>
          <div className="rating-row">
            <StarRating value={avg} size={20} />
            <span className="muted">
              평균 {avg ? avg.toFixed(1) : '–'} · 리뷰 {reviews.length}개
            </span>
          </div>
          <p className="price-lg">{product.price.toLocaleString()}원</p>
          <p className="description">{product.description}</p>
          <p className="muted small">재고: {product.stock ?? '–'}개</p>
          <button className="btn btn-primary btn-lg">장바구니에 담기</button>
        </div>
      </div>

      <section className="reviews-section">
        <h2 className="section-title">리뷰 ({reviews.length})</h2>

        <ReviewSummary reviews={reviews} />

        {/* 리뷰 작성 폼 */}
        <div className="card review-form">
          <h3>리뷰 남기기</h3>
          {!user ? (
            <p className="muted">
              <Link to="/login">로그인</Link> 후 리뷰를 작성할 수 있습니다.
            </p>
          ) : (
            <form onSubmit={submitReview} className="form">
              <div className="rating-picker">
                <span>별점:</span>
                <StarRating value={rating} onChange={setRating} size={26} />
                <span className="muted">{rating}점</span>
              </div>
              <label>
                내용
                <textarea
                  rows={3}
                  placeholder="상품에 대한 솔직한 리뷰를 작성해 주세요."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  required
                />
              </label>
              {error && <div className="alert error">{error}</div>}
              <button className="btn btn-primary" disabled={submitting}>
                {submitting ? '등록 중...' : '리뷰 등록'}
              </button>
            </form>
          )}
        </div>

        {/* 리뷰 리스트 */}
        {reviews.length === 0 ? (
          <div className="card empty">
            <p>아직 리뷰가 없습니다. 첫 리뷰를 남겨 보세요!</p>
          </div>
        ) : (
          <ul className="review-list">
            {reviews.map((r) => (
              <li key={r.id} className="card review-item">
                <div className="review-head">
                  <StarRating value={r.rating} size={16} />
                  <span className="muted small">
                    {new Date(r.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <p className="review-text">{r.text}</p>
                <p className="muted small">{r.userEmail}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
