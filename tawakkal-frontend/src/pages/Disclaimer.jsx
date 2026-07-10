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
            <div className="prose prose-gold max-w-none">
              <h2>Website Disclaimer</h2>
              <p>The information provided by <strong>Tawakkal Store</strong> ("we," "us," or "our") on tawakkal.store (the "Site") is for general informational purposes only. All information on the Site is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.</p>

              <h2>Product & Color Disclaimer</h2>
              <ul>
                <li><strong>Color Variation:</strong> We make every effort to display as accurately as possible the colors and images of our women's clothing apparel that appear at the store. We cannot guarantee that your computer monitor or mobile screen's display of any color will be completely accurate. Minor color variations due to photographic lighting sources or your monitor settings do not qualify as a product defect.</li>
                <li><strong>Sizing:</strong> Please refer to our detailed sizing chart before placing an order. Minor variances of 1–2 inches in stitched clothing sizes are standard due to the manual manufacturing process.</li>
              </ul>

              <h2>Limitation of Liability</h2>
              <p>Under no circumstance shall Tawakkal Store have any liability to you for any loss or damage of any kind incurred as a result of the use of the site or reliance on any information provided on the site. Your use of the site and your reliance on any information on the site is solely at your own risk.</p>
            </div>
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
