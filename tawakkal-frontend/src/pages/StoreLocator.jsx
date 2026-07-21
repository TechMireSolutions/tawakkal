import { useEffect, useState } from "react";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const StoreLocator = () => {
  const settings = useSiteSettings();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchStores = async () => {
      try {
        const { default: api } = await import("../admin/services/axios");
        const res = await api.get("/stores/branches/");
        setStores(Array.isArray(res) ? res : res.results || []);
      } catch (err) {
        console.error("Failed to load stores", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">
            Find Us
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Store <span className="italic font-serif text-gold">Locator</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Visit our store for the complete shopping experience
          </p>
        </div>
      </section>

      {/* Store Locations */}
      <section className="py-24 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold mb-4">
              Visit Us
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Our <span className="italic font-serif text-gold">Location</span>
            </h2>
          </div>

          <div className="space-y-16">
            {/* Store Info Cards & Maps */}
            {stores.map((store, index) => (
              <div key={index} className="grid lg:grid-cols-2 gap-12 items-start">
                <div className="bg-white p-8 shadow-lg border-l-4 border-gold h-full">
                  <h3 className="text-2xl font-bold mb-6 tracking-tight">
                    {store.name}
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{store.address}</p>
                        <p className="text-gray-600">{store.city}, {store.country || 'Pakistan'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                      <a
                        href={`tel:${store.phone}`}
                        className="hover:text-gold transition-colors"
                      >
                        {store.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-gold flex-shrink-0" />
                      <span>{store.hours || "10:00 AM - 8:00 PM"}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-500 mb-3">
                      Store Features:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(
                        store.features || [
                          "Full Collection Available",
                          "In-store Stitching",
                        ]
                      ).map((feature, idx) => (
                        <span
                          key={idx}
                          className="bg-gold/10 text-gold px-3 py-1 text-xs font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={
                      store.latitude && store.longitude
                        ? `https://maps.google.com/?q=${store.latitude},${store.longitude}`
                        : `https://maps.google.com/?q=${encodeURIComponent(store.name + ' ' + store.address + ' ' + store.city)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 bg-charcoal text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                  >
                    <Navigation size={14} />
                    Get Directions
                  </a>
                </div>
                
                {/* Individual Store Map */}
                <div className="aspect-square lg:aspect-auto lg:h-full min-h-[300px] bg-gray-100 relative shadow-lg">
                  <iframe
                    src={
                      store.latitude && store.longitude
                        ? `https://maps.google.com/maps?q=${store.latitude},${store.longitude}&output=embed`
                        : `https://maps.google.com/maps?q=${encodeURIComponent(store.name + ' ' + store.address + ' ' + store.city)}&output=embed`
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${store.name} Location`}
                    className="grayscale hover:grayscale-0 transition-all duration-500 w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}

            {/* Contact Info */}
            <div className="bg-black/5 p-10 border-y border-gold/10 max-w-4xl mx-auto shadow-sm">
              <h4 className="font-bold text-2xl mb-6 text-center">Contact Information</h4>
              <div className="grid md:grid-cols-3 gap-6 text-center text-sm">
                <div>
                  <p className="font-medium mb-2 text-gold uppercase tracking-widest text-[10px]">Email</p>
                  <a
                    href={`mailto:${settings?.contact_email || "mianusmanjee09@gmail.com"}`}
                    className="hover:text-gold transition-colors font-bold"
                  >
                    {settings?.contact_email || "mianusmanjee09@gmail.com"}
                  </a>
                </div>
                <div>
                  <p className="font-medium mb-2 text-gold uppercase tracking-widest text-[10px]">WhatsApp</p>
                  <a
                    href={`https://wa.me/${(settings?.whatsapp_number || "923230000883").replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold transition-colors font-bold"
                  >
                    {settings?.whatsapp_number || "+92 323 0000883"}
                  </a>
                </div>
                <div>
                  <p className="font-medium mb-2 text-gold uppercase tracking-widest text-[10px]">Phone</p>
                  <a
                    href={`tel:${settings?.contact_phone || "+923007600883"}`}
                    className="hover:text-gold transition-colors font-bold"
                  >
                    {settings?.contact_phone || "+92 300 7600883"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Experience */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              In-Store{" "}
              <span className="italic font-serif text-gold">Experience</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "Personal Shopping",
                desc: "Get personalized assistance from our style experts",
              },
              {
                title: "Instant Alterations",
                desc: "Quick stitching and alteration services available",
              },
              {
                title: "Exclusive Deals",
                desc: "In-store only promotions and special discounts",
              },
            ].map((item, index) => (
              <div key={index} className="p-6 border border-white/10">
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StoreLocator;
