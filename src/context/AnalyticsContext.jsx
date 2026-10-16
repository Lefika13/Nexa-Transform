import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const [analytics, setAnalytics] = useState(() => {
    const saved = localStorage.getItem('nexa_analytics');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      visits: 0,
      pageViews: {},
      clicks: {}
    };
  });
  
  const location = useLocation();

  // Save to localStorage whenever analytics state changes
  useEffect(() => {
    localStorage.setItem('nexa_analytics', JSON.stringify(analytics));
  }, [analytics]);

  // Track initial visit and page views
  useEffect(() => {
    setAnalytics(prev => {
      const isNewSession = !sessionStorage.getItem('nexa_session_active');
      let newVisits = prev.visits;
      
      if (isNewSession) {
        newVisits += 1;
        sessionStorage.setItem('nexa_session_active', 'true');
      }

      const path = location.pathname;
      const newPageViews = { ...prev.pageViews };
      newPageViews[path] = (newPageViews[path] || 0) + 1;

      return {
        ...prev,
        visits: newVisits,
        pageViews: newPageViews
      };
    });
  }, [location.pathname]);

  const trackClick = (itemName) => {
    setAnalytics(prev => {
      const newClicks = { ...prev.clicks };
      newClicks[itemName] = (newClicks[itemName] || 0) + 1;
      return {
        ...prev,
        clicks: newClicks
      };
    });
  };

  return (
    <AnalyticsContext.Provider value={{ analytics, trackClick }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => useContext(AnalyticsContext);
