import React from 'react';

// Footerコンポーネントの定義
const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <p style={styles.footerText}>© 2024 Dine Saver. All rights reserved.</p>
    </footer>
  );
};

// スタイル定義
const styles = {
  footer: {
    backgroundColor: '#EEE',
    padding: '10px 0',
    textAlign: 'center' as const,
    position: 'fixed' as const,
    bottom: 0,
    width: '100%',
  },
  footerText: {
    color: 'gray',
    fontSize: '14px',
  },
};

export default Footer;
