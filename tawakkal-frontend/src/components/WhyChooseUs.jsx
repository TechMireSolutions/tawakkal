import { Shield, Truck, Zap, Gem, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: Gem,
    title: 'Premium Quality',
    subtitle: 'Authentic Fabrics',
    description: 'We use only A-grade fabrics and materials for maximum durability and comfort.',
    color: 'from-amber-500 to-yellow-400',
  },
  {
    icon: Shield,
    title: 'Verified Brand',
    subtitle: '100% Original',
    description: 'Authentic designer wear directly from authorized workshops and manufacturers.',
    color: 'from-emerald-500 to-teal-400',
  },
  {
    icon: Truck,
    title: 'Global Delivery',
    subtitle: 'Fast Shipping',
    description: 'Express shipping across Pakistan and worldwide with real-time tracking.',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    icon: Zap,
    title: 'Easy Returns',
    subtitle: '7-Day Policy',
    description: 'Hassle-free exchange and return policy for your complete peace of mind.',
    color: 'from-purple-500 to-pink-400',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 md:py-36 bg-gradient-to-b from-ivory via-white to-ivory text-charcoal relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-3 mb-4 md:mb-6 bg-white px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            <p className="text-gold tracking-[0.2em] uppercase text-[10px] font-bold">Why Shop With Us</p>
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal mb-4 md:mb-5">
            The Tawakkal <span className="italic font-serif text-gold">Promise</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base px-4">
            We are committed to providing you with the best shopping experience
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 md:mt-6">
            <div className="h-px w-16 md:w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="h-px w-16 md:w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>

        {/* Feature Cards - 2 per row on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-white rounded-xl md:rounded-2xl lg:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-3 border border-gray-100 hover:border-gold/30 overflow-hidden"
              >
                {/* Background Glow */}
                <div className={`absolute -top-20 -right-20 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500 rounded-full`} />
                <div className={`absolute -bottom-20 -left-20 w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500 rounded-full`} />
                
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-4 right-4 md:left-6 md:right-6 h-0.5 md:h-1 bg-gradient-to-r ${feature.color} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Header Row - Icon + Text together */}
                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                  {/* Icon Container */}
                  <div className={`w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg md:rounded-xl lg:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg md:shadow-xl relative z-10`}>
                    <Icon size={20} className="text-white md:w-7 md:h-7 lg:w-8 lg:h-8" strokeWidth={1.5} />
                  </div>
                  
                  {/* Title & Subtitle together */}
                  <div className="flex-1 min-w-0 pt-0.5 md:pt-1">
                    <p className="text-[9px] md:text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-0.5 md:mb-1">
                      {feature.subtitle}
                    </p>
                    <h3 className="text-sm md:text-lg lg:text-xl font-bold group-hover:text-gold transition-colors duration-300 flex items-center gap-1 md:gap-2 leading-tight">
                      {feature.title}
                      <ArrowUpRight size={14} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-gold flex-shrink-0 md:w-5 md:h-5" />
                    </h3>
                  </div>
                </div>
                
                {/* Description - Below */}
                <p className="text-gray-500 text-xs md:text-sm lg:text-base leading-relaxed relative z-10">
                  {feature.description}
                </p>
                
                {/* Corner Accents */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 border-t-2 border-r-2 border-gold/30 rounded-tr-lg md:rounded-tr-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-gold" />
                <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 border-b-2 border-l-2 border-gold/30 rounded-bl-lg md:rounded-bl-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-gold" />
                
                {/* Number Badge */}
                <div className="absolute top-3 right-3 md:top-4 md:right-4 w-5 h-5 md:w-7 md:h-7 lg:w-8 lg:h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] md:text-xs font-bold text-gray-400 group-hover:bg-gold group-hover:text-white transition-all duration-300">
                  0{index + 1}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Badge - Single Line */}
        <div className="mt-12 md:mt-24 flex justify-center px-4">
          <div className="bg-white rounded-2xl md:rounded-3xl p-2 md:p-4 shadow-2xl border border-gray-100 flex items-center gap-1 md:gap-4 overflow-x-auto scrollbar-hide max-w-full">
            {/* Happy Customers */}
            <div className="flex items-center gap-2 md:gap-4 px-2 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0">
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <div className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 rounded-full bg-green-500" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm lg:text-base font-bold text-charcoal">25,000+</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Happy Customers</p>
              </div>
            </div>
            
            <div className="w-px h-8 md:h-12 bg-gray-200 flex-shrink-0" />
            
            {/* Rating */}
            <div className="flex items-center gap-2 md:gap-4 px-2 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0">
              <div className="text-gold text-base md:text-xl lg:text-2xl flex-shrink-0">★★★★★</div>
              <div className="hidden md:block">
                <p className="text-sm lg:text-base font-bold text-charcoal">4.9/5</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Rating</p>
              </div>
            </div>
            
            <div className="w-px h-8 md:h-12 bg-gray-200 flex-shrink-0" />
            
            {/* Secure */}
            <div className="flex items-center gap-2 md:gap-4 px-2 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0">
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-gold md:w-6 md:h-6 lg:w-7 lg:h-7" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm lg:text-base font-bold text-charcoal">100% Secure</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">SSL Protected</p>
              </div>
            </div>
            
            <div className="w-px h-8 md:h-12 bg-gray-200 flex-shrink-0" />
            
            {/* Delivery */}
            <div className="flex items-center gap-2 md:gap-4 px-2 md:px-6 py-2 md:py-4 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0">
              <div className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Truck size={18} className="text-amber-600 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm lg:text-base font-bold text-charcoal">Free Delivery</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">On Orders 5k+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
