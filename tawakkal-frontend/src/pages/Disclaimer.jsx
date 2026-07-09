import { useEffect, useState } from 'react';

const Disclaimer = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadPolicy() {
      try {
        const { fetchPolicies } = await import('../api');
        const data = await fetchPolicies();
        const found = data.find(p => p.type === 'terms' || p.slug === 'terms');
        setPolicy(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPolicy();
  }, []);

  return (
    <div className="bg-ivory min-h-screen text-charcoal">
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden bg-charcoal">
        <div className="relative z-20 text-center px-6 max-w-4xl mx-auto">
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Legal</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            <span className="italic font-serif text-gold">Disclaimer</span> & Terms
          </h1>
          {policy?.updatedAt && (
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Last Updated: {new Date(policy.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 px-6 bg-white border-b border-gray-100 min-h-[40vh]">
        <div className="max-w-[1000px] mx-auto prose prose-gold max-w-none">
          {loading ? (
            <div className="text-center text-gray-500 py-20">Loading disclaimer...</div>
          ) : policy ? (
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          ) : (
            <div className="text-center text-gray-500 py-20">Disclaimer content not found.</div>
          )}
        </div>
      </section>

      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Questions About Our <span className="italic font-serif text-gold">Terms?</span>
          </h2>
          <p className="text-white/70 mb-8">
            If you need clarification on any of our terms or policies, please reach out to us.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <a href="/contact" className="bg-gold text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Disclaimer;
