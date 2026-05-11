import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isFirebaseConfigured } from '../services/api';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="brand">
          <span className="brand-icon">🛒</span> 마이샵
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            홈
          </NavLink>
          {user?.isAdmin && <NavLink to="/admin">관리자</NavLink>}
          {user && <NavLink to="/mypage">마이페이지</NavLink>}
          <NavLink to="/settings">설정</NavLink>
        </nav>

        <div className="nav-actions">
          {!isFirebaseConfigured && (
            <span className="badge" title="Firebase 미연동 - localStorage 모드">
              데모 모드
            </span>
          )}
          {user ? (
            <>
              <span className="user-email">{user.email}</span>
              <button className="btn btn-ghost" onClick={handleSignOut}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                로그인
              </Link>
              <Link to="/signup" className="btn btn-primary">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
