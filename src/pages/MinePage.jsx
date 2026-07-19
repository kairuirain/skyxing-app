import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransition } from '../context/TransitionContext';
import { isAndroid } from '../lib/platform';
import {
  Shield, IdCard, Settings as SettingsIcon, ScrollText, User as UserIcon,
  FileText, LogOut, ShieldCheck, LogIn, Bell,
} from 'lucide-react';
import { MenuList, MenuRow, MenuDivider, MenuSectionTitle } from '../components/MenuList';

export default function MinePage() {
  const { user, logout } = useAuth();
  const { launch } = useTransition();
  const navigate = useNavigate();
  const android = isAndroid();

  if (!user) {
    return (
      <div className="min-h-full flex items-center justify-center px-6 animate-fadeIn">
        <div className="w-full max-w-sm bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-[var(--win-pane)] flex items-center justify-center text-[var(--win-text-tertiary)] mb-4">
            <LogIn size={26} />
          </div>
          <p className="text-[var(--win-text)] text-sm mb-5">请先登录后查看个人中心</p>
          <Link to="/login" className="inline-block w-full py-2 rounded-lg bg-[var(--win-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity">
            前往登录
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => { logout(); navigate('/'); };
  const initial = (user?.displayName || user?.username || '?').charAt(0).toUpperCase();

  return (
    <div className="min-h-full px-4 py-5">
      {/* 用户信息显示 */}
      <div className="bg-[var(--win-card)] border border-[var(--win-border)] rounded-2xl p-5 mb-5 animate-fadeInUp">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fb7299] to-[#00a1d6] text-white text-2xl font-bold flex items-center justify-center shadow-md shrink-0">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-bold text-[var(--win-text)] truncate">{user?.displayName || user?.username}</h1>
            <p className="text-[13px] text-[var(--win-text-tertiary)] truncate">@{user?.username}</p>
            {user?.role === 'admin' && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-[var(--win-accent)] font-semibold">
                <ShieldCheck size={12} /> 管理员
              </span>
            )}
          </div>
        </div>
        {user?.bio && (
          <p className="text-[13px] text-[var(--win-text-secondary)] mt-4 pt-4 border-t border-[var(--win-border)] leading-relaxed">{user.bio}</p>
        )}
      </div>

      <MenuSectionTitle>账号</MenuSectionTitle>
      <MenuList className="mb-2 animate-fadeInUp">
        <MenuRow icon={Shield} label="账号安全" desc="密码 · 2FA · 注销账号" onClick={(e) => launch(e, '/account/security')} />
        <MenuDivider />
        <MenuRow icon={IdCard} label="账号信息" desc="昵称 · 简介 · 头像" onClick={(e) => launch(e, '/account/info')} />
      </MenuList>

      <MenuSectionTitle>通用</MenuSectionTitle>
      <MenuList className="mb-2 animate-fadeInUp">
        <MenuRow icon={Bell} label="消息通知" desc="系统消息与互动提醒" onClick={(e) => launch(e, '/notifications')} />
        <MenuDivider />
        <MenuRow icon={SettingsIcon} label="设置" desc="个性化 · 更新 · 反馈 · 关于" onClick={(e) => launch(e, '/settings')} />
        <MenuDivider />
        <MenuRow icon={ScrollText} label="隐私条款和用户协议" onClick={(e) => launch(e, '/privacy')} />
      </MenuList>

      {user?.role === 'admin' && (
        <MenuList className="mb-2 animate-fadeInUp">
          <MenuRow icon={ShieldCheck} label="管理后台" onClick={(e) => launch(e, '/admin')} />
        </MenuList>
      )}

      <MenuList className="mb-5 animate-fadeInUp">
        <MenuRow icon={UserIcon} label="我的主页" onClick={(e) => launch(e, `/user/${user.id}`)} />
        <MenuDivider />
        <MenuRow icon={FileText} label="我的文章" onClick={(e) => launch(e, `/user/${user.id}?tab=articles`)} />
      </MenuList>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl text-red-500 font-medium bg-[var(--win-card)] border border-[var(--win-border)] hover:bg-red-50 active:bg-red-100 transition-colors animate-fadeInUp"
      >
        <LogOut size={18} /> 退出登录
      </button>

      <p className="pt-6 pb-2 text-center text-[11px] text-[var(--win-text-tertiary)]">SkyXing v{__APP_VERSION__}</p>
    </div>
  );
}
