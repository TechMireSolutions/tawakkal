import { createContext, useContext, useState, useEffect } from 'react';
import { fetchSiteSettings } from '../api';

const SiteSettingsContext = createContext(null);

let preloadedSettingsPromise = null;
if (typeof window !== 'undefined') {
  preloadedSettingsPromise = fetchSiteSettings();
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSiteSettings = () => useContext(SiteSettingsContext);

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const promise = preloadedSettingsPromise || fetchSiteSettings();
    promise
      .then(setSettings)
      .catch(console.error)
      .finally(() => {
        preloadedSettingsPromise = null;
      });
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

    if (settings?.hero_background_url) {
      let preloadLink = document.querySelector(`link[rel="preload"][as="image"]`);
      if (!preloadLink) {
        preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.fetchPriority = 'high';
        
        if (settings.hero_background_variants) {
          const variants = settings.hero_background_variants;
          preloadLink.imageSrcSet = `${variants.thumb || settings.hero_background_url} 150w, ${variants.card || settings.hero_background_url} 400w, ${variants.medium || settings.hero_background_url} 800w, ${variants.large || settings.hero_background_url} 1600w`;
          preloadLink.imageSizes = "100vw";
        } else {
          preloadLink.href = settings.hero_background_url;
        }
        
        document.head.appendChild(preloadLink);
      }
    }
  }, [settings?.favicon_url, settings?.apple_touch_icon_url, settings?.social_sharing_image_url, settings?.hero_background_url, settings?.hero_background_variants]);

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
};
