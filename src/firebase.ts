import { getApp, getApps, initializeApp } from 'firebase/app';
import { addDoc, collection, doc, getDoc, getFirestore, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';

const config = { apiKey:'AIzaSyBWhYhDuV8CAVYz33f0udYppgypp2phUew', authDomain:'jackx-1a9d9.firebaseapp.com', projectId:'jackx-1a9d9', storageBucket:'jackx-1a9d9.firebasestorage.app', messagingSenderId:'332749297524', appId:'1:332749297524:web:836f9623bf408dd1463e21' };
const app = getApps().length ? getApp() : initializeApp(config);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const ensureSession = () => signInAnonymously(auth);
export const watchAuth = onAuthStateChanged;
export const signInAdmin = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const signOutAdmin = () => signOut(auth);
export const createOrder = (order: Record<string, unknown>) => addDoc(collection(db,'orders'), { ...order, createdAt: serverTimestamp() });
export const watchOrders = (onChange:(orders:any[])=>void, onError:(error:Error)=>void) => onSnapshot(query(collection(db,'orders'),orderBy('createdAt','desc'),limit(100)), snap => onChange(snap.docs.map(d=>({docId:d.id,...d.data()}))), onError);
export const updateOrder = (docId:string,status:string) => updateDoc(doc(db,'orders',docId),{status,updatedAt:serverTimestamp()});
const brandRef = doc(db, 'settings', 'qr-caffe');
export async function readBrand<T extends object>(fallback: T): Promise<T> {
  try {
    const snap = await getDoc(brandRef);
    return snap.exists() ? ({ ...fallback, ...snap.data() } as T) : fallback;
  } catch (error) {
    console.warn('تعذر قراءة إعدادات QR CAFFE من Firebase', error);
    return fallback;
  }
}
export async function writeBrand<T extends object>(brand: T): Promise<{ ok: boolean; message?: string }> {
  try {
    await setDoc(brandRef, brand);
    return { ok: true };
  } catch (error) {
    console.error('تعذر حفظ إعدادات QR CAFFE في Firebase', error);
    const identity = auth.currentUser
      ? `user=${auth.currentUser.email || 'anonymous'}; uid=${auth.currentUser.uid}; anonymous=${auth.currentUser.isAnonymous}`
      : 'user=none';
    return { ok: false, message: `${error instanceof Error ? error.message : String(error)} (${identity})` };
  }
}
