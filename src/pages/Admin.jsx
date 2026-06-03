import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductsAPI, OrdersAPI } from '../services/api';
import { generateProductDescription, hasApiKey } from '../services/ai';

const EMPTY = {
  name: '',
  price: '',
  image: '',
  description: '',
  isHot: false,
  category: '',
  stock: '',
};

export default function Admin() {
  const [tab, setTab] = useState('products');

  return (
    <div className="container">
      <h1 className="page-title">관리자</h1>
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn${tab === 'products' ? ' active' : ''}`}
          onClick={() => setTab('products')}
        >
          상품 관리
        </button>
        <button
          className={`admin-tab-btn${tab === 'orders' ? ' active' : ''}`}
          onClick={() => setTab('orders')}
        >
          주문 관리
        </button>
      </div>

      {tab === 'products' ? <ProductsTab /> : <OrdersTab />}
    </div>
  );
}

function ProductsTab() {
  const [form, setForm] = useState(EMPTY);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const load = async () => {
    setProducts(await ProductsAPI.list());
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!form.name || !form.price) {
      setError('상품명과 가격은 필수입니다.');
      return;
    }
    setLoading(true);
    try {
      await ProductsAPI.add({
        name: form.name.trim(),
        price: Number(form.price),
        image:
          form.image.trim() ||
          'https://via.placeholder.com/600x600?text=Product',
        description: form.description.trim(),
        isHot: !!form.isHot,
        category: form.category.trim() || '기타',
        stock: form.stock === '' ? 0 : Number(form.stock),
      });
      setForm(EMPTY);
      setMessage('상품이 등록되었습니다.');
      await load();
    } catch (err) {
      setError(err.message || '상품 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    await ProductsAPI.remove(id);
    await load();
  };

  const onGenerateDescription = async () => {
    setError('');
    setMessage('');
    if (!form.name.trim()) {
      setError('AI 설명 생성을 위해 상품명을 먼저 입력해 주세요.');
      return;
    }
    if (!hasApiKey()) {
      setError('OpenAI API 키가 필요합니다. 설정 페이지에서 입력해 주세요.');
      return;
    }
    setAiLoading(true);
    try {
      const text = await generateProductDescription({
        name: form.name,
        category: form.category,
        price: form.price ? Number(form.price) : undefined,
        hints: form.description,
      });
      setForm((f) => ({ ...f, description: text }));
      setMessage('AI가 상품 설명을 작성했습니다. 검토 후 저장해 주세요.');
    } catch (err) {
      setError(err.message || 'AI 호출에 실패했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="admin-grid">
      <div className="card form-card">
        <h2>새 상품 등록</h2>
        <form onSubmit={onSubmit} className="form">
          <label>
            상품명
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="예: 무선 이어폰"
              required
            />
          </label>
          <div className="row-2">
            <label>
              가격(원)
              <input
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={onChange}
                placeholder="0"
                required
              />
            </label>
            <label>
              재고
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={onChange}
                placeholder="0"
              />
            </label>
          </div>
          <label>
            카테고리
            <input
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="예: 전자, 패션"
            />
          </label>
          <label>
            이미지 URL
            <input
              name="image"
              value={form.image}
              onChange={onChange}
              placeholder="https://..."
            />
          </label>
          <label>
            <div className="label-row">
              <span>상품 설명</span>
              <button
                type="button"
                className="btn-ai"
                onClick={onGenerateDescription}
                disabled={aiLoading}
                title={
                  hasApiKey()
                    ? 'OpenAI 로 상품 설명을 생성합니다'
                    : '설정에서 OpenAI 키를 먼저 등록해 주세요'
                }
              >
                {aiLoading ? '✨ 생성 중...' : '✨ AI로 설명 생성'}
              </button>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              placeholder="상품에 대한 간단한 설명 (혹은 키워드만 적고 AI 버튼 클릭)"
            />
            {!hasApiKey() && (
              <span className="muted small">
                AI 기능을 쓰려면 <Link to="/settings">설정</Link>에서 OpenAI
                키를 등록해 주세요.
              </span>
            )}
          </label>
          <label className="checkbox-row">
            <input
              type="checkbox"
              name="isHot"
              checked={form.isHot}
              onChange={onChange}
            />
            인기 상품으로 표시 (메인 페이지 HOT 섹션)
          </label>
          {error && <div className="alert error">{error}</div>}
          {message && <div className="alert success">{message}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '등록 중...' : '상품 등록'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="section-title">등록된 상품 ({products.length})</h2>
        {products.length === 0 ? (
          <div className="card empty">등록된 상품이 없습니다.</div>
        ) : (
          <ul className="admin-product-list">
            {products.map((p) => (
              <li key={p.id} className="card admin-product-row">
                <img src={p.image} alt={p.name} />
                <div className="grow">
                  <h4>
                    {p.name}{' '}
                    {p.isHot && <span className="hot-tag inline">HOT</span>}
                  </h4>
                  <p className="muted small">
                    {p.category} · 재고 {p.stock ?? 0}개
                  </p>
                  <p className="price">{p.price.toLocaleString()}원</p>
                </div>
                <button
                  className="btn btn-danger"
                  onClick={() => onDelete(p.id)}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setOrders(await OrdersAPI.list());
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="loading">주문 불러오는 중...</div>;

  if (orders.length === 0) {
    return (
      <div className="card empty" style={{ marginTop: 24 }}>
        <p>아직 접수된 주문이 없습니다.</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 8 }}>
      <p className="muted small" style={{ marginBottom: 16 }}>
        총 {orders.length}건의 주문
      </p>
      <ul className="order-admin-list">
        {orders.map((o) => (
          <li key={o.id} className="card order-admin-row">
            <div
              className="order-admin-header"
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
            >
              <div className="order-admin-meta">
                <span className="order-admin-email">{o.userEmail || '알 수 없음'}</span>
                <span className="muted small">
                  {new Date(o.createdAt).toLocaleString('ko-KR')}
                </span>
              </div>
              <div className="order-admin-right">
                <span className="order-admin-total">
                  {(o.total ?? o.totalPrice ?? 0).toLocaleString()}원
                </span>
                <span className="order-admin-toggle">
                  {expanded === o.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expanded === o.id && (
              <div className="order-admin-detail">
                {o.address && (
                  <div className="order-admin-section">
                    <p className="order-admin-label">배송지</p>
                    <p>{o.address}</p>
                    {o.recipientName && <p>수령인: {o.recipientName}</p>}
                    {o.phone && <p>연락처: {o.phone}</p>}
                  </div>
                )}

                {o.items && o.items.length > 0 && (
                  <div className="order-admin-section">
                    <p className="order-admin-label">주문 상품</p>
                    <ul className="order-admin-items">
                      {o.items.map((item, i) => (
                        <li key={i} className="order-admin-item">
                          {item.image && (
                            <img src={item.image} alt={item.name} />
                          )}
                          <div className="grow">
                            <p className="order-item-name">{item.name || item.productId}</p>
                            <p className="muted small">
                              {(item.price ?? 0).toLocaleString()}원 × {item.quantity}개
                            </p>
                          </div>
                          <p className="order-item-subtotal">
                            {((item.price ?? 0) * item.quantity).toLocaleString()}원
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="order-admin-footer">
                  <span>주문 번호: <code>{o.id}</code></span>
                  <span className="order-admin-total">
                    합계 {(o.total ?? o.totalPrice ?? 0).toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
