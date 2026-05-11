import { useEffect, useMemo, useState } from 'react';
import { ProductsAPI, ReviewsAPI, average } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [all, hot] = await Promise.all([
        ProductsAPI.list(),
        ProductsAPI.hot(),
      ]);
      setProducts(all);
      setHotProducts(hot);

      // 모든 상품의 리뷰를 한 번에 모아 평균 별점 계산용으로 사용
      const reviewLists = await Promise.all(
        all.map((p) => ReviewsAPI.forProduct(p.id)),
      );
      setReviews(reviewLists.flat());
      setLoading(false);
    })();
  }, []);

  const ratingMap = useMemo(() => {
    const map = {};
    for (const r of reviews) {
      if (!map[r.productId]) map[r.productId] = [];
      map[r.productId].push(r);
    }
    return map;
  }, [reviews]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(k) ||
        (p.category || '').toLowerCase().includes(k),
    );
  }, [keyword, products]);

  if (loading) return <div className="loading">상품을 불러오는 중...</div>;

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <h1>오늘의 라이프스타일 ✨</h1>
            <p>큐레이션된 인기 상품을 만나보세요.</p>
          </div>
          <input
            className="search"
            placeholder="🔍 상품 또는 카테고리 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </section>

      <div className="container">
        {hotProducts.length > 0 && !keyword && (
          <section>
            <h2 className="section-title">
              🔥 인기 상품 <span className="muted small">HOT</span>
            </h2>
            <div className="product-grid">
              {hotProducts.map((p) => {
                const rs = ratingMap[p.id] || [];
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    avgRating={average(rs)}
                    reviewCount={rs.length}
                  />
                );
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="section-title">
            {keyword ? `"${keyword}" 검색 결과` : '전체 상품'}
          </h2>
          {filtered.length === 0 ? (
            <div className="card empty">
              <p>표시할 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((p) => {
                const rs = ratingMap[p.id] || [];
                return (
                  <ProductCard
                    key={p.id}
                    product={p}
                    avgRating={average(rs)}
                    reviewCount={rs.length}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
