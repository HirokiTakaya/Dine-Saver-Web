import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next'; // Import useTranslation

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

const SignUp: React.FC = () => {
  const { t } = useTranslation(); // Destructure the translation function
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      console.log('Signed up with Google:', result.user);
    } catch (error) {
      console.error('Google Sign-Up Error:', error);
      alert(t('google_sign_up_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!email || !password) {
        alert(t('error_missing_credentials'));
        return;
      }

      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Signed up with email:', userCredential.user);
    } catch (error) {
      console.error('Email Sign-Up Error:', error);
      alert(t('email_sign_up_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
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
      <Button onClick={handleEmailSignUp} disabled={loading}>
        {loading ? t('signing_up') : t('sign_up_email')} {/* Translated button text */}
      </Button>
      <Button onClick={handleGoogleSignUp} disabled={loading}>
        {loading ? t('signing_up') : t('sign_up_google')} {/* Translated button text */}
      </Button>
    </Container>
  );
};

export default SignUp;
