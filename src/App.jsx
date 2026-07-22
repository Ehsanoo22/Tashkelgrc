import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/admin/Login';
import ProjectsGrid from './pages/ProjectsGrid';
import ProjectDetail from './pages/ProjectDetail';

function App() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  return (
    <Routes>
      <Route path="/projects" element={<ProjectsGrid lang={lang} setLang={setLang} />} />
      <Route path="/projects/:slug" element={<ProjectDetail lang={lang} setLang={setLang} />} />
      <Route path="/*" element={<PublicSite lang={lang} setLang={setLang} />} />
      <Route path="/tashkeladmin/login" element={<Login />} />
      <Route path="/tashkeladmin/*" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
