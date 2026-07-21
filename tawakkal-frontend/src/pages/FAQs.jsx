import { useEffect, useState } from 'react';
import { HelpCircle, Search, MessageCircle, Plus, Minus } from 'lucide-react';

const defaultFaqs = [];

const FAQs = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadFaqs() {
      try {
        const { fetchFaqs } = await import('../api');
        const data = await fetchFaqs();
        const filtered = data.filter(f => f.status === 'published' || f.is_published === true);
        setFaqs(filtered.length > 0 ? filtered : defaultFaqs);
      } catch (err) {
        console.error("Error loading FAQs:", err);
        setFaqs(defaultFaqs);
      }
    }
    loadFaqs();
  }, []);

  // Deduplicate categories from backend FAQs
  const categories = Array.from(new Set(faqs.map(f => f.category || 'general'))).map(cat => ({
    id: cat,
    name: cat === 'general' ? 'General' : cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) // Basic formatting
  }));

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      {/* Hero Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Help Center</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Frequently Asked <span className="italic font-serif text-gold">Questions</span>
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Find answers to common questions about our services
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-12 px-6 bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-300 text-charcoal placeholder-gray-500 border border-gray-400 pl-12 pr-4 py-4 text-sm focus:outline-none focus:bg-white focus:border-gold transition-colors rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories & Content */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {categories.map((category) => {
            const categoryFAQs = filteredFAQs.filter(faq => faq.category === category.id);
            if (categoryFAQs.length === 0) return null;

            return (
              <div key={category.id} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 tracking-tight flex items-center gap-2">
                  <HelpCircle className="w-6 h-6 text-gold" />
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {categoryFAQs.map((faq) => {
                    const globalIndex = faqs.indexOf(faq);
                    return (
                      <div 
                        key={faq.id || globalIndex}
                        className="bg-gray-300 border border-gray-400 shadow-md rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(faq.id || globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-400 transition-colors"
                        >
                          <span className="font-medium text-charcoal pr-4">{faq.question}</span>
                          <div className="relative w-5 h-5 flex items-center justify-center flex-shrink-0">
                            <Plus className={`absolute w-5 h-5 text-gold transition-all duration-300 ${openIndex === (faq.id || globalIndex) ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'}`} />
                            <Minus className={`absolute w-5 h-5 text-gold transition-all duration-300 ${openIndex === (faq.id || globalIndex) ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'}`} />
                          </div>
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${openIndex === (faq.id || globalIndex) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                          <div className="overflow-hidden">
                            <div className="px-6 pb-4 pt-4 border-t border-gray-400 text-center">
                              <p className="text-gray-800 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No results found. Try a different search term.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MessageCircle className="w-12 h-12 text-gold mx-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Still Have <span className="italic font-serif text-gold">Questions?</span>
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Can't find what you're looking for? Our customer support team is here to help you with any inquiries.
          </p>
          <a href="/contact" className="inline-block bg-gold text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-colors">
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default FAQs;
