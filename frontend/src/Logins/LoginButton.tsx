
import React from 'react';
import { useAuth } from './AuthContext';
import styled from 'styled-components';

// スタイル付きのボタンコンポーネント
const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #0056b3;
  }
`;

const LogoutButton: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <Button onClick={signOut}>
      Logout
    </Button>
  );
};

export default LogoutButton;