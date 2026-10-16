import React, { createContext, useContext, useState } from 'react';

// Define all toggleable pages here
const DEFAULT_FLAGS = {
  'training-academy': false,   // Hidden by default
  'innovation-lab': false,     // Hidden by default
  'resources': false,          // Hidden by default
};

const FLAG_LABELS = {
  'training-academy': 'Training Academy',
  'innovation-lab': 'Innovation Lab',
  'resources': 'Resources',
};

const FeatureFlagsContext = createContext();

export const FeatureFlagsProvider = ({ children }) => {
  const [flags, setFlags] = useState(() => {
    const saved = localStorage.getItem('nexa_feature_flags');
    if (saved) {
      // Merge saved with defaults so new flags always start with their default value
      return { ...DEFAULT_FLAGS, ...JSON.parse(saved) };
    }
    return DEFAULT_FLAGS;
  });

  const toggleFlag = (key) => {
    setFlags((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('nexa_feature_flags', JSON.stringify(updated));
      return updated;
    });
  };

  const isVisible = (key) => flags[key] ?? true;

  return (
    <FeatureFlagsContext.Provider value={{ flags, toggleFlag, isVisible, FLAG_LABELS }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext);
