import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PenSquare, User, LogOut, LogIn, Home, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0" style={{ WebkitAppRegion: 'drag' }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-600" style={{ WebkitAppRegion: 'no-drag' }}>
            <Home size={22} />
            <span>SkyXing</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3" style={{ WebkitAppRegion: 'no-drag' }}>
            {user ? (
              <>
                <Link to="/write" className="btn-primary btn-sm">
                  <PenSquare size={15} className="mr-1" />
                  写文章
                </Link>
                <Link to={`/user/${user.id}`} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm">
                  <User size={18} />
                  {user.displayName}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-gray-600 hover:text-gray-900" title="管理后台">
                    <Settings size={18} />
                  </Link>
                )}
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-600" title="退出">
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline btn-sm">登录</Link>
                <Link to="/register" className="btn-primary btn-sm">注册</Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600"
            style={{ WebkitAppRegion: 'no-drag' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
            {user ? (
              <>
                <Link to="/write" onClick={() => setMobileMenuOpen(false)} className="block btn-primary btn-sm w-full text-center">
                  写文章
                </Link>
                <Link to={`/user/${user.id}`} onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 py-2 text-sm">
                  个人主页
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 py-2 text-sm">
                    管理后台
                  </Link>
                )}
                <button onClick={handleLogout} className="block text-red-600 py-2 text-sm w-full text-left">
                  退出登录
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block btn-outline btn-sm w-full text-center">登录</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block btn-primary btn-sm w-full text-center">注册</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
