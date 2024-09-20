import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Logins/firebaseConfig';
import { signOut } from 'firebase/auth';

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login', { replace: true }); // ログイン画面にリダイレクト
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.welcomeText}>{auth.currentUser?.email} Welcome</h1>
      <button onClick={handleSignOut}>Logout</button>
    </div>
  );
};

// スタイル定義をTypeScriptで表現
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  } as React.CSSProperties,
  welcomeText: {
    fontSize: '20px',
    marginBottom: '20px',
  } as React.CSSProperties,
};

export default HomeScreen;
