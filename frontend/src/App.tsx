import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import NavigationPage from './pages/NavigationPage';
import AboutPage from './pages/AboutPage';
import WorksPage from './pages/WorksPage';
import ExperiencePage from './pages/ExperiencePage';
import ThoughtsPage from './pages/ThoughtsPage';
import OtherStuffPage from './pages/OtherStuffPage';
import PrivateAccessPage from './pages/PrivateAccessPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/navigation" replace />} />
            <Route path="/navigation" element={<NavigationPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/works" element={<WorksPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/thoughts" element={<ThoughtsPage />} />
            <Route path="/other" element={<OtherStuffPage />} />
            <Route path="/private1" element={<PrivateAccessPage section="private1" />} />
            <Route path="/private2" element={<PrivateAccessPage section="private2" />} />
            <Route path="*" element={<Navigate to="/navigation" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;