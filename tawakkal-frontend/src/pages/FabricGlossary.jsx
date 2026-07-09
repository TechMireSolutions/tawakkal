import { useEffect } from 'react';

const FabricGlossary = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fabrics = [
    {
      name: "Lawn",
      description: "A lightweight, breathable cotton fabric perfect for Pakistan's hot summers. Known for its soft texture and excellent print quality, making it ideal for everyday wear.",
      characteristics: ["Lightweight", "Breathable", "Soft", "Printed"],
      bestFor: "Summer daily wear"
    },
    {
      name: "Cotton",
      description: "A natural fiber that's comfortable, durable, and easy to maintain. Available in various weights and weaves, making it versatile for all seasons.",
      characteristics: ["Natural", "Durable", "Easy care", "Comfortable"],
      bestFor: "All-season wear"
    },
    {
      name: "Chiffon",
      description: "A lightweight, sheer fabric with a slightly rough feel. Known for its elegant drape and is often used for dupattas and formal wear overlays.",
      characteristics: ["Sheer", "Lightweight", "Elegant drape", "Delicate"],
      bestFor: "Formal dupattas and overlays"
    },
    {
      name: "Silk",
      description: "A luxurious natural protein fiber known for its smooth texture and natural sheen. Used in premium formal and wedding collections.",
      characteristics: ["Luxurious", "Shiny", "Smooth", "Strong"],
      bestFor: "Wedding and formal wear"
    },
    {
      name: "Velvet",
      description: "A plush fabric with a dense pile that gives it a distinctive soft texture. Perfect for winter formal wear and special occasions.",
      characteristics: ["Plush", "Warm", "Rich texture", "Heavy"],
      bestFor: "Winter formal wear"
    },
    {
      name: "Organza",
      description: "A thin, plain weave, sheer fabric traditionally made from silk. Crisp and lightweight, perfect for structured designs and overlays.",
      characteristics: ["Crisp", "Sheer", "Structured", "Light"],
      bestFor: "Formal overlays and structuring"
    },
    {
      name: "Jacquard",
      description: "A fabric with intricate patterns woven directly into the material rather than printed. Known for its raised designs and premium feel.",
      characteristics: ["Woven patterns", "Textured", "Premium", "Intricate"],
      bestFor: "Festive and formal wear"
    },
    {
      name: "Khaddar",
      description: "A thick, coarse cotton fabric traditionally hand-spun. Provides warmth and durability, making it ideal for winter wear.",
      characteristics: ["Thick", "Warm", "Durable", "Textured"],
      bestFor: "Winter daily wear"
    },
    {
      name: "Linen",
      description: "A natural fiber made from flax plants. Known for its exceptional coolness and strength in hot weather, though it wrinkles easily.",
      characteristics: ["Cool", "Strong", "Natural", "Breathable"],
      bestFor: "Summer casual wear"
    },
    {
      name: "Cambric",
      description: "A lightweight, closely woven plain cotton fabric with a slight sheen. Smoother and finer than regular cotton.",
      characteristics: ["Smooth", "Fine", "Light sheen", "Durable"],
      bestFor: "Shirts and tops"
    },
    {
      name: "Satin",
      description: "A weave that typically has a glossy surface and a dull back. Known for its smooth, lustrous finish and elegant drape.",
      characteristics: ["Glossy", "Smooth", "Lustrous", "Elegant"],
      bestFor: "Formal linings and trims"
    },
    {
      name: "Georgette",
      description: "A sheer, lightweight, dull-finished crepe fabric. Has a slightly rough texture and good drape, perfect for flowy designs.",
      characteristics: ["Sheer", "Flowy", "Textured", "Light"],
      bestFor: "Dresses and dupattas"
    }
  ];

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Guide</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Fabric <span className="italic font-serif text-gold">Glossary</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Understanding the materials that make our outfits special
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 leading-relaxed text-lg">
            Choosing the right fabric is essential for comfort and style. Our comprehensive fabric glossary helps you understand the characteristics, uses, and care requirements of different materials used in our collections.
          </p>
        </div>
      </section>

      {/* Fabric Grid */}
      <section className="py-24 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fabrics.map((fabric, index) => (
              <div key={index} className="bg-white p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h3 className="text-2xl font-bold mb-4 tracking-tight text-gold">{fabric.name}</h3>
                <p className="text-gray-600 leading-relaxed text-sm mb-6">{fabric.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Characteristics</p>
                    <div className="flex flex-wrap gap-2">
                      {fabric.characteristics.map((char, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 text-xs">
                          {char}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-charcoal mb-1">Best For</p>
                    <p className="text-sm text-gray-600">{fabric.bestFor}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care Tips */}
      <section className="py-24 bg-[#f9f9f9] border-y border-gold/10">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">
              General <span className="italic font-serif text-gold">Care Tips</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Washing", desc: "Always check care labels. Use cold water for colored fabrics and mild detergents." },
              { title: "Drying", desc: "Air dry when possible. Avoid direct sunlight to prevent color fading." },
              { title: "Ironing", desc: "Iron on appropriate heat settings. Use a pressing cloth for delicate fabrics." },
              { title: "Storage", desc: "Store in cool, dry places. Use padded hangers for heavy embroidered pieces." }
            ].map((tip, index) => (
              <div key={index} className="bg-white p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-2">{tip.title}</h3>
                <p className="text-gray-600 text-sm">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Need <span className="italic font-serif text-gold">Help Choosing?</span>
          </h2>
          <p className="text-white/70 mb-8">
            Our team can help you select the perfect fabric for your needs and preferences.
          </p>
          <a href="/contact" className="inline-block bg-gold text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-colors">
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default FabricGlossary;
