import { useEffect } from 'react';
import { useCart } from "./CartContext.jsx";
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const Cart = () => {
  const { cartItems, removeFromCart, addToCart } = useCart();
  const navigate = useNavigate();
  const { convertPrice } = useCurrency();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const priceStr = String(item.price);
      const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
      return total + price * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    if (cartItems.length === 0) return 0;
    // Use the shipping price from the first item, or calculate total shipping
    // For simplicity, we'll use the max shipping price among items
    const shippingPrices = cartItems.map(item => item.shipping_price || 0);
    return Math.max(...shippingPrices);
  };

  const subtotal = calculateSubtotal();
  const shipping = calculateShipping();
  const total = subtotal + shipping;

  return (
    <div className="bg-ivory min-h-screen text-charcoal pt-32">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold uppercase tracking-widest border-b border-gold pb-4 mb-8">Shopping Cart</h1>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-2/3">
            {cartItems.length === 0 ? (
              <div className="bg-white p-8 shadow-sm border border-gray-100 text-center py-20">
                <p className="text-gray-500 tracking-widest text-sm uppercase">Your cart is currently empty.</p>
                <a href="/products" className="inline-block mt-6 bg-charcoal text-white px-8 py-3 text-xs uppercase tracking-[0.2em] font-bold hover:bg-gold transition-colors">Return to Shop</a>
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-gray-100">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.selectedSize || 'nosize'}-${item.selectedColor?.name || 'nocolor'}`} className={`flex items-center gap-4 p-4 md:p-6 ${index > 0 ? 'border-t border-gray-100' : ''}`}>
                    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <img src={item.primary_image?.image_url || "https://placehold.co/400x533?text=No+Image"} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      {item.selectedSize && (
                        <p className="text-gray-500 text-sm">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                          Color: <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor.hex }}></span> {item.selectedColor.name}
                        </p>
                      )}
                      <p className="font-bold text-gold text-lg mt-2">{convertPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => addToCart(item, -(item.isWholesale ? (item.wholesale_step_quantity || 6) : 1), item.selectedSize, item.selectedColor, item.isWholesale)}
                        disabled={item.quantity <= (item.isWholesale ? (item.wholesale_min_quantity || 6) : 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-lg">{item.quantity}</span>
                      <button
                        onClick={() => addToCart(item, item.isWholesale ? (item.wholesale_step_quantity || 6) : 1, item.selectedSize, item.selectedColor, item.isWholesale)}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor?.name)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="md:w-1/3">
            <div className="bg-white p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 uppercase tracking-widest">Order Summary</h2>
              <div className="flex justify-between border-b border-gray-100 pb-4 mb-4">
                <span className="text-sm">Subtotal</span>
                <span className="font-bold">PKR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-4 mb-4">
                <span className="text-sm">Shipping</span>
                <span className="font-bold">{shipping > 0 ? `PKR ${shipping.toLocaleString()}` : 'Free'}</span>
              </div>
              <div className="flex justify-between mb-8">
                <span className="font-bold uppercase tracking-widest">Total</span>
                <span className="font-bold text-gold">PKR {total.toLocaleString()}</span>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="w-full bg-charcoal text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all"
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
