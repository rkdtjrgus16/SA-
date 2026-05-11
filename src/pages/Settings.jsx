import { useEffect, useState } from 'react';
import {
  getApiKey,
  setApiKey,
  getModel,
  setModel,
  isEnvKey,
} from '../services/ai';

export default function Settings() {
  const [key, setKey] = useState('');
  const [model, setModelState] = useState('gpt-4o-mini');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);
  const envActive = isEnvKey();

  useEffect(() => {
    setKey(envActive ? '' : getApiKey());
    setModelState(getModel());
  }, [envActive]);

  const onSave = (e) => {
    e.preventDefault();
    setApiKey(key);
    setModel(model);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const onClear = () => {
    if (!confirm('저장된 API 키를 삭제할까요?')) return;
    setApiKey('');
    setKey('');
  };

  const masked = (k) => {
    if (!k) return '';
    if (k.length < 12) return '••••';
    return k.slice(0, 6) + '••••••••' + k.slice(-4);
  };

  return (
    <div className="container narrow">
      <h1 className="page-title">설정</h1>

      <div className="card form-card">
        <h2>🤖 OpenAI API 키</h2>
        <p className="muted small">
          AI 상품 추천 · 리뷰 요약 · 상품 설명 생성 기능에 사용됩니다. 키는
          브라우저 localStorage 에만 저장되며 외부로 전송되지 않습니다.
        </p>

        <div className="alert warn">
          ⚠️ <b>학습용 데모</b>이므로 키가 브라우저에 노출됩니다. 실제 서비스에서는
          반드시 백엔드(Firebase Functions 등)를 통해 호출하세요.
        </div>

        {envActive && (
          <div className="alert success">
            ✅ <b>.env 파일의 키가 적용 중</b>입니다. 별도 입력 없이 AI 기능이
            동작해요. (변경하려면 프로젝트 루트의 <code>.env</code> 파일을
            수정한 뒤 개발 서버를 재시작하세요.)
          </div>
        )}

        <form onSubmit={onSave} className="form">
          <label>
            API 키 {envActive && <span className="muted small">(.env 사용 중 — 아래는 비활성화됨)</span>}
            <div className="key-input-row">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={envActive ? '.env 의 키가 우선 적용됩니다' : 'sk-...'}
                autoComplete="off"
                spellCheck={false}
                disabled={envActive}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShow((s) => !s)}
                disabled={envActive}
              >
                {show ? '숨기기' : '보기'}
              </button>
            </div>
            {!show && key && !envActive && (
              <span className="muted small">현재: {masked(key)}</span>
            )}
          </label>

          <label>
            모델
            <select
              value={model}
              onChange={(e) => setModelState(e.target.value)}
            >
              <option value="gpt-4o-mini">gpt-4o-mini (저렴, 빠름) – 추천</option>
              <option value="gpt-4o">gpt-4o (고품질)</option>
              <option value="gpt-4.1-mini">gpt-4.1-mini</option>
              <option value="gpt-4.1">gpt-4.1</option>
            </select>
          </label>

          {saved && <div className="alert success">저장되었습니다.</div>}

          <div className="btn-row">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={envActive}
            >
              저장
            </button>
            {key && !envActive && (
              <button
                className="btn btn-ghost"
                type="button"
                onClick={onClear}
              >
                키 삭제
              </button>
            )}
          </div>
        </form>

        <div className="hint-box">
          <p style={{ margin: '0 0 8px' }}>
            <b>📌 가장 쉬운 설정 방법</b>
          </p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>프로젝트 루트의 <code>.env</code> 파일을 엽니다.</li>
            <li><code>VITE_OPENAI_API_KEY=여기에_키_붙여넣기</code> 줄의 값을 본인 키로 교체.</li>
            <li>개발 서버 재시작 (<code>npm run dev</code>).</li>
          </ol>
          <p style={{ margin: '8px 0 0' }}>
            API 키 발급:{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
            >
              platform.openai.com/api-keys
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
