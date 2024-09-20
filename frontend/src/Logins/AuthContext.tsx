// AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { auth, googleAuthProvider } from './firebaseConfig'; // パスを適宜調整
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup,
  User
} from 'firebase/auth';

// AuthContextの型定義
interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  fetchJwtToken: () => Promise<void>;
}

// AuthContextの作成
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProviderコンポーネント
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Email/Password サインイン
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log("Signed in user:", userCredential.user);
    } catch (error: any) {
      console.error("Sign-In Error:", error);
      switch (error.code) {
        case 'auth/invalid-email':
          alert("無効なメールアドレスです。正しいメールアドレスを入力してください。");
          break;
        case 'auth/wrong-password':
          alert("パスワードが間違っています。再度お試しください。");
          break;
        case 'auth/user-not-found':
          alert("このメールアドレスのユーザーが見つかりません。サインアップしてください。");
          break;
        default:
          alert("サインインに失敗しました: " + error.message);
      }
      throw error;
    }
  };

  // Googleサインイン
  const signInWithGoogle = async (): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      setUser(result.user);
      console.log("Google Signed in user:", result.user);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      alert("Googleサインインに失敗しました: " + error.message);
      throw error;
    }
  };

  // サインアウト
  const signOutUser = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      console.log("User signed out successfully.");
    } catch (error: any) {
      console.error("Sign-Out Error:", error);
      alert("サインアウトに失敗しました: " + error.message);
    }
  };

  // JWTトークンの取得
  const fetchJwtToken = async (): Promise<void> => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User is not authenticated');

      const token = await user.getIdToken();

      const response = await fetch('http://localhost:3000/api/login', { // バックエンドのポートに合わせて修正
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Token received:', data.token);
        // 必要に応じてトークンをlocalStorageやコンテキストに保存
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error: any) {
      console.error('Fetching JWT failed:', error);
      alert('JWTトークンの取得に失敗しました。');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signInWithGoogle, signOut: signOutUser, fetchJwtToken }}>
      {children}
    </AuthContext.Provider>
  );
};
