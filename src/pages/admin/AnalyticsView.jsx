import React from 'react';
import { BarChart3, Settings } from 'lucide-react';

export default function AnalyticsView() {
  const sharedDashboardUrl = import.meta.env.VITE_POSTHOG_SHARED_DASHBOARD;

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-brand-dark" /> Analytics & Overview
        </h1>
      </div>

      {sharedDashboardUrl ? (
        <div className="flex-1 bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden min-h-[600px]">
          <iframe 
            src={sharedDashboardUrl} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen
            title="PostHog Analytics"
            className="w-full h-full"
          ></iframe>
        </div>
      ) : (
        <div className="bg-white p-8 md:p-12 rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center text-center max-w-2xl mx-auto mt-10">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6">
            <Settings className="w-8 h-8 text-stone-500" />
          </div>
          <h2 className="text-xl font-bold mb-4">Connect Your PostHog Dashboard</h2>
          <p className="text-stone-500 mb-8 leading-relaxed">
            You can embed your live analytics directly on this page. To do so, you need to generate a Shared Dashboard link in PostHog and add it to your Vercel Environment Variables.
          </p>
          
          <div className="text-left bg-stone-50 p-6 rounded-xl border border-stone-200 w-full mb-8">
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider text-stone-600">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-3 text-stone-600 text-sm">
              <li>Log into your PostHog account.</li>
              <li>Go to <strong>Dashboards</strong> and open your main dashboard.</li>
              <li>Click the <strong>Share</strong> button (top right).</li>
              <li>Enable "Share dashboard publicly" and copy the embedded URL.</li>
              <li>Go to your Vercel project Settings &gt; Environment Variables.</li>
              <li>Add a new variable named <code className="bg-stone-200 px-1.5 py-0.5 rounded text-brand-dark font-bold">VITE_POSTHOG_SHARED_DASHBOARD</code></li>
              <li>Paste the URL as the value, save, and <strong>Redeploy</strong> in Vercel.</li>
            </ol>
          </div>

          <a 
            href="https://app.posthog.com/dashboards" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-brand-dark hover:bg-black transition-colors"
          >
            Open PostHog to get link
          </a>
        </div>
      )}
    </div>
  );
}
