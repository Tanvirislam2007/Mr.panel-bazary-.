import { 
  Service, Order, OrderStatus, BannerConfig, 
  PaymentConfig, ActivationCheckResult, SetupTutorialConfig, ApkDownloadItem,
  SiteBrandingConfig
} from '../types';
import { firebaseService } from './firebase';

const STORAGE_KEYS = {
  SERVICES: 'shebapay_services_v2',
  ORDERS: 'shebapay_orders_v2',
  BANNER: 'shebapay_banner_v2',
  PAYMENT_CONFIG: 'shebapay_payment_config_v2',
  SETUP_TUTORIAL: 'shebapay_setup_tutorial_v2',
  TERMS_ACCEPTED: 'shebapay_terms_accepted_v2',
  BRANDING: 'shebapay_branding_v2',
};

export const DEFAULT_PACKAGE_IMAGE = '/assets/aistudio/Gemini_Generated_Image_x767mhx767mhx767_5b18910b.jpg';

// Initial Services categorized by hours (১ ঘন্টা, ৩ ঘন্টা, ৬ ঘন্টা, ১২ ঘন্টা, ২৪ ঘন্টা)
const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: '১ ঘন্টা আল্ট্রা ফাস্ট ভিআইপি এক্সেস (1 Hour VIP Access)',
    category: 'ঘন্টা ভিত্তিক এক্সেস',
    description: '১ ঘন্টার জন্য ফুল হাই স্পিড সার্ভার কানেকশন ও অটো ইনজেক্টর সাপোর্ট। ইনস্ট্যান্ট অ্যাক্টিভেশন ও লাইভ ট্র্যাকিং।',
    price: 60,
    originalPrice: 100,
    durationHours: 1,
    image: DEFAULT_PACKAGE_IMAGE,
    badge: '⚡ ১ ঘন্টা ট্রায়াল',
    deliveryTime: 'ইনস্ট্যান্ট অটো চালু',
    idLabel: 'কাস্টমার ইউজার আইডি / ফোন',
    idPlaceholder: 'उदा. user_9201 অথবা 017xxxxxxxx',
    features: [
      '১ ঘন্টা সম্পূর্ণ আনলিমিটেড এক্সেস',
      'অটো কাউন্টডাউন টাইমার সাপোর্ট',
      'ইনস্ট্যান্ট ৩টি এপিকে সংযোগ',
      'জিরো ল্যাগ হাই স্পিড লাইন'
    ],
    instructions: 'পেমেন্ট শেষে প্রাপ্ত ইউনিক কোড দিয়ে "কোড এক্টিভেশন" অপশনে গিয়ে সার্ভিস চালু করুন।',
    isAvailable: true,
  },
  {
    id: 'srv-2',
    title: '৩ ঘন্টা সুপার ভিআইপি প্যাকেজ (3 Hours Super VIP)',
    category: 'ঘন্টা ভিত্তিক এক্সেস',
    description: 'জনপ্রিয় ৩ ঘন্টার প্যাকেজ। ৩ ঘন্টা টানা হাই-স্পিড সার্ভার এক্সেস, প্রিমিয়াম কী এবং আল্ট্রা স্টেবল কানেক্টিভিটি।',
    price: 150,
    originalPrice: 240,
    durationHours: 3,
    image: DEFAULT_PACKAGE_IMAGE,
    badge: '🔥 সর্বাধিক বিক্রিত (৩ ঘন্টা)',
    deliveryTime: '১-৩ মিনিট ইনস্ট্যান্ট',
    idLabel: 'কাস্টমার ইউজার আইডি / গেমিং UID',
    idPlaceholder: 'उदा. 1827495029 অথবা user_id',
    features: [
      'টানা ৩ ঘন্টা ফুল প্রিমিয়াম স্পিড',
      'লাইভ কাউন্টডাউন ড্যাশবোর্ড',
      '৩টি এপিকে ইনস্ট্যান্ট সাপোর্ট',
      '২৪/৭ সার্ভার স্ট্যাবিলিটি'
    ],
    instructions: 'আপনার সঠিক আইডি নাম্বার দিন। পেমেন্ট কনফার্মেশনের পর ইউনিক কোড দিয়ে এক্টিভ করুন।',
    isAvailable: true,
  },
  {
    id: 'srv-3',
    title: '৬ ঘন্টা প্রো গেমিং ও স্ট্রিমিং পাস (6 Hours Pro Pass)',
    category: 'ঘন্টা ভিত্তিক এক্সেস',
    description: '৬ ঘন্টার দীর্ঘমেয়াদী সেশন। নন-স্টপ আল্ট্রা পিং বুস্টার, ফুল সিকিউরিটি ও কোনো বাফারিং ছাড়া সংযোগ।',
    price: 280,
    originalPrice: 450,
    durationHours: 6,
    image: DEFAULT_PACKAGE_IMAGE,
    badge: '⭐ স্পেশাল অফার',
    deliveryTime: 'ইনস্ট্যান্ট অটো ডেলিভারি',
    idLabel: 'কাস্টমার অ্যাকাউন্ট আইডি',
    idPlaceholder: 'उदा. your_account_id',
    features: [
      'টানা ৬ ঘন্টা বিরতিহীন সংযোগ',
      'প্রো গেমিং সার্ভার সাপোর্ট',
      'লাইভ অবশিষ্ট সময় কাউন্টডাউন',
      'স্মার্ট রিকানেক্ট ফিচার'
    ],
    instructions: 'ইউনিক কোড দিয়ে "আমার কেনা সার্ভিস" পেজে গিয়ে কাউন্টডাউন পর্যবেক্ষণ করুন।',
    isAvailable: true,
  },
  {
    id: 'srv-4',
    title: '১২ ঘন্টা ফুল ডে প্রিমিয়াম সেশন (12 Hours Full Day)',
    category: 'ঘন্টা ভিত্তিক এক্সেস',
    description: '১২ ঘন্টার মেগা প্যাকেজ। সারাদিন বা সারারাত টানা যেকোনো অ্যাপ্লিকেশন ও ভিআইপি টুল নিরবচ্ছিন্নভাবে ব্যবহারের নিশ্চয়তা।',
    price: 490,
    originalPrice: 750,
    durationHours: 12,
    image: DEFAULT_PACKAGE_IMAGE,
    badge: '💎 মেগা সেভার (১২ ঘন্টা)',
    deliveryTime: '১-৫ মিনিট ইনস্ট্যান্ট',
    idLabel: 'কাস্টমার আইডি / জিমেইল',
    idPlaceholder: 'user@gmail.com',
    features: [
      '১২ ঘন্টা মেগা ভ্যালিডিটি',
      'মাল্টিপল সার্ভার সুইচিং',
      'লাইভ কাউন্টডাউন মনিটর',
      'ভিআইপি প্রায়োরিটি ব্যান্ডউইথ'
    ],
    instructions: 'পেমেন্ট শেষে ইউনিক কোড ও আইডি দিয়ে এক্টিভ করলেই ১২ ঘন্টার কাউন্টডাউন টাইমার শুরু হবে।',
    isAvailable: true,
  },
  {
    id: 'srv-5',
    title: '২৪ ঘন্টা / ১ দিন আনলিমিটেড আলটিমেট পাস (24 Hours)',
    category: 'ঘন্টা ভিত্তিক এক্সেস',
    description: 'পূর্ণ ২৪ ঘন্টার আনলিমিটেড ভিআইপি লাইসেন্স। ফুল স্পিড, অল ইন ওয়ান এপিকে সাপোর্ট এবং ২৪ ঘন্টা লাইভ কাউন্টডাউন।',
    price: 850,
    originalPrice: 1300,
    durationHours: 24,
    image: DEFAULT_PACKAGE_IMAGE,
    badge: '👑 ১ দিন আনলিমিটেড',
    deliveryTime: 'ইনস্ট্যান্ট অটো এক্টিভেশন',
    idLabel: 'ইউজারনেম / কাস্টমার আইডি',
    idPlaceholder: 'उदा. vip_gamer_bd',
    features: [
      '২৪ ঘন্টা সম্পূর্ণ আনলিমিটেড',
      'অটো রিনিউয়াল অপশন',
      '৩টি এপিকে ফুল আনলকড',
      'ভিআইপি ডেডিকেটেড নোড'
    ],
    instructions: 'এক্টিভ করার সাথে সাথে স্ক্রিনে ২৪ ঘন্টার ঘড়ি চালু হবে।',
    isAvailable: true,
  }
];

// Initial Banner
const INITIAL_BANNER: BannerConfig = {
  imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=90',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title: 'ঘন্টা ভিত্তিক প্রিমিয়াম অনলাইন সার্ভিস',
  subtitle: '১ ঘন্টা, ৩ ঘন্টা, ৬ ঘন্টা থেকে ২৪ ঘন্টা পর্যন্ত নিন পছন্দমতো প্যাকেজ। বিকাশ ও নগদ অটো পেমেন্টে ইনস্ট্যান্ট লাইভ কাউন্টডাউন চালু করুন!',
  tagline: 'ইনস্ট্যান্ট অটোমেটিক ডিজিটাল সেবা',
  badgeText: '⚡ ১ ঘন্টা ও ৩ ঘন্টা স্পেশাল প্যাকেজ',
  ctaText: 'সার্ভিস ও রেট দেখুন',
  isEnabled: true,
};

// Initial Site Branding (Logo, Site Name, Tagline, Packages Title)
const INITIAL_BRANDING: SiteBrandingConfig = {
  siteName: 'সেবাপে',
  tagline: 'অনলাইন সার্ভিস ও লাইভ কাউন্টডাউন',
  badgeText: 'ঘন্টা ভিত্তিক এক্সেস',
  logoUrl: '', // Default: Uses stylized gradient Sparkles logo icon; Custom uploaded image logo if set
  packagesTitle: 'প্যাকেজ সমূহ',
};

// Initial Setup with Custom VPN, Large Data File, and Main Tools
const INITIAL_SETUP_TUTORIAL: SetupTutorialConfig = {
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0',
  videoTitle: 'কিভাবে ভিপিএন, বড় ফাইল ও এপিকে সেটআপ করবেন (ভিডিও টিউটোরিয়াল)',
  videoDescription: 'নিচের আমাদের তৈরি ভিপিএন এপিকে, বড় ডাটা ফাইল ও মেইন অ্যাপ ডাউনলোড করে ইন্সটল করুন এবং ভিডিও দেখে সহজেই কনফিগার করে আপনার ইউনিক কোড দিয়ে সার্ভিস উপভোগ করুন।',
  steps: [
    '১. প্রথমে আমাদের তৈরি নিজস্ব "ভিপিএন এপিকে" ডাউনলোড করে কানেক্ট করুন।',
    '২. "বড় ডাটা ও রিসোর্স ফাইল" (Google Drive / MediaFire) থেকে নামিয়ে নির্দিষ্ট ফোল্ডারে রাখুন।',
    '৩. "মেইন সার্ভিস কন্ট্রোলার" অ্যাপটি ওপেন করে আপনার ক্রয়কৃত "ইউনিক কোড" দিয়ে সার্ভিস চালু করুন।',
    '৪. "আমার কেনা সার্ভিস" পেজে গিয়ে দেখুন কত ঘন্টা অবশিষ্ট রয়েছে এবং লাইভ কাউন্টডাউন টাইমার চেক করুন।'
  ],
  apks: [
    {
      id: 'apk-vpn',
      title: 'GO VPN (সুপারফাস্ট ভিআইপি ভিপিএন - Superfast GO VPN)',
      version: 'v4.2 Turbo 5G',
      size: '12.8 MB',
      description: 'আমাদের তৈরি সুপারফাস্ট GO VPN। মাঝখানে বড় অন বাটন, রিয়েল-টাইম স্পিড টেস্ট (২০০+ Mbps), সিঙ্গাপুর-টোকিও-বাংলাদেশ লো-পিং সার্ভার লিস্ট এবং প্ল্যান অনুযায়ী অটো-টাইমার।',
      downloadUrl: '#download-govpn-apk',
      mirrorUrl: 'https://drive.google.com/file/d/sample-govpn/view',
      fileName: 'GO_VPN_v4.2_SuperFast.apk',
      iconType: 'vpn',
      fileCategory: 'vpn',
      isLargeFile: false,
      storageProvider: 'direct',
      installInstructions: 'ইউনিক কোড দিয়ে অ্যাপটি আনলক ও চালু করুন। মাঝখানের বড় পাওয়ার বাটনে চাপ দিয়ে সিঙ্গাপুর বা বাংলাদেশ ফাস্ট সার্ভারে যুক্ত হন।',
      badge: '⚡ GO VPN (Superfast)',
      isActive: true,
    },
    {
      id: 'apk-large-file',
      title: 'বড় ভিআইপি জিপ প্যাকেজ (VIP Complete ZIP Package)',
      version: 'v6.0 VIP Pack',
      size: '১.২ GB (বড় ফাইল)',
      description: 'বড় সাইজের সম্পূর্ণ ভিআইপি জিপ ফাইল। ইউনিক কোড দিলেই গুগল ড্রাইভ বা মিডিয়াফায়ার ক্লাউড থেকে সরাসরি হাই-স্পিডে ডাউনলোড করতে পারবেন। সাইজ অনেক বড় হওয়ায় কোনো লিমিট ছাড়া দ্রুত নামবে।',
      downloadUrl: 'https://drive.google.com/file/d/sample-large-pack/view',
      mirrorUrl: 'https://www.mediafire.com/file/sample-large-pack',
      fileName: 'VIP_Gaming_Complete_Resource_Pack.zip',
      iconType: 'large_file',
      fileCategory: 'large_file',
      isLargeFile: true,
      storageProvider: 'gdrive',
      installInstructions: 'ইউনিক কোড দিয়ে আনলক করার পর ক্লাউড লিংক থেকে সম্পূর্ণ জিপ ফাইল নামিয়ে নিন। এরপর ZArchiver বা RAR অ্যাপ দিয়ে এক্সট্রাক্ট করুন।',
      badge: '📦 বড় জিপ ফাইল (High-Speed ZIP)',
      isActive: true,
    },
    {
      id: 'apk-main',
      title: 'মেইন সার্ভিস কন্ট্রোলার (Main Service Tool APK)',
      version: 'v4.5.2 Pro',
      size: '18.4 MB',
      description: 'সার্ভিসের প্রধান অ্যাপ যা সিস্টেমের সাথে সরাসরি যোগাযোগ রক্ষা করে এবং ইউনিক কোড দিয়ে সার্ভিস চালু রাখে।',
      downloadUrl: '#download-main-apk',
      fileName: 'ShebaService_Main_v4.5.apk',
      iconType: 'main',
      fileCategory: 'main',
      isLargeFile: false,
      storageProvider: 'direct',
      installInstructions: 'অ্যাপটি ফোনে ইনস্টল করে প্রয়োজনীয় পারমিশন দিন এবং ওয়েবসাইটে পাওয়া ইউনিক কোডটি দিয়ে লগইন বা এক্টিভেট করুন।',
      badge: 'মেইন সার্ভিস অ্যাপ',
      isActive: true,
    }
  ]
};

// Initial Payment Configuration
const INITIAL_PAYMENT_CONFIG: PaymentConfig = {
  bkashNumber: '01834-892100',
  bkashType: 'Personal',
  bkashQr: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=01834892100',
  nagadNumber: '01799-445566',
  nagadType: 'Personal',
  nagadQr: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=01799445566',
  supportPhone: '+880 1834-892100',
  supportWhatsApp: '+880 1834-892100',
  whatsAppGreeting: 'হ্যালো সেবা পে টিম, আমি সার্ভিস ও পেমেন্ট বিষয়ে সাহায্য চাই।',
  adminPin: '', // Replaced by Firebase Auth
  adminPassword: '', // Replaced by Firebase Auth
  adminEmail: 'tanvirislamtanvir512007@gmail.com', 
  masterRecoveryKey: '', // Replaced by Firebase Auth
  verificationMode: 'manual', // Default: Admin manual verification to prevent fake payment
};

// Initial sample orders
const now = Date.now();
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-98421',
    serviceId: 'srv-2',
    serviceTitle: '৩ ঘন্টা সুপার ভিআইপি প্যাকেজ (3 Hours Super VIP)',
    serviceImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    amount: 150,
    customerName: 'তানভীর ইসলাম',
    customerPhone: '01712345678',
    senderNumber: '01712345678',
    customerId: 'tanvir_pro_bd',
    trxId: 'BKT92918840',
    paymentMethod: 'bkash',
    uniqueCode: 'ACT-7841-BD',
    durationHours: 3,
    status: 'activated',
    createdAt: new Date(now - 1000 * 60 * 35).toISOString(), // 35 mins ago
    activatedAt: new Date(now - 1000 * 60 * 35).toISOString(),
    expiresAt: new Date(now - 1000 * 60 * 35 + 3 * 3600 * 1000).toISOString(), // ~2 hours 25 mins left
    adminNotes: '৩টি এপিকে সেকশনে কোড দিয়ে ৩ ঘন্টার সার্ভিস সক্রিয় করা হয়েছে',
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-98422',
    serviceId: 'srv-1',
    serviceTitle: '১ ঘন্টা আল্ট্রা ফাস্ট ভিআইপি এক্সেস (1 Hour VIP Access)',
    serviceImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    amount: 60,
    customerName: 'রাকিব আহমেদ',
    customerPhone: '01898765432',
    senderNumber: '01898765432',
    customerId: 'rakib_gamer',
    trxId: 'NGD55819022',
    paymentMethod: 'nagad',
    uniqueCode: 'ACT-9920-BD',
    durationHours: 1,
    status: 'verified', // Verified payment - timer starts once entered in 3 APKs!
    createdAt: new Date(now - 1000 * 60 * 15).toISOString(),
    adminNotes: 'পেমেন্ট অনুমোদিত। ৩টি এপিকে সেকশনে কোড দিলে টাইমার শুরু হবে',
  }
];

class StoreService {
  private inMemoryOrders: Order[] | null = null;
  private inMemoryServices: Service[] | null = null;

  // Real-time synchronization from Firebase (Single Source of Truth)
  setRemoteOrders(orders: Order[]): void {
    this.inMemoryOrders = orders;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch {}
  }

  setRemoteServices(services: Service[]): void {
    this.inMemoryServices = services;
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch {}
  }

  // Terms Acceptance Popup
  isTermsAccepted(): boolean {
    return localStorage.getItem(STORAGE_KEYS.TERMS_ACCEPTED) === 'true';
  }

  setTermsAccepted(accepted: boolean): void {
    localStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, accepted ? 'true' : 'false');
  }

  // Services CRUD
  getServices(): Service[] {
    if (this.inMemoryServices && this.inMemoryServices.length > 0) {
      return this.inMemoryServices;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!raw) {
      try {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
      } catch {
        // quota ignore on init
      }
      this.inMemoryServices = INITIAL_SERVICES;
      return INITIAL_SERVICES;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const mapped = parsed.map((s, idx) => ({
          ...s,
          id: s.id || `srv-${Date.now()}-${idx}`,
          title: s.title || `প্যাকেজ #${idx + 1}`,
          price: Number(s.price) || 0,
          durationHours: Number(s.durationHours) || 1,
          isAvailable: s.isAvailable !== false,
          image: (!s.image || s.image.includes('unsplash.com')) ? DEFAULT_PACKAGE_IMAGE : s.image,
        }));
        this.inMemoryServices = mapped;
        return mapped;
      }
      this.inMemoryServices = INITIAL_SERVICES;
      return INITIAL_SERVICES;
    } catch {
      this.inMemoryServices = INITIAL_SERVICES;
      return INITIAL_SERVICES;
    }
  }

  saveServices(services: Service[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (err) {
      console.warn('LocalStorage quota issue in saveServices, auto-sanitizing heavy images:', err);
      // Auto-sanitize oversized base64 data URLs to prevent QuotaExceededError
      const safe = services.map(s => {
        if (s.image && s.image.startsWith('data:') && s.image.length > 80000) {
          return {
            ...s,
            image: DEFAULT_PACKAGE_IMAGE
          };
        }
        return s;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(safe));
      } catch (err2) {
        console.error('Failed to write services to localStorage:', err2);
      }
    }

    // Broadcast update so storefront updates in real-time
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('shebapay_services_updated', { detail: services }));
      } catch {}
    }
  }

  getServiceById(id: string): Service | undefined {
    return this.getServices().find(s => s.id === id);
  }

  addService(service: Omit<Service, 'id'>): Service {
    const services = this.getServices();
    // Strictly forbid Base64 strings: Only HTTP/HTTPS URLs allowed
    const safeImage = (service.image && !service.image.startsWith('data:')) 
      ? service.image 
      : DEFAULT_PACKAGE_IMAGE;

    const newService: Service = {
      ...service,
      id: `srv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: (service.title || 'নতুন প্যাকেজ').trim(),
      category: service.category || 'ঘন্টা ভিত্তিক এক্সেস',
      description: service.description || '',
      price: Number(service.price) || 0,
      originalPrice: service.originalPrice !== undefined && service.originalPrice !== null ? Number(service.originalPrice) : undefined,
      durationHours: Math.max(1, Number(service.durationHours) || 1),
      image: safeImage,
      badge: service.badge || '⚡ স্পেশাল প্যাকেজ',
      deliveryTime: service.deliveryTime || 'ইনস্ট্যান্ট অটো ডেলিভারি',
      idLabel: service.idLabel || 'কাস্টমার ইউজার আইডি / গেমিং UID',
      idPlaceholder: service.idPlaceholder || 'আইডি নাম্বার দিন',
      features: (service.features && service.features.length > 0) ? service.features : ['ইনস্ট্যান্ট অটো কাউন্টডাউন', '৩টি এপিকে এক্সেস'],
      instructions: service.instructions || 'পেমেন্ট সম্পন্ন হওয়ার পর প্রাপ্ত ইউনিক কোড দিয়ে এক্টিভ করুন।',
      isAvailable: service.isAvailable !== false,
    };
    services.unshift(newService);
    this.saveServices(services);
    firebaseService.saveService(newService).catch(err => console.warn('Cloud save service notice:', err));
    return newService;
  }

  updateService(id: string, updates: Partial<Service>): Service | null {
    const services = this.getServices();
    const index = services.findIndex(s => s.id === id);
    if (index === -1) {
      console.warn('updateService: could not find service with id', id);
      return null;
    }

    // Strictly sanitize image: reject any Base64 strings
    let cleanImage = updates.image;
    if (cleanImage && cleanImage.startsWith('data:')) {
      cleanImage = services[index].image || DEFAULT_PACKAGE_IMAGE;
    }

    const cleanUpdates: Partial<Service> = {
      ...updates,
      image: cleanImage !== undefined ? cleanImage : services[index].image,
      title: updates.title !== undefined ? updates.title.trim() : services[index].title,
      price: updates.price !== undefined ? Number(updates.price) : services[index].price,
      originalPrice: updates.originalPrice !== undefined ? (updates.originalPrice ? Number(updates.originalPrice) : undefined) : services[index].originalPrice,
      durationHours: updates.durationHours !== undefined ? Math.max(1, Number(updates.durationHours) || 1) : services[index].durationHours,
      isAvailable: updates.isAvailable !== undefined ? updates.isAvailable : services[index].isAvailable,
    };

    services[index] = { ...services[index], ...cleanUpdates };
    this.saveServices(services);
    firebaseService.saveService(services[index]).catch(err => console.warn('Cloud update service notice:', err));
    return services[index];
  }

  deleteService(id: string): boolean {
    const services = this.getServices();
    const filtered = services.filter(s => s.id !== id);
    if (filtered.length !== services.length) {
      this.saveServices(filtered);
      firebaseService.deleteService(id).catch(err => console.warn('Cloud delete service notice:', err));
      return true;
    }
    return false;
  }

  resetServicesToDefault(): Service[] {
    this.saveServices(INITIAL_SERVICES);
    return INITIAL_SERVICES;
  }

  // Setup Tutorial, Custom VPN, and Large Files
  getSetupTutorial(): SetupTutorialConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.SETUP_TUTORIAL);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETUP_TUTORIAL, JSON.stringify(INITIAL_SETUP_TUTORIAL));
      return INITIAL_SETUP_TUTORIAL;
    }
    try {
      const parsed: SetupTutorialConfig = JSON.parse(raw);
      // Ensure apks is an array (allow 0 items if admin deleted them)
      if (!Array.isArray(parsed.apks)) {
        parsed.apks = [];
      } else {
        // If apks has items, ensure proper category fields
        parsed.apks = parsed.apks.map((item, idx) => {
          const category = item.fileCategory || (
            idx === 0 ? 'vpn' : idx === 1 ? 'large_file' : 'main'
          );
          const isVpn = category === 'vpn' || item.id === 'apk-vpn';
          const isLarge = Boolean(category === 'large_file' || item.id === 'apk-large-file' || item.isLargeFile || (item.fileName && item.fileName.endsWith('.zip')));
          const title = isVpn && (!item.title || item.title.includes('আমাদের নিজস্ব ভিপিএন') || item.title.includes('Custom Official VPN'))
            ? 'GO VPN (সুপারফাস্ট ভিআইপি ভিপিএন - Superfast GO VPN)'
            : isLarge && (!item.title || item.title.includes('বড় ফাইল / ফুল ডাটা'))
            ? 'বড় ভিআইপি জিপ প্যাকেজ (VIP Complete ZIP Package)'
            : item.title;
          const badge = isVpn && (!item.badge || item.badge.includes('আমাদের ভিপিএন'))
            ? '⚡ GO VPN (Superfast)'
            : (item.badge || (isLarge ? '📦 বড় জিপ ফাইল (High-Speed ZIP)' : 'মেইন অ্যাপ'));
          const size = isLarge && (!item.size || item.size === '420 MB' || item.size === '500 MB')
            ? '১.২ GB (বড় ফাইল)'
            : item.size;

          return {
            ...item,
            title,
            badge,
            size,
            fileCategory: category,
            iconType: item.iconType || (category === 'vpn' ? 'vpn' : isLarge ? 'large_file' : 'main'),
            isLargeFile: item.isLargeFile !== undefined ? item.isLargeFile : isLarge,
            isActive: item.isActive !== undefined ? item.isActive : true,
          };
        });
      }
      return parsed;
    } catch {
      return INITIAL_SETUP_TUTORIAL;
    }
  }

  updateSetupTutorial(config: Partial<SetupTutorialConfig>): SetupTutorialConfig {
    const current = this.getSetupTutorial();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEYS.SETUP_TUTORIAL, JSON.stringify(updated));
    return updated;
  }

  deleteApkItem(targetIndex: number): ApkDownloadItem[] {
    const current = this.getSetupTutorial();
    const updatedApks = current.apks.filter((_, idx) => idx !== targetIndex);
    this.updateSetupTutorial({ apks: updatedApks });
    return updatedApks;
  }

  clearAllDemoApks(): ApkDownloadItem[] {
    const current = this.getSetupTutorial();
    const demoIds = ['apk-vpn-custom', 'apk-large-file', 'apk-main'];
    // Filter out initial demo APKs
    const filtered = current.apks.filter(a => !demoIds.includes(a.id));
    this.updateSetupTutorial({ apks: filtered });
    return filtered;
  }

  clearAllApks(): ApkDownloadItem[] {
    this.updateSetupTutorial({ apks: [] });
    return [];
  }

  // Banner Config
  getBanner(): BannerConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.BANNER);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(INITIAL_BANNER));
      return INITIAL_BANNER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BANNER;
    }
  }

  updateBanner(banner: Partial<BannerConfig>): BannerConfig {
    const current = this.getBanner();
    // Strictly forbid Base64 strings
    let safeImageUrl = banner.imageUrl;
    if (safeImageUrl && safeImageUrl.startsWith('data:')) {
      safeImageUrl = current.imageUrl;
    }

    const updated = { 
      ...current, 
      ...banner,
      imageUrl: safeImageUrl !== undefined ? safeImageUrl : current.imageUrl 
    };
    localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(updated));
    firebaseService.saveBanner(updated).catch(err => console.warn('Cloud sync banner notice:', err));
    return updated;
  }

  // Site Branding (Logo & Site Name)
  getBranding(): SiteBrandingConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.BRANDING);
    if (!raw) {
      try {
        localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(INITIAL_BRANDING));
      } catch {
        // Ignore quota error on initialization
      }
      return INITIAL_BRANDING;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        siteName: (parsed.siteName && typeof parsed.siteName === 'string') ? parsed.siteName : INITIAL_BRANDING.siteName,
        tagline: parsed.tagline !== undefined ? parsed.tagline : INITIAL_BRANDING.tagline,
        badgeText: parsed.badgeText !== undefined ? parsed.badgeText : INITIAL_BRANDING.badgeText,
        logoUrl: (parsed.logoUrl && !parsed.logoUrl.startsWith('data:')) ? parsed.logoUrl : INITIAL_BRANDING.logoUrl,
        packagesTitle: parsed.packagesTitle !== undefined ? parsed.packagesTitle : (INITIAL_BRANDING.packagesTitle || 'প্যাকেজ সমূহ'),
      };
    } catch {
      return INITIAL_BRANDING;
    }
  }

  updateBranding(config: Partial<SiteBrandingConfig>): SiteBrandingConfig {
    const current = this.getBranding();
    // Strictly forbid Base64 strings
    let safeLogoUrl = config.logoUrl;
    if (safeLogoUrl && safeLogoUrl.startsWith('data:')) {
      safeLogoUrl = current.logoUrl;
    }

    const updated: SiteBrandingConfig = {
      ...current,
      ...config,
      logoUrl: safeLogoUrl !== undefined ? safeLogoUrl : current.logoUrl,
      siteName: config.siteName !== undefined 
        ? (config.siteName.trim() || current.siteName || INITIAL_BRANDING.siteName) 
        : current.siteName,
    };
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(updated));
    } catch (err) {
      console.warn('LocalStorage quota issue saving branding, attempting safe payload:', err);
      try {
        // If logo was too large for quota, keep text updates
        const safePayload: SiteBrandingConfig = {
          ...updated,
          logoUrl: current.logoUrl,
        };
        localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(safePayload));
      } catch (err2) {
        console.error('Failed to write branding to localStorage:', err2);
      }
    }

    // Broadcast update event so all components and tabs sync in real-time
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('shebapay_branding_updated', { detail: updated }));
      } catch {
        // Ignore event dispatch error
      }
    }

    firebaseService.saveBranding(updated).catch(err => console.warn('Cloud sync branding notice:', err));
    return updated;
  }

  resetBranding(): SiteBrandingConfig {
    try {
      localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(INITIAL_BRANDING));
    } catch {
      // Ignore quota error
    }
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('shebapay_branding_updated', { detail: INITIAL_BRANDING }));
      } catch {
        // Ignore event dispatch error
      }
    }
    return INITIAL_BRANDING;
  }

  // Payment Config
  getPaymentConfig(): PaymentConfig {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENT_CONFIG);
    if (!raw) return INITIAL_PAYMENT_CONFIG;
    try {
      const parsed = JSON.parse(raw);
      const adminEmail = (parsed.adminEmail && parsed.adminEmail !== 'admin@shebapay.com')
        ? parsed.adminEmail
        : 'tanvirislamtanvir512007@gmail.com';
      return {
        ...INITIAL_PAYMENT_CONFIG,
        ...parsed,
        adminEmail,
        adminPin: '',
        adminPassword: '',
        masterRecoveryKey: '',
      };
    } catch {
      return INITIAL_PAYMENT_CONFIG;
    }
  }

  updatePaymentConfig(config: Partial<PaymentConfig>): PaymentConfig {
    const current = this.getPaymentConfig();
    const updated = { 
      ...current, 
      ...config,
      adminPin: '',
      adminPassword: '',
      masterRecoveryKey: '',
    };
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CONFIG, JSON.stringify(updated));
    firebaseService.savePaymentConfig(updated).catch(err => console.warn('Cloud sync payment notice:', err));
    return updated;
  }

  // Remove local password verification. Firebase Google Auth handles this now.
  verifyAdminPassword(_input: string): boolean {
    return false;
  }

  // Orders Management
  getOrders(): Order[] {
    if (this.inMemoryOrders !== null) {
      return this.inMemoryOrders;
    }
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!raw) {
      this.inMemoryOrders = INITIAL_ORDERS;
      return INITIAL_ORDERS;
    }
    try {
      const parsed = JSON.parse(raw);
      this.inMemoryOrders = parsed;
      return parsed;
    } catch {
      this.inMemoryOrders = INITIAL_ORDERS;
      return INITIAL_ORDERS;
    }
  }

  saveOrders(orders: Order[]): void {
    this.inMemoryOrders = orders;
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.warn('LocalStorage saveOrders quota warning:', e);
    }
  }

  private generateUniqueCode(): string {
    const characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let codePart = '';
    for (let i = 0; i < 5; i++) {
      codePart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return `ACT-${codePart}-BD`;
  }

  createOrder(data: {
    serviceId: string;
    customerName: string;
    customerPhone: string;
    senderNumber: string;
    customerId: string;
    trxId: string;
    paymentMethod: 'bkash' | 'nagad';
  }): Order {
    const service = this.getServiceById(data.serviceId);
    if (!service) throw new Error('সার্ভিস পাওয়া যায়নি');

    const cleanSender = data.senderNumber.trim().replace(/[^0-9]/g, '');
    const cleanTrx = data.trxId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const paymentConfig = this.getPaymentConfig();

    // 1. Strict Bangladeshi Mobile Number Validation (013, 014, 015, 016, 017, 018, 019)
    const bdPhoneRegex = /^(013|014|015|016|017|018|019)\d{8}$/;
    if (!bdPhoneRegex.test(cleanSender)) {
      throw new Error('ভুল মোবাইল নম্বর! অনুগ্রহ করে ১১ ডিজিটের সঠিক ও সক্রিয় বাংলাদেশী বিকাশ/নগদ নম্বর দিন (যেমন: 017xxxxxxxx, 018xxxxxxxx)।');
    }

    // Reject obvious fake / dummy phone numbers
    const fakeNumbers = [
      '01700000000', '01711111111', '01712345678', '01812345678', '01912345678', 
      '01612345678', '01512345678', '01800000000', '01900000000', '01600000000',
      '01300000000', '01400000000', '01888888888', '01999999999', '01799999999'
    ];
    if (fakeNumbers.includes(cleanSender) || /^01\d(\d)\1{7}$/.test(cleanSender)) {
      throw new Error('অকার্যকর বা ভুয়া মোবাইল নম্বর গ্রহণযোগ্য নয়! অনুগ্রহ করে আপনার নিজস্ব প্রকৃত নম্বর দিন।');
    }

    // Reject using receiver number as sender
    const targetReceiver = (data.paymentMethod === 'bkash' ? paymentConfig.bkashNumber : paymentConfig.nagadNumber).replace(/[^0-9]/g, '');
    if (cleanSender === targetReceiver) {
      throw new Error('প্রাপক নম্বর এবং প্রেরক নম্বর একই হতে পারে না! আপনি যে ব্যক্তিগত একাউন্ট থেকে টাকা পাঠিয়েছেন সেই নম্বরটি দিন।');
    }

    // 2. Strict Method-Specific Transaction ID (TrxID) Validation
    if (data.paymentMethod === 'bkash') {
      // Official bKash TrxID is exactly 10 alphanumeric characters (mixed letters & numbers)
      if (cleanTrx.length !== 10 || !/[A-Z]/.test(cleanTrx) || !/[0-9]/.test(cleanTrx)) {
        throw new Error('ভুল বিকাশ TrxID! বিকাশ ট্রানজেকশন আইডি অবশ্যই ঠিক ১০ ডিজিটের আলফানিউমেরিক কোড হতে হবে (যেমন: BKT92918840)।');
      }
    } else {
      // Official Nagad TrxID is exactly 8 alphanumeric characters (mixed letters & numbers)
      if (cleanTrx.length !== 8 || !/[A-Z]/.test(cleanTrx) || !/[0-9]/.test(cleanTrx)) {
        throw new Error('ভুল নগদ TrxID! নগদ ট্রানজেকশন আইডি অবশ্যই ঠিক ৮ ডিজিটের আলফানিউমেরিক কোড হতে হবে (যেমন: 71KA9021)।');
      }
    }

    // Reject obvious fake/dummy TrxIDs
    const fakeTrxPatterns = [
      '12345678', '00000000', '11111111', '87654321', 'TEST', 'DEMO', 
      'TRXID', 'FAKE', 'ABCDEF', 'BKASH', 'NAGAD', 'PAYMENT', 'DUMMY'
    ];
    const hasFakePattern = fakeTrxPatterns.some(pat => cleanTrx.includes(pat)) || /^([A-Z0-9])\1{6,}$/.test(cleanTrx);
    if (hasFakePattern) {
      throw new Error('অকার্যকর বা ভুয়া TrxID সনাক্ত হয়েছে! অনুগ্রহ করে বিকাশ/নগদ অ্যাপে টাকা পাঠিয়ে প্রাপ্ত সঠিক এসএমএস TrxID দিন।');
    }

    // 3. Strict Duplicate TrxID Prevention
    const orders = this.getOrders();
    const isDuplicate = orders.some(
      o => o.trxId.toUpperCase() === cleanTrx && o.status !== 'rejected'
    );
    if (isDuplicate) {
      throw new Error('এই ট্রানজেকশন আইডি (TrxID) দিয়ে ইতিপূর্বে পেমেন্ট সম্পন্ন হয়েছে! ডুপ্লিকেট TrxID গ্রহণযোগ্য নয়।');
    }

    const uniqueCode = this.generateUniqueCode();
    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const durationHours = service.durationHours || 1;

    // Requirement: "তিনটি এপিকে এখানে ইউনিক কোড দেওয়ার পর আমার কিনা সার্ভিসের টাইমিং শুরু হবে"
    // Timer starts only when the user submits their unique code in the 3 APKs download section!
    const isAutoMode = paymentConfig.verificationMode === 'auto';
    const status: OrderStatus = isAutoMode ? 'verified' : 'pending';
    const activatedAt = undefined;
    const expiresAt = undefined;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      serviceId: service.id,
      serviceTitle: service.title,
      serviceImage: service.image,
      amount: service.price,
      customerName: data.customerName.trim() || 'গ্রাহক',
      customerPhone: cleanSender,
      senderNumber: cleanSender,
      customerId: data.customerId.trim() || cleanSender,
      trxId: cleanTrx,
      paymentMethod: data.paymentMethod,
      uniqueCode,
      durationHours,
      status,
      createdAt: new Date().toISOString(),
      activatedAt,
      expiresAt,
      adminNotes: isAutoMode 
        ? `স্বয়ংক্রিয় ভেরিফাইড পেমেন্ট (${durationHours} ঘন্টা)। ৩টি এপিকে সেকশনে কোড দিলে টাইমার চালু হবে।` 
        : `এডমিন ভেরিফিকেশন অপেক্ষমাণ (${durationHours} ঘন্টা)`,
    };

    orders.unshift(newOrder);
    this.saveOrders(orders);
    firebaseService.saveOrder(newOrder).catch(err => console.warn('Cloud save order notice:', err));
    return newOrder;
  }

  // Admin hour adjustment feature: "এডমিন পেনেল এ ঘন্টা কম বেশি করার অপশন থাকবে"
  adjustOrderHours(orderId: string, hoursDelta: number): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const order = orders[index];
    const newDuration = Math.max(1, order.durationHours + hoursDelta);
    
    // Recalculate expiresAt based on activation time or current time
    const baseTime = order.activatedAt ? new Date(order.activatedAt).getTime() : Date.now();
    const newExpiresAt = new Date(baseTime + newDuration * 3600 * 1000).toISOString();

    orders[index] = {
      ...order,
      durationHours: newDuration,
      expiresAt: newExpiresAt,
      adminNotes: `${order.adminNotes || ''} | এডমিন ঘন্টা পরিবর্তন: ${newDuration} ঘন্টা`,
    };

    this.saveOrders(orders);
    firebaseService.updateOrder(orderId, {
      durationHours: newDuration,
      expiresAt: newExpiresAt,
      adminNotes: orders[index].adminNotes
    }).catch(err => console.warn('Cloud update hours notice:', err));

    return orders[index];
  }

  updateOrderStatus(orderId: string, status: OrderStatus, adminNotes?: string): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return null;

    const current = orders[index];
    let activatedAt = current.activatedAt;
    let expiresAt = current.expiresAt;

    if (status === 'activated' && !current.activatedAt) {
      activatedAt = new Date().toISOString();
      expiresAt = new Date(Date.now() + (current.durationHours || 1) * 3600 * 1000).toISOString();
    }

    orders[index] = {
      ...current,
      status,
      activatedAt,
      expiresAt,
      adminNotes: adminNotes ?? current.adminNotes,
    };

    this.saveOrders(orders);
    firebaseService.updateOrder(orderId, {
      status,
      activatedAt,
      expiresAt,
      adminNotes: adminNotes ?? current.adminNotes
    }).catch(err => console.warn('Cloud update status notice:', err));

    return orders[index];
  }

  deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    if (filtered.length !== orders.length) {
      this.saveOrders(filtered);
      firebaseService.deleteOrder(orderId).catch(err => console.warn('Cloud delete notice:', err));
      return true;
    }
    return false;
  }

  // Core requirement: verify & unlock with Unique Code alone (no customer ID needed!)
  verifyAndActivateService(uniqueCode: string, customerId?: string): ActivationCheckResult {
    const cleanCode = uniqueCode.trim().toUpperCase();

    if (!cleanCode) {
      return {
        success: false,
        message: 'অনুগ্রহ করে আপনার ইউনিক কোডটি প্রদান করুন।',
        errorType: 'NOT_FOUND',
      };
    }

    const orders = this.getOrders();
    const matchingOrder = orders.find(
      o => o.uniqueCode.toUpperCase() === cleanCode
    );

    if (!matchingOrder) {
      return {
        success: false,
        message: 'ভুল ইউনিক কোড! এই কোড দিয়ে কোনো পেমেন্ট রেকর্ড পাওয়া যায়নি।',
        errorType: 'NOT_FOUND',
      };
    }

    if (matchingOrder.status === 'rejected') {
      return {
        success: false,
        message: '❌ এই অর্ডারটি ভুল তথ্য বা ভুয়া ট্রানজেকশনের কারণে বাতিল ও ব্লক করা হয়েছে! কোনো সার্ভিস বা এপিকে প্রদান করা হবে না।',
        errorType: 'REJECTED',
        order: matchingOrder,
      };
    }

    if (matchingOrder.status === 'pending') {
      return {
        success: false,
        message: '⚠️ আপনার পেমেন্টটি এখনও এডমিন কর্তৃক যাচাই করা হয়নি (Pending Verification)। বিকাশ/নগদ পেমেন্ট কনফার্ম হলে আপনার ইউনিক কোডটি স্বয়ংক্রিয়ভাবে সক্রিয় হবে এবং ৩টি এপিকে ডাউনলোড ও সার্ভিস চালু হবে।',
        errorType: 'NOT_PAID',
        order: matchingOrder,
      };
    }

    // Check expiration if expiresAt is set
    if (matchingOrder.expiresAt) {
      const isExpired = new Date(matchingOrder.expiresAt).getTime() < Date.now();
      if (isExpired) {
        matchingOrder.status = 'expired';
        this.saveOrders(orders);
        return {
          success: false,
          message: `আপনার সার্ভিসের মেয়াদ (${matchingOrder.durationHours} ঘন্টা) শেষ হয়ে গেছে। দয়া করে নতুন সার্ভিস ক্রয় করুন।`,
          errorType: 'EXPIRED',
          order: matchingOrder,
        };
      }
    }

    // Activate if not activated yet (e.g. status was verified by admin)
    if (matchingOrder.status !== 'activated') {
      const activatedAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + (matchingOrder.durationHours || 1) * 3600 * 1000).toISOString();
      matchingOrder.status = 'activated';
      matchingOrder.activatedAt = activatedAt;
      matchingOrder.expiresAt = expiresAt;
      this.saveOrders(orders);
    }

    return {
      success: true,
      message: `🎉 অভিনন্দন! ৩টি এপিকে সফলভাবে আনলক হয়েছে এবং আপনার কেনা সার্ভিসের ${matchingOrder.durationHours} ঘন্টার লাইভ কাউন্টডাউন টাইমার শুরু হয়েছে!`,
      order: matchingOrder,
    };
  }

  // Total Sales & Analytics: "এডমিন পেনেল এ মোট সেল ... থাকবে"
  getSalesAnalytics() {
    const orders = this.getOrders();
    const validOrders = orders.filter(o => o.status !== 'rejected');
    const totalRevenue = validOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const bkashOrders = validOrders.filter(o => o.paymentMethod === 'bkash');
    const nagadOrders = validOrders.filter(o => o.paymentMethod === 'nagad');
    const bkashRevenue = bkashOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const nagadRevenue = nagadOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const activeCount = orders.filter(o => {
      if (o.status !== 'activated') return false;
      if (!o.expiresAt) return true;
      return new Date(o.expiresAt).getTime() > Date.now();
    }).length;

    return {
      totalOrders: orders.length,
      validOrdersCount: validOrders.length,
      totalRevenue,
      bkashOrdersCount: bkashOrders.length,
      bkashRevenue,
      nagadOrdersCount: nagadOrders.length,
      nagadRevenue,
      activeSubscriptionsCount: activeCount,
    };
  }

  // Reset to demo defaults
  resetDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.BANNER, JSON.stringify(INITIAL_BANNER));
    localStorage.setItem(STORAGE_KEYS.PAYMENT_CONFIG, JSON.stringify(INITIAL_PAYMENT_CONFIG));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.SETUP_TUTORIAL, JSON.stringify(INITIAL_SETUP_TUTORIAL));
    localStorage.setItem(STORAGE_KEYS.BRANDING, JSON.stringify(INITIAL_BRANDING));
    localStorage.removeItem(STORAGE_KEYS.TERMS_ACCEPTED);
  }
}

export const store = new StoreService();
