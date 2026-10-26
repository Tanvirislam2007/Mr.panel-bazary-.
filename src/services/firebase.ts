import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { Order, Service, SiteBrandingConfig, BannerConfig, PaymentConfig, SetupTutorialConfig } from '../types';

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore with explicit databaseId (MANDATORY)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// 3. Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 4. Initialize Firebase Storage
export const storage = getStorage(app);

// 4. Firestore Error Handling Protocol
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 5. Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline. Checking network...");
    }
    return false;
  }
}

// 6. Realtime Subscriptions & CRUD Helpers
export const firebaseService = {
  // Listen to orders collection in real-time across devices
  subscribeOrders(onUpdate: (orders: Order[]) => void, onError?: (err: any) => void): Unsubscribe {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q, 
      (snapshot) => {
        const orders: Order[] = [];
        snapshot.forEach((docSnap) => {
          orders.push(docSnap.data() as Order);
        });
        onUpdate(orders);
      },
      (error) => {
        console.warn('Orders subscription error:', error);
        if (onError) onError(error);
      }
    );
  },

  // Save or update an order in Firestore
  async saveOrder(order: Order): Promise<void> {
    const path = `orders/${order.id}`;
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Update order status or fields
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        ...updates,
        updatedAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Delete an order
  async deleteOrder(orderId: string): Promise<void> {
    const path = `orders/${orderId}`;
    try {
      await deleteDoc(doc(db, 'orders', orderId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Listen to Services in real-time
  subscribeServices(onUpdate: (services: Service[]) => void): Unsubscribe {
    return onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        const services: Service[] = [];
        snapshot.forEach((docSnap) => {
          services.push(docSnap.data() as Service);
        });
        if (services.length > 0) {
          onUpdate(services);
        }
      },
      (error) => {
        console.warn('Services subscription notice:', error);
      }
    );
  },

  // Save Service package
  async saveService(service: Service): Promise<void> {
    const path = `services/${service.id}`;
    try {
      await setDoc(doc(db, 'services', service.id), service);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Delete Service package
  async deleteService(serviceId: string): Promise<void> {
    const path = `services/${serviceId}`;
    try {
      await deleteDoc(doc(db, 'services', serviceId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // Listen to Branding
  subscribeBranding(onUpdate: (branding: SiteBrandingConfig) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'settings', 'branding'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as SiteBrandingConfig);
        }
      },
      (error) => {
        console.warn('Branding subscription notice:', error);
      }
    );
  },

  async saveBranding(branding: SiteBrandingConfig): Promise<void> {
    const path = 'settings/branding';
    try {
      await setDoc(doc(db, 'settings', 'branding'), branding);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Listen to Payment Configuration
  subscribePaymentConfig(onUpdate: (config: PaymentConfig) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'settings', 'payment'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as PaymentConfig);
        }
      },
      (error) => {
        console.warn('Payment subscription notice:', error);
      }
    );
  },

  async savePaymentConfig(config: PaymentConfig): Promise<void> {
    const path = 'settings/payment';
    try {
      await setDoc(doc(db, 'settings', 'payment'), config);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Listen to Top Banner
  subscribeBanner(onUpdate: (banner: BannerConfig) => void): Unsubscribe {
    return onSnapshot(
      doc(db, 'settings', 'banner'),
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as BannerConfig);
        }
      },
      (error) => {
        console.warn('Banner subscription notice:', error);
      }
    );
  },

  async saveBanner(banner: BannerConfig): Promise<void> {
    const path = 'settings/banner';
    try {
      await setDoc(doc(db, 'settings', 'banner'), banner);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Google Login for Admin (Firebase Auth)
  async loginWithGoogle(): Promise<User> {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  // Email & Password Login for Admin (Firebase Auth)
  async loginWithEmail(email: string, pass: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  },

  // Secure Password Reset Email (Firebase Auth)
  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Auth State Listener
  subscribeAuthState(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
  },

  // Cloud Image Upload (Firebase Storage & Cloud CDN) - Zero Base64
  async uploadImage(file: File, folder: string = 'images'): Promise<string> {
    const extension = file.name.split('.').pop() || 'png';
    const cleanFileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${extension}`;
    
    // 1. Primary: Firebase Storage
    try {
      const fileRef = storageRef(storage, cleanFileName);
      const snapshot = await uploadBytes(fileRef, file, {
        contentType: file.type || 'image/png'
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      if (downloadUrl && downloadUrl.startsWith('http')) {
        return downloadUrl;
      }
    } catch (storageErr) {
      console.warn('Firebase Storage upload notice (using cloud hosting):', storageErr);
    }

    // 2. High-speed Cloud Image Hosting (ImgBB) fallback
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('https://api.imgbb.com/1/upload?key=b096f2ca1433f52414777d130ce5a538', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data?.data?.url) {
        return data.data.url;
      }
      if (data?.data?.display_url) {
        return data.data.display_url;
      }
    } catch (cdnErr) {
      console.warn('Cloud CDN fallback notice:', cdnErr);
    }

    throw new Error('ছবি ক্লাউডে আপলোড করা যায়নি। অনুগ্রহ করে ImgBB বা PostImages-এ ছবি আপলোড করে সরাসরি ইমেজ লিঙ্ক (URL) পেস্ট করুন।');
  },

  async logout(): Promise<void> {
    await signOut(auth);
  }
};

// Initial connection test
testConnection();
