import React, { useState, useEffect } from 'react';

interface Restaurant {
  name: string;
  rating: number;
  review_count: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

const RestaurantDetailScreen: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/search?location=${encodeURIComponent('location')}&term=${encodeURIComponent('term')}`
        );
        const data = await response.json();
        setRestaurant(data.businesses[0]);
        setIsVisible(true);
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      }
    };

    fetchRestaurantData();
  }, []);

  const openMapsApp = () => {
    if (!restaurant || !restaurant.coordinates) {
      console.error('Invalid restaurant location data');
      return;
    }

    const latitude = restaurant.coordinates.latitude;
    const longitude = restaurant.coordinates.longitude;
    const label = encodeURIComponent(restaurant.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    window.open(url, '_blank'); // Web版の互換性に合わせて修正
  };

  const onClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      {isVisible && (
        <div style={styles.centeredView}>
          <div style={styles.modalView}>
            {restaurant ? (
              <>
                <h2 style={styles.title}>{restaurant.name}</h2>
                <p>Rating: {restaurant.rating}</p>
                <p>Reviews: {restaurant.review_count}</p>
                <button onClick={openMapsApp}>Open in Maps</button>
                <button onClick={onClose}>Close</button>
              </>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  centeredView: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'fixed',  // 型キャストは不要です
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',  // 中央に配置するためのtransform
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    width: '100%',
    height: '100%',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '35px',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '20px',
    marginBottom: '8px',
  },
};


export default RestaurantDetailScreen;
