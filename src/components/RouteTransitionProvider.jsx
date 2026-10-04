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
      // Cinematic initial entrance sequence (~2.4s)
      const initialTimer = setTimeout(() => {
        setIsNavigating(false);
        setIsInitialLoad(false);
      }, 2400);
      return () => clearTimeout(initialTimer);
    }

    // Only intercept if the route path actually changes
    if (location.pathname !== displayLocation.pathname) {
      setIsNavigating(true);
      
      // Fast, sleek architectural transition for subsequent pages (350ms in, 350ms out = 700ms total)
      const transitionTimer = setTimeout(() => {
        setDisplayLocation(location);
        window.scrollTo(0, 0); // Ensure the new page starts at the top
        
        const exitTimer = setTimeout(() => {
          setIsNavigating(false);
        }, 350);

        return () => clearTimeout(exitTimer);
      }, 350);

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
      <PageLoader isVisible={isNavigating} isInitial={isInitialLoad} />
      {wrappedChildren || children}
    </>
  );
}
