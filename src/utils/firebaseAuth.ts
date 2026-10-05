import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('openid');

let cachedToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      try {
        const token = await user.getIdToken();
        cachedToken = token;
        if (onAuthSuccess) onAuthSuccess(user, token);
      } catch (e) {
        console.error('Error fetching Firebase ID token:', e);
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleOAuth = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    cachedToken = idToken;

    return {
      user: result.user,
      idToken,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      uid: result.user.uid,
      phoneNumber: result.user.phoneNumber
    };
  } catch (error: any) {
    console.error('Google OAuth sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logoutFirebaseAuth = async () => {
  try {
    await signOut(auth);
    cachedToken = null;
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCachedToken = () => cachedToken;
