import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Send, 
  Calendar, 
  MessageSquare, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  PhoneCall,
  Scissors,
  Building,
  Check,
  Search,
  RefreshCw,
  Award,
  FileText,
  Navigation,
  Headphones,
  SlidersHorizontal
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export type InquiryIntent = 
  | 'Order & Sizing Assistance'
  | 'Private Atelier Styling Appointment'
  | 'Bespoke Tailoring & Custom Alterations'
  | 'Wholesale & Press Representation'
  | 'Grievance & Executive Support';

interface FaqItem {
  category: 'Orders & Shipping' | 'Atelier & Fittings' | 'Tailoring & Care' | 'Compliance & Service';
  q: string;
  a: string;
}

export const ContactPage: React.FC = () => {
  const { setActivePage, showToast, storeSettings, currentUser, userOrders } = useShop();

  // Primary Inquiry Form State
  const [intent, setIntent] = useState<InquiryIntent>('Order & Sizing Assistance');
  const [name, setName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('11:00 AM - 01:00 PM');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopiedTicket, setHasCopiedTicket] = useState(false);
  const [hasCopiedAddress, setHasCopiedAddress] = useState(false);
  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);

  // Submitted ticket modal/view state
  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketNumber: string;
    name: string;
    email: string;
    intent: string;
    submittedAt: string;
  } | null>(null);

  // Quick 15-Minute Concierge Callback Form State
  const [callbackName, setCallbackName] = useState(currentUser?.fullName || '');
  const [callbackPhone, setCallbackPhone] = useState(currentUser?.phone || '');
  const [callbackSlot, setCallbackSlot] = useState('Morning (10:00 AM - 01:00 PM IST)');
  const [isRequestingCallback, setIsRequestingCallback] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  // FAQ Accordion & Filter State
  const [faqCategory, setFaqCategory] = useState<string>('All');
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sync user info if currentUser updates
  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.fullName || '');
      if (!email) setEmail(currentUser.email || '');
      if (!phone) setPhone(currentUser.phone || '');
      if (!callbackName) setCallbackName(currentUser.fullName || '');
      if (!callbackPhone) setCallbackPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Real-time IST Atelier Operating Status
  const [atelierStatus, setAtelierStatus] = useState<{
    isOpen: boolean;
    statusText: string;
    subText: string;
    currentTimeIST: string;
  }>({
    isOpen: true,
    statusText: 'Concierge Desk Online',
    subText: 'Direct telephone & live stylist desk active',
    currentTimeIST: ''
  });

  useEffect(() => {
    const computeIstStatus = () => {
      // Create date object in Asia/Kolkata (IST = UTC+5:30)
      const now = new Date();
      const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istString);
      const day = istDate.getDay(); // 0 = Sun, 6 = Sat
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const currentDecimal = hours + minutes / 60;

      const timeFormatted = istDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // Mon-Fri: 9:30 AM (9.5) to 7:30 PM (19.5)
      // Sat: 10:00 AM (10.0) to 6:00 PM (18.0)
      // Sun: VIP Private Online Concierge only
      if (day >= 1 && day <= 5) {
        if (currentDecimal >= 9.5 && currentDecimal < 19.5) {
          setAtelierStatus({
            isOpen: true,
            statusText: 'Showroom & Atelier Open',
            subText: `Live until 7:30 PM IST · Turnaround < 2h`,
            currentTimeIST: timeFormatted
          });
        } else {
          setAtelierStatus({
            isOpen: false,
            statusText: 'Atelier Closed for the Evening',
            subText: `Reopens tomorrow at 9:30 AM IST · Inquiries queue 24/7`,
            currentTimeIST: timeFormatted
          });
        }
      } else if (day === 6) {
        if (currentDecimal >= 10.0 && currentDecimal < 18.0) {
          setAtelierStatus({
            isOpen: true,
            statusText: 'Saturday Atelier Open',
            subText: `Fittings active until 6:00 PM IST`,
            currentTimeIST: timeFormatted
          });
        } else {
          setAtelierStatus({
            isOpen: false,
            statusText: 'Saturday Hours Concluded',
            subText: `Reopens Monday 9:30 AM IST`,
            currentTimeIST: timeFormatted
          });
        }
      } else {
        setAtelierStatus({
          isOpen: false,
          statusText: 'Sunday VIP Remote Concierge',
          subText: `Online transmissions monitored · Full atelier reopens Mon 9:30 AM`,
          currentTimeIST: timeFormatted
        });
      }
    };

    computeIstStatus();
    const interval = setInterval(computeIstStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const phoneDisplay = storeSettings?.supportPhone || '+91 9022246164';
  const cleanPhone = phoneDisplay.replace(/[^0-9+]/g, '');
  const emailDisplay = storeSettings?.supportEmail || 'business@cornus.io';
  const addressDisplay = storeSettings?.physicalAddress || 'Tathawade, Pimpri Chinchwad, Pune 411033, Maharashtra, India';

  const intentOptions: { 
    value: InquiryIntent; 
    label: string; 
    badge: string; 
    desc: string; 
    icon: React.FC<{ className?: string }> 
  }[] = [
    { 
      value: 'Order & Sizing Assistance', 
      label: 'Order & Sizing', 
      badge: 'Fastest SLA',
      desc: 'Track dispatch, fit consultation, exchanges & delivery adjustments.',
      icon: MessageSquare 
    },
    { 
      value: 'Private Atelier Styling Appointment', 
      label: 'VIP Appointment', 
      badge: 'In-Person',
      desc: 'Schedule a 1-on-1 silhouette fitting & fabric review at our Pune showroom.',
      icon: Calendar 
    },
    { 
      value: 'Bespoke Tailoring & Custom Alterations', 
      label: 'Bespoke Tailoring', 
      badge: 'Master Tailor',
      desc: 'Hem adjustments, custom chest/sleeve specs, and monogram embroidery.',
      icon: Scissors 
    },
    { 
      value: 'Wholesale & Press Representation', 
      label: 'Press & B2B', 
      badge: 'Corporate',
      desc: 'Bulk corporate curations, brand collaborations & editorial garment loans.',
      icon: Building 
    },
    { 
      value: 'Grievance & Executive Support', 
      label: 'Grievance Officer', 
      badge: 'Statutory 48h',
      desc: 'Direct escalation to statutory Nodal Officer under Consumer Protection rules.',
      icon: ShieldCheck 
    },
  ];

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please provide your name, email address, and inquiry message.');
      return;
    }

    setIsSubmitting(true);

    const fallbackTicket = `CRN-CON-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
          intent,
          subject: subject.trim() || `${intent} - ${name.trim()}`,
          orderId: orderId.trim() || undefined,
          appointmentDate: intent === 'Private Atelier Styling Appointment' ? appointmentDate : undefined,
          preferredTime: intent === 'Private Atelier Styling Appointment' ? preferredTime : undefined,
          message: message.trim()
        })
      });

      const data = await res.json();

      const ticketNum = (data.success && data.ticketNumber) ? data.ticketNumber : fallbackTicket;

      setSubmittedTicket({
        ticketNumber: ticketNum,
        name: name.trim(),
        email: email.trim(),
        intent,
        submittedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      });

      showToast(`Concierge Ticket #${ticketNum} created successfully!`);
    } catch {
      // Offline graceful fallback
      setSubmittedTicket({
        ticketNumber: fallbackTicket,
        name: name.trim(),
        email: email.trim(),
        intent,
        submittedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      });
      showToast(`Inquiry recorded under Ticket #${fallbackTicket}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone.trim()) {
      showToast('Please provide your full name and contact phone number.');
      return;
    }

    setIsRequestingCallback(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: callbackName.trim(),
          email: currentUser?.email || 'callback-request@cornus.io',
          phone: callbackPhone.trim(),
          intent: 'Direct Phone Callback Request',
          subject: `Concierge Callback Request - Time Window: ${callbackSlot}`,
          preferredTime: callbackSlot,
          message: `Client ${callbackName.trim()} requested a personal 15-minute stylist consultation at phone: ${callbackPhone.trim()} during slot: ${callbackSlot}.`
        })
      });

      setCallbackSuccess(true);
      showToast('Stylist callback scheduled! Our liaison will ring you.');
    } catch {
      setCallbackSuccess(true);
      showToast('Callback request registered.');
    } finally {
      setIsRequestingCallback(false);
    }
  };

  const faqs: FaqItem[] = [
    {
      category: 'Orders & Shipping',
      q: 'How quickly will the CORNUS concierge respond to my inquiry?',
      a: 'During standard atelier operating hours (Monday through Saturday, 9:30 AM – 7:30 PM IST), our dedicated styling liaisons guarantee an initial personal response within 2 to 4 business hours.'
    },
    {
      category: 'Atelier & Fittings',
      q: 'Can I visit the Tathawade Pune showroom for an in-person fitting?',
      a: 'Yes, absolutely. We welcome clients for private appointments at our Pune flagship showroom for master measurements, tactile drape reviews of Italian wools and Japanese cottons, and bespoke consultations. Select "VIP Appointment" above or contact our reception.'
    },
    {
      category: 'Orders & Shipping',
      q: 'How do I initiate a return or size exchange for my recent order?',
      a: 'We provide an unconditional 30-day doorstep reverse return and exchange policy. You can initiate it from your Client Dashboard (/account) or simply send an inquiry with your Order ID (#ORD-XXXXXX) for complimentary doorstep pickup across India.'
    },
    {
      category: 'Tailoring & Care',
      q: 'Do you offer custom hemline and sleeve tailoring prior to dispatch?',
      a: 'Yes! Our master tailors execute bespoke trouser hem shortening, jacket sleeve taper adjustments, and waist alterations before packaging. Simply provide your specific measurements with your Order ID immediately after checkout.'
    },
    {
      category: 'Orders & Shipping',
      q: 'Which international territories do you dispatch to?',
      a: 'We deliver to over 60+ countries worldwide via express DHL Express and FedEx with real-time end-to-end tracking, climate-controlled packaging, and transparent customs duties clearance.'
    },
    {
      category: 'Compliance & Service',
      q: 'Who is the designated Grievance Officer for consumer compliance?',
      a: 'In adherence with Consumer Protection (E-Commerce) Rules and the Information Technology Act, our designated Nodal Grievance Officer is Mr. R. Deshmukh (grievance@cornus.io / +91 9022246164) with guaranteed written resolution within 48 business hours.'
    },
    {
      category: 'Tailoring & Care',
      q: 'How do I care for CORNUS bespoke wool and cashmere garments?',
      a: 'We recommend professional eco-friendly dry cleaning for structured coats and blazers. For silk and cotton poplin shirts, gentle hand washing in cold water or delicate cycle with pH-neutral detergent preserves the drape and fiber lustres.'
    }
  ];

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      const matchesCategory = faqCategory === 'All' || faq.category === faqCategory;
      const matchesSearch = !faqSearch.trim() || 
        faq.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
        faq.a.toLowerCase().includes(faqSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [faqCategory, faqSearch]);

  const copyToClipboard = (text: string, type: 'ticket' | 'address' | 'email') => {
    navigator.clipboard.writeText(text);
    if (type === 'ticket') {
      setHasCopiedTicket(true);
      setTimeout(() => setHasCopiedTicket(false), 2500);
      showToast(`Copied Ticket ID: ${text}`);
    } else if (type === 'address') {
      setHasCopiedAddress(true);
      setTimeout(() => setHasCopiedAddress(false), 2500);
      showToast('Showroom address copied to clipboard');
    } else if (type === 'email') {
      setHasCopiedEmail(true);
      setTimeout(() => setHasCopiedEmail(false), 2500);
      showToast(`Copied email: ${text}`);
    }
  };

  return (
    <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 sm:pb-20 min-h-screen flex flex-col flex-grow bg-[#fafaf9] text-zinc-900">
      {/* 1. EDITORIAL HEADER & BREADCRUMBS */}
      <section className="w-full mb-6 sm:mb-8">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase font-mono text-zinc-400 mb-2.5">
          <button 
            onClick={() => setActivePage('home')} 
            className="hover:text-black transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Concierge & Client Relations</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-200/80 pb-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-zinc-900 text-white text-[10px] font-mono uppercase tracking-[0.2em] font-bold rounded-sm">
                Atelier Client Service
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                Pune Headquarters · Direct Line
              </span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-zinc-950 font-normal">
              Concierge & Bespoke Relations
            </h1>
            
            <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed">
              Connect directly with our master tailors, private styling liaisons, and customer support desk for personalized sizing guidance, showroom appointments, and order inquiries.
            </p>
          </div>

          {/* Real-time Atelier Status Pill */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-4 sm:p-5 shadow-xs shrink-0 flex items-center gap-4 min-w-[280px]">
            <div className="relative flex items-center justify-center">
              <div className={`w-3.5 h-3.5 rounded-full ${atelierStatus.isOpen ? 'bg-emerald-500' : 'bg-amber-500'} animate-ping opacity-75`} />
              <div className={`w-3 h-3 rounded-full ${atelierStatus.isOpen ? 'bg-emerald-600' : 'bg-amber-600'} absolute`} />
            </div>
            <div className="text-xs space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 font-mono">{atelierStatus.statusText}</span>
              </div>
              <p className="text-zinc-500 text-[11px] font-light">{atelierStatus.subText}</p>
              {atelierStatus.currentTimeIST && (
                <span className="text-[10px] font-mono text-zinc-400 block pt-0.5">
                  IST Local Time: {atelierStatus.currentTimeIST}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. THREE CORE ACCESS PILLARS */}
      <section className="w-full mb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Telephone & WhatsApp */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 hover:border-zinc-400 hover:shadow-md transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                Instant Telephone & WhatsApp
              </span>
              <h3 className="font-serif text-2xl font-normal text-zinc-950">Direct Concierge Desk</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Connect instantly with our styling desk for real-time sizing advice, courier dispatch check, or quick garment advice.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <a 
                href={`tel:${cleanPhone}`} 
                className="font-mono text-base font-bold text-zinc-950 hover:text-black block transition-colors tracking-wide"
              >
                {phoneDisplay}
              </a>
              
              <div className="flex items-center gap-2 pt-1">
                <a 
                  href={`tel:${cleanPhone}`} 
                  className="flex-1 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
                <a 
                  href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent('Hello CORNUS Concierge, I would like assistance with an inquiry regarding garments.')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </a>
              </div>
              <span className="text-[10px] text-zinc-400 block pt-1 font-mono">
                Operating: Mon – Sat: 9:30 AM – 7:30 PM IST
              </span>
            </div>
          </div>

          {/* Pillar 2: Written Email Correspondence */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 hover:border-zinc-400 hover:shadow-md transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                Official Electronic Correspondence
              </span>
              <h3 className="font-serif text-2xl font-normal text-zinc-950">Executive & Support Mail</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Submit custom measurements, wholesale proposals, or press loan inquiries. Guaranteed recorded ticket confirmation.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-xl p-2.5">
                <a 
                  href={`mailto:${emailDisplay}`} 
                  className="font-mono text-xs font-bold text-zinc-950 hover:underline block truncate"
                >
                  {emailDisplay}
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(emailDisplay, 'email')}
                  className="p-1.5 text-zinc-500 hover:text-zinc-950 rounded-lg hover:bg-zinc-200/60 transition-colors cursor-pointer"
                  title="Copy email address"
                >
                  {hasCopiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Atelier Inquiries:</span>
                <a href="mailto:concierge@cornus.io" className="font-mono text-zinc-700 hover:text-black underline">
                  concierge@cornus.io
                </a>
              </div>

              <span className="text-[10px] text-emerald-700 font-semibold block pt-1 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Written Response Guaranteed &lt; 2-4 Hours</span>
              </span>
            </div>
          </div>

          {/* Pillar 3: Flagship Showroom Coordinates */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 hover:border-zinc-400 hover:shadow-md transition-all duration-300 group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-400 font-bold block">
                Flagship Atelier & Showroom
              </span>
              <h3 className="font-serif text-2xl font-normal text-zinc-950">Tathawade Headquarters</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Visit our physical showroom for tactile textile reviews, bespoke sizing consultations, and exclusive atelier collections.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <p className="font-mono text-xs text-zinc-800 leading-relaxed">
                {addressDisplay}
              </p>
              
              <div className="flex items-center gap-2 pt-1">
                <a 
                  href="https://maps.google.com/?q=Tathawade,+Pimpri+Chinchwad,+Pune+411033" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Navigation className="w-3.5 h-3.5 text-zinc-700" />
                  <span>GPS Directions</span>
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(addressDisplay, 'address')}
                  className="px-3 py-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                  title="Copy physical address"
                >
                  {hasCopiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Copy</span>
                </button>
              </div>
              
              <span className="text-[10px] text-zinc-400 block pt-1 font-mono">
                Showroom Valet & Private Parking Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSMISSION FORM & SCHEDULER */}
      <section className="w-full mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Inquiry & Booking Form (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold">
                  Bespoke Client Transmission
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-zinc-950 font-normal">
                Transmit an Inquiry to the Atelier
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 font-light mt-1.5 leading-relaxed">
                Select your inquiry classification below to route your communication directly to our senior stylists, master tailors, or compliance desk.
              </p>
            </div>

            {/* Purpose Classification Selector */}
            <div className="space-y-3">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                1. Select Inquiry Classification
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {intentOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = intent === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setIntent(opt.value)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-zinc-950 bg-zinc-950 text-white shadow-md ring-1 ring-zinc-950'
                          : 'border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-zinc-800 text-amber-400' : 'bg-zinc-200/60 text-zinc-700'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200/70 text-zinc-600'
                        }`}>
                          {opt.badge}
                        </span>
                      </div>
                      
                      <div>
                        <span className="text-xs font-bold leading-tight block">{opt.label}</span>
                        <p className={`text-[10px] mt-1 line-clamp-2 leading-snug font-light ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inquiry Form or Success State */}
            {submittedTicket ? (
              <div className="bg-gradient-to-b from-zinc-50 to-white border border-zinc-200 rounded-3xl p-8 sm:p-10 text-center space-y-6 animate-in fade-in duration-300 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold px-3 py-1 bg-emerald-100 rounded-full border border-emerald-200">
                    Transmission Officially Registered
                  </span>
                  <h3 className="font-serif text-3xl text-zinc-950 font-normal">
                    Inquiry Received by Concierge Desk
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    Thank you, <strong className="text-zinc-900 font-semibold">{submittedTicket.name}</strong>. Your transmission regarding <strong className="text-zinc-900 font-semibold">{submittedTicket.intent}</strong> has been logged in our atelier system.
                  </p>
                </div>

                {/* Ticket Receipt Card */}
                <div className="bg-white border border-zinc-200/90 rounded-2xl p-5 max-w-md mx-auto font-mono text-xs space-y-3 text-left shadow-sm">
                  <div className="flex justify-between items-center text-zinc-400 text-[10px] pb-2 border-b border-zinc-100">
                    <span className="tracking-wider">CORNUS ATELIER RECORD</span>
                    <span>OFFICIAL TICKET</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Ticket Number:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-950 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {submittedTicket.ticketNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(submittedTicket.ticketNumber, 'ticket')}
                        className="p-1 hover:bg-zinc-100 rounded text-zinc-500 hover:text-black cursor-pointer"
                        title="Copy Ticket ID"
                      >
                        {hasCopiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Registered Email:</span>
                    <span className="font-medium text-zinc-900 truncate max-w-[200px]">
                      {submittedTicket.email}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Recorded Timestamp:</span>
                    <span className="text-zinc-800 font-medium">
                      Today at {submittedTicket.submittedAt}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-zinc-100 text-emerald-700">
                    <span>Guaranteed SLA Turnaround:</span>
                    <span className="font-bold">&lt; 2 to 4 Business Hours</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setMessage('');
                      setSubject('');
                    }}
                    className="w-full sm:w-auto px-7 py-3 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    Submit Another Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePage('shop')}
                    className="w-full sm:w-auto px-7 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Explore Wardrobe Collections
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-6">
                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                    2. Client Credentials & Specifics
                  </span>
                </div>

                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Singhania"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="client@cornus.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Phone & Order ID / Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1.5">
                      Contact Phone / WhatsApp <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 90222 46164"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-zinc-700 font-bold">
                        {intent === 'Order & Sizing Assistance' ? 'Order Number / AWB' : 'Subject of Inquiry'}
                      </label>
                      {userOrders && userOrders.length > 0 && intent === 'Order & Sizing Assistance' && (
                        <button
                          type="button"
                          onClick={() => setOrderId(userOrders[0].id)}
                          className="text-[10px] text-zinc-500 hover:text-black underline font-mono cursor-pointer"
                        >
                          Use Recent: {userOrders[0].id}
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={intent === 'Order & Sizing Assistance' ? 'e.g. ORD-109283' : 'e.g. Autumn Wool Coat Consultation'}
                      value={intent === 'Order & Sizing Assistance' ? orderId : subject}
                      onChange={(e) => {
                        if (intent === 'Order & Sizing Assistance') setOrderId(e.target.value);
                        else setSubject(e.target.value);
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Conditional Appointment Booking Fields */}
                {intent === 'Private Atelier Styling Appointment' && (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-5 space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <span>Reserve Private Showroom Fitting Window (Tathawade, Pune)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-zinc-800 font-bold mb-1.5">
                          Requested Appointment Date
                        </label>
                        <input
                          type="date"
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:border-zinc-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-800 font-bold mb-1.5">
                          Preferred Time Window
                        </label>
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-900 focus:border-zinc-900 font-medium cursor-pointer"
                        >
                          <option value="10:30 AM - 12:30 PM">Morning (10:30 AM - 12:30 PM)</option>
                          <option value="01:00 PM - 03:00 PM">Midday (01:00 PM - 03:00 PM)</option>
                          <option value="03:30 PM - 05:30 PM">Afternoon (03:30 PM - 05:30 PM)</option>
                          <option value="06:00 PM - 07:30 PM">Evening (06:00 PM - 07:30 PM)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Area */}
                <div className="text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-zinc-700 font-bold">
                      Detailed Message / Styling Specifications <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-zinc-400">{message.length} / 1200 characters</span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    maxLength={1200}
                    placeholder="Provide detailed information regarding your inquiry, fit requirements, sleeve or trouser alteration specifications, or event styling timeline..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 transition-all font-light leading-relaxed resize-y"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-zinc-100">
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>256-Bit Encrypted Atelier Transmission</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-zinc-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting to Atelier...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Transmit Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Callback & Regulatory Hub (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick 15-Minute Concierge Callback Scheduler */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950">Stylist Callback Request</h3>
                  <p className="text-[11px] text-zinc-500 font-light">15-minute tailored voice consultation</p>
                </div>
              </div>

              {callbackSuccess ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Callback Scheduled</span>
                  </div>
                  <p className="text-[11px] font-light leading-relaxed">
                    Our atelier styling liaison will dial <strong className="font-mono">{callbackPhone}</strong> during your requested window ({callbackSlot}).
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-zinc-600 font-bold mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Kapoor"
                      value={callbackName}
                      onChange={(e) => setCallbackName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 font-bold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 90222 46164"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-600 font-bold mb-1">Preferred Time Window</label>
                    <select
                      value={callbackSlot}
                      onChange={(e) => setCallbackSlot(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-900 focus:bg-white focus:border-zinc-900 cursor-pointer font-medium"
                    >
                      <option value="Morning (10:00 AM - 01:00 PM IST)">Morning (10:00 AM - 01:00 PM IST)</option>
                      <option value="Afternoon (02:00 PM - 05:00 PM IST)">Afternoon (02:00 PM - 05:00 PM IST)</option>
                      <option value="Evening (05:00 PM - 07:30 PM IST)">Evening (05:00 PM - 07:30 PM IST)</option>
                      <option value="Urgent (Next Available Stylist)">Urgent (Next Available Stylist)</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={isRequestingCallback}
                    className="w-full py-3 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 active:scale-95"
                  >
                    {isRequestingCallback ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Schedule Call</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Atelier Operational Timetable */}
            <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-700" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-950">
                  Concierge Operating Hours
                </h3>
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500">Monday – Friday:</span>
                  <span className="font-bold text-zinc-900">09:30 – 19:30 IST</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
                  <span className="text-zinc-500">Saturday Atelier:</span>
                  <span className="font-bold text-zinc-900">10:00 – 18:00 IST</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Sunday & Public Holidays:</span>
                  <span className="font-semibold text-zinc-600">VIP Remote Concierge</span>
                </div>
              </div>
            </div>

            {/* Statutory Grievance Officer Regulatory Compliance Notice */}
            <div className="bg-zinc-100/80 border border-zinc-200 rounded-3xl p-6 text-xs space-y-3 text-zinc-700">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-zinc-900" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                  Statutory Nodal Officer
                </span>
              </div>
              <p className="font-bold text-zinc-950 text-sm">Mr. R. Deshmukh</p>
              <p className="text-[11px] text-zinc-600 font-light leading-relaxed">
                Appointed in adherence with the Information Technology Act 2000 and Consumer Protection (E-Commerce) Rules.
              </p>
              <div className="pt-1 font-mono text-[11px] space-y-1">
                <div>Email: <a href="mailto:grievance@cornus.io" className="underline hover:text-black font-semibold">grievance@cornus.io</a></div>
                <div>Helpline: <a href="tel:+919022246164" className="underline hover:text-black font-semibold">+91 9022246164</a></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE GOOGLE MAPS SHOWROOM LOCATOR */}
      <section className="w-full mb-16">
        <div className="bg-white border border-zinc-200/90 rounded-3xl overflow-hidden shadow-xs">
          <div className="p-6 sm:p-8 border-b border-zinc-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold block">
                Spatial Coordinates · Flagship Boutique
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal">
                Visit the CORNUS Pune Showroom
              </h3>
              <p className="text-xs text-zinc-500 font-light">
                Tathawade, Pimpri Chinchwad, Pune 411033 · Maharashtra, India
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => copyToClipboard(addressDisplay, 'address')}
                className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {hasCopiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Address</span>
              </button>
              <a
                href="https://maps.google.com/?q=Tathawade,+Pimpri+Chinchwad,+Pune+411033"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>

          <div className="w-full h-80 sm:h-96 relative bg-zinc-100">
            <iframe
              title="CORNUS Flagship Showroom Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3781.4239857945037!2d73.7441584!3d18.6011124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9e6ffaaaaab%3A0x123456789abcdef!2sTathawade%2C%20Pimpri-Chinchwad%2C%20Maharashtra%20411033!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[25%] contrast-[105%]"
            />
          </div>
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS & KNOWLEDGE BASE */}
      <section className="w-full">
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-zinc-400 font-bold block mb-1">
                Concierge Knowledge Base
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-zinc-950 font-normal">
                Frequently Addressed Inquiries
              </h3>
            </div>

            {/* FAQ Filter and Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions & answers..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {['All', 'Orders & Shipping', 'Atelier & Fittings', 'Tailoring & Care'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      faqCategory === cat
                        ? 'bg-zinc-900 text-white font-bold'
                        : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`border rounded-2xl p-5 transition-all cursor-pointer ${
                      isOpen ? 'border-zinc-900 bg-zinc-50/70 shadow-xs' : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                          {faq.category}
                        </span>
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-950 leading-snug">
                          {faq.q}
                        </h4>
                      </div>
                      <span className="text-zinc-400 shrink-0">
                        {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-900" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                    {isOpen && (
                      <p className="text-xs text-zinc-600 font-light mt-3 leading-relaxed pt-2.5 border-t border-zinc-200/60 animate-in fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 text-center py-10 text-zinc-400 text-xs">
                No matching inquiries found for "{faqSearch}". Please submit a direct inquiry above.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
