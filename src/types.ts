export interface Service {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  durationHours: number; // ঘন্টা হিসেবে: ১ ঘন্টা, ৩ ঘন্টা, ৬ ঘন্টা, ২৪ ঘন্টা ইত্যাদি
  image: string;
  badge?: string;
  deliveryTime: string;
  idLabel: string;
  idPlaceholder: string;
  features: string[];
  instructions?: string;
  isAvailable: boolean;
}

export type PaymentMethod = 'bkash' | 'nagad';

export type OrderStatus = 'pending' | 'verified' | 'activated' | 'rejected' | 'expired';

export interface Order {
  id: string;
  orderNumber: string;
  serviceId: string;
  serviceTitle: string;
  serviceImage: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  senderNumber: string; // যে বিকাশ/নগদ নাম্বার থেকে পেমেন্ট করেছে
  customerId: string;   // গ্রাহকের আইডি নাম্বার (UID/Email/Phone)
  trxId: string;
  paymentMethod: PaymentMethod;
  uniqueCode: string;   // অটোমেটিক জেনারেট হওয়া ইউনিক কোড
  durationHours: number; // এই অর্ডারের মেয়াদ ঘন্টা হিসেবে
  status: OrderStatus;
  createdAt: string;
  activatedAt?: string;
  expiresAt?: string;   // কাউন্টডাউন টাইমারের জন্য মেয়াদ শেষ হওয়ার সময়
  adminNotes?: string;
}

export interface BannerConfig {
  imageUrl: string;
  youtubeUrl?: string; // YouTube video link when user clicks on banner
  title: string;
  subtitle: string;
  tagline: string;
  badgeText: string;
  ctaText: string;
  isEnabled: boolean;
}

export type ApkFileType = 'vpn' | 'large_file' | 'main' | 'injector' | 'helper' | 'other';

export interface ApkDownloadItem {
  id: string;
  title: string;
  version: string;
  size: string;
  description: string;
  downloadUrl: string;
  mirrorUrl?: string; // Optional backup/mirror download link (Google Drive, MediaFire, Mega)
  fileName: string;
  iconType: 'main' | 'injector' | 'helper' | 'vpn' | 'large_file' | 'other';
  fileCategory?: ApkFileType; // 'vpn' = Custom VPN APK, 'large_file' = Large Data/Resource/OBB, etc.
  isLargeFile?: boolean;
  storageProvider?: 'direct' | 'gdrive' | 'mediafire' | 'mega' | 'telegram' | 'custom';
  installInstructions?: string; // Specific instructions on how to install or setup this file
  badge?: string; // Custom badge label (e.g. 'আমাদের ভিপিএন', 'বড় ফাইল (৫০০MB+)')
  isActive?: boolean;
}

export interface SetupTutorialConfig {
  videoUrl: string;
  videoTitle: string;
  videoDescription: string;
  steps: string[];
  apks: ApkDownloadItem[];
}

export interface PaymentConfig {
  bkashNumber: string;
  bkashType: 'Personal' | 'Merchant' | 'Agent';
  bkashQr: string;
  nagadNumber: string;
  nagadType: 'Personal' | 'Merchant';
  nagadQr: string;
  supportPhone: string;
  supportWhatsApp: string;
  whatsAppGreeting?: string;
  adminPin: string; // legacy 4-digit compatibility
  adminPassword?: string; // secure extended password (8+ characters)
  adminEmail?: string; // recovery email address for password resets
  masterRecoveryKey?: string; // Emergency offline recovery key visible only in authenticated dashboard
  verificationMode: 'manual' | 'auto'; // 'manual' = Admin must approve to prevent fake info; 'auto' = algorithmic auto-approval
}

export interface AdminRecoveryOtp {
  code: string;
  email: string;
  expiresAt: number;
  createdAt: number;
}

export interface ActivationCheckResult {
  success: boolean;
  message: string;
  order?: Order;
  errorType?: 'NOT_FOUND' | 'ID_MISMATCH' | 'NOT_PAID' | 'REJECTED' | 'EXPIRED';
}

export interface SiteBrandingConfig {
  siteName: string;
  tagline: string;
  badgeText: string;
  logoUrl?: string; // Custom uploaded image logo (base64 data URL) or web URL
  packagesTitle?: string; // Packages section title option
}

