import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductsAPI } from '../services/api';
import {
  recommendProducts,
  customerServiceChat,
  hasApiKey,
} from '../services/ai';

const SUGGESTIONS = {
  recommend: [
    '5만원 이하 선물용 추천해줘',
    '재택근무에 어울리는 아이템 있어?',
    '여름에 시원하게 입을 옷 있을까',
    '인기 상품 중 하나 추천해줘',
  ],
  support: [
    '배송은 얼마나 걸리나요?',
    '반품/교환 어떻게 하나요?',
    '결제 수단은 뭐가 있나요?',
    '회원가입은 어떻게 해요?',
  ],
};

const WELCOME = {
  recommend:
    '안녕하세요! 원하시는 상품의 분위기·용도·예산 등을 알려주시면 어울리는 상품을 추천해 드릴게요.',
  support:
    '안녕하세요, 마이샵 고객센터입니다. 배송·반품·결제 등 무엇이든 물어보세요.',
};

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('recommend'); // 'recommend' | 'support'
  const [products, setProducts] = useState([]);

  // 모드별 메시지를 따로 보관 (탭 전환해도 히스토리 유지)
  const [recMessages, setRecMessages] = useState([
    { role: 'assistant', type: 'text', content: WELCOME.recommend },
  ]);
  const [supMessages, setSupMessages] = useState([
    { role: 'assistant', type: 'text', content: WELCOME.support },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const messages = mode === 'recommend' ? recMessages : supMessages;
  const setMessages = mode === 'recommend' ? setRecMessages : setSupMessages;
  const suggestions = SUGGESTIONS[mode];

  useEffect(() => {
    if (open && mode === 'recommend' && products.length === 0) {
      ProductsAPI.list().then(setProducts);
    }
  }, [open, mode, products.length]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const isInitial = messages.length === 1;

  // 고객 응대 모드: OpenAI 가 받을 대화 히스토리 (텍스트만)
  const supportHistory = useMemo(
    () =>
      supMessages
        .filter((m) => m.type !== 'error')
        .map((m) => ({ role: m.role, content: m.content })),
    [supMessages],
  );

  const ask = async (text) => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loading) return;

    setMessages((m) => [
      ...m,
      { role: 'user', type: 'text', content: userMessage },
    ]);
    setInput('');

    if (!hasApiKey()) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          type: 'error',
          content:
            'OpenAI API 키가 필요해요. 우상단 메뉴의 "설정"에서 키를 등록해 주세요.',
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      if (mode === 'recommend') {
        const result = await recommendProducts({
          userMessage,
          products,
        });
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            type: 'recommendation',
            content: result.message,
            recommendations: result.recommendations,
          },
        ]);
      } else {
        const reply = await customerServiceChat([
          ...supportHistory,
          { role: 'user', content: userMessage },
        ]);
        setMessages((m) => [
          ...m,
          { role: 'assistant', type: 'text', content: reply },
        ]);
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          type: 'error',
          content: err.message || '오류가 발생했습니다.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    ask();
  };

  const headTitle =
    mode === 'recommend' ? '상품 추천 큐레이터' : '고객 응대 도우미';
  const headSub =
    mode === 'recommend'
      ? '자연어로 원하는 걸 말해 주세요. 카탈로그에서 골라드릴게요.'
      : '배송·반품·결제 등 쇼핑몰 이용 관련 문의를 도와드려요.';
  const placeholder =
    mode === 'recommend'
      ? '예: 사무실용 작은 가습기 추천'
      : '예: 반품은 어떻게 신청하나요?';

  return (
    <>
      <button
        className={`chatbot-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="AI 챗봇 열기"
      >
        {open ? '✕' : '🤖'}
      </button>

      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="AI 챗봇">
          <header className="chatbot-head">
            <div>
              <h3>
                <span className="ai-badge">AI</span> {headTitle}
              </h3>
              <p className="muted small">{headSub}</p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOpen(false)}
            >
              닫기
            </button>
          </header>

          <div className="chatbot-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={mode === 'recommend'}
              className={`chatbot-tab ${mode === 'recommend' ? 'active' : ''}`}
              onClick={() => setMode('recommend')}
            >
              🛍️ 상품 추천
            </button>
            <button
              role="tab"
              aria-selected={mode === 'support'}
              className={`chatbot-tab ${mode === 'support' ? 'active' : ''}`}
              onClick={() => setMode('support')}
            >
              💬 고객 응대
            </button>
          </div>

          <div className="chatbot-body" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                <div className="chat-bubble">
                  {m.type === 'error' ? (
                    <span className="muted">{m.content}</span>
                  ) : (
                    <p style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>
                  )}
                  {m.type === 'recommendation' &&
                    m.recommendations.length > 0 && (
                      <ul className="chat-recs">
                        {m.recommendations.map(({ product, reason }) => (
                          <li key={product.id}>
                            <Link
                              to={`/products/${product.id}`}
                              className="chat-rec-card"
                              onClick={() => setOpen(false)}
                            >
                              <img
                                src={product.image}
                                alt={product.name}
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <div>
                                <strong>{product.name}</strong>
                                <span className="price">
                                  {product.price.toLocaleString()}원
                                </span>
                                <span className="reason">{reason}</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg assistant">
                <div className="chat-bubble">
                  <span className="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}

            {isInitial && !loading && (
              <div className="chat-suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    className="suggestion-chip"
                    onClick={() => ask(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className="chatbot-input" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder={placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
            >
              전송
            </button>
          </form>
        </div>
      )}
    </>
  );
}
