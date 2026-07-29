import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import PublicSite from './pages/PublicSite';
import AdminDashboard from './pages/admin/AdminDashboard';
import Login from './pages/admin/Login';
import ProjectsGrid from './pages/ProjectsGrid';
import ProjectDetail from './pages/ProjectDetail';
import FAQPage from './pages/FAQPage';
import RouteTransitionProvider from './components/RouteTransitionProvider';
import { supabase } from './lib/supabase';
import { logPageView } from './lib/analytics';
import CookieConsent from './components/shared/CookieConsent';
import { useLocation } from 'react-router-dom';

function App() {
  const [lang, setLang] = useState('en');
  const [enableLoader, setEnableLoader] = useState(true);
  const [seo, setSeo] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Log page view whenever the location changes
    logPageView(location.pathname);
  }, [location]);

  useEffect(() => {
    // Fetch global settings on app load
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('enable_page_loader, seo_title, seo_description, seo_keywords')
        .limit(1)
        .single();
      
      if (data) {
        if (data.enable_page_loader !== undefined) setEnableLoader(data.enable_page_loader);
        setSeo({
          title: data.seo_title,
          description: data.seo_description,
          keywords: data.seo_keywords
        });
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
    <HelmetProvider>
      {seo && (
        <Helmet>
          {seo.title && <title>{seo.title}</title>}
          {seo.description && <meta name="description" content={seo.description} />}
          {seo.keywords && <meta name="keywords" content={seo.keywords} />}
          {seo.title && <meta property="og:title" content={seo.title} />}
          {seo.description && <meta property="og:description" content={seo.description} />}
        </Helmet>
      )}
      <RouteTransitionProvider enableLoader={enableLoader}>
        <Routes>
          <Route path="/projects" element={<ProjectsGrid lang={lang} setLang={setLang} />} />
          <Route path="/projects/:slug" element={<ProjectDetail lang={lang} setLang={setLang} />} />
          <Route path="/faq" element={<FAQPage lang={lang} setLang={setLang} />} />
          <Route path="/*" element={<PublicSite lang={lang} setLang={setLang} />} />
          <Route path="/tashkeladmin/login" element={<Login />} />
          <Route path="/tashkeladmin/*" element={<AdminDashboard />} />
        </Routes>
        {!location.pathname.startsWith('/tashkeladmin') && <CookieConsent lang={lang} />}
      </RouteTransitionProvider>
    </HelmetProvider>
  );
}

export default App;
