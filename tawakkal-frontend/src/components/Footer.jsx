import { useSiteSettings } from '../context/SiteSettingsContext';

const SocialIcons = {
  Facebook: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  TikTok: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.36-.54.38-.89.98-1.01 1.64-.13.64.01 1.35.35 1.9.36.57.97.97 1.62 1.13.67.16 1.39.11 2.02-.18.73-.34 1.25-1.01 1.47-1.79.07-.3.1-.61.1-.92-.02-3.5-.04-7.01-.03-10.52z"/>
    </svg>
  ),
};

const Footer = ({ id }) => {
  const settings = useSiteSettings();

  const phone = settings?.contact_phone || '+92 300 7600883';
  const email = settings?.contact_email || 'mianusmanjee09@gmail.com';
  const address = settings?.address || 'Karachi, Pakistan';
  const facebookUrl = settings?.facebook_url || '#';
  const instagramUrl = settings?.instagram_url || '#';
  const tiktokUrl = settings?.tiktok_profile_url || '#';

  return (
    <footer id={id} className="bg-charcoal text-white pt-16 md:pt-24 pb-4 border-t border-gold/20">
      <div className="max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-12 md:mb-20">

          {/* Column 1: Contact */}
          <div className="lg:w-[20%] gap-4">
            <h3 className="text-[14px] uppercase tracking-[0.2em] font-extrabold text-white mb-6">GET IN TOUCH</h3>
            <div className="space-y-2 text-xs text-white/60">
              <div className="flex flex-col space-y-0">
                <span className="text-white uppercase text-[12px] tracking-wider opacity-40">Phone no</span>
                <a href={`tel:${phone}`} className="text-gray-300 uppercase text-[12px] tracking-wider font-light hover:text-gold transition-colors">{phone}</a>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-white uppercase text-[12px] tracking-wider opacity-40">Email</span>
                <a href={`mailto:${email}`} className="text-gray-300 uppercase text-[12px] tracking-wider font-light hover:text-gold transition-colors">{email}</a>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-white uppercase text-[12px] tracking-wider opacity-40">Address</span>
                <p className="text-gray-300 uppercase text-[12px] tracking-wider font-light">{address}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Customer Care */}
          <div className="lg:w-[20%] gap-4">
            <h3 className="text-[14px] uppercase tracking-[0.2em] font-extrabold text-white mb-6">CUSTOMER CARE</h3>
            <ul className="space-y-0 md:space-y-2 text-[12px] text-white/60">
              <li><a href="/contact" className="hover:text-gold transition-colors block">Contact Us</a></li>
              <li><a href="/feedback-survey" className="hover:text-gold transition-colors block">Feedback Survey</a></li>
              <li><a href="/privacy-policy" className="hover:text-gold transition-colors block">Privacy Policy</a></li>
              <li><a href="/faqs" className="hover:text-gold transition-colors block">FAQ's</a></li>
              <li><a href="/disclaimer" className="hover:text-gold transition-colors block">Disclaimer</a></li>
            </ul>
          </div>

          {/* Column 3: Information */}
          <div className="lg:w-[20%]">
            <h3 className="text-[14px] uppercase tracking-[0.2em] font-extrabold text-white mb-6">INFORMATION</h3>
            <ul className="space-y-0 md:space-y-2 text-[12px] text-white/60">
              <li><a href="/about" className="hover:text-gold transition-colors block">About Us</a></li>
              <li><a href="/shipping" className="hover:text-gold transition-colors block">Shipping and Handling</a></li>
              <li><a href="/store-locator" className="hover:text-gold transition-colors block">Store Locator</a></li>
              <li><a href="/blogs" className="hover:text-gold transition-colors block">Blogs</a></li>
              <li><a href="/fabric-glossary" className="hover:text-gold transition-colors block">Fabric Glossary</a></li>
            </ul>
          </div>

          {/* Column 4: About */}
          <div className="lg:w-[40%]">
            <h3 className="text-[14px] uppercase tracking-[0.2em] font-extrabold text-white mb-6">ABOUT</h3>
            <div className="mb-6">
              {settings?.footer_logo_url || settings?.main_logo_url ? (
                <img 
                  src={settings?.footer_logo_url || settings?.main_logo_url} 
                  alt={settings?.site_name || "Tawakkal"} 
                  className="h-10 w-auto object-contain"
                />
              ) : null}
            </div>
            <p className="text-white/60 text-[12px] leading-relaxed text-left pl-0 lg:pl-0">
              {settings?.site_description || "Luxury fashion destination crafting world-class textiles."}
            </p>
            <div className="mt-4 flex space-x-6 text-white/60">
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><SocialIcons.Facebook /></a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><SocialIcons.Instagram /></a>
              <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors"><SocialIcons.TikTok /></a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 md:pt-4 flex justify-center">
          <p className="text-[12px] uppercase tracking-[0.2em] text-white/40 text-center">
          © 2026 - {settings?.site_name?.toUpperCase() || "TAWAKKAL"} | Developed by <span className="text-gold hover:text-orange-200 transition-colors"><a href="https://techmiresolutions.com/" target="_blank" rel="noopener noreferrer">Techmire Solutions</a></span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
