import { createContext, useContext, useState, useEffect } from 'react';
import { fetchSiteSettings } from '../api';

const SiteSettingsContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSiteSettings()
      .then(setSettings)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (settings?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }

    if (settings?.apple_touch_icon_url) {
      let link = document.querySelector("link[rel='apple-touch-icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'apple-touch-icon';
        document.head.appendChild(link);
      }
      link.href = settings.apple_touch_icon_url;
    }

    if (settings?.social_sharing_image_url) {
      let ogMeta = document.querySelector("meta[property='og:image']");
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', 'og:image');
        document.head.appendChild(ogMeta);
      }
      ogMeta.content = settings.social_sharing_image_url;
      
      let twitterMeta = document.querySelector("meta[name='twitter:image']");
      if (!twitterMeta) {
        twitterMeta = document.createElement('meta');
        twitterMeta.setAttribute('name', 'twitter:image');
        document.head.appendChild(twitterMeta);
      }
      twitterMeta.content = settings.social_sharing_image_url;
    }
  }, [settings?.favicon_url, settings?.apple_touch_icon_url, settings?.social_sharing_image_url]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
