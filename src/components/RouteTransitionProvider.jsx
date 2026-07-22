import React, { useState, useEffect } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import PageLoader from './PageLoader';

export default function RouteTransitionProvider({ children, enableLoader }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const isPublicRoute = !location.pathname.startsWith('/tashkeladmin');
  const [isNavigating, setIsNavigating] = useState(isPublicRoute && enableLoader !== false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // If loader is globally disabled or we are in the admin dashboard, skip animation
    if (enableLoader === false || !isPublicRoute) {
      setDisplayLocation(location);
      setIsNavigating(false);
      return;
    }

    if (isInitialLoad) {
      // Clear initial load animation after 1.5 seconds for a majestic entrance
      const initialTimer = setTimeout(() => {
        setIsNavigating(false);
        setIsInitialLoad(false);
      }, 1500);
      return () => clearTimeout(initialTimer);
    }

    // Only intercept if the route path actually changes
    if (location.pathname !== displayLocation.pathname) {
      setIsNavigating(true);
      
      // Wait for the loader to completely fade in (800ms) before switching routes
      const transitionTimer = setTimeout(() => {
        setDisplayLocation(location);
        window.scrollTo(0, 0); // Ensure the new page starts at the top
        
        // Wait another 500ms so the user sees the logo, then trigger the slide-up exit
        const exitTimer = setTimeout(() => {
          setIsNavigating(false);
        }, 500);

        return () => clearTimeout(exitTimer);
      }, 800);

      return () => clearTimeout(transitionTimer);
    }
  }, [location, displayLocation.pathname, enableLoader, isPublicRoute, isInitialLoad]);

  // Inject displayLocation into the <Routes> element so it holds the old page during fade-in
  const wrappedChildren = React.Children.map(children, child => {
    if (React.isValidElement(child) && child.type === Routes) {
      return React.cloneElement(child, { location: displayLocation });
    }
    return child;
  });

  return (
    <>
      <PageLoader isVisible={isNavigating} />
      {wrappedChildren || children}
    </>
  );
}
