import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';

const SESSION_KEY = 'tashkel_session_id';
const VISITOR_KEY = 'tashkel_visitor_id';
const COOKIE_CONSENT_KEY = 'tashkel_cookie_consent';

// Helper to get or create a persistent visitor ID (localStorage)
const getVisitorId = () => {
  let vid = localStorage.getItem(VISITOR_KEY);
  if (!vid) {
    vid = uuidv4();
    localStorage.setItem(VISITOR_KEY, vid);
  }
  return vid;
};

// Helper to get or create a session ID (sessionStorage)
const getSessionId = async () => {
  let sid = sessionStorage.getItem(SESSION_KEY);
  
  // If no session exists, create a new one in DB
  if (!sid) {
    sid = uuidv4();
    sessionStorage.setItem(SESSION_KEY, sid);
    
    // Only track if consent is given
    if (localStorage.getItem(COOKIE_CONSENT_KEY) === 'granted') {
      try {
        const ua = navigator.userAgent;
        let deviceType = 'Desktop';
        if (/Mobi|Android/i.test(ua)) deviceType = 'Mobile';
        else if (/Tablet|iPad/i.test(ua)) deviceType = 'Tablet';
        
        let browser = 'Other';
        if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Edge')) browser = 'Edge';

        let os = 'Other';
        if (ua.includes('Win')) os = 'Windows';
        else if (ua.includes('Mac')) os = 'MacOS';
        else if (ua.includes('Linux')) os = 'Linux';
        else if (ua.includes('Android')) os = 'Android';
        else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS';

        const urlParams = new URLSearchParams(window.location.search);

        await supabase.from('analytics_sessions').insert([{
          id: sid,
          visitor_id: getVisitorId(),
          device_type: deviceType,
          browser: browser,
          os: os,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          language: navigator.language || 'en-US',
          referrer: document.referrer || 'Direct',
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign')
        }]);
      } catch (err) {
        console.error("Failed to log session:", err);
      }
    }
  }
  return sid;
};

// Log a page view
export const logPageView = async (path) => {
  if (localStorage.getItem(COOKIE_CONSENT_KEY) !== 'granted') return;
  
  try {
    const sid = await getSessionId();
    await supabase.from('analytics_events').insert([{
      session_id: sid,
      event_type: 'page_view',
      page_path: path || window.location.pathname
    }]);
  } catch (err) {
    console.error("Failed to log page view:", err);
  }
};

// Log a custom event (clicks, form submits, etc.)
export const logEvent = async (eventType, elementId = null, metadata = {}) => {
  if (localStorage.getItem(COOKIE_CONSENT_KEY) !== 'granted') return;
  
  try {
    const sid = await getSessionId();
    await supabase.from('analytics_events').insert([{
      session_id: sid,
      event_type: eventType,
      page_path: window.location.pathname,
      element_id: elementId,
      metadata: metadata
    }]);
  } catch (err) {
    console.error("Failed to log event:", err);
  }
};

// Log system activity (Admin actions)
export const logActivity = async (type, description, metadata = {}) => {
  try {
    await supabase.from('activity_logs').insert([{
      type,
      description,
      metadata
    }]);
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

// Consent Management
export const grantConsent = () => {
  localStorage.setItem(COOKIE_CONSENT_KEY, 'granted');
  // Initialize a session immediately if granted
  getSessionId();
  logPageView(window.location.pathname);
};

export const declineConsent = () => {
  localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
  // Clear any existing identifiers
  localStorage.removeItem(VISITOR_KEY);
  sessionStorage.removeItem(SESSION_KEY);
};

export const hasRespondedToConsent = () => {
  return !!localStorage.getItem(COOKIE_CONSENT_KEY);
};
