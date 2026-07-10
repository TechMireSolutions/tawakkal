import { useEffect, useState } from 'react';

const Shipping = () => {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadPolicy() {
      try {
        const { fetchPolicies } = await import('../api');
        const data = await fetchPolicies();
        const found = data.find(p => p.type === 'shipping' || p.slug === 'shipping');
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
          <p className="text-gold tracking-[0.4em] uppercase text-[10px] font-bold mb-6">Delivery</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6">
            Shipping & <span className="italic font-serif text-gold">Handling</span>
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
              <p className="mb-6">Thank you for shopping at <strong>Tawakkal Store</strong> (tawakkal.store). We are committed to delivering your favorite women's apparel to you safely and as quickly as possible. Below are the terms and conditions that constitute our Shipping Policy.</p>

              <h2>1. Order Processing Time</h2>
              <ul>
                <li><strong>Ready-to-Wear / Casual Collections:</strong> All orders for in-stock items are processed within <strong>1–2 business days</strong> (excluding weekends and holidays) after receiving your order confirmation email.</li>
                <li><strong>Pre-Orders / Luxury / Semi-Formal Collections:</strong> Items that require custom stitching, embroidery, or are listed as pre-orders generally take <strong>7–14 business days</strong> to process before dispatch.</li>
                <li>You will receive another notification when your order has shipped.</li>
              </ul>

              <h2>2. Shipping Rates & Delivery Estimates</h2>
              <p>Shipping charges for your order will be calculated and displayed at checkout.</p>
              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="border border-gray-200 p-3 font-semibold">Shipping Option</th>
                      <th className="border border-gray-200 p-3 font-semibold">Estimated Delivery Time</th>
                      <th className="border border-gray-200 p-3 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 p-3"><strong>Standard Delivery</strong></td>
                      <td className="border border-gray-200 p-3">3–5 Business Days</td>
                      <td className="border border-gray-200 p-3">Calculated at checkout based on weight/location</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 p-3"><strong>Express Delivery</strong></td>
                      <td className="border border-gray-200 p-3">1–2 Business Days</td>
                      <td className="border border-gray-200 p-3">Available for select regions at a premium rate</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="italic text-sm text-gray-500">*Please note that delivery delays can occasionally occur due to peak holiday seasons, severe weather conditions, or unexpected courier delays.*</p>

              <h2>3. Order Tracking</h2>
              <p>Once your order has shipped, you will receive a shipment confirmation email containing your tracking number(s). The tracking number will become active within 24 hours. You can use this number to monitor your parcel's journey directly on our courier partner's tracking portal.</p>

              <h2>4. Cash on Delivery (COD) & Payment Verification</h2>
              <ul>
                <li>If you select <strong>Cash on Delivery (COD)</strong>, our customer support team may call or message you via WhatsApp to verify your order before dispatch. Unverified COD orders will not be shipped.</li>
                <li>For prepaid orders (Credit/Debit cards, Bank Transfers, or Mobile Wallets), processing begins immediately upon successful payment clearance.</li>
              </ul>

              <h2>5. Incorrect Shipping Addresses & Undelivered Parcels</h2>
              <ul>
                <li>We are not responsible for orders that cannot be delivered due to incorrect or incomplete address details provided by the customer. Please double-check your shipping address during checkout.</li>
                <li>If a parcel is returned to us by the courier after multiple failed delivery attempts, the order will be canceled. For COD customers, repeated failed deliveries may result in the suspension of the COD facility for future orders.</li>
              </ul>

              <h2>6. Damaged or Missing Items</h2>
              <p>If your package arrives visibly damaged, please take a photo or record a brief video while opening the parcel. If any items are damaged or missing upon arrival, contact our support team within <strong>24–48 hours</strong> of delivery at our official email or WhatsApp helpdesk so we can resolve the issue immediately.</p>
            
              <p><strong>Tip:</strong> Just like the previous policies, feel free to tweak the specific delivery windows (like changing 3–5 days to whatever your preferred courier service actually promises) before publishing it on your site!</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-charcoal text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-6">
            Shipping <span className="italic font-serif text-gold">Questions?</span>
          </h2>
          <p className="text-white/70 mb-8">
            If you have any questions about shipping or your order status, our team is here to help.
          </p>
          <a href="/contact" className="inline-block bg-gold text-white px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-colors">
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
};

export default Shipping;
