import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EMAIL_PENDING } from '../services/supabaseAuth';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setLoading(true);
    try {
      const result = await signUp(email, password);
      if (result?.__type === EMAIL_PENDING) {
        setInfo('가입 확인 이메일을 발송했습니다. 이메일을 확인한 후 로그인해 주세요.');
        return;
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (info) {
    return (
      <div className="container narrow">
        <div className="card form-card">
          <h2>이메일을 확인해 주세요 ✉️</h2>
          <div className="alert success" style={{ marginTop: 12 }}>{info}</div>
          <p className="muted small" style={{ marginTop: 16 }}>
            이미 확인하셨나요? <Link to="/login">로그인</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <div className="card form-card">
        <h2>회원가입</h2>
        <p className="muted">이메일과 비밀번호를 입력해 주세요.</p>

        <form onSubmit={onSubmit} className="form">
          <label>
            이메일
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </label>
          <label>
            비밀번호 (6자 이상)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>
          <label>
            비밀번호 확인
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="muted small">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
