import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchScreen from './SearchScreen';
import TrackingExpense from './TrackingExpense';
import RecordedExpense from './RecordedExpense';
import { useAuth } from '../Logins/AuthContext';

const BottomTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Search'); // Default to "Search"
  const [popupVisible, setPopupVisible] = useState<boolean>(false); 
  const { signOut } = useAuth();
  const navigate = useNavigate(); 
  const { t, i18n } = useTranslation(); 

  const logout = () => {
    signOut()
      .then(() => {
        alert(t("logout_success")); 
        navigate('/login'); 
      })
      .catch((error) => {
        alert(t("logout_failed") + error.message);
      });
  };

  const Tab: React.FC<{ name: string; onPress?: () => void }> = ({ name, onPress }) => (
    <div
      style={activeTab === name ? styles.tabActive : styles.tab}
      onClick={onPress || (() => setActiveTab(name))}
    >
      <span style={activeTab === name ? styles.tabTextActive : styles.tabText}>
        {t(name)}
      </span>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Popup */}
      {popupVisible && (
        <div style={styles.popupOverlay}>
          <div style={styles.popupContent}>
            <h3>{t("logout")}</h3>
            <p>{t("confirm_logout")}</p>
            <div style={styles.buttonGroup}>
              <button
                style={styles.buttonClose}
                onClick={() => {
                  setPopupVisible(false);
                  logout();
                }}
              >
                {t("yes")}
              </button>
              <button style={styles.buttonCancel} onClick={() => setPopupVisible(false)}>
                {t("no")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Language Switch */}
      <header style={styles.header}>
        <h1 
          style={{ 
            ...styles.headerText, 
            cursor: 'pointer' // Make the title clickable
          }} 
          onClick={() => setActiveTab('Search')} // On click, activate 'Search'
        >
          {t("app_name")}
        </h1> 
        <div style={styles.languageSwitchContainer}>
          <button style={styles.languageButton} onClick={() => i18n.changeLanguage('ja')}>日本語</button>
          <button style={styles.languageButton} onClick={() => i18n.changeLanguage('en')}>English</button>
        </div>
      </header>

      {/* Tab bar */}
      <div style={styles.tabBar}>
        <Tab name="Search" />
        <Tab name="Tracking Expense" />
        <Tab name="Recorded Expense" />
        <Tab name="Logout" onPress={() => setPopupVisible(true)} />
      </div>

      {/* Content */}
      <div style={styles.screenContainer}>
        {activeTab === 'Search' && <SearchScreen />}
        {activeTab === 'Tracking Expense' && <TrackingExpense />}
        {activeTab === 'Recorded Expense' && <RecordedExpense />}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: '20px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    position: 'fixed' as const,
    top: 0,
    width: '100%',
    zIndex: 1,
  },
  headerText: {
    textAlign: 'center' as const,
    fontSize: '24px',
    margin: 0,
    marginLeft: 100,
    flex: 1,
  },
  languageSwitchContainer: {
    display: 'flex',
    gap: '10px',
    marginRight: 30,
  },
  languageButton: {
    backgroundColor: 'white',
    color: '#2196F3',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  tabBar: {
    display: 'flex',
    flexDirection: 'row' as const,
    justifyContent: 'space-around',
    padding: '5px 0',
    backgroundColor: '#EEE',
    position: 'fixed' as const,
    top: '60px',
    width: '100%',
    zIndex: 1,
  },
  screenContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '130px',
  },
  tabActive: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '2px',
    cursor: 'pointer',
    backgroundColor: '#ddd',
    color: 'tomato',
  },
  tab: {
    flex: 1,
    textAlign: 'center' as const,
    padding: '2px',
    cursor: 'pointer',
  },
  tabText: {
    color: 'gray',
  },
  tabTextActive: {
    color: 'tomato',
  },
  popupOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2,
  },
  popupContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center' as const,
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '300px',
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    gap: '10px',
  },
  buttonClose: {
    backgroundColor: "#2196F3",
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  buttonCancel: {
    backgroundColor: "#2196F3",
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default BottomTabNavigator;
