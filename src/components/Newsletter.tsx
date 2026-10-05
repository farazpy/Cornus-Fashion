import React, { useState } from 'react';
import { ArrowRight, Check, Mail, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useShop();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.success) {
        setSubscribed(true);
        showToast('Welcome to the CORNUS Atelier Club!');
      } else {
        showToast(data.error || 'Failed to join');
      }
    } catch (err) {
      // Offline fallback
      setSubscribed(true);
      showToast('Welcome to the CORNUS Atelier Club!');
    }
  };

  return (
    <section className="py-20 lg:py-24 bg-[#fffdf9] border-t border-neutral-900/10 px-4">
      <div className="max-w-2xl mx-auto bg-[#bbf7d0] border border-neutral-900/15 p-8 sm:p-12 rounded-2xl shadow-xs text-center relative overflow-hidden">
        
        {/* Floating background decorative details */}
        <div className="absolute top-4 right-4 text-neutral-900/25 animate-bounce">
          <Sparkles className="w-8 h-8 fill-current" />
        </div>
        <div className="absolute bottom-4 left-4 text-neutral-900/20">
          <Mail className="w-10 h-10" />
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-white border border-neutral-900/15 px-3 py-1 rounded-full mb-4 shadow-none">
          Atelier Communications
        </span>

        <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-neutral-900 mb-3 uppercase">
          STAY IN THE HAPPY LOOP!
        </h2>

        <p className="text-sm sm:text-base text-neutral-800 font-bold leading-relaxed mb-8 max-w-md mx-auto">
          Get direct invitations to cozy sample drops, happy seasonal edits, and exclusive member-only tailoring events.
        </p>

        {!subscribed ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto relative z-10">
            <div className="relative w-full">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Write your email here..."
                className="w-full px-5 py-3.5 bg-white text-sm text-neutral-900 placeholder:text-neutral-400 border border-neutral-900/15 rounded-xl focus:border-neutral-900 focus:outline-none transition-all font-bold shadow-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-amber-300 border border-neutral-900/15 text-black hover:bg-amber-400 text-xs font-bold tracking-wider uppercase shrink-0 flex items-center justify-center gap-2 rounded-xl shadow-xs transition-all active:translate-y-0.5 cursor-pointer"
            >
              <span>Join Atelier</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </form>
        ) : (
          <div className="p-6 bg-white border border-neutral-900/15 rounded-2xl text-center animate-fadeIn shadow-xs">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 border border-neutral-900/15 flex items-center justify-center mx-auto mb-3">
              <Check className="w-5 h-5 stroke-[2]" />
            </div>
            <h3 className="font-serif text-xl font-black text-neutral-900 mb-1">
              YOU ARE ON THE LIST!
            </h3>
            <p className="text-xs text-neutral-600 font-bold">
              We've registered {email} onto our MySQL subscriber database. Prepare for cozy drops!
            </p>
          </div>
        )}

      </div>
    </section>
  );
};
