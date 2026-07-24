import { useState, useEffect } from 'react';
import { fetchSiteSettings, fetchTikTokReels } from '../api';

// ── Fallback: reel cards from database ───────────────────────────────────────
const ReelCard = ({ reel }) => {
  const thumb = reel.cover_image || reel.cover_image_url;

  return (
    <a
      href={reel.video_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
      style={{ aspectRatio: '9/16' }}
    >
      {/* Thumbnail */}
      {thumb ? (
        <img
          src={thumb}
          alt={reel.title || 'TikTok Reel'}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <svg className="w-12 h-12 text-white/30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.42a8.16 8.16 0 004.77 1.52V7.5a4.85 4.85 0 01-1-.81z" />
          </svg>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
          <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {/* TikTok icon top-right */}
      <div className="absolute top-3 right-3">
        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.42a8.16 8.16 0 004.77 1.52V7.5a4.85 4.85 0 01-1-.81z" />
        </svg>
      </div>

      {/* Title at bottom */}
      {reel.title && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-[11px] leading-tight line-clamp-2 font-medium drop-shadow">
            {reel.title}
          </p>
        </div>
      )}
    </a>
  );
};

const ReelsFromDB = ({ reels }) => (
  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide justify-start md:justify-center">
    {reels.map((reel) => (
      <ReelCard key={reel.id} reel={reel} />
    ))}
  </div>
);

// ── Embed widget (Elfsight optimized) ────────────────────────────────────────
const EmbedWidget = ({ code }) => {
  useEffect(() => {
    if (!code) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(code, 'text/html');

    doc.querySelectorAll('script').forEach((el) => {
      if (el.src) {
        // Check if script is already present globally in the document
        const existing = document.querySelector(`script[src="${el.src}"]`);
        if (!existing) {
          const s = document.createElement('script');
          s.src = el.src;
          s.async = true;
          document.body.appendChild(s);
        }
        // NOTE: Removed window.eapps call to completely stop the 5-sec reload loop
      }
    });
  }, [code]);

  // Strip script tags for innerHTML rendering safely
  const html = code ? code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') : '';

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

// ── Main component ────────────────────────────────────────────────────────────
const ReelsGallery = () => {
  const [embedCode, setEmbedCode] = useState(null);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchSiteSettings(), fetchTikTokReels()])
      .then(([settings, reelData]) => {
        setEmbedCode(settings?.tiktok_embed_code || null);
        setReels(reelData || []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && !embedCode && reels.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="max-w-[95%] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-[0.2em] text-charcoal uppercase">
            Tradition in Motion
          </h2>
          <p className="text-xs text-charcoal/60 mt-2 tracking-widest uppercase font-light italic">
            Follow us on TikTok @tawakkalstudio
          </p>
        </div>

        {loading ? (
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] rounded-2xl bg-gray-100 animate-pulse"
                style={{ aspectRatio: '9/16' }}
              />
            ))}
          </div>
        ) : embedCode ? (
          <EmbedWidget code={embedCode} />
        ) : (
          <ReelsFromDB reels={reels} />
        )}

      </div>
    </section>
  );
};

export default ReelsGallery;