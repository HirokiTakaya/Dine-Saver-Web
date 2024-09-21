import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from './AuthContext'; // Firebase Auth Contextを利用
import { useTranslation } from 'react-i18next'; // i18nのuseTranslationを追加

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Input = styled.input`
  width: 50%; /* Adjust width to make the input slimmer */
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid gray;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: skyblue;
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin-top: 10px;
  width: 50%; /* Adjust width to make the button slimmer */
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;

  &:disabled {
    background-color: lightgray;
    cursor: not-allowed;
  }
`;

const LanguageSwitcher = styled.div`
  margin-top: 20px;
  cursor: pointer;
  font-size: 14px;
  color: blue;
`;

const LoginScreen: React.FC = () => {
  const { signIn, signInWithGoogle, fetchJwtToken } = useAuth(); // Contextからメソッドを取得
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // loadingステートの定義
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // i18nの翻訳関数を取得

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        alert(t('error_missing_credentials')); // Translated error message
        return;
      }

      if (!isValidEmail(email)) {
        alert(t('error_invalid_email')); // Translated error message
        return;
      }

      setLoading(true); // ローディング開始
      console.log("Attempting to sign in with email:", email);

      await signIn(email, password);

      await fetchJwtToken();

      navigate('/home');
    } catch (error: any) {
      console.log('Login Error:', error);
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      await fetchJwtToken();
      navigate('/home');
    } catch (error: any) {
      console.log('Google Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Container>
  {/* Display the email and password as plain text */}
      <div>
        <p>Email: chosenonehao@yahoo.co.jp</p>
        <p>Password: 000000</p>
      </div>   
   <Input
        type="email"
        placeholder={t('email')} // Translated placeholder
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Input
        type="password"
        placeholder={t('password')} // Translated placeholder
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? t('logging_in') : t('login')} {/* Translated button text */}
      </Button>
      <Button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? t('logging_in') : t('login_google')} {/* Translated button text */}
      </Button>

      <LanguageSwitcher onClick={() => changeLanguage('en')}>
        English
      </LanguageSwitcher>
      <LanguageSwitcher onClick={() => changeLanguage('ja')}>
        日本語
      </LanguageSwitcher>
    </Container>
  );
};

export default LoginScreen;
