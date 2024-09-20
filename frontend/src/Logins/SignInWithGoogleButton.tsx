import React, { useEffect } from 'react';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleAuthProvider } from './firebaseConfig';

const SignInWithGoogleButton: React.FC = () => {
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Signed in with Google:', result.user);
        }
      } catch (error) {
        console.error('Error handling redirect result:', error);
      }
    };

    checkRedirectResult();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithRedirect(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Googleサインインに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn}>
        Sign In with Google
      </button>
    </div>
  );
};

export default SignInWithGoogleButton;
