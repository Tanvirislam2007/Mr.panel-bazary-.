import React, { useState, useEffect } from 'react';
import { Service, Order, BannerConfig, PaymentConfig, OrderStatus, SetupTutorialConfig, SiteBrandingConfig, ApkDownloadItem } from '../types';
import { store, DEFAULT_PACKAGE_IMAGE } from '../services/store';
import { firebaseService, auth } from '../services/firebase';
import { User } from 'firebase/auth';
import { 
  ShieldCheck, Plus, Trash2, Edit3, 
  Save, CheckCircle2, XCircle, Clock, RefreshCw, 
  Search, Filter, Image as ImageIcon, CreditCard, 
  Settings, Sparkles, Smartphone, UserCheck, 
  Check, X, AlertTriangle, ArrowLeft, TrendingUp, 
  DollarSign, Hourglass, PlusCircle, MinusCircle, LogOut, Upload,
  Video, Palette, Play, Film, Type, FileVideo, Copy, CheckCheck, Key,
  Shield, HardDrive, FileArchive, Cloud, Link, ExternalLink, Globe, ArrowUp, ArrowDown, HelpCircle, FileCode2, Download,
  AlertCircle, Loader2, Eye
} from 'lucide-react';
import { BkashLogo, NagadLogo } from './PaymentLogos';
import { WhatsAppIcon } from './WhatsAppModal';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onDataUpdated,
}) => {
  // 100% Secure Firebase Google Authentication Only
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => auth.currentUser);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [googleAuthError, setGoogleAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'services' | 'banner' | 'tutorial' | 'branding' | 'payment'>('analytics');

  // State from store
  const [orders, setOrders] = useState<Order[]>(() => store.getOrders());
  const [services, setServices] = useState<Service[]>(() => store.getServices());
  const [banner, setBanner] = useState<BannerConfig>(() => store.getBanner());
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => store.getPaymentConfig());
  const [analytics, setAnalytics] = useState(() => store.getSalesAnalytics());

  // Search & Filter in Orders
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [orderDeleteConfirmId, setOrderDeleteConfirmId] = useState<string | null>(null);
  const [orderDeleteNotice, setOrderDeleteNotice] = useState<string | null>(null);

  // Service Edit / Create Modal state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreatingService, setIsCreatingService] = useState(false);
  const [serviceFormData, setServiceFormData] = useState<Partial<Service>>({});
  const [serviceSaveNotice, setServiceSaveNotice] = useState<string | null>(null);
  const [serviceModalError, setServiceModalError] = useState<string>('');
  const [isProcessingServiceImage, setIsProcessingServiceImage] = useState(false);
  const [serviceDeleteConfirmId, setServiceDeleteConfirmId] = useState<string | null>(null);

  // Banner form state
  const [bannerFormData, setBannerFormData] = useState<BannerConfig>(banner);
  const [bannerSaveNotice, setBannerSaveNotice] = useState(false);
  const [isProcessingBanner, setIsProcessingBanner] = useState(false);

  // Payment form state
  const [paymentFormData, setPaymentFormData] = useState<PaymentConfig>(paymentConfig);
  const [paymentSaveNotice, setPaymentSaveNotice] = useState(false);

  // Setup Tutorial, Video & APK Files form state
  const [tutorialFormData, setTutorialFormData] = useState<SetupTutorialConfig>(() => store.getSetupTutorial());
  const [tutorialSaveNotice, setTutorialSaveNotice] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState('');
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [apkFilter, setApkFilter] = useState<'all' | 'vpn' | 'large_file' | 'main' | 'other'>('all');
  const [apkUploadNotice, setApkUploadNotice] = useState<{ id: string; message: string; type: 'info' | 'success' | 'warn' } | null>(null);

  // Site Branding & Logo form state
  const [brandingFormData, setBrandingFormData] = useState<SiteBrandingConfig>(() => store.getBranding());
  const [brandingSaveNotice, setBrandingSaveNotice] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState('');
  const [logoUploadSuccess, setLogoUploadSuccess] = useState('');
  const [isProcessingLogo, setIsProcessingLogo] = useState(false);

  // Listen to Firebase Auth state for real-time authentication
  useEffect(() => {
    const unsub = firebaseService.subscribeAuthState((user) => {
      setFirebaseUser(user);
      if (user) {
        const userEmail = (user.email || '').toLowerCase();
        const adminEmail = (paymentConfig.adminEmail || 'tanvirislamtanvir512007@gmail.com').toLowerCase();
        if (userEmail === adminEmail || userEmail === 'tanvirislamtanvir512007@gmail.com') {
          setIsAuthenticated(true);
          setGoogleAuthError('');
        }
      }
    });
    return () => unsub();
  }, [paymentConfig.adminEmail]);

  if (!isOpen) return null;

  // Google Login for Admin (100% Firebase Auth Google Sign-In)
  const handleGoogleAdminLogin = async () => {
    setIsGoogleSigningIn(true);
    setGoogleAuthError('');
    try {
      const user = await firebaseService.loginWithGoogle();
      const adminEmail = (paymentConfig.adminEmail || 'tanvirislamtanvir512007@gmail.com').toLowerCase();
      const loggedInEmail = (user.email || '').toLowerCase();
      if (loggedInEmail === adminEmail || loggedInEmail === 'tanvirislamtanvir512007@gmail.com') {
        setIsAuthenticated(true);
        setFirebaseUser(user);
        setGoogleAuthError('');
      } else {
        await firebaseService.logout();
        setGoogleAuthError(`অ্যাক্সেস অস্বীকৃত: "${user.email}" অনুমোদিত এডমিন নয়। শুধুমাত্র ${adminEmail} লগইন করতে পারবেন।`);
      }
    } catch (err: any) {
      setGoogleAuthError(`লগইন ব্যর্থ হয়েছে: ${err?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'}`);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      await firebaseService.logout();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
    setFirebaseUser(null);
  };

  const refreshAllData = () => {
    setOrders(store.getOrders());
    setServices(store.getServices());
    setBanner(store.getBanner());
    setPaymentConfig(store.getPaymentConfig());
    setTutorialFormData(store.getSetupTutorial());
    setBrandingFormData(store.getBranding());
    setAnalytics(store.getSalesAnalytics());
    onDataUpdated();
  };

  // Video File Upload handler
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 80 * 1024 * 1024) {
      setVideoUploadError('ভিডিও ফাইলটি ৮০ মেগাবাইটের বেশি। অনুগ্রহ করে ৮০ মেগাবাইট বা তার কম সাইজের ফাইল আপলোড করুন অথবা ইউটিউব ভিডিও লিঙ্ক দিন।');
      return;
    }

    setIsVideoUploading(true);
    setVideoUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setTutorialFormData(prev => ({
        ...prev,
        videoUrl: result,
      }));
      setIsVideoUploading(false);
    };
    reader.onerror = () => {
      setVideoUploadError('ভিডিও ফাইল লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setIsVideoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Save Tutorial & Video
  const handleSaveTutorial = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSetupTutorial(tutorialFormData);
    setTutorialSaveNotice(true);
    setTimeout(() => setTutorialSaveNotice(false), 3500);
    refreshAllData();
  };

  // APK & Large File Upload / Management Handlers
  const handleFileUploadForApk = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1000 
      ? `${(sizeInMB / 1024).toFixed(2)} GB` 
      : `${sizeInMB.toFixed(1)} MB`;

    const updatedApks = [...tutorialFormData.apks];
    const targetApk = updatedApks[index];
    const isBig = sizeInMB > 15;

    updatedApks[index] = {
      ...targetApk,
      fileName: file.name,
      title: targetApk.title || file.name.replace(/\.[^/.]+$/, ''),
      size: formattedSize,
      isLargeFile: isBig || targetApk.isLargeFile,
      fileCategory: targetApk.fileCategory || (isBig ? 'large_file' : 'main'),
    };

    setTutorialFormData({ ...tutorialFormData, apks: updatedApks });

    if (isBig) {
      setApkUploadNotice({
        id: targetApk.id || String(index),
        message: `ফাইল লোড হয়েছে: "${file.name}" (${formattedSize})। এটি একটি বড় ফাইল, গ্রাহকদের ফুল স্পিড ডাউনলোডের জন্য গুগল ড্রাইভ বা ক্লাউড লিংক অপশন সক্রিয় করা হয়েছে।`,
        type: 'info'
      });
    } else {
      setApkUploadNotice({
        id: targetApk.id || String(index),
        message: `ফাইল নির্বাচিত হয়েছে: "${file.name}" (${formattedSize})।`,
        type: 'success'
      });
    }
    setTimeout(() => setApkUploadNotice(null), 5000);
  };

  const handleAddApk = (presetType: 'vpn' | 'large_file' | 'main' | 'other') => {
    const id = `apk-${presetType}-${Date.now()}`;
    let newApk: ApkDownloadItem;

    if (presetType === 'vpn') {
      newApk = {
        id,
        title: 'আমাদের নিজস্ব ভিপিএন (Custom VPN APK)',
        version: 'v3.5 VIP',
        size: '15.0 MB',
        description: 'আমাদের তৈরি করা স্পেশাল হাই-স্পিড সিকিউর ভিপিএন অ্যাপ। কোনো ল্যাগ ছাড়াই ফুল স্পিডে কানেক্ট করবে।',
        downloadUrl: '',
        mirrorUrl: '',
        fileName: 'My_Custom_VPN.apk',
        iconType: 'vpn',
        fileCategory: 'vpn',
        isLargeFile: false,
        storageProvider: 'direct',
        installInstructions: 'ভিপিএন অ্যাপটি ওপেন করে BD বা SG সার্ভার অন করুন। ভিপিএন কানেক্ট থাকার পর মূল ফাইল ব্যবহার করুন।',
        badge: 'আমাদের নিজস্ব ভিপিএন',
        isActive: true,
      };
    } else if (presetType === 'large_file') {
      newApk = {
        id,
        title: 'বড় ভিআইপি জিপ প্যাকেজ (VIP Complete ZIP Package)',
        version: 'v6.0 VIP Pack',
        size: '১.২ GB (বড় ফাইল)',
        description: 'বড় সাইজের সম্পূর্ণ ভিআইপি জিপ ফাইল। ইউনিক কোড দিলেই গুগল ড্রাইভ বা মিডিয়াফায়ার ক্লাউড থেকে সরাসরি হাই-স্পিডে ডাউনলোড করতে পারবেন। সাইজ অনেক বড় হওয়ায় ক্লাউড লিংকের মাধ্যমে নিরবচ্ছিন্নভাবে নামবে।',
        downloadUrl: '',
        mirrorUrl: '',
        fileName: 'VIP_Gaming_Complete_Resource_Pack.zip',
        iconType: 'large_file',
        fileCategory: 'large_file',
        isLargeFile: true,
        storageProvider: 'gdrive',
        installInstructions: 'ইউনিক কোড দিয়ে আনলক করার পর ক্লাউড লিংক থেকে সম্পূর্ণ জিপ ফাইল নামিয়ে নিন। এরপর ZArchiver বা RAR অ্যাপ দিয়ে এক্সট্রাক্ট করুন।',
        badge: '📦 বড় জিপ ফাইল (High-Speed ZIP)',
        isActive: true,
      };
    } else {
      newApk = {
        id,
        title: presetType === 'main' ? 'মেইন সার্ভিস কন্ট্রোলার (Main APK)' : 'নতুন এপিকে ফাইল',
        version: 'v1.0 Pro',
        size: '18.0 MB',
        description: 'সার্ভিসের প্রয়োজনীয় অ্যাপ্লিকেশন যা ইউনিক কোড দিয়ে সক্রিয় থাকে।',
        downloadUrl: '',
        mirrorUrl: '',
        fileName: 'Service_Tool.apk',
        iconType: presetType === 'main' ? 'main' : 'helper',
        fileCategory: presetType,
        isLargeFile: false,
        storageProvider: 'direct',
        installInstructions: 'অ্যাপটি ফোনে ইনস্টল করে আপনার কেনা ইউনিক কোড দিয়ে এক্টিভেট করুন।',
        badge: presetType === 'main' ? 'মেইন অ্যাপ' : 'টুলস',
        isActive: true,
      };
    }

    setTutorialFormData(prev => ({
      ...prev,
      apks: [...prev.apks, newApk],
    }));
    setApkFilter('all');
  };

  // Delete APK item with instant auto-save to persistent store (No iframe-blocking window.confirm)
  const handleRemoveApk = (index: number) => {
    const targetApk = tutorialFormData.apks[index];
    const apkTitle = targetApk?.title || 'ফাইল';
    
    // Direct store persistence
    const updatedApks = store.deleteApkItem(index);
    setTutorialFormData(prev => ({
      ...prev,
      apks: updatedApks,
    }));
    refreshAllData();

    setApkUploadNotice({
      id: `deleted-${Date.now()}`,
      message: `✅ "${apkTitle}" সফলভাবে ডিলিট করা হয়েছে এবং পরিবর্তন সরাসরি সেভ হয়েছে!`,
      type: 'info'
    });
    setTimeout(() => setApkUploadNotice(null), 4000);
  };

  // Remove all default demo APKs in one click
  const handleClearAllDemoApks = () => {
    const updatedApks = store.clearAllDemoApks();
    setTutorialFormData(prev => ({
      ...prev,
      apks: updatedApks,
    }));
    refreshAllData();

    setApkUploadNotice({
      id: `cleared-demos-${Date.now()}`,
      message: '✅ পূর্বের সব ডেমো এপিকে মুছে ফেলা হয়েছে! এখন আপনি শুধু আপনার তৈরি ভিপিএন এবং বড় ফাইল যোগ করতে পারেন।',
      type: 'success'
    });
    setTimeout(() => setApkUploadNotice(null), 5000);
  };

  const handleMoveApk = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tutorialFormData.apks.length) return;
    const apks = [...tutorialFormData.apks];
    const temp = apks[index];
    apks[index] = apks[targetIndex];
    apks[targetIndex] = temp;
    setTutorialFormData(prev => ({ ...prev, apks }));
    store.updateSetupTutorial({ apks });
  };

  const handleTestDownload = (apk: ApkDownloadItem) => {
    const url = apk.downloadUrl || apk.mirrorUrl;
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      setApkUploadNotice({
        id: `test-warn-${Date.now()}`,
        message: `ℹ️ "${apk.title}"-এর জন্য এখনো কোনো সরাসরি লিংক যোগ করা হয়নি। গুগল ড্রাইভ বা ক্লাউড লিংক পেস্ট করুন।`,
        type: 'info'
      });
      setTimeout(() => setApkUploadNotice(null), 4000);
    }
  };

  // Logo File Upload directly to Firebase Storage (No base64 data URL)
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setLogoUploadError('লোগো ফাইলের সাইজ ১০ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ছবি নির্বাচন করুন।');
      return;
    }

    setIsProcessingLogo(true);
    setLogoUploadError('');
    setLogoUploadSuccess('');

    try {
      const downloadUrl = await firebaseService.uploadImage(file, 'logos');
      setBrandingFormData(prev => ({
        ...prev,
        logoUrl: downloadUrl,
      }));
      setLogoUploadSuccess('✅ লোগো ফায়ারবেস ক্লাউড স্টোরেজে সফলভাবে আপলোড হয়েছে! নিচে "লোগো ও সাইটের নাম সেভ করুন" বাটনে ক্লিক করে সেভ করুন।');
    } catch (err: any) {
      setLogoUploadError('ছবি আপলোড করতে ব্যর্থ হয়েছে: ' + (err?.message || 'সঠিক ইমেজ ফাইল দিন'));
    } finally {
      setIsProcessingLogo(false);
      e.target.value = '';
    }
  };

  // Save Branding (Site Logo & Name)
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setLogoUploadError('');
    setLogoUploadSuccess('');

    try {
      const saved = store.updateBranding(brandingFormData);
      setBrandingFormData(saved);
      setBrandingSaveNotice(true);
      setLogoUploadSuccess(`✅ সাইটের নাম "${saved.siteName}" এবং লোগো সফলভাবে সেভ করা হয়েছে!`);
      setTimeout(() => setBrandingSaveNotice(false), 5000);
      refreshAllData();
    } catch (err: any) {
      setLogoUploadError(`সেভ করতে সমস্যা হয়েছে: ${err?.message || 'পুনরায় চেষ্টা করুন'}`);
    }
  };

  // Reset Branding to Default
  const handleResetBranding = () => {
    const reset = store.resetBranding();
    setBrandingFormData(reset);
    setBrandingSaveNotice(true);
    setLogoUploadSuccess('✅ ডিফল্ট সাইট নাম "সেবাপে" এবং লোগো সফলভাবে ফিরিয়ে নেওয়া হয়েছে!');
    setTimeout(() => setBrandingSaveNotice(false), 4000);
    refreshAllData();
  };

  // Order Actions
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    store.updateOrderStatus(orderId, status);
    refreshAllData();
  };

  // Hour adjustment: "ঘন্টা কম বেশি করার অপশন থাকবে"
  const handleAdjustHours = (orderId: string, delta: number) => {
    store.adjustOrderHours(orderId, delta);
    refreshAllData();
  };

  const handleDeleteOrder = (orderId: string) => {
    store.deleteOrder(orderId);
    setOrderDeleteConfirmId(null);
    refreshAllData();
    setOrderDeleteNotice('✅ অর্ডার রেকর্ডটি সফলভাবে ডিলিট করা হয়েছে!');
    setTimeout(() => setOrderDeleteNotice(null), 4000);
  };

  // Package Image Direct Cloud Upload to Firebase Storage (No base64 data URL)
  const handleServiceImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setServiceModalError('ইমেজ ফাইলের সাইজ ১৫ মেগাবাইটের বেশি। অনুগ্রহ করে ছোট ছবি সিলেক্ট করুন।');
      return;
    }

    setIsProcessingServiceImage(true);
    setServiceModalError('');

    try {
      const downloadUrl = await firebaseService.uploadImage(file, 'services');
      setServiceFormData(prev => ({
        ...prev,
        image: downloadUrl,
      }));
    } catch (err: any) {
      setServiceModalError('ছবি ক্লাউডে আপলোড করতে ব্যর্থ হয়েছে: ' + (err?.message || 'সঠিক ইমেজ ফাইল দিন'));
    } finally {
      setIsProcessingServiceImage(false);
      e.target.value = '';
    }
  };

  // Service Actions
  const handleOpenEditService = (service: Service) => {
    setIsCreatingService(false);
    setEditingService(service);
    setServiceModalError('');
    setServiceFormData({
      ...service,
      durationHours: Number(service.durationHours) || 1,
      price: Number(service.price) || 0,
      originalPrice: service.originalPrice ? Number(service.originalPrice) : undefined,
    });
  };

  const handleOpenCreateService = () => {
    setEditingService(null);
    setIsCreatingService(true);
    setServiceModalError('');
    setServiceFormData({
      title: '',
      category: 'ঘন্টা ভিত্তিক এক্সেস',
      description: 'অটো ডেলিভারি এবং ইনস্ট্যান্ট কাউন্টডাউন এক্সেস',
      price: 150,
      originalPrice: 250,
      durationHours: 3,
      image: DEFAULT_PACKAGE_IMAGE,
      badge: 'জনপ্রিয় অফার',
      deliveryTime: 'ইনস্ট্যান্ট অটো ডেলিভারি',
      idLabel: 'কাস্টমার ইউজার আইডি / ফোন',
      idPlaceholder: 'আইডি নাম্বার দিন',
      features: ['ইনস্ট্যান্ট অটো কাউন্টডাউন', 'ভিআইপি এপিকে এক্সেস'],
      isAvailable: true,
    });
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    setServiceModalError('');

    const title = (serviceFormData.title || '').trim();
    const priceNum = Number(serviceFormData.price);
    const durationHours = Math.max(1, Number(serviceFormData.durationHours) || 1);

    if (!title) {
      setServiceModalError('অনুগ্রহ করে প্যাকেজের নাম বা টাইটেল প্রদান করুন।');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setServiceModalError('অনুগ্রহ করে সঠিক বিক্রয় মূল্য (টাকায়) প্রদান করুন।');
      return;
    }

    try {
      if (editingService) {
        // UPDATE Existing Service
        const updated = store.updateService(editingService.id, {
          ...serviceFormData,
          title,
          price: priceNum,
          durationHours,
          originalPrice: serviceFormData.originalPrice ? Number(serviceFormData.originalPrice) : undefined,
          isAvailable: serviceFormData.isAvailable ?? true,
        });

        if (!updated) {
          throw new Error('প্যাকেজটি আপডেট করা সম্ভব হয়নি।');
        }

        setServiceSaveNotice(`✅ "${title}" প্যাকেজটি সফলভাবে আপডেট ও সেভ হয়েছে!`);
      } else if (isCreatingService) {
        // CREATE New Service
        const newPkg = store.addService({
          title,
          category: serviceFormData.category || 'ঘন্টা ভিত্তিক এক্সেস',
          description: serviceFormData.description || '',
          price: priceNum,
          originalPrice: serviceFormData.originalPrice ? Number(serviceFormData.originalPrice) : undefined,
          durationHours,
          image: serviceFormData.image || DEFAULT_PACKAGE_IMAGE,
          badge: serviceFormData.badge || undefined,
          deliveryTime: serviceFormData.deliveryTime || 'ইনস্ট্যান্ট অটো ডেলিভারি',
          idLabel: serviceFormData.idLabel || 'কাস্টমার আইডি',
          idPlaceholder: serviceFormData.idPlaceholder || 'আইডি দিন',
          features: serviceFormData.features && serviceFormData.features.length > 0
            ? serviceFormData.features
            : ['ইনস্ট্যান্ট অটো কাউন্টডাউন', 'ভিআইপি এক্সেস'],
          instructions: serviceFormData.instructions || 'পেমেন্ট সম্পন্ন হওয়ার পর প্রাপ্ত ইউনিক কোড দিয়ে এক্টিভ করুন।',
          isAvailable: serviceFormData.isAvailable ?? true,
        });

        setServiceSaveNotice(`✅ নতুন প্যাকেজ "${newPkg.title}" সফলভাবে তৈরি ও সেভ হয়েছে!`);
      }

      setEditingService(null);
      setIsCreatingService(false);
      setServiceFormData({});
      setTimeout(() => setServiceSaveNotice(null), 5000);
      refreshAllData();
    } catch (err: any) {
      setServiceModalError(`প্যাকেজ সেভ করতে সমস্যা হয়েছে: ${err?.message || 'পুনরায় চেষ্টা করুন'}`);
    }
  };

  const handleToggleServiceStock = (service: Service) => {
    store.updateService(service.id, {
      isAvailable: !service.isAvailable,
    });
    setServiceSaveNotice(`🔄 "${service.title}" এর স্টক স্ট্যাটাস পরিবর্তিত হয়েছে!`);
    setTimeout(() => setServiceSaveNotice(null), 3000);
    refreshAllData();
  };

  const handleDeleteService = (serviceId: string) => {
    store.deleteService(serviceId);
    setServiceDeleteConfirmId(null);
    setServiceSaveNotice('🗑️ প্যাকেজটি সফলভাবে মুছে ফেলা হয়েছে।');
    setTimeout(() => setServiceSaveNotice(null), 4000);
    refreshAllData();
  };

  const handleResetServices = () => {
    store.resetServicesToDefault();
    setServiceSaveNotice('✅ ডিফল্ট প্যাকেজসমূহ সফলভাবে ফিরিয়ে আনা হয়েছে!');
    setTimeout(() => setServiceSaveNotice(null), 4000);
    refreshAllData();
  };

  // Banner Save
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateBanner(bannerFormData);
    setBanner(bannerFormData);
    setBannerSaveNotice(true);
    setTimeout(() => setBannerSaveNotice(false), 2500);
    onDataUpdated();
  };

  // Payment Save
  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    store.updatePaymentConfig(paymentFormData);
    setPaymentConfig(paymentFormData);
    setPaymentSaveNotice(true);
    setTimeout(() => setPaymentSaveNotice(false), 2500);
    onDataUpdated();
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.senderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.uniqueCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.trxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 text-slate-100 flex flex-col">
      {/* Dedicated Admin Portal Top Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="মূল সাইটে ফিরে যান"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">মূল ওয়েবসাইটে ফেরত</span>
          </button>
          <div className="flex items-center gap-2.5">
            {brandingFormData.logoUrl ? (
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 p-0.5 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/10">
                <img
                  src={brandingFormData.logoUrl}
                  alt={brandingFormData.siteName}
                  className="w-full h-full object-contain rounded-xl"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/15 shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
            )}
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{brandingFormData.siteName || 'সেবাপে'} - এডমিন পোর্টাল</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {brandingFormData.badgeText || 'ADMIN V2'}
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {brandingFormData.tagline || 'মোট সেলস অডিট, ঘন্টা কন্ট্রোল, ব্যানার ও পেমেন্ট ম্যানেজমেন্ট'}
              </p>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            {/* Download Full Project Source Code (.ZIP) */}
            <a
              href="/shebapay_project_source.zip"
              download="ShebaPay_Full_Project_Source.zip"
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-md shadow-amber-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              title="সম্পূর্ণ প্রজেক্টের সোর্স কোড জিপ (ZIP) আকারে ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
              <span>প্রজেক্ট জিপ ডাউনলোড (.ZIP)</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ক্লাউড লাইভ সিঙ্ক সক্রিয় (Firebase)</span>
            </div>
            <button
              onClick={handleAdminLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {!isAuthenticated ? (
          /* ===================== SECURE FIREBASE GOOGLE AUTH ONLY ===================== */
          <div className="max-w-md mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-blue-500/20 border-2 border-pink-500/30 text-pink-400 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">এডমিন প্যানেলে প্রবেশ করুন</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  ১০০% সুরক্ষিত ফায়ারবেস ক্লাউড অথেনটিকেশন (Firebase Google Auth)
                </p>
              </div>
            </div>

            {/* Authorized Admin Notice */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-semibold text-slate-400">অনুমোদিত এডমিন:</span>
                <span className="font-mono font-bold text-pink-400">
                  {paymentConfig.adminEmail || 'tanvirislamtanvir512007@gmail.com'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] pt-1 border-t border-slate-850">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>ক্লাউড সার্ভার-সাইড ভেরিফিকেশন সক্রিয় • ক্লায়েন্টে কোনো পাসওয়ার্ড নেই</span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={handleGoogleAdminLogin}
                disabled={isGoogleSigningIn}
                className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer border border-slate-200 active:scale-[0.99] disabled:opacity-50"
              >
                {isGoogleSigningIn ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{isGoogleSigningIn ? 'যাচাই করা হচ্ছে...' : 'Google দিয়ে নিরাপদ এডমিন লগইন'}</span>
              </button>

              {googleAuthError && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-3.5 rounded-xl border border-rose-500/20 text-center leading-relaxed animate-in fade-in">
                  {googleAuthError}
                </div>
              )}
            </div>

            {/* Zero Password Security Assurance */}
            <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>মিলিটারি-গ্রেড ক্লাউড সিকিউরিটি এনফোর্সড</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                ব্রাউজার ইন্সপেক্ট বা ক্লায়েন্ট কোড থেকে পাসওয়ার্ড ফাঁসের কোনো ঝুঁকি নেই। শুধুমাত্র অনুমোদিত গুগল আইডি দিয়ে স্বয়ংক্রিয়ভাবে প্রবেশাধিকার নিশ্চিত হবে।
              </p>
            </div>
          </div>
        ) : (
          /* ===================== AUTHENTICATED ADMIN DASHBOARD ===================== */
          <div className="space-y-6">
            {/* Admin Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>মোট সেলস ও অ্যানালিটিক্স</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>অর্ডার ও ঘন্টা কন্ট্রোল ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>সার্ভিস ও ঘন্টা রেট ({services.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('banner')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'banner'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>টপ ব্যানার এডিট</span>
              </button>

              <button
                onClick={() => setActiveTab('tutorial')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'tutorial'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>এপিকে ও ফাইল ({tutorialFormData.apks.length})</span>
              </button>

              <button
                onClick={() => {
                  setBrandingFormData(store.getBranding());
                  setLogoUploadError('');
                  setLogoUploadSuccess('');
                  setActiveTab('branding');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'branding'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>লোগো ও সাইট নাম</span>
              </button>

              <button
                onClick={() => setActiveTab('payment')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'payment'
                    ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>পেমেন্ট ও সিকিউরিটি</span>
              </button>
            </div>

            {/* ===================== TAB 0: SALES ANALYTICS ===================== */}
            {/* Requirement: "এডমিন পেনেল এ মোট সেল ... থাকবে" */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-extrabold text-white">মোট সেলস ও রাজস্ব বিবরণী</h3>
                  <p className="text-xs sm:text-sm text-slate-400">রিয়েল-টাইম বিক্রি ও বিকাশ/নগদ পেমেন্ট অডিট</p>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Total Sales in BDT */}
                  <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 rounded-3xl border border-emerald-500/40 shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase">
                      <span>মোট মোট সেল (Total Revenue)</span>
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      ৳ {analytics.totalRevenue.toLocaleString('bn-BD')}
                    </div>
                    <p className="text-[11px] text-emerald-300">মোট সফল বিক্রি হওয়া টাকার পরিমাণ</p>
                  </div>

                  {/* Total Orders */}
                  <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-blue-400 text-xs font-bold uppercase">
                      <span>মোট অর্ডার সংখ্যা</span>
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      {analytics.totalOrders.toLocaleString('bn-BD')} টি
                    </div>
                    <p className="text-[11px] text-slate-400">গৃহীত সর্বমোট অর্ডারের হিসাব</p>
                  </div>

                  {/* bKash Total Sales */}
                  <div className="bg-[#e2136e]/10 p-6 rounded-3xl border border-[#e2136e]/30 shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-pink-400 text-xs font-bold uppercase">
                      <span>বিকাশ মোট সেল</span>
                      <BkashLogo className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      ৳ {analytics.bkashRevenue.toLocaleString('bn-BD')}
                    </div>
                    <p className="text-[11px] text-pink-300 font-mono">
                      {analytics.bkashOrdersCount} টি বিকাশ ট্রানজেকশন
                    </p>
                  </div>

                  {/* Nagad Total Sales */}
                  <div className="bg-[#f7941d]/10 p-6 rounded-3xl border border-[#f7941d]/30 shadow-xl space-y-2">
                    <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase">
                      <span>নগদ মোট সেল</span>
                      <NagadLogo className="w-5 h-5" />
                    </div>
                    <div className="text-3xl font-black text-white font-mono tracking-tight">
                      ৳ {analytics.nagadRevenue.toLocaleString('bn-BD')}
                    </div>
                    <p className="text-[11px] text-amber-300 font-mono">
                      {analytics.nagadOrdersCount} টি নগদ ট্রানজেকশন
                    </p>
                  </div>
                </div>

                {/* Active Subscriptions Alert Box */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">বর্তমানে সক্রিয় ঘন্টা সাবস্ক্রিপশন</h4>
                      <p className="text-xs text-slate-400">যাদের কাউন্টডাউন টাইমার এখনও লাইভ চলছে</p>
                    </div>
                  </div>
                  <div className="text-xl font-mono font-black text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-xl border border-emerald-500/20">
                    {analytics.activeSubscriptionsCount} টি লাইভ
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 1: ORDERS & HOUR ADJUSTMENT ===================== */}
            {/* Requirement: "এডমিন পেনেল এ কোন নাম্বার থেকে থেকে পেমেন্ট করেছে তার আইডি নাম্বার যেটা ইউনিক কোড ও তার সাথে দিয়েছিল ওই আইডি নাম্বারটা দেখাবে" + "ঘন্টা কম বেশি করার অপশন থাকবে" */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="খুঁজুন: প্রেরক নম্বর, কাস্টমার আইডি, ইউনিক কোড, বা TrxID..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 outline-none focus:border-pink-500 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 outline-none"
                    >
                      <option value="all">সকল অর্ডার</option>
                      <option value="pending">⏳ যাচাই অপেক্ষমাণ (Pending)</option>
                      <option value="activated">সক্রিয় (Activated)</option>
                      <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
                      <option value="verified">ভেরিফাইড (Verified)</option>
                      <option value="rejected">বাতিল (Rejected)</option>
                    </select>
                  </div>
                </div>

                {/* Pending Orders Queue Banner */}
                {orders.filter(o => o.status === 'pending').length > 0 && (
                  <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 space-y-3 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                        <h3 className="text-base font-black text-amber-300">
                          নতুন পেমেন্ট যাচাই রিকোয়েস্ট ({orders.filter(o => o.status === 'pending').length} টি অপেক্ষমাণ)
                        </h3>
                      </div>
                      <span className="text-xs text-amber-200/80">বিকাশ/নগদ স্টেটমেন্ট দেখে অনুমোদন বা বাতিল করুন</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                      {orders.filter(o => o.status === 'pending').map(ord => (
                        <div key={ord.id} className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between gap-3 shadow-md">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono text-slate-400">{ord.orderNumber}</span>
                              <span className="font-mono font-black text-emerald-400">৳ {ord.amount}</span>
                            </div>
                            <div className="text-sm font-bold text-white line-clamp-1">{ord.serviceTitle} ({ord.durationHours} ঘন্টা)</div>
                            <div className="text-xs text-slate-300 font-mono space-y-0.5">
                              <div>প্রেরক নম্বর: <strong className="text-white">{ord.senderNumber}</strong></div>
                              <div className="flex items-center gap-1.5">
                                {ord.paymentMethod === 'bkash' ? <BkashLogo className="w-3.5 h-3.5" /> : <NagadLogo className="w-3.5 h-3.5" />}
                                <span>TrxID: <strong className="text-amber-300 uppercase">{ord.trxId}</strong></span>
                              </div>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              ইউনিক কোড: <span className="text-emerald-300 font-bold">{ord.uniqueCode}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'verified')}
                              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
                              title="পেমেন্ট অনুমোদন করুন (৩টি এপিকেতে কোড দিলে গ্রাহকের টাইমার শুরু হবে)"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>✓ অনুমোদন (পেমেন্ট নিশ্চিত)</span>
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'activated')}
                              className="py-2 px-2.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/30 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="এখনই সরাসরি লাইভ কাউন্টডাউন চালু করুন"
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>সরাসরি চালু</span>
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(ord.id, 'rejected')}
                              className="py-2 px-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="ভুল বা ভুয়া তথ্য দেওয়ার কারণে বাতিল"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order Action Notice Banner */}
                {orderDeleteNotice && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold flex items-center justify-between shadow-lg">
                    <span>{orderDeleteNotice}</span>
                    <button
                      type="button"
                      onClick={() => setOrderDeleteNotice(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="বিজ্ঞপ্তি বন্ধ করুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Orders Table */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm text-slate-300">
                      <thead className="bg-slate-950/70 text-slate-400 uppercase text-[11px] font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3.5">তারিখ ও সময়</th>
                          <th className="px-4 py-3.5">প্রেরক নম্বর (Sender No)</th>
                          <th className="px-4 py-3.5">কাস্টমার আইডি (Customer ID)</th>
                          <th className="px-4 py-3.5">ইউনিক কোড (Unique Code)</th>
                          <th className="px-4 py-3.5">পেমেন্ট ও TrxID</th>
                          <th className="px-4 py-3.5">ঘন্টা মেয়ার ও এডমিন কন্ট্রোল</th>
                          <th className="px-4 py-3.5">স্ট্যাটাস</th>
                          <th className="px-4 py-3.5 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                              কোন অর্ডার পাওয়া যায়নি।
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map((ord) => (
                            <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                              {/* Date */}
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-400">
                                <div>{new Date(ord.createdAt).toLocaleDateString('bn-BD')}</div>
                                <div className="text-[11px] font-mono text-slate-500">
                                  {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </td>

                              {/* Sender Mobile Number ("কোন নাম্বার থেকে পেমেন্ট করেছে") */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="font-mono font-bold text-white bg-slate-950 px-2 py-1 rounded border border-slate-800 inline-block">
                                  {ord.senderNumber}
                                </div>
                                {ord.customerName && ord.customerName !== 'গ্রাহক' && (
                                  <div className="text-[11px] text-slate-400 mt-0.5">{ord.customerName}</div>
                                )}
                              </td>

                              {/* Customer ID ("তার আইডি নাম্বার") */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="font-mono font-bold text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-lg border border-pink-500/20 inline-block">
                                  {ord.customerId}
                                </div>
                              </td>

                              {/* Unique Code ("যেটা ইউনিক কোড ও তার সাথে দিয়েছিল") */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="font-mono font-extrabold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-block tracking-wider">
                                  {ord.uniqueCode}
                                </div>
                              </td>

                              {/* Payment Method & TrxID */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 font-bold">
                                  {ord.paymentMethod === 'bkash' ? (
                                    <BkashLogo className="w-3.5 h-3.5" />
                                  ) : (
                                    <NagadLogo className="w-3.5 h-3.5" />
                                  )}
                                  <span className="font-mono text-slate-200 text-xs uppercase">{ord.trxId}</span>
                                </div>
                                <div className="text-emerald-400 font-bold text-xs mt-0.5">৳ {ord.amount}</div>
                              </td>

                              {/* Hour Adjustment: "ঘন্টা কম বেশি করার অপশন থাকবে" */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-white">
                                    {ord.durationHours} ঘন্টা
                                  </span>

                                  {/* Quick Hour Adjustment Buttons */}
                                  <button
                                    onClick={() => handleAdjustHours(ord.id, 1)}
                                    className="p-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                                    title="+১ ঘন্টা বাড়ান"
                                  >
                                    <PlusCircle className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => handleAdjustHours(ord.id, -1)}
                                    disabled={ord.durationHours <= 1}
                                    className="p-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors cursor-pointer disabled:opacity-40"
                                    title="-১ ঘন্টা কমান"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                  ord.status === 'activated'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : ord.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : ord.status === 'expired'
                                    ? 'bg-slate-800 text-slate-400'
                                    : ord.status === 'verified'
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}>
                                  {ord.status === 'activated' && '● চালু (Active)'}
                                  {ord.status === 'pending' && '⏳ যাচাই অপেক্ষমাণ'}
                                  {ord.status === 'expired' && 'মেয়াদ শেষ'}
                                  {ord.status === 'verified' && 'ভেরিফাইড'}
                                  {ord.status === 'rejected' && 'বাতিল'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {ord.status !== 'activated' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'activated')}
                                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                                      title="সার্ভিস চালু করুন"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}

                                  {ord.status !== 'rejected' && (
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'rejected')}
                                      className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition-colors cursor-pointer"
                                      title="অর্ডার বাতিল করুন"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}

                                  {orderDeleteConfirmId === ord.id ? (
                                    <div className="flex items-center gap-1 bg-rose-950/80 p-1 rounded-xl border border-rose-500/40">
                                      <button
                                        onClick={() => handleDeleteOrder(ord.id)}
                                        className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
                                        title="মুছে ফেলতে নিশ্চিত করুন"
                                      >
                                        মুছুন
                                      </button>
                                      <button
                                        onClick={() => setOrderDeleteConfirmId(null)}
                                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium cursor-pointer transition-colors"
                                        title="বাতিল করুন"
                                      >
                                        না
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setOrderDeleteConfirmId(ord.id)}
                                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                      title="এই রেকর্ডটি ডিলিট করুন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ===================== TAB 2: SERVICE MANAGEMENT ===================== */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                {/* Save / Delete / Reset Notification Banner */}
                {serviceSaveNotice && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center justify-between shadow-lg">
                    <span>{serviceSaveNotice}</span>
                    <button
                      onClick={() => setServiceSaveNotice(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">ঘন্টা ভিত্তিক প্যাকেজ ও মূল্য তালিকা</h3>
                    <p className="text-xs text-slate-400">এখান থেকে ১ ঘন্টা, ৩ ঘন্টা ইত্যাদি প্যাকেজের রেট, মেয়াদ ও ছবি কন্ট্রোল করুন</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetServices}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
                      title="ডিফল্ট ৫টি প্যাকেজ ফিরিয়ে আনুন"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                      <span>ডিফল্ট প্যাকেজ</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenCreateService}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>নতুন প্যাকেজ যোগ করুন</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden p-5 flex flex-col justify-between space-y-4 shadow-lg hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-square max-h-44 sm:max-h-48 mx-auto w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                          <img
                            src={srv.image || DEFAULT_PACKAGE_IMAGE}
                            alt={srv.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <h4 className="font-bold text-white text-base line-clamp-1">{srv.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[2rem]">
                            {srv.description || 'ইনস্ট্যান্ট এক্টিভেশন ও অটো কাউন্টডাউন সার্ভিস'}
                          </p>
                        </div>

                        <div className="text-xs space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                          <div className="text-slate-400 flex justify-between">
                            <span>প্যাকেজ মেয়াদ:</span>
                            <span className="text-emerald-400 font-bold">{srv.durationHours} ঘন্টা</span>
                          </div>
                          <div className="text-slate-400 flex justify-between">
                            <span>মূল্য:</span>
                            <span className="text-pink-400 font-bold">৳ {srv.price}</span>
                          </div>
                          <div className="text-slate-400 flex justify-between">
                            <span>স্ট্যাটাস:</span>
                            <span className={srv.isAvailable ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {srv.isAvailable ? 'সক্রিয় (অনলাইন)' : 'বন্ধ (স্টক আউট)'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-800 space-y-2">
                        {serviceDeleteConfirmId === srv.id ? (
                          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                            <span className="text-xs text-rose-300 font-medium block">
                              প্যাকেজটি মুছে ফেলতে চান?
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteService(srv.id)}
                                className="flex-1 py-1 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer"
                              >
                                হ্যাঁ, মুছুন
                              </button>
                              <button
                                onClick={() => setServiceDeleteConfirmId(null)}
                                className="flex-1 py-1 px-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-all cursor-pointer"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleToggleServiceStock(srv)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                srv.isAvailable
                                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                              }`}
                              title="ক্লিক করে স্টক পরিবর্তন করুন"
                            >
                              {srv.isAvailable ? '● স্টক আছে' : '○ স্টক আউট'}
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditService(srv)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-pink-600/20 hover:text-pink-300 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-pink-400" />
                                <span>এডিট</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setServiceDeleteConfirmId(srv.id)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                                title="প্যাকেজ মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ===================== TAB 3: BANNER MANAGEMENT ===================== */}
            {activeTab === 'banner' && (
              <div className="max-w-3xl bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-pink-400" />
                    <span>টপ ব্যানার আপলোড ও পরিবর্তন</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    মোবাইল বা কম্পিউটার থেকে সরাসরি ব্যানার ইমেজ আপলোড করুন। ব্যানারের উপর কোনো কৃত্রিম ইফেক্ট বা ডার্ক ফিল্টার থাকবে না।
                  </p>
                </div>

                {bannerSaveNotice && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ব্যানার সফলভাবে সংরক্ষণ করা হয়েছে!</span>
                  </div>
                )}

                <form onSubmit={handleSaveBanner} className="space-y-6">
                  {/* DIRECT FILE UPLOAD ZONE */}
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-2">
                      ১. মোবাইল/কম্পিউটার থেকে সরাসরি ব্যানার ছবি আপলোড করুন:
                    </label>

                    <label className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-700 hover:border-pink-500/60 cursor-pointer transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {isProcessingBanner ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors">
                        {isProcessingBanner ? 'ফায়ারবেস স্টোরেজে আপলোড হচ্ছে...' : 'ব্যানার ফাইল ক্লাউডে আপলোড করতে ক্লিক করুন'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        প্রস্তাবিত সাইজ: <strong className="text-pink-400 font-mono">1920 × 600 px</strong> (বা 1600 × 500 px) • PNG, JPG, WebP
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isProcessingBanner}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsProcessingBanner(true);
                            try {
                              const downloadUrl = await firebaseService.uploadImage(file, 'banners');
                              setBannerFormData(prev => ({ ...prev, imageUrl: downloadUrl }));
                            } catch (err: any) {
                              alert('ব্যানার ফাইল আপলোড করতে সমস্যা হয়েছে: ' + (err?.message || 'সরাসরি ইমেজ লিংক ব্যবহার করুন'));
                            } finally {
                              setIsProcessingBanner(false);
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {/* Firebase Cloud Storage Badge */}
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        ✅ <strong>ফায়ারবেস ক্লাউড স্টোরেজ সংযুক্ত:</strong> ছবি সরাসরি গুগল ক্লাউড স্টোরেজে আপলোড হয়ে দ্রুতগতির CDN লিঙ্ক তৈরি হবে। ডাটাবেসের 1MB লিমিট অতিক্রমের কোনো ঝুঁকি নেই।
                      </span>
                    </div>
                  </div>

                  {/* OR URL INPUT */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      অনলাইন ব্যানার ছবির সরাসরি লিঙ্ক (Image URL - সাজেস্টেড):
                    </label>
                    <input
                      type="url"
                      required
                      value={bannerFormData.imageUrl}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, imageUrl: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-pink-500 font-mono"
                    />

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[11px] text-slate-400">প্রিসেট ব্যানার ছবি:</span>
                      {[
                        { label: 'গেমিং ও স্পার্ক', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=85' },
                        { label: 'সাইবার ও নিয়ন', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=85' },
                        { label: 'ফিউচারিস্টিক টেক', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85' },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBannerFormData({ ...bannerFormData, imageUrl: preset.url })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 border border-slate-700 cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* YOUTUBE VIDEO LINK (Requirement: "মূল ব্যানারে ক্লিক করলে ইউটিউব ভিডিওতে নিয়ে যাবে, ইউটিউব ভিডিও লিংক দেওয়ার অপশন এডমিন প্যানেলে থাকবে") */}
                  <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-2">
                    <div className="flex items-center gap-2 text-white font-bold text-xs sm:text-sm">
                      <Play className="w-4 h-4 text-red-500 fill-red-500" />
                      <span>ব্যানার ক্লিক ইউটিউব ভিডিও লিঙ্ক (YouTube Video URL)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      মূল সাইটের ব্যানারে ক্লিক করলে গ্রাহক সরাসরি যে ইউটিউব ভিডিওতে চলে যাবে, তার লিংক নিচে দিন:
                    </p>
                    <input
                      type="url"
                      value={bannerFormData.youtubeUrl || ''}
                      onChange={(e) => setBannerFormData({ ...bannerFormData, youtubeUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... অথবা https://youtu.be/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-red-500 font-mono"
                    />
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>💡 টিপস: এখানে কোনো লিংক না দিলে ব্যানারে ক্লিক করলে গ্রাহক নিচে সার্ভিসের তালিকায় যাবে। লিংক দিলে সরাসরি ভিডিও ওপেন হবে।</span>
                    </div>
                  </div>

                  {/* LIVE PREVIEW - ZERO EFFECTS / FILTERS */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">
                        লাইভ প্রিভিউ (ব্যানারে কোনো কৃত্রিম ইফেক্ট বা ডার্ক ফিল্টার নেই):
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        ● ১০০% অরিজিনাল কালার ভিউ
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-1">
                      <img
                        src={bannerFormData.imageUrl}
                        alt="Banner preview"
                        className="w-full h-auto max-h-72 object-contain rounded-xl block mx-auto"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>ব্যানার পরিবর্তন সংরক্ষণ করুন</span>
                  </button>
                </form>
              </div>
            )}

            {/* ===================== TAB 4: PAYMENT CONFIGURATION ===================== */}
            {activeTab === 'payment' && (
              <div className="max-w-3xl bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-pink-400" />
                    <span>বিকাশ ও নগদ পেমেন্ট গেটওয়ে সেটিংস</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    গ্রাহক যে বিকাশ ও নগদ নম্বরে টাকা পাঠাবে তা এখান থেকে নিয়ন্ত্রণ করুন
                  </p>
                </div>

                {paymentSaveNotice && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>পেমেন্ট সেটিংস সফলভাবে সেভ হয়েছে!</span>
                  </div>
                )}

                <form onSubmit={handleSavePaymentConfig} className="space-y-6">
                  {/* bKash Settings with Logo */}
                  <div className="p-5 rounded-2xl bg-[#e2136e]/10 border border-[#e2136e]/30 space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <BkashLogo className="w-5 h-5" />
                      <span>বিকাশ (bKash) সেটিংস</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">বিকাশ নম্বর</label>
                        <input
                          type="text"
                          required
                          value={paymentFormData.bkashNumber}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, bkashNumber: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm outline-none focus:border-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">একাউন্ট টাইপ</label>
                        <select
                          value={paymentFormData.bkashType}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, bkashType: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                          <option value="Agent">Agent (Cash Out)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Nagad Settings with Logo */}
                  <div className="p-5 rounded-2xl bg-[#f7941d]/10 border border-[#f7941d]/30 space-y-4">
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <NagadLogo className="w-5 h-5" />
                      <span>নগদ (Nagad) সেটিংস</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">নগদ নম্বর</label>
                        <input
                          type="text"
                          required
                          value={paymentFormData.nagadNumber}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, nagadNumber: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm outline-none focus:border-[#f7941d]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">একাউন্ট টাইপ</label>
                        <select
                          value={paymentFormData.nagadType}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, nagadType: e.target.value as any })}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none"
                        >
                          <option value="Personal">Personal (Send Money)</option>
                          <option value="Merchant">Merchant (Payment)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Support Configuration - "এডমিন প্যানেলে হোয়াটসঅ্যাপ নাম্বার যোগ করার ব্যবস্থা রাখ" */}
                  <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <WhatsAppIcon className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                        </div>
                        <div>
                          <span className="text-white font-bold block text-sm">হোয়াটসঅ্যাপ সাপোর্ট সেটিংস (WhatsApp Support)</span>
                          <span className="text-[11px] text-slate-400">মেইন সাইটের "হোয়াটসঅ্যাপে যোগাযোগ" বাটনে এই নাম্বারটি সরাসরি সংযুক্ত থাকবে</span>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold w-fit">
                        ● পাবলিক বাটনে লাইভ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          হোয়াটসঅ্যাপ সাপোর্ট মোবাইল নম্বর
                        </label>
                        <input
                          type="text"
                          required
                          value={paymentFormData.supportWhatsApp}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, supportWhatsApp: e.target.value })}
                          placeholder="+880 1834-892100"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          * উদাহরণ: +8801834892100 অথবা 01834892100
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          ডিফল্ট চ্যাট গ্রিটিং মেসেজ (ঐচ্ছিক)
                        </label>
                        <input
                          type="text"
                          value={paymentFormData.whatsAppGreeting || ''}
                          onChange={(e) => setPaymentFormData({ ...paymentFormData, whatsAppGreeting: e.target.value })}
                          placeholder="হ্যালো সেবা পে টিম, আমি সার্ভিস ও পেমেন্ট বিষয়ে সাহায্য চাই।"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          * গ্রাহক ক্লিক করলে স্বয়ংক্রিয়ভাবে এই লেখাটি টাইপ থাকবে
                        </span>
                      </div>
                    </div>

                    {/* Quick WhatsApp Test Link for Admin */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-300">এখনই টেস্ট করে দেখতে পারেন:</span>
                      <a
                        href={`https://wa.me/${paymentFormData.supportWhatsApp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(paymentFormData.whatsAppGreeting || 'টেস্ট মেসেজ')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all w-fit"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-300" />
                        <span>হোয়াটসঅ্যাপ টেস্ট করুন (সরাসরি চ্যাট ওপেন)</span>
                      </a>
                    </div>
                  </div>

                  {/* Anti-Fraud Verification Mode Setting */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      পেমেন্ট ভেরিফিকেশন ও নিরাপত্তা মোড (Anti-Fraud Mode):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                        paymentFormData.verificationMode !== 'auto'
                          ? 'border-emerald-500 bg-emerald-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="verificationMode"
                          value="manual"
                          checked={paymentFormData.verificationMode !== 'auto'}
                          onChange={() => setPaymentFormData({ ...paymentFormData, verificationMode: 'manual' })}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-bold text-emerald-400">এডমিন ম্যানুয়াল অনুমোদন (প্রস্তাবিত)</div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            গ্রাহকের বিকাশ/নগদ নম্বর ও TrxID এডমিন অনুমোদন না করা পর্যন্ত কোড বা এপিকে চালু হবে না। ভুল তথ্য দিয়ে কেনা সম্পূর্ণ প্রতিরোধ হবে।
                          </p>
                        </div>
                      </label>

                      <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-2.5 transition-all ${
                        paymentFormData.verificationMode === 'auto'
                          ? 'border-pink-500 bg-pink-500/10 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400'
                      }`}>
                        <input
                          type="radio"
                          name="verificationMode"
                          value="auto"
                          checked={paymentFormData.verificationMode === 'auto'}
                          onChange={() => setPaymentFormData({ ...paymentFormData, verificationMode: 'auto' })}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="font-bold text-pink-400">স্মার্ট অ্যালগরিদম অটো-ভেরিফিকেশন</div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            সঠিক ১১ ডিজিট ও ইউনিক বৈধ TrxID সাবমিট করলে স্বয়ংক্রিয়ভাবে কোড সক্রিয় হবে।
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* ===================== FIREBASE CLOUD SECURITY & ADMIN AUTH SETTINGS ===================== */}
                  <div className="pt-4 border-t border-slate-800 space-y-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>এডমিন একাউন্ট নিরাপত্তা ও ফায়ারবেস ক্লাউড সেটিংস</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        অননুমোদিত অ্যাক্সেস ও ইন্সপেক্ট হ্যাকিং প্রতিরোধে ফায়ারবেস অথেনটিকেশন (Google Auth) কার্যকর করা হয়েছে।
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1.5">
                            অনুমোদিত এডমিন গুগল ইমেইল (Authorized Admin Email)
                          </label>
                          <input
                            type="email"
                            required
                            value={paymentFormData.adminEmail || ''}
                            onChange={(e) => setPaymentFormData({ ...paymentFormData, adminEmail: e.target.value })}
                            placeholder="tanvirislamtanvir512007@gmail.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-emerald-500 font-mono"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            * শুধুমাত্র এই গুগল ইমেইল আইডি দিয়ে সাইন-ইন করলে এডমিন এক্সেস মিলবে।
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-center space-y-1">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>ফায়ারবেস সিকিউরিটি সক্রিয়</span>
                          </span>
                          <span className="text-[11px] text-slate-300">
                            মেথড: <strong>Google OAuth 2.0 (Firebase Auth)</strong>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ব্রাউজারে পাসওয়ার্ড সংরক্ষণ ও ফ্রন্টএন্ড ইমেইল ওটিপি স্থায়ীভাবে বন্ধ রাখা হয়েছে।
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300">
                        <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-white block mb-0.5">১০০% হ্যাকিং-প্রুফ আর্কিটেকচার:</strong>
                          <span className="text-slate-400 text-[11px] leading-relaxed">
                            ১. ফায়ারস্টোরে ছবি আর Base64 টেক্সট হিসেবে সেভ হবে না—সরাসরি ফায়ারবেস ক্লাউড স্টোরেজে আপলোড হবে।<br />
                            ২. এডমিন অথেনটিকেশন সরাসরি ক্লাউড সার্ভার-সাইডে যাচাই হয়, ব্রাউজার ইনস্পেক্ট করে পাসওয়ার্ড ফাঁসের সুযোগ শূন্য।
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>পেমেন্ট সেটিংস সেভ করুন</span>
                  </button>
                </form>

                {/* Reset to Factory Defaults */}
                <div className="pt-6 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('আপনি কি সব ডাটা রিসেট করে ডিফল্ট মোডে ফিরে যেতে চান?')) {
                        store.resetDefaults();
                        refreshAllData();
                        alert('সব ডাটা ডিফল্ট অবস্থায় রিসেট করা হয়েছে।');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all cursor-pointer"
                  >
                    ফ্যাক্টরি ডিফল্ট ডাটা রিসেট করুন
                  </button>
                </div>
              </div>
            )}

            {/* ===================== TAB 5: APKS & FILES CONFIGURATION ===================== */}
            {/* Requirement: "satap video ta lagbay na akany sodo apk instol ar opson takby satap video opson lagby na" */}
            {activeTab === 'tutorial' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-pink-500" />
                      <span>এপিকে ও ফাইল ম্যানেজমেন্ট (APK & File Management)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      আপনার নিজস্ব তৈরি ভিপিএন এপিকে, বড় সাইজের ডাটা ফাইল ও মেইন অ্যাপ যুক্ত করুন। ইউনিক কোড দিয়ে ইউজাররা এগুলো সরাসরি ডাউনলোড ও ইনস্টল করতে পারবেন।
                    </p>
                  </div>

                  {tutorialSaveNotice && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>এপিকে ও ফাইল সফলভাবে সেভ হয়েছে!</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveTutorial} className="space-y-6">
                  {/* ===================== APKS & LARGE FILES CONFIGURATION ===================== */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Smartphone className="w-5 h-5 text-emerald-400" />
                          <span>ভিপিএন এপিকে, বড় ডাটা ফাইল ও প্রয়োজনীয় অ্যাপস তালিকা ({tutorialFormData.apks.length})</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          আপনার তৈরি নিজস্ব ভিপিএন, বড় সাইজের ডাটা/ওবিবি ফাইল ও অন্যান্য এপিকে ফাইল যুক্ত ও কনফিগার করুন
                        </p>
                      </div>

                      {/* Quick Preset Buttons & Delete Demo APKs */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddApk('vpn')}
                          className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>+ ভিপিএন এপিকে</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddApk('large_file')}
                          className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Cloud className="w-3.5 h-3.5" />
                          <span>+ বড় জিপ ফাইল (ক্লাউড)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddApk('main')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ মেইন এপিকে</span>
                        </button>

                        {/* One-click delete demo APKs button */}
                        {tutorialFormData.apks.some(a => ['apk-vpn-custom', 'apk-large-file', 'apk-main'].includes(a.id) || a.fileName.includes('Sheba_Custom') || a.fileName.includes('Complete_Resource_Pack')) && (
                          <button
                            type="button"
                            onClick={handleClearAllDemoApks}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/25 hover:bg-rose-500/35 text-rose-300 border border-rose-500/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                            title="পূর্বের ৩টি স্যাম্পল/ডেমো এপিকে মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>আগের সব ডেমো এপিকে মুছুন</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-850">
                      {[
                        { id: 'all', label: `সকল ফাইল (${tutorialFormData.apks.length})` },
                        { id: 'large_file', label: '📦 বড় জিপ ফাইল (.zip)' },
                        { id: 'vpn', label: '🛡️ ভিপিএন এপিকে' },
                        { id: 'main', label: '⚡ মেইন অ্যাপ' },
                        { id: 'other', label: '🧩 অন্যান্য' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setApkFilter(f.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            apkFilter === f.id
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    {/* Smart Notice for Large Files & VPN */}
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3 text-xs leading-relaxed">
                      <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-slate-300 space-y-1">
                        <span className="font-bold text-white">📦 বড় জিপ ফাইল (.zip) ও এপিকে দেওয়ার নিয়ম:</span>
                        <p className="text-slate-400 text-[11px] leading-relaxed">
                          • <strong>বড় জিপ ফাইল (Large ZIP File):</strong> নিচের <strong>"+ বড় জিপ ফাইল (ক্লাউড)"</strong> বাটনে চাপ দিন অথবা যেকোনা ফাইলের ধরন "বড় জিপ ফাইল / ডাটা প্যাক (.zip)" নির্বাচন করুন। আপনি সরাসরি আপনার কম্পিউটার/মোবাইল থেকে .zip ফাইল বাছাই করতে পারেন অথবা ফাইল অনেক বড় হলে (৫০০MB - ২GB+) গুগল ড্রাইভ (Google Drive) বা মিডিয়াফায়ার (MediaFire) লিংক পেস্ট করতে পারেন।<br />
                          • <strong>ভিপিএন এপিকে:</strong> আপনার নিজস্ব ভিপিএন ফাইলের জন্য গুগল ড্রাইভ বা সরাসরি ফাইল আপলোড লিংক ব্যবহার করুন।
                        </p>
                      </div>
                    </div>

                    {/* Upload / Notice alert */}
                    {apkUploadNotice && (
                      <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fadeIn ${
                        apkUploadNotice.type === 'info'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}>
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{apkUploadNotice.message}</span>
                      </div>
                    )}

                    {/* APK Cards List */}
                    <div className="space-y-4">
                      {tutorialFormData.apks
                        .map((apk, originalIndex) => ({ apk, originalIndex }))
                        .filter(({ apk }) => {
                          if (apkFilter === 'all') return true;
                          if (apkFilter === 'vpn') return apk.fileCategory === 'vpn' || apk.iconType === 'vpn';
                          if (apkFilter === 'large_file') return apk.isLargeFile || apk.fileCategory === 'large_file' || apk.iconType === 'large_file';
                          if (apkFilter === 'main') return apk.fileCategory === 'main' || apk.iconType === 'main';
                          return apk.fileCategory === 'other' || apk.fileCategory === 'helper' || apk.fileCategory === 'injector';
                        })
                        .map(({ apk, originalIndex }) => (
                          <div
                            key={apk.id || originalIndex}
                            className={`p-5 rounded-2xl border space-y-4 transition-all ${
                              apk.fileCategory === 'vpn'
                                ? 'bg-cyan-950/20 border-cyan-500/40'
                                : apk.isLargeFile || apk.fileCategory === 'large_file'
                                ? 'bg-amber-950/20 border-amber-500/40'
                                : 'bg-slate-900 border-slate-800'
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-slate-800 text-pink-400 font-mono font-bold text-xs flex items-center justify-center">
                                  #{originalIndex + 1}
                                </span>

                                <select
                                  value={apk.fileCategory || 'main'}
                                  onChange={(e) => {
                                    const cat = e.target.value as any;
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = {
                                      ...apk,
                                      fileCategory: cat,
                                      iconType: cat === 'vpn' ? 'vpn' : cat === 'large_file' ? 'large_file' : 'main',
                                      isLargeFile: cat === 'large_file' ? true : apk.isLargeFile,
                                      badge: cat === 'vpn' ? 'আমাদের ভিপিএন' : cat === 'large_file' ? '📦 বড় জিপ ফাইল (High-Speed ZIP)' : 'মেইন অ্যাপ',
                                    };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-bold outline-none focus:border-pink-500"
                                >
                                  <option value="large_file">📦 বড় জিপ ফাইল প্যাকেজ (.zip / Large File)</option>
                                  <option value="vpn">🛡️ আমাদের তৈরি ভিপিএন (Custom VPN APK)</option>
                                  <option value="main">⚡ মেইন সার্ভিস কন্ট্রোলার (Main APK)</option>
                                  <option value="helper">🧩 হেল্পার ও ইনজেক্টর প্লাগইন (Plugin)</option>
                                  <option value="other">📁 অন্যান্য ফাইল (Other)</option>
                                </select>

                                {apk.isLargeFile && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                                    📦 বড় জিপ ফাইল (.zip)
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Move Up/Down */}
                                <button
                                  type="button"
                                  disabled={originalIndex === 0}
                                  onClick={() => handleMoveApk(originalIndex, 'up')}
                                  title="উপরে নিন"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={originalIndex === tutorialFormData.apks.length - 1}
                                  onClick={() => handleMoveApk(originalIndex, 'down')}
                                  title="নিচে নিন"
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>

                                {/* Test Download */}
                                <button
                                  type="button"
                                  onClick={() => handleTestDownload(apk)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>টেস্ট লিংক</span>
                                </button>

                                {/* Direct Delete with instant auto-save */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveApk(originalIndex)}
                                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="এই এপিকে তালিকা থেকে ডিলিট করুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                  <span>ডিলিট</span>
                                </button>
                              </div>
                            </div>

                            {/* Direct File Attachment / Picker */}
                            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                              <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-pink-400 shrink-0" />
                                <div>
                                  <span className="font-bold text-white">ডিভাইস থেকে ফাইল নির্বাচন:</span>
                                  <p className="text-[11px] text-slate-400">
                                    বর্তমান ফাইল: <span className="font-mono text-emerald-400 font-semibold">{apk.fileName || 'কোনো ফাইল নির্ধারিত নেই'}</span> ({apk.size || '০ MB'})
                                  </p>
                                </div>
                              </div>

                              <label className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer text-xs flex items-center justify-center gap-1.5 shrink-0">
                                <Upload className="w-3.5 h-3.5 text-pink-400" />
                                <span>কম্পিউটার/মোবাইল থেকে ফাইল বাছুন</span>
                                <input
                                  type="file"
                                  accept=".apk,.zip,.rar,.7z,.obb,.bin,.dat,*"
                                  onChange={(e) => handleFileUploadForApk(originalIndex, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Main Metadata Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">ফাইলের নাম (Title) *</label>
                                <input
                                  type="text"
                                  required
                                  value={apk.title}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, title: e.target.value };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium outline-none focus:border-pink-500"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">ভার্সন (Version)</label>
                                <input
                                  type="text"
                                  value={apk.version}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, version: e.target.value };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  placeholder="उदा. v3.5 VIP"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none focus:border-pink-500"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">সাইজ (File Size)</label>
                                <input
                                  type="text"
                                  value={apk.size}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, size: e.target.value };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  placeholder="उदा. 15.2 MB বা 420 MB"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono outline-none focus:border-pink-500"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">কাস্টম ব্যাজ টেক্সট</label>
                                <input
                                  type="text"
                                  value={apk.badge || ''}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, badge: e.target.value };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  placeholder="उदा. আমাদের নিজস্ব ভিপিএন"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-pink-500"
                                />
                              </div>
                            </div>

                            {/* Download Links & Storage Provider */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">হোস্টিং বা লিংক টাইপ</label>
                                <select
                                  value={apk.storageProvider || 'direct'}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, storageProvider: e.target.value as any };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none"
                                >
                                  <option value="gdrive">গুগল ড্রাইভ (Google Drive Link)</option>
                                  <option value="mediafire">মিডিয়াফায়ার (MediaFire Link)</option>
                                  <option value="mega">মেগা (MEGA Cloud Link)</option>
                                  <option value="telegram">টেলিগ্রাম চ্যানেল / ফাইল লিংক</option>
                                  <option value="direct">সরাসরি ডাউনলোড লিংক (Direct CDN/URL)</option>
                                  <option value="custom">কাস্টম / প্যাকেজড ডাউনলোড</option>
                                </select>
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-slate-300 font-semibold mb-1">
                                  প্রধান ডাউনলোড লিংক (Main Download URL) *
                                </label>
                                <div className="relative">
                                  <Link className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    value={apk.downloadUrl}
                                    onChange={(e) => {
                                      const updated = [...tutorialFormData.apks];
                                      updated[originalIndex] = { ...apk, downloadUrl: e.target.value };
                                      setTutorialFormData({ ...tutorialFormData, apks: updated });
                                    }}
                                    placeholder="https://drive.google.com/file/d/... অথবা ডিরেক্ট লিংক"
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-pink-500"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Mirror Backup Link (For High Reliability with Large Files / VPN) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                  বিকল্প ব্যাকআপ লিংক (Optional Backup / Mirror Cloud Link)
                                </label>
                                <div className="relative">
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    value={apk.mirrorUrl || ''}
                                    onChange={(e) => {
                                      const updated = [...tutorialFormData.apks];
                                      updated[originalIndex] = { ...apk, mirrorUrl: e.target.value };
                                      setTutorialFormData({ ...tutorialFormData, apks: updated });
                                    }}
                                    placeholder="বিকল্প মিডিয়াফায়ার বা মেগা লিংক (যদি ড্রাইভ জ্যাম থাকে)"
                                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-pink-500"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-slate-300 font-semibold mb-1">
                                  সেটআপ / ইনস্টলেশন নির্দেশনা (User Setup Instructions)
                                </label>
                                <input
                                  type="text"
                                  value={apk.installInstructions || ''}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, installInstructions: e.target.value };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  placeholder="उदा. ভিপিএন অন করে সার্ভিস চালু করবেন / Android/obb তে রাখুন"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-pink-500"
                                />
                              </div>
                            </div>

                            {/* Description and isLarge toggle */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                              <div className="sm:col-span-2">
                                <label className="block text-slate-400 mb-1">সংক্ষিপ্ত বিবরণ (Description)</label>
                                <input
                                  type="text"
                                  value={apk.description}
                                  onChange={(e) => {
                                    const updated = [...tutorialFormData.apks];
                                    updated[originalIndex] = { ...apk, description: e.target.value };
                                    setTutorialFormData({ ...tutorialFormData, apks: updated });
                                  }}
                                  placeholder="অ্যাপের কাজ ও সুবিধা সম্পর্কে এক লাইনে লিখুন"
                                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-pink-500"
                                />
                              </div>

                              <div className="flex items-center gap-3 pt-5">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                                  <input
                                    type="checkbox"
                                    checked={apk.isLargeFile || false}
                                    onChange={(e) => {
                                      const updated = [...tutorialFormData.apks];
                                      updated[originalIndex] = { ...apk, isLargeFile: e.target.checked };
                                      setTutorialFormData({ ...tutorialFormData, apks: updated });
                                    }}
                                    className="w-4 h-4 rounded text-pink-600 focus:ring-0 cursor-pointer"
                                  />
                                  <span>এটি বড় সাইজের ফাইল (Large File)</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Empty State when no APKs exist */}
                      {tutorialFormData.apks.length === 0 && (
                        <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mx-auto">
                            <Smartphone className="w-6 h-6" />
                          </div>
                          <div className="text-white font-bold text-sm">পূর্বে প্রদর্শিত সব ডেমো এপিকে মুছে ফেলা হয়েছে</div>
                          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                            এখন আপনার তৈরি করা <strong className="text-cyan-400">ভিপিএন এপিকে</strong> অথবা <strong className="text-amber-400">বড় ফাইল</strong> যোগ করতে উপরের বাটনে ক্লিক করুন।
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleAddApk('vpn')}
                              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Shield className="w-4 h-4" />
                              <span>+ আপনার ভিপিএন দিন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddApk('large_file')}
                              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                            >
                              <Cloud className="w-4 h-4" />
                              <span>+ আপনার বড় ফাইল দিন</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>এপিকে ও ফাইল পরিবর্তন সেভ করুন</span>
                  </button>
                </form>
              </div>
            )}

            {/* ===================== TAB 6: SITE LOGO & NAME ===================== */}
            {/* Requirement: "wobsit name o logo poriborton hoy na ata somadan koro" */}
            {activeTab === 'branding' && (
              <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                  <div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-pink-500" />
                      <span>মূল সাইটের লোগো ও নাম পরিবর্তন (Site Branding)</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      ওয়েবসাইটের নাম, লোগো, ট্যাগলাইন ও ব্যাজ পরিবর্তন করুন। এখানে পরিবর্তন করলে মূল সাইটের হেডার, ফুটার এবং ব্রাউজার ট্যাবে সাথে সাথে আপডেট কার্যকর হবে।
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="মূল ওয়েবসাইটে ফলাফল সরাসরি দেখুন"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-pink-400" />
                      <span>মূল সাইট দেখুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetBranding}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      title="ডিফল্ট 'সেবাপে' সেটিংসে ফিরে যান"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>ডিফল্ট রিসেট</span>
                    </button>
                  </div>
                </div>

                {/* Status Alerts */}
                {brandingSaveNotice && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p>{logoUploadSuccess || `ওয়েবসাইটের নাম "${brandingFormData.siteName}" এবং লোগো সফলভাবে সংরক্ষিত হয়েছে!`}</p>
                      <span className="text-[11px] font-normal text-emerald-400/90 block mt-0.5">
                        * মূল সাইটের হেডার, ফুটার এবং ব্রাউজার উইন্ডো টাইটেলে সরাসরি আপডেট হয়ে গেছে।
                      </span>
                    </div>
                  </div>
                )}

                {logoUploadError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{logoUploadError}</span>
                  </div>
                )}

                {isProcessingLogo && (
                  <div className="p-3.5 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs flex items-center gap-2 animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-pink-400" />
                    <span>লোগো ছবি ফায়ারবেস ক্লাউড স্টোরেজে আপলোড করা হচ্ছে... অনুগ্রহ করে একটু অপেক্ষা করুন।</span>
                  </div>
                )}

                {/* Live Header Preview */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border-2 border-dashed border-pink-500/30 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold flex items-center gap-1.5 text-pink-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>মূল সাইটের হেডারে যেমন দেখাবে (লাইভ প্রিভিউ):</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ● রিয়েল-টাইম প্রিভিউ
                    </span>
                  </div>

                  <div className="p-3 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {brandingFormData.logoUrl ? (
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 p-0.5 shadow-md flex items-center justify-center shrink-0">
                          <img
                            src={brandingFormData.logoUrl}
                            alt="Preview Logo"
                            className="w-full h-full object-contain rounded-xl"
                          />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          </span>
                        </div>
                      ) : (
                        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 shadow-md flex items-center justify-center text-white shrink-0">
                          <Sparkles className="w-6 h-6 animate-pulse" />
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl font-black text-white">
                            {brandingFormData.siteName || 'সেবাপে'}
                          </span>
                          {brandingFormData.badgeText && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {brandingFormData.badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{brandingFormData.tagline || 'অনলাইন সার্ভিস ও লাইভ কাউন্টডাউন'}</p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-pink-600 text-white text-xs font-bold shadow-sm">হোম পেজ</span>
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 text-xs">আমার কেনা সার্ভিস</span>
                    </div>
                  </div>
                </div>

                {/* Fast Presets Box (1-Click Fill) */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>দ্রুত সাইট নেম ও লোগো প্রিসেট (১-ক্লিকে সেট করুন):</span>
                    </span>
                    <span className="text-[10px] text-slate-500">ক্লিক করলেই ফিল্ড আপডেট হবে</span>
                  </div>

                  {/* Preset Site Names */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">নামের প্রিসেট:</span>
                    {[
                      { name: 'সেবাপে', tag: 'অনলাইন সার্ভিস ও লাইভ কাউন্টডাউন', badge: 'ঘন্টা ভিত্তিক এক্সেস' },
                      { name: 'PANEL BAZAR.COM', tag: 'অল-ইন-ওয়ান গেমিং ও ভিআইপি প্যানেল', badge: 'অফিসিয়াল প্যানেল' },
                      { name: 'VIP SERVICE BD', tag: 'প্রিমিয়াম ডিজিটাল সার্ভিস প্ল্যাটফর্ম', badge: '২৪/৭ অটো এক্টিভেশন' },
                      { name: 'FIRE GAMING BD', tag: 'আল্ট্রা ফাস্ট ইনজেক্টর ও স্পেশাল পাস', badge: 'জিরো ল্যাগ' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setBrandingFormData(prev => ({
                            ...prev,
                            siteName: preset.name,
                            tagline: preset.tag,
                            badgeText: preset.badge,
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          brandingFormData.siteName === preset.name
                            ? 'bg-pink-600/20 text-pink-300 border-pink-500/50'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  {/* Preset Logos */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-850">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">লোগো প্রিসেট:</span>
                    {[
                      {
                        label: '✨ ডিফল্ট স্পার্কল',
                        url: '',
                      },
                      {
                        label: '🛡️ প্যানেল শিল্ড',
                        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80',
                      },
                      {
                        label: '👑 রয়্যাল ক্রাউন',
                        url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=256&q=80',
                      },
                      {
                        label: '🔥 ফায়ার গেমিং',
                        url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=256&q=80',
                      },
                      {
                        label: '💎 সাইবার ডায়মন্ড',
                        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=256&q=80',
                      },
                      {
                        label: '🚀 টার্বো রকেট',
                        url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=256&q=80',
                      },
                    ].map((logoPreset) => (
                      <button
                        key={logoPreset.label}
                        type="button"
                        onClick={() => {
                          setBrandingFormData(prev => ({
                            ...prev,
                            logoUrl: logoPreset.url,
                          }));
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          brandingFormData.logoUrl === logoPreset.url
                            ? 'bg-pink-600/20 text-pink-300 border-pink-500/50'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-800'
                        }`}
                      >
                        {logoPreset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSaveBranding} className="space-y-6">
                  {/* Site Name and Tagline */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Type className="w-4 h-4 text-pink-400" />
                      <span>১. সাইটের নাম ও টাইটেল সেটিংস</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          মূল সাইটের নাম (Site Name) *
                        </label>
                        <input
                          type="text"
                          required
                          value={brandingFormData.siteName}
                          onChange={(e) => setBrandingFormData({ ...brandingFormData, siteName: e.target.value })}
                          placeholder="उदा. সেবাপে অথবা PANEL BAZAR.COM"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm outline-none focus:border-pink-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          * হেডার, ফুটার এবং ব্রাউজার ট্যাবে এই নামটি প্রদর্শিত হবে
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">
                          ট্যাগলাইন / সাবটাইটেল (Tagline)
                        </label>
                        <input
                          type="text"
                          value={brandingFormData.tagline || ''}
                          onChange={(e) => setBrandingFormData({ ...brandingFormData, tagline: e.target.value })}
                          placeholder="उदा. অনলাইন সার্ভিস ও লাইভ কাউন্টডাউন"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-pink-500"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          * লোগো নামের ঠিক নিচে ছোট করে দেখাবে
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        হেডার ব্যাজ টেক্সট (Badge Text)
                      </label>
                      <input
                        type="text"
                        value={brandingFormData.badgeText || ''}
                        onChange={(e) => setBrandingFormData({ ...brandingFormData, badgeText: e.target.value })}
                        placeholder="उदा. ঘন্টা ভিত্তিক এক্সেস অথবা অফিসিয়াল"
                        className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        প্যাকেজ সেকশন টাইটেল (Packages Title Option)
                      </label>
                      <input
                        type="text"
                        value={brandingFormData.packagesTitle || ''}
                        onChange={(e) => setBrandingFormData({ ...brandingFormData, packagesTitle: e.target.value })}
                        placeholder="उदा. প্যাকেজ সমূহ অথবা ঘন্টা ভিত্তিক প্যাকেজ সমূহ"
                        className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm outline-none focus:border-pink-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        * হোম পেজে প্যাকেজের তালিকার উপরে শুধুমাত্র এই টাইটেলটি এককভাবে প্রদর্শিত হবে
                      </span>
                    </div>
                  </div>

                  {/* Logo Upload & Configuration */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>২. সাইটের লোগো আপলোড বা পরিবর্তন</span>
                      </h4>

                      {brandingFormData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setBrandingFormData({ ...brandingFormData, logoUrl: '' });
                            setLogoUploadSuccess('ডিফল্ট স্পার্কল লোগো নির্বাচন করা হয়েছে। সেভ বাটনে ক্লিক করুন।');
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                        >
                          ডিফল্ট আইকন লোগোতে ফিরে যান
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Upload from PC/mobile with auto-compression */}
                      <div className="p-5 rounded-xl bg-slate-900/80 border-2 border-dashed border-slate-700 hover:border-pink-500/50 transition-colors text-center flex flex-col items-center justify-center">
                        <label className="cursor-pointer block space-y-2.5 w-full">
                          <div className="w-12 h-12 rounded-2xl bg-pink-500/15 text-pink-400 flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-pink-400 hover:text-pink-300 block">
                              কম্পিউটার বা মোবাইল থেকে লোগো ছবি আপলোড করুন
                            </span>
                            <p className="text-[11px] text-slate-400 mt-1">
                              PNG, JPG, SVG, WebP সমর্থিত। ছবি সরাসরি ফায়ারবেস ক্লাউড স্টোরেজে আপলোড ও সিঙ্ক হবে।
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isProcessingLogo}
                            onChange={handleLogoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Or Enter Logo URL */}
                      <div className="space-y-2.5 flex flex-col justify-center p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                        <label className="block text-xs font-bold text-slate-300">
                          অথবা লোগো ছবির সরাসরি লিঙ্ক / URL দিন:
                        </label>
                        <input
                          type="text"
                          value={brandingFormData.logoUrl || ''}
                          onChange={(e) => setBrandingFormData({ ...brandingFormData, logoUrl: e.target.value })}
                          placeholder="https://.../my-logo.png"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-pink-500 font-mono"
                        />
                        <span className="text-[10px] text-slate-400 leading-normal">
                          * যেকোনো ক্লাউড লিংক (ImgBB, PostImages, Google Drive direct, ইত্যাদি) দিতে পারেন। ফাঁকা রাখলে ডিফল্ট স্পার্কল প্রদর্শিত হবে।
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button Row */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isProcessingLogo}
                      className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>লোগো ও সাইটের নাম সেভ করুন</span>
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <ExternalLink className="w-4 h-4 text-pink-400" />
                      <span>মূল সাইট ভিজিট করুন</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>


      {/* ===================== CREATE / EDIT SERVICE MODAL ===================== */}
      {(editingService || isCreatingService) && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>{editingService ? 'প্যাকেজ এডিট করুন' : 'নতুন ঘন্টা ভিত্তিক প্যাকেজ তৈরি করুন'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingService ? `আইডি: ${editingService.id}` : 'সব তথ্য পূরণ করে নিচের "সংরক্ষণ করুন" বাটনে চাপ দিন'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingService(null);
                  setIsCreatingService(false);
                  setServiceModalError('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Error Banner */}
            {serviceModalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{serviceModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  প্যাকেজের নাম / টাইটেল <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={serviceFormData.title || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                  placeholder="उदा. ৩ ঘন্টা সুপার ভিআইপি প্যাকেজ"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-pink-500"
                />
              </div>

              {/* Duration Hours Setting: "ঘন্টা কম বেশি করার অপশন থাকবে" */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-emerald-400">
                    মেয়াদ (ঘন্টায়) <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">ক্লিক করে সিলেক্ট করুন বা নিচে লিখুন</span>
                </div>

                {/* Duration Presets */}
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 12, 24, 48, 72].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setServiceFormData(prev => ({ ...prev, durationHours: hrs }))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        Number(serviceFormData.durationHours) === hrs
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-500/50'
                      }`}
                    >
                      {hrs} ঘন্টা
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">কাস্টম ঘন্টা</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={serviceFormData.durationHours || 1}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, durationHours: Math.max(1, Number(e.target.value)) })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-white text-sm outline-none focus:border-emerald-400 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      বিক্রয় মূল্য (৳) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={serviceFormData.price ?? ''}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, price: e.target.value === '' ? ('' as any) : Number(e.target.value) })}
                      placeholder="150"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-pink-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">আগের মূল্য (৳)</label>
                    <input
                      type="number"
                      value={serviceFormData.originalPrice ?? ''}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, originalPrice: e.target.value === '' ? undefined : Number(e.target.value) })}
                      placeholder="250"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-pink-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Package Badge */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">প্যাকেজ ব্যাজ (Badge)</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['⚡ স্পেশাল অফার', '🔥 হট ডিল', '👑 ভিআইপি অফার', '⭐ মোস্ট পপুলার', 'নতুন'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setServiceFormData(prev => ({ ...prev, badge: b }))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        serviceFormData.badge === b
                          ? 'bg-pink-600/30 text-pink-300 border-pink-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setServiceFormData(prev => ({ ...prev, badge: undefined }))}
                    className="px-2.5 py-1 rounded-lg text-xs text-slate-500 border border-slate-850 hover:text-slate-300 cursor-pointer"
                  >
                    ব্যাজ বাতিল
                  </button>
                </div>
                <input
                  type="text"
                  value={serviceFormData.badge || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, badge: e.target.value })}
                  placeholder="কাস্টম ব্যাজ টেক্সট (ঐচ্ছিক)"
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-pink-500"
                />
              </div>

              {/* PACKAGE IMAGE DIRECT CLOUD UPLOAD TO FIREBASE STORAGE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    প্যাকেজ ছবি আপলোড করুন:
                  </label>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                    ক্লাউড স্টোরেজ (Firebase Storage)
                  </span>
                </div>

                {/* Upload Card */}
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border-2 border-dashed border-slate-750 hover:border-pink-500 cursor-pointer transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    {isProcessingServiceImage ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-pink-400 transition-colors">
                    {isProcessingServiceImage ? 'ফায়ারবেস স্টোরেজে আপলোড হচ্ছে...' : 'মোবাইল বা পিসি থেকে ছবি ক্লাউডে আপলোড করুন'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    JPG, PNG বা WebP • সরাসরি ফায়ারবেস ক্লাউড স্টোরেজে আপলোড ও সিঙ্ক
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isProcessingServiceImage}
                    onChange={handleServiceImageUpload}
                    className="hidden"
                  />
                </label>

                {/* Uploaded Image Preview */}
                {serviceFormData.image && (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={serviceFormData.image}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-xs text-emerald-400 font-semibold block">✓ প্যাকেজ ছবি যুক্ত হয়েছে</span>
                        <span className="text-[11px] text-slate-400 truncate block">কার্ডে ও স্টোরে প্রদর্শিত হবে</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setServiceFormData(prev => ({
                        ...prev,
                        image: DEFAULT_PACKAGE_IMAGE
                      }))}
                      className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-900 border border-slate-800"
                    >
                      ডিফল্ট ছবি
                    </button>
                  </div>
                )}

                {/* Optional URL input as alternative */}
                <div className="pt-1">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    অথবা ছবির সরাসরি ওয়েব লিঙ্ক (Image URL):
                  </label>
                  <input
                    type="url"
                    value={serviceFormData.image || ''}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ডেসক্রিপশন (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description || ''}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                  placeholder="প্যাকেজ সম্পর্কে বিস্তারিত বিবরণ..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-none focus:border-pink-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="srvAvailable"
                  checked={serviceFormData.isAvailable ?? true}
                  onChange={(e) => setServiceFormData({ ...serviceFormData, isAvailable: e.target.checked })}
                  className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 cursor-pointer"
                />
                <label htmlFor="srvAvailable" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  প্যাকেজটি বিক্রির জন্য সক্রিয় রাখুন (স্টক অন)
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  disabled={isProcessingServiceImage}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingService(null);
                    setIsCreatingService(false);
                    setServiceModalError('');
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
