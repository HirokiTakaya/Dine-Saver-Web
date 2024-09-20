// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBaG2bFPlJvI12u_Zn4lN3G7WEEGmuXAW4",
  authDomain: "dinesaver-2df54.firebaseapp.com",
  projectId: "dinesaver-2df54",
  storageBucket: "dinesaver-2df54.appspot.com",
  messagingSenderId: "303415736159",
  appId: "1:303415736159:web:dd472e69a2fc9eea8da8ea",
  measurementId: "G-0YDHTYW6YF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google Provider
const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();

export { auth, googleAuthProvider };
