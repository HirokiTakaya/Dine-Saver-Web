import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch'; // Used for making requests to the Google Places API
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import { getExpenses, addExpense, deleteExpense, getUserProfile, updateUserProfile, UserProfile } from './mongodb.js'; // MongoDBの関数を利用
import serviceAccount from './config/dinesaver-2df54-firebase-adminsdk-rj89c-d5d4f8baef.json' assert { type: 'json' }; // JSONファイルをimportに変更

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());

// Firebase の初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 認証ミドルウェア
function verifyToken(req, res, next) {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    req.token = bearerToken;

    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
      if (err) {
        res.sendStatus(403); // Forbidden
      } else {
        req.user = authData;
        next();
      }
    });
  } else {
    res.sendStatus(403); // Forbidden
  }
}

// Google Places APIのデータ取得
app.get('/api/search/google', async (req, res) => {
  const { latitude, longitude, term, pagetoken } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  const apiParams = {
    key: apiKey,
    location: `${latitude},${longitude}`,
    radius: 5000, // 検索半径（メートル）
    keyword: term,
    language: 'ja',
  };

  if (pagetoken) {
    apiParams.pagetoken = pagetoken;
  }

  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${new URLSearchParams(apiParams)}`;

  try {
    console.log('Google Places API Request URL:', apiUrl); // デバッグ用
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.error_message) {
      console.error('Google Places API error:', data.error_message);
      res.status(500).json({ error: data.error_message });
      return;
    }

    res.json(data);
  } catch (error) {
    console.error('Google Places API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Place Photoのプロキシエンドポイント
app.get('/api/place/photo', async (req, res) => {
  const { photo_reference } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const apiUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo_reference}&key=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    res.redirect(response.url);
  } catch (error) {
    console.error('Place Photo API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 経費管理関連エンドポイント
app.get('/api/expenses', async (req, res) => {
  try {
    const expenses = await getExpenses();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const newExpense = await addExpense(req.body);
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  console.log(`Delete request for expense with id: ${req.params.id}`);
  try {
    console.log('Attempting to delete expense');
    const deletedExpense = await deleteExpense(req.params.id);
    if (!deletedExpense) {
      console.log('Expense not found');
      return res.status(404).json({ error: 'Expense not found' });
    }
    console.log('Expense deleted successfully');
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Yelp API エンドポイント
app.get('/api/search', async (req, res) => {
  const { location, term } = req.query;
  const apiKey = process.env.YELP_API_KEY;
  const yelpURL = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(term)}`;

  try {
    const yelpResponse = await fetch(yelpURL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!yelpResponse.ok) {
      throw new Error('Failed to fetch from Yelp API');
    }

    const yelpData = await yelpResponse.json();
    res.json(yelpData);
  } catch (error) {
    console.error('Yelp API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ユーザープロファイル関連エンドポイント
app.get('/api/user/profile/:username', async (req, res) => {
  try {
    const userProfile = await getUserProfile(req.params.username);
    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(userProfile);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/profile/:username', async (req, res) => {
  try {
    const updatedUserProfile = await updateUserProfile(req.params.username, req.body);
    res.json(updatedUserProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// 新しいユーザープロファイルの作成
app.post('/api/user/profile', async (req, res) => {
  try {
    const newProfileData = req.body;
    const newProfile = await createNewUserProfile(newProfileData);
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating new user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Firebase 認証用ログインエンドポイント
app.post('/api/login', async (req, res) => {
  try {
    const token = req.headers.authorization.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('User ID:', decodedToken.uid);
    const serverToken = jwt.sign(
      { uid: decodedToken.uid },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token: serverToken });
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    res.status(401).send('Unauthorized: Invalid token');
  }
});

// サーバーの起動
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
