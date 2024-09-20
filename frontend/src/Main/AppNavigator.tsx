import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchScreen from './SearchScreen';
import RestaurantDetailScreen from './RestaurantDetailScreen';
import BottomTabNavigator from './BottomTabNavigator';

const AppNavigator: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/home" element={<BottomTabNavigator />} />
        <Route path="/restaurant/:id" element={<RestaurantDetailScreen />} />
      </Routes>
    </Router>
  );
};

export default AppNavigator;
