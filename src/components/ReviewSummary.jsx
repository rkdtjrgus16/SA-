import { useState } from 'react';
import { Link } from 'react-router-dom';
import { summarizeReviews, hasApiKey } from '../services/ai';

export default function ReviewSummary({ reviews }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!reviews || reviews.length === 0) return null;

  const onSummarize = async () => {
    setError('');
    if (!hasApiKey()) {
      setError('OpenAI API 키가 필요합니다. 설정 페이지에서 등록해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const result = await summarizeReviews(reviews);
      setSummary(result);
    } catch (err) {
      setError(err.message || '요약에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card ai-card">
      <div className="ai-card-head">
        <h3>
          <span className="ai-badge">AI</span> 리뷰 한눈에 보기
        </h3>
        {!summary && !loading && (
          <button className="btn-ai" onClick={onSummarize}>
            ✨ {reviews.length}개 리뷰 요약하기
          </button>
        )}
        {summary && !loading && (
          <button className="btn btn-ghost btn-sm" onClick={onSummarize}>
            다시 분석
          </button>
        )}
      </div>

      {loading && (
        <p className="muted">AI가 {reviews.length}개의 리뷰를 분석 중입니다...</p>
      )}

      {error && (
        <div className="alert error">
          {error}
          {!hasApiKey() && (
            <>
              {' '}
              <Link to="/settings">설정으로 이동</Link>
            </>
          )}
        </div>
      )}

      {summary && (
        <div className="ai-summary">
          <p className="ai-summary-text">{summary.summary}</p>
          <div className="proscons">
            {summary.pros.length > 0 && (
              <div className="proscons-col">
                <h4 className="proscons-title pros">👍 장점</h4>
                <ul>
                  {summary.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {summary.cons.length > 0 && (
              <div className="proscons-col">
                <h4 className="proscons-title cons">👎 아쉬운 점</h4>
                <ul>
                  {summary.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <p className="muted small">
            ⚠️ AI가 생성한 요약이며 실제 리뷰와 차이가 있을 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
}
