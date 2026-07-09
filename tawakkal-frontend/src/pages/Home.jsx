import HeroSection from '../components/HeroSection';
import OurStory from '../components/OurStory';
import CategoryGallery from '../components/CategoryGallery';
import ProductMarquee from '../components/ProductMarquee';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import ReelsGallery from '../components/ReelsGallery';

const Home = () => {
  return (
    <main>
      <HeroSection />
      <CategoryGallery />
      <ProductMarquee id="shop" limit={8} />
      <WhyChooseUs />

      {/* Quote & Statistics Combined Section */}
      <section className="relative py-16 md:py-28 bg-charcoal overflow-hidden text-white">
        {/* Background Image */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-charcoal/80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=1200"
            className="w-full h-full object-cover grayscale opacity-50"
            alt="Background"
          />
        </div>

        <div className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quote */}
          <div className="text-center mb-10 md:mb-16">
            <div className="flex items-center justify-center gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold">Our Philosophy</p>
              <div className="h-px w-12 md:w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-5xl font-serif italic text-white leading-tight mb-4 md:mb-6 max-w-4xl mx-auto px-4">
              "Quality is never an accident; it is always the result of intelligent effort."
            </h2>
            <p className="text-white/50 text-xs uppercase tracking-[0.3em]">The Tawakkal Collection</p>
          </div>


        </div>
      </section>

      <OurStory id="about" />

      <Testimonials />

      <ReelsGallery />
    </main>
  );
};

export default Home;
