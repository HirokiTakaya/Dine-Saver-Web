import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const getYelpData = async (location, term) => {
  if (!location || !term) {
    console.error('getYelpData function requires both location and term parameters');
    return { error: true, message: 'Missing parameters', statusCode: 400 };
  }

  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    console.error('No API Key found in environment variables');
    return { error: true, message: 'API Key not provided', statusCode: 500 };
  }

  const url = `https://api.yelp.com/v3/businesses/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(term)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    // Add debug output for response
    console.log(`Response Status: ${response.status}`);
    if (!response.ok) {
      const errorResponse = await response.text(); // Get response body as text
      console.error(`Error fetching data from Yelp: ${response.status} ${response.statusText}, Body: ${errorResponse}`);
      throw new Error(`Error fetching data from Yelp: ${response.status} ${response.statusText}, Body: ${errorResponse}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from Yelp:', error);
    return { error: true, message: error.message, statusCode: error.statusCode || 500 };
  }
};

export default getYelpData;
