import { useEffect } from "react";
import gsap from "gsap";
import { useSiteSettings } from "../context/SiteSettingsContext";

const Preloader = ({ onComplete }) => {
  const siteSettings = useSiteSettings();

  useEffect(() => {
    const tl = gsap.timeline();
    tl.to(".preloader-logo", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power4.out",
    })
      .to(".preloader-logo", {
        scale: 1.1,
        duration: 1,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut",
      })
      .to(".preloader-container", {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut",
        onComplete: onComplete,
      });
  }, [onComplete]);

  return (
    <div className="preloader-container fixed inset-0 z-[100] bg-charcoal-dark flex items-center justify-center">
      <div className="preloader-logo opacity-0 translate-y-10 text-center">
        {(siteSettings?.preloader_logo_url || siteSettings?.main_logo_url) && (
          <img
            src={
              siteSettings?.preloader_logo_url || siteSettings?.main_logo_url
            }
            alt={siteSettings?.site_name || "Tawakkal"}
            className="h-20 md:h-24 lg:h-36 w-auto object-contain mx-auto"
          />
        )}
        <div className="w-12 h-0.5 bg-gold mx-auto mt-4" />
      </div>
    </div>
  );
};

export default Preloader;
