import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import MyPage from './pages/MyPage';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AIChatbot from './components/AIChatbot';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading">로딩 중...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading">로딩 중...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) {
    return (
      <div className="container">
        <div className="card empty">
          <h2>접근 권한이 없습니다</h2>
          <p>관리자 권한이 필요한 페이지입니다.</p>
          <p className="hint">데모 계정: <b>demo@user.com / demo1234</b></p>
        </div>
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <Admin />
              </RequireAdmin>
            }
          />
          <Route
            path="/mypage"
            element={
              <RequireAuth>
                <MyPage />
              </RequireAuth>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AIChatbot />
      <footer className="footer">
        <p>© {new Date().getFullYear()} 마이샵 · React + Firebase 학습용 데모</p>
      </footer>
    </>
  );
}
