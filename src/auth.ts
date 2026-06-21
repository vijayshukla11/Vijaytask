import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request the active scopes configured
provider.addScope("https://www.googleapis.com/auth/spreadsheets");
provider.addScope("https://www.googleapis.com/auth/drive.file");

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state checker
export const initAuth = (
  onAuthSuccess: (user: User, token: string) => void,
  onAuthFailure: () => void
) => {
  // Try retrieving cached token from helper session storage if it helps (optional, but let's stick to system-defined rule)
  // Rule says: "Do NOT store the access token in localStorage or sessionStorage. Implement in-memory caching."
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in under Firebase but token is lost, we need to prompt signInWithPopup to get fresh tokens
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure();
    }
  });
};

// Sign in operation
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to extract active access token from credential");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Firebase oauth error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
