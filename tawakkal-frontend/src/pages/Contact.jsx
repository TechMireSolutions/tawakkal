import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Plus, Minus, ChevronDown } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { submitContactForm } from '../api';

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const settings = useSiteSettings();
  const [faqs, setFaqs] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const subjectOptions = [
    { value: '', label: 'Select Subject' },
    { value: 'order', label: 'Order Inquiry' },
    { value: 'return', label: 'Return/Exchange' },
    { value: 'product', label: 'Product Question' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  const sectionRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    gsap.fromTo(formRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        }
      }
    );

    async function loadFaqs() {
      try {
        const { fetchFaqs } = await import('../api');
        const data = await fetchFaqs();
        const publishedFaqs = data.filter(f => f.status === 'published' || f.is_published === true);
        setFaqs(publishedFaqs.slice(0, 4));
      } catch (err) {
        console.error("Error loading FAQs:", err);
      }
    }
    loadFaqs();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.subject) {
      alert("Please select a subject before sending your message.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactForm(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error("Failed to submit form:", err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSubjectOpen && !e.target.closest('.subject-dropdown')) {
        setIsSubjectOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isSubjectOpen]);

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-charcoal/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=1920"
            alt="Contact Us"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Get In Touch</p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter mb-6">
            Contact <span className="italic font-serif text-gold">Us</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We would love to hear from you. Reach out to us for any inquiries or support.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section ref={sectionRef} className="py-16 md:py-20 px-4 sm:px-6 -mt-16 md:-mt-20 relative z-30">
        <div className="max-w-[1440px] mx-auto">
          {/* Mobile: 2 per row | Desktop: 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[
              {
                icon: Phone,
                title: "Phone",
                line1: settings?.contact_phone || "+92 300 7600883",
                link1: `tel:${settings?.contact_phone || '+923007600883'}`,
                line2: settings?.whatsapp_number || "+92 323 0000883",
                link2: `https://wa.me/${(settings?.whatsapp_number || '923230000883').replace(/\D/g, '')}`
              },
              {
                icon: Mail,
                title: "Email",
                line1: settings?.contact_email || "mianusmanjee09@gmail.com",
                link1: `mailto:${settings?.contact_email || 'mianusmanjee09@gmail.com'}`,
                line2: "",
                link2: ""
              },
              {
                icon: MapPin,
                title: "Address",
                line1: settings?.address || "Faisalabad, Pakistan",
                link1: "https://maps.google.com/?q=31.4187,73.0793",
                line2: "",
                link2: ""
              },
              {
                icon: Clock,
                title: "Working Hours",
                line1: "Mon - Sat: 10AM - 8PM",
                line2: "Sunday: Closed"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 md:p-8 shadow-lg border-t-2 border-gold text-center group hover:shadow-xl transition-all">
                <div className="w-10 h-10 md:w-16 md:h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-6 group-hover:bg-gold/20 transition-colors">
                  <item.icon className="w-4 h-4 md:w-7 md:h-7 text-gold" />
                </div>
                <h3 className="font-bold text-xs md:text-lg mb-1 md:mb-3 tracking-tight">{item.title}</h3>
                {item.link1 ? (
                  <a href={item.link1} target={item.link1.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" className="block text-gray-600 text-[10px] md:text-sm leading-tight hover:text-gold transition-colors">
                    {item.line1}
                  </a>
                ) : (
                  <p className="text-gray-600 text-[10px] md:text-sm leading-tight">{item.line1}</p>
                )}
                {item.line2 && (
                  item.link2 ? (
                    <a href={item.link2} target={item.link2.startsWith('http') ? "_blank" : "_self"} rel="noopener noreferrer" className="block text-gray-600 text-[10px] md:text-sm leading-tight hover:text-gold transition-colors">
                      {item.line2}
                    </a>
                  ) : (
                    <p className="text-gray-600 text-[10px] md:text-sm leading-tight">{item.line2}</p>
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Contact Form */}
            <div ref={formRef} className="pr-2 md:pr-4">
              <div className="mb-10">
                <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Send Message</p>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Get in <span className="italic font-serif text-gold">Touch</span>
                </h2>
              </div>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Message Sent!</h3>
                  <p className="text-green-700">Thank you for contacting us. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Your Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors"
                        placeholder="+92 323 0000883"
                      />
                    </div>
                    <div className="relative subject-dropdown">
                      <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Subject</label>
                      {/* Custom Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsSubjectOpen(!isSubjectOpen)}
                          className="w-full bg-white border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors text-left flex items-center justify-between"
                        >
                          <span className={formData.subject ? 'text-charcoal' : 'text-gray-400'}>
                            {subjectOptions.find(opt => opt.value === formData.subject)?.label || 'Select Subject'}
                          </span>
                          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSubjectOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 shadow-lg z-50 max-h-48 overflow-y-auto">
                            {subjectOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, subject: option.value });
                                  setIsSubjectOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gold/10 transition-colors ${formData.subject === option.value ? 'bg-gold/20 text-gold font-medium' : 'text-charcoal'
                                  } ${option.value === '' ? 'text-gray-400' : ''}`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Hidden input for form data submission */}
                      <input type="hidden" name="subject" value={formData.subject} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-charcoal mb-2">Your Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-gold transition-colors resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-charcoal text-white px-10 py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-colors flex items-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              <div className="bg-charcoal text-white p-8">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-6 h-6 text-gold" />
                  <h3 className="text-xl font-bold tracking-tight">Quick Support</h3>
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Need quick assistance? Reach out to us on WhatsApp for instant support regarding orders, products, or any inquiries.
                </p>
                <a
                  href={`https://wa.me/${(settings?.whatsapp_number || '923230000883').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 text-[11px] font-bold uppercase tracking-widest hover:bg-green-700 transition-colors"
                >
                  <MessageCircle size={16} />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.6629782723677!2d73.0793!3d31.4187!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDI1JzA3LjMiTiA3M8KwMDQnNDUuNSJF!5e0!3m2!1sen!2s!4v1"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              <div className="bg-white p-6 border border-gray-100">
                <h4 className="font-bold text-sm mb-4 tracking-tight">Store Location</h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {settings?.address || `Opposite GC University\nKotwali Road, Chenab Chowk\nFaisalabad, Pakistan`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-black/5 border-y border-gold/10">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold mb-4">Common Questions</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
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
    </div>
  );
};

export default Contact;
