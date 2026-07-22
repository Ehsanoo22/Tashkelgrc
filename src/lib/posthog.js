import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: false, // We'll handle this manually for SPA routing if needed
  });
} else {
  console.warn("PostHog key is missing in .env.local, analytics disabled.");
}

export { posthog };
