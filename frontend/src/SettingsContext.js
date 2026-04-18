import React, { createContext, useState, useEffect } from 'react';
import { getApiUrl } from './api';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    site_name: 'منصة النخبة',
    site_slogan: 'منصة النخبة للتعليم الأكاديمي',
    site_logo: '',
    primary_color: '#2563EB',
    maintenance_mode: false,
    allow_registration: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        const newSettings = {};
        data.forEach(s => {
          let val = s.value;
          const isBoolKey = ['maintenance_mode', 'allow_registration'].includes(s.key);
          if (s.type === 'boolean' || isBoolKey) {
            val = (val === 'true' || val === '1' || val === true);
          }
          if (s.type === 'integer') val = parseInt(val);
          if (s.type === 'json' || s.key === 'ranking_system') {
            try { val = typeof val === 'string' ? JSON.parse(val) : val; } catch(e){}
          }
          newSettings[s.key] = val;
        });
        setSettings(prev => ({ ...prev, ...newSettings }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = () => fetchSettings();

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
