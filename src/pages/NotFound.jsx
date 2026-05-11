import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container">
      <div className="card empty">
        <h2>페이지를 찾을 수 없습니다</h2>
        <p>주소를 다시 확인해 주세요.</p>
        <Link to="/" className="btn btn-primary">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
