import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SlideOutlet from './components/SlideOutlet';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ArticlePage from './pages/ArticlePage';
import WritePage from './pages/WritePage';
import EditPage from './pages/EditPage';
import UserPage from './pages/UserPage';
import AdminPage from './pages/AdminPage';
import PodcastPage from './pages/PodcastPage';
import MinePage from './pages/MinePage';
import AccountSecurityPage from './pages/AccountSecurityPage';
import AccountInfoPage from './pages/AccountInfoPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPage from './pages/PrivacyPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';
import LinkRedirect from './pages/LinkRedirect';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      {/* 主内容框架（含侧边栏导航） */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/podcast" element={<PodcastPage />} />
        <Route path="/mine" element={<MinePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/edit/:id" element={<EditPage />} />
        <Route path="/user/:id" element={<UserPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:convId" element={<ConversationPage />} />
        <Route path="/link" element={<LinkRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* 二级菜单（全屏滑入，覆盖导航栏） */}
      <Route element={<SlideOutlet />}>
        <Route path="/account/security" element={<AccountSecurityPage />} />
        <Route path="/account/info" element={<AccountInfoPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
