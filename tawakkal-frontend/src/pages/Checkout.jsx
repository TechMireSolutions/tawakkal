import { useState, useEffect } from 'react';
import { useCart } from "./CartContext.jsx";
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api';
// Removed unused useCurrency import
import { useSiteSettings } from '../context/SiteSettingsContext';
import { Check, ArrowRight, Loader2 } from 'lucide-react';

const Checkout = () => {
  const { cartItems, clearCart, setNotification } = useCart();
  // Removed unused convertPrice
  const siteSettings = useSiteSettings();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const shippingFee = siteSettings?.shipping_fee ?? 250;
  const freeShippingThreshold = siteSettings?.free_shipping_threshold ?? 5000;
  const taxPercent = siteSettings?.tax_percent ?? 0;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: 'Pakistan',
    paymentMethod: 'COD'
  });

  useEffect(() => {
    if (cartItems.length === 0 && !orderComplete) {
      navigate('/cart');
    }
  }, [cartItems, navigate, orderComplete]);

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
      return total + price * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingFee;
  const tax = taxPercent > 0 ? Math.round(subtotal * taxPercent / 100) : 0;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.country}`,
        total_amount: total,
        order_items: cartItems.map(item => ({
          product: item.id,
          variant_id: item.variants?.[0]?.id || item.id, // Fallback if no variant_id is present
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor?.name,
          is_wholesale: !!item.isWholesale
        }))
      };

      await createOrder(orderData);
      setOrderComplete(true);
      clearCart();
      setNotification({
        type: 'success',
        message: 'Order placed successfully!'
      });
    } catch (err) {
      console.error("Error creating order", err);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-ivory pt-40 pb-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-12 text-center shadow-2xl animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/20">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight">Thank You!</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Your order has been placed successfully. We'll contact you shortly for confirmation.
          </p>
          <button 
            onClick={() => navigate('/products')}
            className="w-full bg-charcoal text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-charcoal pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <h1 className="text-4xl font-black tracking-tight mb-12">Checkout</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Shipping Details */}
          <div className="lg:col-span-7 space-y-10">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-widest border-b border-gray-50 pb-4">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all" placeholder="Doe" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all" placeholder="jane@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all" placeholder="+92 300 1234567" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                <input required name="address" value={formData.address} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all" placeholder="House #, Street, Area" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                  <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all" placeholder="Karachi" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Country</label>
                  <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-gray-50 border border-transparent rounded-xl px-6 py-4 text-sm focus:bg-white focus:border-gold outline-none transition-all appearance-none cursor-pointer">
                    <option value="Pakistan">Pakistan</option>
                    <option value="UAE">UAE</option>
                    <option value="UK">UK</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
               <h2 className="text-xl font-bold uppercase tracking-widest border-b border-gray-50 pb-4">Payment Method</h2>
               <div className="flex items-center gap-4 p-6 bg-gold/5 border border-gold/20 rounded-2xl">
                  <div className="w-6 h-6 rounded-full border-4 border-gold bg-white"></div>
                  <div>
                    <p className="text-sm font-bold">Cash on Delivery (COD)</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pay when you receive your order</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 sticky top-32 space-y-8">
              <h2 className="text-xl font-bold uppercase tracking-widest">Your Order</h2>
              
              <div className="space-y-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-bold line-clamp-1 uppercase tracking-wider">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Size: {item.selectedSize} | Qty: {item.quantity}
                      </p>
                      <p className="text-xs font-black text-gold mt-1">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="font-bold">PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400 font-bold uppercase tracking-widest">Shipping</span>
                  <span className="font-bold">{shipping === 0 ? 'FREE' : `PKR ${shipping}`}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase tracking-widest">Tax ({taxPercent}%)</span>
                    <span className="font-bold">PKR {tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <span className="text-lg font-black uppercase tracking-[0.2em]">Total</span>
                  <span className="text-2xl font-black text-gold">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-charcoal text-white py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all shadow-xl shadow-charcoal/10 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={18} /> Processing...</>
                ) : (
                  <><Check size={18} /> Place Order Now</>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                <ArrowRight size={12} /> Secure Checkout Guaranteed
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
