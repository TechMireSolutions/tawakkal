import { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';
import { fetchTestimonials } from '../api';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await fetchTestimonials();
        setTestimonials(data.filter(t => t.is_active));
      } catch (err) {
        console.error("Error loading testimonials:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTestimonials();
  }, []);

  if (loading) return null;
  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-gradient-to-b from-ivory to-white text-charcoal">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <p className="text-gold tracking-[0.4em] uppercase text-[11px] font-bold">Real Results</p>
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="italic font-serif text-gold">Clients Say</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Trusted by thousands of satisfied customers across Pakistan
          </p>
        </div>

        {/* Testimonials Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gold/30 relative overflow-hidden"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-gold/10 group-hover:text-gold/20 transition-colors">
                <Quote size={48} />
              </div>
              
              {/* Stars */}
              <div className="flex gap-1.5 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-gold fill-gold" />
                ))}
              </div>
              
              {/* Text */}
              <p className="text-base text-gray-600 leading-relaxed mb-8 line-clamp-4">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4 pt-5 border-t border-gray-100">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-bold text-base text-charcoal">{testimonial.name}</h4>
                  <p className="text-xs text-gold uppercase tracking-wider font-semibold">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-16 md:mt-20 text-center px-4">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 md:gap-4 bg-white px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-full shadow-lg border border-gray-100">
            <div className="flex -space-x-3">
              {testimonials.slice(0, 5).map((t, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-md">
                  {t.initials}
                </div>
              ))}
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-gold text-lg">★★★★★</span>
              <span className="text-base font-bold text-charcoal">4.9</span>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <span className="text-base font-semibold text-charcoal">Trusted by Customers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
