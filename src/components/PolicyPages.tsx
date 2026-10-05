import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Truck, 
  RotateCcw, 
  PhoneCall, 
  HelpCircle, 
  Leaf, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Instagram, 
  CheckCircle2, 
  Send,
  ChevronDown,
  ChevronUp,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { PolicyTab } from '../types';

export const PolicyPages: React.FC = () => {
  const { activePolicyTab, setActivePolicyTab, setActivePage, setIsSizeGuideOpen } = useShop();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Order & Sizing Inquiry',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const tabs: { key: PolicyTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { key: 'terms', label: 'Terms & Conditions', icon: FileText },
    { key: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { key: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    { key: 'contact', label: 'Contact & Grievance', icon: PhoneCall },
    { key: 'faqs', label: 'FAQs & Sizing', icon: HelpCircle },
    { key: 'sustainability', label: 'Sustainability & Ethics', icon: Leaf },
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject,
          message: contactForm.message
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert(data.error || 'Failed to submit message.');
      }
    } catch (err) {
      // Offline fallback
      setIsSubmitted(true);
    }
  };

  const faqs = [
    {
      q: 'How long does dispatch and delivery take?',
      a: 'All orders are handcrafted or inspected and dispatched from our fulfillment center within 24 to 48 hours. Domestic orders (India) arrive within 2-4 business days. International express shipments typically arrive within 4-7 business days with full real-time tracking.'
    },
    {
      q: 'What is the return and exchange window?',
      a: 'We offer an unconditional 30-day return and exchange window from the date of delivery. Garments must be unworn, unwashed, with all original atelier tags attached and in their original dust bags or packaging.'
    },
    {
      q: 'How do I care for CORNUS virgin wool and cashmere?',
      a: 'Our 100% Biella virgin wool outerwear should only be dry cleaned by specialist garment cleaners. For Grade-A Mongolian cashmere, hand wash in lukewarm water with gentle wool detergent or dry clean. Never tumble dry or hang wet knitwear on thin hangers.'
    },
    {
      q: 'Are your sizes true to standard luxury fit?',
      a: 'Yes, CORNUS garments are cut with a tailored yet modern, relaxed drape. If you prefer a closer, traditional silhouette, we recommend sizing down one size. You can also view our full interactive Size Guide with metric (cm) and imperial (in) measurements.'
    },
    {
      q: 'Which payment methods are accepted on cornusfashion.com?',
      a: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), Apple Pay, Google Pay, UPI, Net Banking, and Cash on Delivery (COD) for eligible domestic pin codes.'
    },
    {
      q: 'How can I reach the CORNUS customer concierge?',
      a: 'Our concierge desk is reachable via business@cornus.io, phone at +919022246164, or at our offices located at Tathawade, Pimpri Chinchwad, Pune 411033 between 9:30 AM and 7:00 PM IST, Monday through Saturday.'
    }
  ];

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow bg-[#fafaf9]">
      {/* Editorial Header */}
      <div className="w-full mb-5 sm:mb-6">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-mono text-black/50 mb-2 sm:mb-2.5">
          <button onClick={() => setActivePage('home')} className="hover:text-black transition-colors">
            Home
          </button>
          <span>/</span>
          <span className="text-black font-semibold">Atelier Policies & Care</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl tracking-tight text-black font-normal">
          Client Care & Legal Standards
        </h1>
        <p className="text-xs sm:text-sm text-black/60 font-light max-w-2xl mt-2 leading-relaxed">
          Official policies, sustainability commitments, shipping criteria, and grievance officer disclosure for{' '}
          <strong className="font-medium text-black">CORNUS</strong> (
          <a href="https://www.cornusfashion.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">
            cornusfashion.com
          </a>
          ).
        </p>
      </div>

      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar (Glassmorphism Pill Dock) */}
          <div className="lg:col-span-4 sticky top-20 space-y-2 z-10">
            <div className="glass-card bg-white/80 backdrop-blur-xl border border-black/10 p-3 sm:p-4 rounded-xs shadow-sm">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-black/40 block px-3 py-2">
                Essential Governance
              </span>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activePolicyTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActivePolicyTab(tab.key);
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 text-xs tracking-wider uppercase font-medium transition-all rounded-xs text-left ${
                        isActive
                          ? 'bg-black text-white shadow-sm font-semibold'
                          : 'text-black/70 hover:bg-black/5 hover:text-black'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-black/50'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0 text-white' : 'opacity-0 -translate-x-1'}`} />
                    </button>
                  );
                })}
              </nav>

              {/* Direct Concierge Box */}
              <div className="mt-6 pt-5 border-t border-black/10 px-3 text-xs text-black/70 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-black/40 block">
                  Direct Support
                </span>
                <p className="text-[11px] leading-relaxed text-black/60">
                  Concierge Desk available Mon-Sat, 9:30 AM – 7:00 PM IST
                </p>
                <div className="pt-1 flex flex-col gap-1.5 font-mono text-[11px] text-black">
                  <a href="tel:+919022246164" className="hover:underline flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-black/50" /> +91 9022246164
                  </a>
                  <a href="mailto:business@cornus.io" className="hover:underline flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-black/50" /> business@cornus.io
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            <div className="glass-card bg-white/90 backdrop-blur-xl border border-black/10 p-6 sm:p-10 rounded-xs shadow-sm text-black">
              {/* 1. PRIVACY POLICY */}
              {activePolicyTab === 'privacy' && (
                <article className="prose prose-neutral max-w-none space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Compliance · Effective September 2026
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Privacy & Data Protection Policy
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-black/80 font-light">
                    At <strong className="font-medium text-black">CORNUS</strong> (“we”, “us”, or “our”), accessible through{' '}
                    <a href="https://www.cornusfashion.com/" className="underline font-normal text-black">
                      https://www.cornusfashion.com/
                    </a>
                    , we hold the privacy and trust of our clients as paramount. This Privacy Policy outlines our transparent practices regarding the collection, use, safeguarding, and disclosure of personal data in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and international data protection standards (including GDPR principles).
                  </p>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      1. Information We Collect
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      When you interact with CORNUS, browse our collections, or place an order, we collect:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/75 font-light">
                      <li><strong>Identity Data:</strong> Full name, salutation, and account authentication details.</li>
                      <li><strong>Contact Information:</strong> Shipping destination, billing address, email address (e.g. communication via business@cornus.io), and phone number (+91 9022246164).</li>
                      <li><strong>Transactional Data:</strong> Items purchased, sizing preferences, order history, invoice details, and encrypted payment gateway token identifiers (we never store raw CVV or card PINs).</li>
                      <li><strong>Technical Data:</strong> IP address, browser type, device specifications, operating system, and session cookies for preserving your bag items and aesthetic preferences.</li>
                    </ul>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      2. Purpose of Data Processing
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      We utilize your personal information strictly to fulfill contractual and concierge obligations:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-sm text-black/75 font-light">
                      <li>To process, tailor, pack, and deliver your ordered garments with real-time consignment tracking.</li>
                      <li>To facilitate seamless 30-day returns, sizing adjustments, and warranty inquiries.</li>
                      <li>To detect, prevent, and protect against fraudulent transactions and unauthorized portal access.</li>
                      <li>To send editorial drops and new season previews (only with your prior explicit consent).</li>
                    </ul>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      3. Data Security & Storage
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      All communications between your device and <span className="font-mono text-xs">cornusfashion.com</span> are secured using 256-bit Transport Layer Security (TLS/HTTPS). Data rests on ISO 27001 certified cloud architectures with strict role-based access control.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      4. Grievance Redressal Officer
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      In accordance with the Information Technology Act and rules made thereunder, the name and contact details of our designated Grievance Officer are:
                    </p>
                    <div className="p-4 bg-black/[0.03] border border-black/10 rounded-xs text-xs font-mono space-y-1">
                      <p><strong>Officer:</strong> Legal & Grievance Directorate, CORNUS</p>
                      <p><strong>Address:</strong> Tathawade, Pimpri Chinchwad, Pune 411033, Maharashtra, India</p>
                      <p><strong>Direct Phone:</strong> +91 9022246164</p>
                      <p><strong>Email:</strong> business@cornus.io</p>
                    </div>
                  </div>
                </article>
              )}

              {/* 2. TERMS & CONDITIONS */}
              {activePolicyTab === 'terms' && (
                <article className="prose prose-neutral max-w-none space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Legal Terms · Revised 2026
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Terms & Conditions of Service
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-black/80 font-light">
                    Welcome to CORNUS. By accessing, browsing, or making purchases on{' '}
                    <a href="https://www.cornusfashion.com/" className="underline font-normal text-black">
                      https://www.cornusfashion.com/
                    </a>
                    , you acknowledge and agree to be bound by these Terms and Conditions. Please review them carefully before placing an order.
                  </p>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      1. Brand Identity & Intellectual Property
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      The trademark <strong>CORNUS</strong>, the wordmark, garment patterns, bespoke cuts, website design, text, photographs, digital assets, and styling concepts are the exclusive intellectual property of CORNUS. Unauthorized reproduction, imitation, commercial exploitation, or scraping is strictly prohibited under applicable copyright and industrial design laws.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      2. Contract of Sale & Order Acceptance
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      Submission of an order through our portal constitutes an offer to purchase. Acceptance of your offer occurs upon our generation of the dispatch confirmation and official air waybill (AWB) tracking number. CORNUS reserves the right to decline or cancel any order in instances of inventory discrepancies, inaccuracies in pricing, or suspected fraudulent activity.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      3. Pricing, Invoicing & Taxes
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      All prices displayed on <span className="font-mono text-xs">cornusfashion.com</span> are inclusive of all applicable statutory taxes (such as GST for deliveries within India). For cross-border deliveries, any local customs duties or import handling fees imposed by destination customs are the responsibility of the recipient.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      4. Limitation of Liability & Governing Jurisdiction
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      These terms and any disputes arising out of the sale or website operation shall be governed exclusively by the laws of India. The competent courts situated in <strong>Pune, Maharashtra</strong> shall have exclusive territorial jurisdiction over any proceedings.
                    </p>
                  </div>
                </article>
              )}

              {/* 3. SHIPPING & DELIVERY POLICY */}
              {activePolicyTab === 'shipping' && (
                <article className="prose prose-neutral max-w-none space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Logistics Standards · Worldwide & Domestic
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Shipping & Delivery Policy
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-black/80 font-light">
                    Every CORNUS garment is handled with utmost care, pressed, and enclosed in breathable organic cotton garment bags prior to dispatch. We partner exclusively with premium express couriers including BlueDart, Delhivery, and DHL Express.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs">
                      <span className="text-xs font-mono font-semibold uppercase text-black block mb-1">
                        Domestic Express (India)
                      </span>
                      <p className="text-xs text-black/70 leading-relaxed">
                        Dispatch within 24–48 hours. Transit time 2–4 business days to metropolitan areas (Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Chennai) and 3–5 business days to other regions.
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-700 mt-2 block">
                        Complimentary on all orders over INR 2,500
                      </span>
                    </div>

                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs">
                      <span className="text-xs font-mono font-semibold uppercase text-black block mb-1">
                        International Priority Express
                      </span>
                      <p className="text-xs text-black/70 leading-relaxed">
                        Direct express dispatch via DHL Express / FedEx to over 60 countries. Typical transit time is 4–7 business days with end-to-end tracking and SMS alerts.
                      </p>
                      <span className="text-[11px] font-semibold text-black/80 mt-2 block">
                        Calculated at checkout with duty delivery options
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      Consignment Tracking
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      Upon package handover to the logistics partner, an automated notification containing your live tracking URL and AWB code is transmitted via email and SMS. You can also monitor your order progress anytime through the CORNUS Client Dashboard.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      Damaged or Tampered Parcels
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      In the unlikely event that your exterior packaging appears severely torn, wet, or tampered with upon courier handover, please do not accept the delivery and immediately notify our concierge at{' '}
                      <a href="tel:+919022246164" className="underline font-medium text-black">
                        +91 9022246164
                      </a>{' '}
                      or email{' '}
                      <a href="mailto:business@cornus.io" className="underline font-medium text-black">
                        business@cornus.io
                      </a>{' '}
                      within 24 hours.
                    </p>
                  </div>
                </article>
              )}

              {/* 4. RETURN, REFUND & CANCELLATION */}
              {activePolicyTab === 'returns' && (
                <article className="prose prose-neutral max-w-none space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Client Assurance · 30-Day Guarantee
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Return, Refund & Cancellation Policy
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-black/80 font-light">
                    We stand resolutely behind the tailored craftsmanship, drape, and material integrity of every CORNUS creation. If your garment does not meet your expectations, we offer a straightforward, hassle-free 30-day return and exchange policy.
                  </p>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      1. Eligibility Criteria for Returns
                    </h3>
                    <div className="space-y-2 text-sm text-black/75 font-light">
                      <p>To qualify for a full refund or complimentary size exchange:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>The request must be initiated within 30 calendar days of delivery.</li>
                        <li>Garments must remain in unworn, unwashed, and immaculate condition.</li>
                        <li>All original security tags, fabric care labels, and spare horn button pouches must remain attached.</li>
                        <li>Items must be returned inside the original CORNUS dust cover and protective packaging.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      2. Reverse Pickup & Inspection
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      For domestic orders, our concierge arranges complimentary reverse pickup directly from your doorstep in Tathawade, Pune, or anywhere across India. Once received at our atelier, the piece undergoes quality inspection within 24 to 48 hours.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      3. Refund Disbursement
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      Upon successful inspection, refunds are credited back to your original mode of payment (credit card, debit card, UPI, or net banking) within 5 to 7 business days. For Cash on Delivery (COD) orders, a secure bank transfer or store credit voucher is issued upon your verified instructions.
                    </p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      4. Order Cancellation
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      Orders may be cancelled at no penalty before dispatch occurs (typically within 2 to 4 hours of placement). Once dispatched and an AWB tracking code has been generated, please receive the shipment and initiate our complimentary 30-day return process.
                    </p>
                  </div>
                </article>
              )}

              {/* 5. CONTACT US & GRIEVANCE */}
              {activePolicyTab === 'contact' && (
                <article className="space-y-8">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Direct Atelier Line · Pune Headquarters
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Contact Concierge & Grievance Desk
                    </h2>
                  </div>

                  {/* Company Credentials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs space-y-2">
                      <div className="flex items-center gap-2 text-black">
                        <MapPin className="w-4 h-4 text-black/60 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Registered Atelier Address</span>
                      </div>
                      <p className="text-xs text-black/75 font-mono leading-relaxed pl-6">
                        Tathawade, Pimpri Chinchwad,<br />
                        Pune 411033, Maharashtra, India
                      </p>
                    </div>

                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs space-y-2">
                      <div className="flex items-center gap-2 text-black">
                        <Phone className="w-4 h-4 text-black/60 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Direct Concierge Helpline</span>
                      </div>
                      <p className="text-xs text-black/75 font-mono leading-relaxed pl-6">
                        <a href="tel:+919022246164" className="hover:underline text-black font-medium">
                          +91 9022246164
                        </a><br />
                        Mon – Sat: 9:30 AM – 7:00 PM IST
                      </p>
                    </div>

                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs space-y-2">
                      <div className="flex items-center gap-2 text-black">
                        <Mail className="w-4 h-4 text-black/60 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Executive & Business Email</span>
                      </div>
                      <p className="text-xs text-black/75 font-mono leading-relaxed pl-6">
                        <a href="mailto:business@cornus.io" className="hover:underline text-black font-medium">
                          business@cornus.io
                        </a><br />
                        Guaranteed response within 4 hours
                      </p>
                    </div>

                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs space-y-2">
                      <div className="flex items-center gap-2 text-black">
                        <Instagram className="w-4 h-4 text-black/60 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Official Digital Channels</span>
                      </div>
                      <p className="text-xs text-black/75 font-mono leading-relaxed pl-6">
                        <a href="https://www.instagram.com/cornusfashion/" target="_blank" rel="noopener noreferrer" className="hover:underline text-black font-medium block">
                          @cornusfashion
                        </a>
                        <a href="https://www.cornusfashion.com/" target="_blank" rel="noopener noreferrer" className="hover:underline text-black/60 block text-[11px]">
                          www.cornusfashion.com
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Interactive Message Form */}
                  <div className="p-6 bg-white border border-black/10 rounded-xs shadow-sm">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-black mb-1">
                      Send an Inquiry to the Atelier
                    </h3>
                    <p className="text-xs text-black/60 font-light mb-6">
                      For bespoke tailoring consultations, wholesale representations, or order inquiries.
                    </p>

                    {isSubmitted ? (
                      <div className="p-6 bg-emerald-50 border border-emerald-200 text-center rounded-xs space-y-2 animate-in fade-in">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-semibold text-emerald-900">Inquiry Transmitted to CORNUS Concierge</h4>
                        <p className="text-xs text-emerald-700 max-w-md mx-auto font-light">
                          Thank you, {contactForm.name}. A personal liaison from our Tathawade, Pune atelier will reach out to <span className="font-mono">{contactForm.email}</span> within 4 hours.
                        </p>
                        <button
                          onClick={() => {
                            setIsSubmitted(false);
                            setContactForm({ name: '', email: '', phone: '', subject: 'Order & Sizing Inquiry', message: '' });
                          }}
                          className="mt-3 text-xs underline font-medium text-emerald-800"
                        >
                          Send another message
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-black/60 block mb-1">
                              Client Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              placeholder="e.g. Arjun Sharma"
                              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 text-xs text-black focus:outline-none focus:border-black rounded-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-black/60 block mb-1">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              required
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              placeholder="client@domain.com"
                              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 text-xs text-black focus:outline-none focus:border-black rounded-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-black/60 block mb-1">
                              Contact Phone Number
                            </label>
                            <input
                              type="tel"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                              placeholder="+91 9022246164"
                              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 text-xs text-black focus:outline-none focus:border-black rounded-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-mono uppercase tracking-wider text-black/60 block mb-1">
                              Inquiry Category
                            </label>
                            <select
                              value={contactForm.subject}
                              onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 text-xs text-black focus:outline-none focus:border-black rounded-xs"
                            >
                              <option value="Order & Sizing Inquiry">Order & Sizing Inquiry</option>
                              <option value="Returns & Exchanges">Returns & Exchanges</option>
                              <option value="Custom Tailoring Consultation">Custom Tailoring Consultation</option>
                              <option value="Wholesale & Corporate Partnership">Wholesale & Corporate Partnership</option>
                              <option value="Grievance Redressal">Grievance Redressal</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono uppercase tracking-wider text-black/60 block mb-1">
                            Message Detail *
                          </label>
                          <textarea
                            required
                            rows={4}
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="Provide any details regarding your requirement, garment style, or order number..."
                            className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 text-xs text-black focus:outline-none focus:border-black rounded-xs resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-8 py-3 bg-black text-white text-xs font-semibold tracking-[0.18em] uppercase hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                        >
                          <span>Transmit Message</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              )}

              {/* 6. FAQS & SIZING */}
              {activePolicyTab === 'faqs' && (
                <article className="space-y-8">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Client Assistance · Comprehensive Guide
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  {/* Accordion List */}
                  <div className="space-y-3">
                    {faqs.map((faq, index) => {
                      const isOpen = openFaqIndex === index;
                      return (
                        <div
                          key={index}
                          className="border border-black/10 rounded-xs overflow-hidden bg-white/70"
                        >
                          <button
                            onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                            className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-black/[0.02] transition-colors"
                          >
                            <span className="text-xs sm:text-sm font-medium text-black pr-4">
                              {faq.q}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-black/60 shrink-0" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-black/40 shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5 pt-1 text-xs text-black/75 leading-relaxed font-light border-t border-black/5 animate-in fade-in duration-200">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Size Guide Trigger Banner */}
                  <div className="p-6 bg-black text-white rounded-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold tracking-wide uppercase">Looking for Precise Tailoring Measurements?</h4>
                      <p className="text-xs text-white/70 font-light mt-1">
                        View our complete size matrix across chest, waist, hips, and inseam in both centimeters and inches.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsSizeGuideOpen(true)}
                      className="px-6 py-2.5 bg-white text-black text-xs font-semibold tracking-wider uppercase hover:bg-white/90 transition-colors shrink-0"
                    >
                      Open Size Guide
                    </button>
                  </div>
                </article>
              )}

              {/* 7. SUSTAINABILITY & ETHICAL SOURCING */}
              {activePolicyTab === 'sustainability' && (
                <article className="prose prose-neutral max-w-none space-y-6">
                  <div className="border-b border-black/10 pb-4">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-black/50 block">
                      Manifesto · Responsible Modern Luxury
                    </span>
                    <h2 className="font-serif text-3xl font-medium tracking-tight text-black mt-1">
                      Sustainability & Ethical Sourcing Statement
                    </h2>
                  </div>

                  <p className="text-sm leading-relaxed text-black/80 font-light">
                    At CORNUS, sustainable practice is not a secondary marketing claim; it is the foundational criterion for every fiber we weave. We reject seasonal disposability in favor of timeless heirloom pieces crafted to endure decades of considered wear.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black block mb-1">
                        100% Traceable Wool
                      </span>
                      <p className="text-xs text-black/70 leading-relaxed font-light">
                        Milled exclusively in Biella, Italy from certified non-mulesed, animal-welfare accredited virgin wool sources with closed-loop hydro purification.
                      </p>
                    </div>

                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black block mb-1">
                        Plastic-Free Packaging
                      </span>
                      <p className="text-xs text-black/70 leading-relaxed font-light">
                        Every garment arrives wrapped in raw certified GOTS organic cotton garment covers with 100% compostable FSC-certified outer paper cartons.
                      </p>
                    </div>

                    <div className="p-4 bg-black/[0.02] border border-black/10 rounded-xs">
                      <span className="text-xs font-semibold uppercase tracking-wider text-black block mb-1">
                        Fair Atelier Living Wages
                      </span>
                      <p className="text-xs text-black/70 leading-relaxed font-light">
                        Our master tailors in Pune, Portugal, and Okayama operate under strict ethical labor standards with living wages, healthcare, and safe studio conditions.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <h3 className="text-base font-semibold tracking-wide uppercase text-black">
                      Circular Repair & Heirloom Program
                    </h3>
                    <p className="text-sm leading-relaxed text-black/75 font-light">
                      All CORNUS tailored overcoats and trousers are eligible for lifetime button replacement and seam restoration consultations at our Tathawade, Pune atelier. Simply contact{' '}
                      <a href="mailto:business@cornus.io" className="underline font-medium text-black">
                        business@cornus.io
                      </a>{' '}
                      with your order number.
                    </p>
                  </div>
                </article>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
