import React from 'react';

export default function AnalyticsView() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics & Overview</h1>
      <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center">
        <p className="text-stone-500 mb-4">To view live analytics, please log into your PostHog dashboard.</p>
        <a 
          href="https://app.posthog.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-brand-dark hover:bg-black transition-colors"
        >
          Open PostHog Dashboard
        </a>
      </div>
    </div>
  );
}
