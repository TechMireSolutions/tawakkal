import { useState, useEffect } from 'react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-ivory min-h-screen text-charcoal pt-32">
      <div className="max-w-md mx-auto px-6 py-12">
        <div className="bg-white p-8 shadow-2xl border border-gold/20">
          <div className="flex justify-center mb-8 gap-8 border-b border-gray-100 pb-4">
            <button 
              onClick={() => setIsLogin(true)}
              className={`uppercase tracking-widest text-sm font-bold pb-2 border-b-2 transition-colors ${isLogin ? 'border-gold text-charcoal' : 'border-transparent text-gray-400 hover:text-charcoal'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`uppercase tracking-widest text-sm font-bold pb-2 border-b-2 transition-colors ${!isLogin ? 'border-gold text-charcoal' : 'border-transparent text-gray-400 hover:text-charcoal'}`}
            >
              Register
            </button>
          </div>

          <form className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                <input type="text" className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold transition-colors bg-transparent" placeholder="John Doe" />
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
              <input type="email" className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold transition-colors bg-transparent" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Password</label>
              <input type="password" className="w-full border-b border-gray-200 py-2 focus:outline-none focus:border-gold transition-colors bg-transparent" placeholder="••••••••" />
            </div>
            
            <button type="submit" className="w-full bg-charcoal text-white py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all mt-8">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center">
              <a href="#" className="text-[10px] text-gray-500 hover:text-gold uppercase tracking-widest transition-colors">Forgot your password?</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
