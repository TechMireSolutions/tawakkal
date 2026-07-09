import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useSiteSettings } from "../context/SiteSettingsContext";

const HeroSection = () => {
  const heroRef = useRef(null);
  const siteSettings = useSiteSettings();

  useEffect(() => {
    if (siteSettings?.hero_enabled === false) return;

    let ctx = gsap.context(() => {
      const heroEls = gsap.utils.toArray(".hero-fade-in");
      const productEls = gsap.utils.toArray(".product-card-reveal");
      
      if (heroEls.length > 0) {
        const tl = gsap.timeline();
        tl.fromTo(
          heroEls,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: "power4.out" }
        );
        if (productEls.length > 0) {
          tl.fromTo(
            productEls,
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.5, stagger: 0.3, ease: "expo.out" },
            "-=1"
          );
        }
      }

      const floatEls = gsap.utils.toArray(".float-card");
      if (floatEls.length > 0) {
        gsap.to(floatEls, {
          y: -15,
          duration: 2.5,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.5,
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, [siteSettings?.hero_enabled]);

  if (siteSettings?.hero_enabled === false) return null;

  const bgImage = siteSettings?.hero_background_url;
  const heroVideo = siteSettings?.hero_video_url;
  const leftImage = siteSettings?.hero_left_image_url;
  const rightImage = siteSettings?.hero_right_image_url;

  const opacity = siteSettings?.hero_overlay_opacity ?? 0.35;
  const desktopHeight = siteSettings?.hero_height || "100vh";
  const mobileHeight = siteSettings?.hero_mobile_height || "70vh";

  const title = siteSettings?.hero_title || "";
  const highlightTitle = siteSettings?.hero_highlight_title || "";
  const subtitle = siteSettings?.hero_subtitle || "";
  const smallText = siteSettings?.hero_small_text || "";

  const leftBtnText = siteSettings?.hero_left_button_text || "";
  const leftBtnLink = siteSettings?.hero_left_button_link || "#";

  const centerBtnText = siteSettings?.hero_center_button_text || "";
  const centerBtnLink = siteSettings?.hero_center_button_link || "#";

  const rightBtnText = siteSettings?.hero_right_button_text || "";
  const rightBtnLink = siteSettings?.hero_right_button_link || "#";

  const getButtonStyle = (style) => {
    if (style === "ghost") return "border-transparent hover:border-transparent";
    if (style === "outline") return "border-charcoal hover:border-charcoal/0";
    if (style === "secondary")
      return "border-charcoal bg-charcoal hover:border-gold hover:bg-charcoal";
    return "border-gold hover:border-gold/0"; // Primary
  };

  const getButtonTextStyle = (style) => {
    if (style === "ghost") return "text-charcoal group-hover:text-charcoal";
    if (style === "outline") return "text-charcoal group-hover:text-white";
    if (style === "secondary") return "text-white group-hover:text-white";
    return "text-gold group-hover:text-white"; // Primary
  };

  const getButtonInnerStyle = (style) => {
    if (style === "ghost")
      return "bg-black/5 -translate-x-full group-hover:translate-x-0";

    if (style === "outline")
      return "bg-charcoal -translate-x-full group-hover:translate-x-0";

    if (style === "secondary")
      return "bg-gold -translate-x-full group-hover:translate-x-0";

    return "bg-gold -translate-x-full group-hover:translate-x-0";
  };

  const getCardBtnContainerStyle = (style) => {
    if (style === "ghost") return "bg-transparent border-transparent";
    if (style === "outline") return "bg-white border-charcoal";
    if (style === "secondary") return "bg-charcoal border-charcoal";
    return "bg-white border-gray-100"; // primary
  };

  const getCardBtnTextStyle = (style) => {
    if (style === "ghost") return "text-charcoal group-hover:text-charcoal";
    if (style === "outline") return "text-charcoal group-hover:text-white";
    if (style === "secondary") return "text-white group-hover:text-gold";
    return "text-charcoal group-hover:text-white"; // primary
  };

  const getCardBtnInnerStyle = (style) => {
    if (style === "ghost")
      return "bg-black/5 translate-y-full group-hover:translate-y-0";
    if (style === "outline")
      return "bg-charcoal translate-y-full group-hover:translate-y-0";
    if (style === "secondary")
      return "bg-black translate-y-full group-hover:translate-y-0";
    return "bg-gold translate-y-full group-hover:translate-y-0"; // primary
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative flex items-center overflow-hidden bg-[#ebebeb]"
      style={{ minHeight: "var(--hero-height)" }}
    >
      <style>{`
        #home { --hero-height: ${mobileHeight}; }
        @media (min-width: 1024px) { #home { --hero-height: ${desktopHeight}; } }
      `}</style>

      {/* Vertical Scroll Indicator (Left) */}
      <div className="absolute left-6 sm:left-10 bottom-24 hidden lg:flex flex-col items-center gap-6 z-30">
        <p className="text-charcoal/30 [writing-mode:vertical-lr] uppercase text-[8px] font-bold tracking-[0.5em] rotate-180">
          Scroll to Explore
        </p>
        <div className="w-px h-24 bg-gradient-to-t from-gold/40 to-transparent" />
      </div>

      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        {heroVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
        ) : (
          siteSettings?.hero_background_enabled !== false &&
          bgImage && (
            <img
              src={bgImage}
              alt="Hero Background"
              className="w-full h-full object-cover"
            />
          )
        )}

        <div
          className="absolute inset-0 bg-white backdrop-blur-[2px]"
          style={{ opacity }}
        />
      </div>

      <div
        className="relative z-20 w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-12 pt-20 pb-8 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0"
        style={{ minHeight: "var(--hero-height)" }}
      >
        {/* Center Content */}
        <div className="w-full lg:w-[50%] flex flex-col items-center text-center z-40 py-6 lg:py-0 order-1 lg:order-2">
          {(smallText || subtitle) && (
            <div className="hero-fade-in space-y-3 flex flex-col items-center mb-6">
              {smallText && (
                <div className="flex items-center gap-4">
                  <div className="w-8 h-px bg-gold/30" />
                  <p className="text-gold tracking-[0.6em] uppercase text-[9px] font-bold">
                    {smallText}
                  </p>
                  <div className="w-8 h-px bg-gold/30" />
                </div>
              )}
              {subtitle && (
                <p className="text-charcoal/40 tracking-[0.4em] uppercase text-[8px] font-bold">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {(title || highlightTitle) && (
            <div className="hero-fade-in">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-7xl xl:text-9xl font-black text-charcoal tracking-tighter leading-[0.8] uppercase mb-8">
                {title &&
                  title.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  ))}
                {highlightTitle && (
                  <span className="italic font-serif text-gold lowercase relative inline-block">
                    {highlightTitle}
                    <div className="absolute -bottom-2 left-0 w-full h-px bg-gold/20" />
                  </span>
                )}
              </h1>
            </div>
          )}

          {centerBtnText && (
            <div className="hero-fade-in">
              <Link
                to={centerBtnLink}
                className={`group relative inline-flex items-center justify-center overflow-hidden border px-10 sm:px-20 py-3.5 sm:py-6 transition-all duration-500 ${getButtonStyle(siteSettings?.hero_center_button_style)}`}
              >
                <span
                  className={`relative z-20 text-[9px] sm:text-[12px] font-black uppercase tracking-[0.5em] transition-colors duration-500 ${getButtonTextStyle(siteSettings?.hero_center_button_style)}`}
                >
                  {centerBtnText}
                </span>
                <div
                  className={`absolute left-0 top-0 w-full h-full z-0 transition-transform duration-500 ease-out ${getButtonInnerStyle(siteSettings?.hero_center_button_style)}`}
                />
              </Link>
            </div>
          )}
        </div>

        {/* Cards Container */}
        <div className="w-full flex flex-row items-center justify-center gap-4 sm:gap-8 lg:contents order-2 lg:order-none mt-4 lg:mt-0">
          {/* Left Image */}
          {siteSettings?.hero_left_image_enabled !== false && leftImage && (
            <div className="w-1/2 lg:w-[25%] hero-fade-in lg:order-1 flex justify-center lg:justify-start">
              <Link
                to={leftBtnLink}
                className="group block relative float-card w-full max-w-[280px] lg:max-w-[320px]"
              >
                <div className="product-card-reveal relative mx-auto lg:ml-0">
                  <div className="relative aspect-[3/4] overflow-hidden shadow-2xl transition-shadow duration-700">
                    <img
                      src={leftImage}
                      alt={leftBtnText}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    />
                  </div>
                  {leftBtnText && (
                    <div
                      className={`absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 sm:px-8 py-1.5 sm:py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border whitespace-nowrap overflow-hidden group ${getCardBtnContainerStyle(siteSettings?.hero_left_button_style)}`}
                    >
                      <span
                        className={`text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] relative z-10 transition-colors duration-300 ${getCardBtnTextStyle(siteSettings?.hero_left_button_style)}`}
                      >
                        {leftBtnText}
                      </span>
                      <div
                        className={`absolute inset-0 transition-transform duration-300 ease-out ${getCardBtnInnerStyle(siteSettings?.hero_left_button_style)}`}
                      />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* Right Image */}
          {siteSettings?.hero_right_image_enabled !== false && rightImage && (
            <div className="w-1/2 lg:w-[25%] hero-fade-in lg:order-3 flex justify-center lg:justify-end">
              <Link
                to={rightBtnLink}
                className="group block relative float-card w-full max-w-[280px] lg:max-w-[320px]"
              >
                <div className="product-card-reveal relative mx-auto lg:mr-0">
                  <div className="relative aspect-[3/4] overflow-hidden shadow-2xl transition-shadow duration-700">
                    <img
                      src={rightImage}
                      alt={rightBtnText}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                    />
                  </div>
                  {rightBtnText && (
                    <div
                      className={`absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 z-30 px-3 sm:px-8 py-1.5 sm:py-3 shadow-[0_10px_30px_rgba(0,0,0,0.08)] border whitespace-nowrap overflow-hidden group ${getCardBtnContainerStyle(siteSettings?.hero_right_button_style)}`}
                    >
                      <span
                        className={`text-[7px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] relative z-10 transition-colors duration-300 ${getCardBtnTextStyle(siteSettings?.hero_right_button_style)}`}
                      >
                        {rightBtnText}
                      </span>
                      <div
                        className={`absolute inset-0 transition-transform duration-300 ease-out ${getCardBtnInnerStyle(siteSettings?.hero_right_button_style)}`}
                      />
                    </div>
                  )}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
