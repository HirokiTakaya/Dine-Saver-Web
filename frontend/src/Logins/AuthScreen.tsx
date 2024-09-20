import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// スタイル付きのコンポーネント
const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  height: 100vh;
`;

const Button = styled.button`
  background-color: skyblue;
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  margin: 5px 0;
  width: 50%; /* Adjusted width to make the button slimmer */
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;

  &:hover {
    background-color: deepskyblue;
  }
`;

function AuthScreen() {
  const navigate = useNavigate(); // useHistoryをuseNavigateに置き換え

  return (
    <Container>
      <Button onClick={() => navigate('/signup')}>
        Signup
      </Button>
      <Button onClick={() => navigate('/login')}>
        Login
      </Button>
    </Container>
  );
}

export default AuthScreen;
