import React, { useState, useEffect } from 'react';
import { useLocation, Routes } from 'react-router-dom';
import PageLoader from './PageLoader';

export default function RouteTransitionProvider({ children, enableLoader }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // If loader is globally disabled, just switch immediately
    if (enableLoader === false) {
      setDisplayLocation(location);
      return;
    }

    // Only intercept if the route path actually changes
    if (location.pathname !== displayLocation.pathname) {
      setIsNavigating(true);
      
      // Wait for the loader to completely fade in (400ms) before switching routes
      const transitionTimer = setTimeout(() => {
        setDisplayLocation(location);
        window.scrollTo(0, 0); // Ensure the new page starts at the top
        
        // Wait another 300ms so the user sees the logo, then fade out
        const exitTimer = setTimeout(() => {
          setIsNavigating(false);
        }, 300);

        return () => clearTimeout(exitTimer);
      }, 400);

      return () => clearTimeout(transitionTimer);
    }
  }, [location, displayLocation.pathname, enableLoader]);

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
