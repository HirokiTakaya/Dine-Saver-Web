import React, { useState, useMemo } from 'react';
import { Button, Form, Card, Spinner } from 'react-bootstrap';
import {
  FaPhone,
  FaMapMarkerAlt,
  FaTag,
  FaCheckCircle,
  FaTimesCircle,
  FaYelp,
  FaGoogle,
  FaUtensils, // Hotpepperの代替アイコン
} from 'react-icons/fa';
import './styles.css'; // ホバー効果用CSSを使用する場合はコメントアウトを解除
import { useTranslation } from 'react-i18next';

interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  display_phone: string;
  is_closed: boolean;
  distance: number;
  url: string;
  price: string;
  categories: { title: string }[];
  transactions: string[];
  hours?: { is_open_now: boolean }[];
  source: 'google';
  yelp_url?: string;
  hotpepper_url?: string;
}

const CustomPopup: React.FC<{
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div style={customPopupStyles.overlay} role="dialog" aria-modal="true">
      <div style={customPopupStyles.popup}>
        <button
          style={customPopupStyles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          ✖️
        </button>
        {children}
      </div>
    </div>
  );
};

// 距離を計算する関数（ハバースの公式を使用）
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 地球の半径（メートル）
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // メートル単位
  return distance;
}

// 住所を緯度・経度に変換する関数
async function geocodeAddress(
  address: string
): Promise<{ latitude: number; longitude: number }> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      address
    )}`
  );
  const data = await response.json();

  if (data && data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } else {
    throw new Error('住所から緯度・経度を取得できませんでした');
  }
}

// 画像URLを取得する関数
const getPhotoUrl = (photoReference: string) => {
  return `/api/place/photo?photo_reference=${photoReference}`;
};

// スタイルオブジェクトをコンポーネントの外側に一度だけ定義
const customPopupStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
    zIndex: 1000, // 他のコンテンツより上に表示
  },
  popup: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '10px',
    maxWidth: '800px',
    width: '90%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxHeight: '90vh', // 高さを制限してスクロール可能に
    overflowY: 'auto',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    fontSize: '24px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginTop: '40px',
    padding: '20px',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    minWidth: '300px',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  searchButton: {
    backgroundColor: 'skyblue',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    fontSize: '16px',
    width: '200px',
    cursor: 'pointer',
    border: 'none',
  },
  filterContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  filterSelect: {
    marginLeft: '10px',
    padding: '5px',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  errorText: {
    color: 'red',
    marginTop: '10px',
    textAlign: 'center',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  cardContainer: {
    marginBottom: '15px',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.3s',
  },
  cardContainerHover: {
    transform: 'scale(1.05)',
  },
  cardImage: {
    height: '150px',
    objectFit: 'cover',
    borderRadius: '8px 8px 0 0',
    width: '100%',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
  },
  cardText: {
    fontSize: '14px',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    marginBottom: '20px',
    gap: '10px',
    flexWrap: 'nowrap', // ボタンが折り返されないように設定
    overflowX: 'auto', // 横スクロールを許可
    paddingBottom: '30px', // 下部に余白を追加
  },
  paginationButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    fontSize: '16px',
    minWidth: '100px', // 最小幅を設定
    flexShrink: 0, // ボタンが縮まないように設定
  },
  paginationButtonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  popupContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  popupImageContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  popupImage: {
    width: '200px', // 画像の幅を調整
    height: 'auto',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  popupDetails: {
    width: '100%',
  },
  externalLinks: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
    flexWrap: 'wrap',
  },
  linkButton: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '10px 15px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const [location, setLocation] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [results, setResults] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string>('');
  const [isPopupVisible, setIsPopupVisible] = useState<boolean>(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [filterOption, setFilterOption] = useState<string>('distance');
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [pages, setPages] = useState<Restaurant[][]>([]); // 各ページの結果を格納
  const [currentPage, setCurrentPage] = useState<number>(0); // 現在のページ番号
  const [isLoading, setIsLoading] = useState<boolean>(false); // ローディングステート
  const [hasSearched, setHasSearched] = useState<boolean>(false); // 検索が行われたかを管理

  const sortResults = (results: Restaurant[], sortBy: string) => {
    return [...results].sort((a, b) => {
      if (sortBy === 'price_low_to_high') {
        return a.price.length - b.price.length;
      } else if (sortBy === 'price_high_to_low') {
        return b.price.length - a.price.length;
      } else if (sortBy === 'distance') {
        return a.distance - b.distance;
      }
      return 0;
    });
  };

  const filteredResults = useMemo(() => {
    if (pages.length === 0) return [];
    const sorted = sortResults(pages[currentPage], filterOption);
    return sorted;
  }, [pages, currentPage, filterOption]);

  const fetchData = async (
    pagetoken: string | null = null,
    isNewSearch: boolean = false
  ): Promise<void> => {
    if (!location.trim() || !term.trim()) {
      setError(t('error_input'));
      return;
    }
    setError('');
    setIsLoading(true); // ローディング開始

    let latitude = '';
    let longitude = '';

    try {
      if (isNewSearch || !userCoordinates) {
        const coords = await geocodeAddress(location);
        latitude = coords.latitude.toString();
        longitude = coords.longitude.toString();
        setUserCoordinates(coords);
      } else {
        latitude = userCoordinates.latitude.toString();
        longitude = userCoordinates.longitude.toString();
      }
    } catch (error) {
      setError(t('location_fetch_error'));
      setIsLoading(false);
      return;
    }

    const apiUrl = `/api/search/google?latitude=${latitude}&longitude=${longitude}&term=${encodeURIComponent(
      term
    )}${pagetoken ? `&pagetoken=${pagetoken}` : ''}`;

    try {
      console.log('API URL:', apiUrl); // デバッグ用
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.error) {
        setError(`エラーが発生しました: ${data.error}`);
        setIsLoading(false);
        return;
      }

      setNextPageToken(data.next_page_token || null);

      const formattedResults = data.results.map((place: any) => {
        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`;
        
        // Construct Yelp URL (simple search)
        const yelpUrl = `https://www.yelp.com/search?find_desc=${encodeURIComponent(place.name)}&find_loc=${encodeURIComponent(location)}`;
        
        // Construct Hotpepper URL (assuming Japanese locale)
        const hotpepperUrl = `https://www.hotpepper.jp/search/?keyword=${encodeURIComponent(place.name)}&lat=${place.geometry.location.lat}&lng=${place.geometry.location.lng}`;

        return {
          id: place.place_id,
          name: place.name,
          image_url: place.photos
            ? getPhotoUrl(place.photos[0].photo_reference)
            : '',
          coordinates: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          },
          location: {
            address1: place.vicinity,
            city: '',
            state: '',
            zip_code: '',
          },
          display_phone: '', // Place Details APIを使用すれば取得可能
          is_closed: place.business_status !== 'OPERATIONAL',
          distance: userCoordinates
            ? calculateDistance(
                userCoordinates.latitude,
                userCoordinates.longitude,
                place.geometry.location.lat,
                place.geometry.location.lng
              )
            : 0, // 距離を計算
          url: googleMapsUrl, // Google Maps URL
          price: place.price_level
            ? '$'.repeat(place.price_level)
            : '',
          categories: place.types.map((type: string) => ({
            title: type,
          })),
          transactions: [],
          source: 'google',
          yelp_url: yelpUrl,
          hotpepper_url: hotpepperUrl,
        };
      });

      if (isNewSearch) {
        // 新しい検索の場合、結果を置き換える
        setPages([formattedResults]);
        setCurrentPage(0);
        setHasSearched(true); // 検索が行われたことを記録
      } else {
        if (formattedResults.length > 0) {
          setPages((prevPages) => [...prevPages, formattedResults]);
          setCurrentPage((prevPage) => prevPage + 1);
        }
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      setError(t('google_api_fetch_error'));
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const handleSearch = async () => {
    setPages([]);
    setUserCoordinates(null);
    setCurrentPage(0); // ページ番号をリセット
    setHasSearched(false); // 検索が行われるまでページネーションを非表示にする
    await fetchData(null, true); // isNewSearchをtrueに設定
  };

  const handleNextPage = async () => {
    if (nextPageToken) {
      // next_page_tokenが有効になるまで少し待機
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await fetchData(nextPageToken);

      // ページの上部にスクロール
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // ページの上部にスクロール
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const renderItem = (item: Restaurant) => (
    <Card
      key={item.id}
      style={styles.cardContainer}
      onClick={() => {
        setSelectedRestaurant(item);
        setIsPopupVisible(true);
      }}
      className="card-container" // ホバー効果用クラス
    >
      <Card.Img
        variant="top"
        src={item.image_url}
        alt={item.name}
        style={styles.cardImage}
      />
      <Card.Body>
        <Card.Title style={styles.cardTitle}>{item.name}</Card.Title>
        <Card.Text style={styles.cardText}>
          <p>{item.price}</p>
          <p>{item.location.address1}</p>
          <p>{(item.distance / 1000).toFixed(2)} km</p>
        </Card.Text>
      </Card.Body>
    </Card>
  );

  return (
    <div style={styles.container}>
      <div style={styles.inputContainer}>
        <Form.Control
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('location_placeholder')}
          style={styles.searchInput}
        />
        <Form.Control
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t('term_placeholder')}
          style={styles.searchInput}
        />
      </div>
      <div style={styles.buttonContainer}>
        <Button onClick={handleSearch} style={styles.searchButton}>
          {t('search_button')}
        </Button>
      </div>

      <div style={styles.filterContainer}>
        <label htmlFor="filter">{t('filter_by')}:</label>
        <select
          id="filter"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="distance">{t('filter_distance')}</option>
          <option value="price_low_to_high">
            {t('filter_price_low_to_high')}
          </option>
          <option value="price_high_to_low">
            {t('filter_price_high_to_low')}
          </option>
        </select>
      </div>

      {error ? (
        <div style={styles.errorText}>{error}</div>
      ) : null}

      {isLoading && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      <div style={styles.resultsGrid}>
        {filteredResults.map((item: Restaurant) => renderItem(item))}
      </div>

      {/* ページネーションボタンの条件付きレンダリング */}
      {hasSearched && (
        <div style={styles.paginationContainer}>
          <Button
            onClick={handlePrevPage}
            style={{
              ...styles.paginationButton,
              ...(currentPage === 0 ? styles.paginationButtonDisabled : {}),
            }}
            disabled={currentPage === 0}
          >
            Prev
          </Button>
          <Button
            onClick={handleNextPage}
            style={{
              ...styles.paginationButton,
              ...(nextPageToken ? {} : styles.paginationButtonDisabled),
            }}
            disabled={!nextPageToken}
          >
            Next
          </Button>
        </div>
      )}

      {/* 詳細ポップアップ */}
      <CustomPopup
        show={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
      >
        {selectedRestaurant && (
          <div style={styles.popupContent}>
            <div style={styles.popupImageContainer}>
              <img
                src={selectedRestaurant.image_url}
                alt={selectedRestaurant.name}
                style={styles.popupImage}
              />
            </div>
            <div style={styles.popupDetails}>
              <h3>{selectedRestaurant.name}</h3>
              <p>
                <FaPhone />{' '}
                {selectedRestaurant.display_phone || t('info_not_available')}
              </p>
              <p>
                <FaTag /> {selectedRestaurant.price}
              </p>
              <p>
                {(selectedRestaurant.distance / 1000).toFixed(2)} km
              </p>
              <p>
                <FaMapMarkerAlt />{' '}
                {selectedRestaurant.location.address1}
              </p>
              <p>
                {t('open_status')}:{' '}
                {selectedRestaurant.is_closed ? (
                  <FaTimesCircle color="red" />
                ) : (
                  <FaCheckCircle color="green" />
                )}
              </p>
              <p>
                {t('categories')}:{' '}
                {selectedRestaurant.categories
                  .map((cat) => cat.title)
                  .join(', ')}
              </p>
              {/* External Links */}
              <div style={styles.externalLinks}>
                {selectedRestaurant.yelp_url && (
                  <a
                    href={selectedRestaurant.yelp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.linkButton}
                  >
                    <FaYelp style={{ marginRight: '5px' }} />
                    Yelp
                  </a>
                )}
                {selectedRestaurant.url && (
                  <a
                    href={selectedRestaurant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.linkButton}
                  >
                    <FaGoogle style={{ marginRight: '5px' }} />
                    Google Maps
                  </a>
                )}
                {selectedRestaurant.hotpepper_url && (
                  <a
                    href={selectedRestaurant.hotpepper_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.linkButton}
                  >
                    <FaUtensils style={{ marginRight: '5px' }} />
                    Hotpepper
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </CustomPopup>
    </div>
  );
};

// スタイルオブジェクトの定義はすでに上部で行っています

export default SearchScreen;
