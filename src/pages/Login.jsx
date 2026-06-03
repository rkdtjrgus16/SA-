import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container narrow">
      <div className="card form-card">
        <h2>로그인</h2>
        <p className="muted">계정 정보로 로그인해 주세요.</p>

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
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>
          {error && <div className="alert error">{error}</div>}
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="muted small">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
        <div className="hint-box">
          관리자 계정: <b>rkdtjrgus16@gmail.com</b><br />
          계정이 없으면 회원가입 후 이용해 주세요.
        </div>
      </div>
    </div>
  );
}
