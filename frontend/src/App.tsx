import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import NavigationPage from './pages/NavigationPage';
import AboutPage from './pages/AboutPage';
import WorksPage from './pages/WorksPage';
import ExperiencePage from './pages/ExperiencePage';
import ThoughtsPage from './pages/ThoughtsPage';
import OtherStuffPage from './pages/OtherStuffPage';
import StorePage from './pages/StorePage';
import StoreAdminPage from './pages/StoreAdminPage';

function App() {
  const isStoreHost = window.location.hostname.startsWith('store.');

  if (isStoreHost) {
    return (
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/" element={<StorePage />} />
            <Route path="/product/:slug" element={<StorePage />} />
            <Route path="/checkout/:slug" element={<StorePage />} />
            <Route path="/admin" element={<StoreAdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    );
  }

  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/mystore" element={<StoreRedirect />} />
          <Route path="/mystore/*" element={<StoreRedirect />} />
          <Route path="*" element={<Layout><Routes>
            <Route path="/" element={<Navigate to="/navigation" replace />} />
            <Route path="/navigation" element={<NavigationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/thoughts" element={<ThoughtsPage />} />
            <Route path="/other" element={<OtherStuffPage />} />
            <Route path="*" element={<Navigate to="/navigation" replace />} />
          </Routes></Layout>} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

function StoreRedirect() {
  const location = useLocation();
  useEffect(() => {
    const pathname = location.pathname.replace(/^\/mystore/, '') || '/';
    window.location.replace(`https://store.shangdian.me${pathname}${location.search}${location.hash}`);
  }, [location]);
  return null;
}

export default App;
