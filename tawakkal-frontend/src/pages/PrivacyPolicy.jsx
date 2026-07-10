import { useEffect, useState } from 'react';

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadPolicy() {
      try {
        const { fetchPolicies } = await import('../api');
        const data = await fetchPolicies();
        const found = data.find(p => p.type === 'privacy' || p.slug === 'privacy-policy');
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
            Privacy <span className="italic font-serif text-gold">Policy</span>
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
            <div className="text-center text-gray-500 py-20">Loading policy...</div>
          ) : policy ? (
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          ) : (
            <div className="prose prose-gold max-w-none">
              <p className="text-gray-600 mb-6"><strong>Effective Date:</strong> July 13, 2026</p>
              <p className="mb-6">At <strong>Tawakkal Store</strong> (accessible from tawakkal.store), one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Tawakkal Store and how we use it.</p>
              
              <h2>Information We Collect</h2>
              <ul>
                <li><strong>Personal Information:</strong> When you make a purchase or attempt to make a purchase through the Site, we collect certain information from you, including your name, billing address, shipping address, payment information (including credit card numbers or mobile wallet details), email address, and phone number.</li>
                <li><strong>Log Files:</strong> Tawakkal Store follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We use the information we collect in various ways, including to:</p>
              <ul>
                <li>Provide, operate, and maintain our website.</li>
                <li>Process your orders, arrange for shipping, and provide you with invoices and/or order confirmations.</li>
                <li>Communicate with you, including responding to customer service requests or sending promotional updates.</li>
                <li>Screen our orders for potential risk or fraud.</li>
              </ul>

              <h2>Data Protection Rights</h2>
              <p>We want to ensure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
              <ul>
                <li><strong>The right to access</strong> – You have the right to request copies of your personal data.</li>
                <li><strong>The right to rectification</strong> – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li><strong>The right to erasure</strong> – You have the right to request that we erase your personal data, under certain conditions.</li>
              </ul>

              <h2>Third-Party Privacy Policies</h2>
              <p>Tawakkal Store's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers or payment gateways for more detailed information.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Questions About Our <span className="italic font-serif text-gold">Privacy Policy?</span>
          </h2>
          <p className="text-white/70 mb-8">
            If you have any questions or concerns about this Privacy Policy, please contact us:
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

export default PrivacyPolicy;
