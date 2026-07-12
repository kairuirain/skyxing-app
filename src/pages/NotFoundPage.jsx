import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-200 mb-3">404</h1>
      <p className="text-gray-500 mb-5">页面不存在</p>
      <Link to="/" className="btn-primary btn-sm">返回首页</Link>
    </div>
  );
}
