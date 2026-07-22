import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import PublicSite from './pages/PublicSite';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/admin/Login';
import ProjectsGrid from './pages/ProjectsGrid';
import ProjectDetail from './pages/ProjectDetail';
import RouteTransitionProvider from './components/RouteTransitionProvider';
import { supabase } from './lib/supabase';

function App() {
  const [lang, setLang] = useState('en');
  const [enableLoader, setEnableLoader] = useState(true);

  useEffect(() => {
    // Fetch global settings on app load
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('enable_page_loader')
        .limit(1)
        .single();
      
      if (data && data.enable_page_loader !== undefined) {
        setEnableLoader(data.enable_page_loader);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  return (
    <RouteTransitionProvider enableLoader={enableLoader}>
      <Routes>
        <Route path="/projects" element={<ProjectsGrid lang={lang} setLang={setLang} />} />
        <Route path="/projects/:slug" element={<ProjectDetail lang={lang} setLang={setLang} />} />
        <Route path="/*" element={<PublicSite lang={lang} setLang={setLang} />} />
        <Route path="/tashkeladmin/login" element={<Login />} />
        <Route path="/tashkeladmin/*" element={<AdminDashboard />} />
      </Routes>
    </RouteTransitionProvider>
  );
}

export default App;
