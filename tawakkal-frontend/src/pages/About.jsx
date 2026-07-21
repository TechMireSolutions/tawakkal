import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Shield, Heart, Award, Plus, Minus } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef(null);
  const statsRef = useRef([]);
  const settings = useSiteSettings();
  const [faqs, setFaqs] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const [pageContent, setPageContent] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.fromTo(statsRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      }
    );

    async function loadData() {
      try {
        const { fetchFaqs } = await import('../api');
        const data = await fetchFaqs();
        // Just take a few FAQs for the about page
        const publishedFaqs = data.filter(f => f.status === 'published' || f.is_published === true);
        setFaqs(publishedFaqs.slice(0, 5));

        // Fetch CMS page content
        const { default: api } = await import('../admin/services/axios');
        const pageRes = await api.get('/cms/pages/about/');
        if (pageRes) setPageContent(pageRes.content);
      } catch (err) {
        console.error("Error loading About data:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black z-10" />
        </div>
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Our Story</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter mb-6">
            About <span className="italic font-serif text-gold">Us</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {settings?.site_description || "Your destination for premium apparel."}
          </p>
        </div>
      </section>

      {/* Brand Story */}
      <section ref={sectionRef} className="py-24 md:py-32 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold">Our Story</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                  {settings?.site_name || "Tawakkal"} <span className="italic font-serif text-gold">Brand History</span>
                </h2>
              </div>
              {pageContent ? (
                <div
                  className="prose prose-lg max-w-none text-gray-600 prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: pageContent }}
                />
              ) : (
                <>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    We are a fashion brand proudly serving with premium quality and elegant Eastern wear. With years of experience in the fashion industry, we understand what modern women truly seek — quality, grace, and timeless style.
                  </p>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Our journey has been built on trust, craftsmanship, and a commitment to delivering outfits that reflect confidence and sophistication.
                  </p>
                </>
              )}
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src="/about-page-img.png"
                  alt="Fashion Collection"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 md:-bottom-8 md:-left-8 bg-gold text-white p-4 md:p-8">
                <p className="text-3xl md:text-5xl font-bold">7+</p>
                <p className="text-[9px] md:text-[10px] tracking-widest uppercase font-bold mt-1 md:mt-2">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Our Expertise</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              What We <span className="italic font-serif text-gold">Do?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Premium Collections", desc: "We create fashion that tells a story. Our mission is to provide premium unstitched and stitched collections that combine comfort with style." },
              { icon: Award, title: "Quality Craftsmanship", desc: "Whether it's the elegance of a classic lawn suit or the grandeur of a heavily embroidered festive outfit, we ensure every stitch meets the highest standards." },
              { icon: Shield, title: "Trust & Reliability", desc: "Built on years of trust, we deliver outfits that reflect confidence and sophistication for the modern woman." }
            ].map((item, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm p-8 border border-white/10 hover:border-gold/30 transition-all duration-300 group">
                <item.icon className="w-10 h-10 text-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Support</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Frequently Asked <span className="italic font-serif text-gold">Questions</span>
            </h2>
          </div>

          {faqs.length > 0 ? (
            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-300 border border-gray-400 shadow-md rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-400 transition-colors"
                  >
                    <div className="text-left pr-4">
                      {faq.category && (
                        <div className="text-[10px] text-gold uppercase tracking-wider mb-1 font-bold">
                          {faq.category.replace('_', ' ')}
                        </div>
                      )}
                      <h3 className="font-bold text-charcoal text-sm">{faq.question}</h3>
                    </div>
                    <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                      <Plus className={`absolute w-5 h-5 text-gold transition-all duration-300 ${openFaqIndex === index ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} />
                      <Minus className={`absolute w-5 h-5 text-gold transition-all duration-300 ${openFaqIndex === index ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} />
                    </div>
                  </button>
                  <div className={`grid transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 pt-4 border-t border-gray-400 text-center">
                        <p className="text-gray-800 text-sm leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No FAQs available.</div>
          )}
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Get in Touch</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Contact <span className="italic font-serif text-gold">Information</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold tracking-tight">Phone</h3>
              <a href={`tel:${settings?.contact_phone || '+92 300 7600883'}`} className="block text-white/70 text-sm hover:text-gold transition-colors">{settings?.contact_phone || '+92 300 7600883'}</a>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold tracking-tight">Email</h3>
              <a href={`mailto:${settings?.contact_email || 'mianusmanjee09@gmail.com'}`} className="block text-white/70 text-sm hover:text-gold transition-colors">{settings?.contact_email || 'mianusmanjee09@gmail.com'}</a>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold tracking-tight">Address</h3>
              <p className="text-white/70 text-sm">{settings?.address || 'Faisalabad, Pakistan'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
