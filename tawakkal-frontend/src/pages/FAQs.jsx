import { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle, Search, MessageCircle } from 'lucide-react';

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
        setFaqs(data.filter(f => f.status === 'published' || f.is_published || f.status !== 'draft'));
      } catch (err) {
        console.error("Error loading FAQs:", err);
      }
    }
    loadFaqs();
  }, []);

  // Deduplicate categories from backend FAQs
  const categories = Array.from(new Set(faqs.map(f => f.category))).map(cat => ({
    id: cat,
    name: cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) // Basic formatting
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
              className="w-full bg-gray-50 border border-gray-200 pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gold transition-colors"
            />
          </div>
        </div>
      </section>

      {/* FAQ Categories & Content */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
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
                        key={globalIndex}
                        className="bg-white border border-gray-100 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium pr-4">{faq.question}</span>
                          <ChevronDown 
                            className={`w-5 h-5 text-gold flex-shrink-0 transition-transform ${openIndex === globalIndex ? 'rotate-180' : ''}`} 
                          />
                        </button>
                        {openIndex === globalIndex && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
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
