import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Award, Heart } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stories = [
  {
    icon: Sparkles,
    title: 'Premium Fabrics',
    description: 'We source only the finest Egyptian cotton, luxurious silks, and premium lawn to ensure every piece feels exceptional.',
    color: 'from-amber-500 to-orange-400'
  },
  {
    icon: Award,
    title: 'Master Craftsmen',
    description: 'Our designs come to life through skilled artisans who blend traditional techniques with modern precision.',
    color: 'from-rose-500 to-pink-400'
  },
  {
    icon: Heart,
    title: 'Timeless Design',
    description: 'Creating fashion that honors heritage while embracing contemporary elegance for the modern woman.',
    color: 'from-violet-500 to-purple-400'
  },
];

const OurStory = ({ id }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.story-header', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%'
        }
      });

      gsap.from('.story-image', {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%'
        }
      });

      gsap.fromTo('.story-card', 
        {
          y: 30,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.12,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.story-cards',
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id={id} className="py-24 md:py-32 bg-gradient-to-b from-ivory to-white text-charcoal overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="story-header text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-3 mb-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <p className="text-gold tracking-[0.2em] uppercase text-[10px] font-bold">Our Story</p>
            <div className="w-2 h-2 rounded-full bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4">
            Crafted With <span className="italic font-serif text-gold">Passion</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto px-4">
            Three decades of dedication to quality, craftsmanship, and timeless elegance
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-stretch">
          {/* Left Image */}
          <div className="story-image lg:col-span-5 order-1">
            <div className="relative h-full min-h-[350px] sm:min-h-[400px] lg:min-h-[550px]">
              {/* Frame Border */}
              <div className="absolute -inset-2 lg:-inset-3 border-2 border-gold/20 rounded-2xl lg:rounded-3xl" />
              <div className="absolute -inset-4 lg:-inset-6 border border-gold/10 rounded-2xl lg:rounded-3xl" />

              {/* Main Image Container */}
              <div className="relative h-full rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl group">
                <img
                  src="/about-section.png"
                  alt="Artisan at work"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Badge */}
                <div className="absolute top-4 left-4 lg:top-6 lg:left-6">
                  <div className="bg-white rounded-lg lg:rounded-xl px-3 py-2 lg:px-4 lg:py-3 shadow-xl">
                    <p className="text-gold text-[9px] lg:text-[10px] font-bold uppercase tracking-wider mb-0.5">Heritage</p>
                    <p className="text-charcoal text-xs lg:text-sm font-bold">Luxury</p>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                    <div className="h-px w-8 lg:w-12 bg-gold" />
                    <span className="text-gold text-[10px] lg:text-xs uppercase tracking-widest font-bold">Heritage</span>
                  </div>
                  <p className="text-white text-base lg:text-xl font-medium leading-snug">Traditional craftsmanship meets modern elegance</p>
                </div>

                {/* Corner Accents */}
                <div className="absolute top-3 right-3 lg:top-4 lg:right-4 w-8 h-8 lg:w-12 lg:h-12 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
                <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4 w-8 h-8 lg:w-12 lg:h-12 border-b-2 border-r-2 border-white/30 rounded-br-lg" />
              </div>
            </div>
          </div>

          {/* Right Cards */}
          <div className="story-cards lg:col-span-7 flex flex-col justify-center order-2">
            <div className="space-y-4 lg:space-y-6">
              {stories.map((story, i) => {
                const Icon = story.icon;
                return (
                  <div
                    key={i}
                    className="story-card group relative bg-white rounded-xl lg:rounded-2xl p-5 lg:p-7 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gold/30 lg:ml-4 opacity-100"
                  >
                    <div className="flex items-start gap-4 lg:gap-6">
                      {/* Icon with Connector */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-gradient-to-br ${story.color} flex items-center justify-center shadow-lg lg:shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <Icon size={20} className="text-white lg:w-6 lg:h-7" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-0.5 lg:pt-1 min-w-0">
                        <div className="flex items-center gap-2 lg:gap-3 mb-1.5 lg:mb-2">
                          <h3 className="text-base lg:text-xl font-bold group-hover:text-gold transition-colors">
                            {story.title}
                          </h3>
                          <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent hidden sm:block" />
                        </div>
                        <p className="text-gray-500 text-sm lg:text-base leading-relaxed">
                          {story.description}
                        </p>
                      </div>

                      {/* Number */}
                      <div className="hidden lg:block flex-shrink-0">
                        <span className="text-3xl lg:text-5xl font-bold text-gray-100 group-hover:text-gold/20 transition-colors">
                          0{i + 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row items-center gap-3 lg:gap-4 lg:ml-4">
              <Link to="/about" className="inline-flex items-center justify-center gap-2 lg:gap-3 bg-charcoal text-white px-5 lg:px-8 py-2.5 lg:py-4 rounded-lg lg:rounded-xl font-semibold hover:bg-gold transition-all duration-300 shadow-lg hover:shadow-xl group text-sm lg:text-base w-full sm:w-auto">
                <span>Learn More About Us</span>
                <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStory;
