import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
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
import MessagesPage from './pages/MessagesPage';
import ConversationPage from './pages/ConversationPage';
import LinkRedirect from './pages/LinkRedirect';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
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
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/link" element={<LinkRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
