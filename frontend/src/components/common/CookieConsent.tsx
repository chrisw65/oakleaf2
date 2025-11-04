import React, { useState, useEffect } from 'react';
import { Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Text } = Typography;

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true, // Necessary cookies always allowed
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '1px solid #e8e8e8',
        padding: '20px',
        zIndex: 9999,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <Text style={{ fontSize: 14 }}>
            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or learn more in our{' '}
            <Link to="/privacy-policy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/cookie-policy" style={{ textDecoration: 'underline' }}>Cookie Policy</Link>.
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={handleReject}>
            Reject Non-Essential
          </Button>
          <Button type="primary" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
