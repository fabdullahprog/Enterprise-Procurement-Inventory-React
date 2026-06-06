import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './landing.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.load();
      videoRef.current.play().catch(err => {
        console.warn("Video autoplay failed, possibly blocked by browser:", err);
      });
    }
  }, []);

  const features = [
    {
      icon: '📊',
      title: 'Smart Inventory Management',
      description: 'Real-time stock tracking, automated reordering, and multi-location warehouse control to optimize your supply chain.'
    },
    {
      icon: '🛡️',
      title: 'End-to-End Procurement',
      description: 'Streamline sourcing with RFQ management, supplier comparative statements, and automated purchase order generation.'
    },
    {
      icon: '📈',
      title: 'Power Retail Analytics',
      description: 'Deep insights into sales trends, department performance, and financial metrics with intuitive, interactive dashboards.'
    }
  ];

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="nav-landing">
        <div className="nav-container">
          <div className="nav-logo">
            <span className="nav-brand">SuperShop ERP</span>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <button className="btn-nav-cta" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            ) : (
              <>
                <button className="btn-nav-login" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="btn-nav-cta" onClick={() => navigate('/login')}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">B2B Retail Solution</span>
          <h1 className="hero-title">
            COMPLETE CONTROL OF YOUR <span>SUPER SHOP BUSINESS.</span>
          </h1>
          <p className="hero-subtitle">
            Empower your retail operations with our all-in-one ERP solution.
            Streamline inventory, procurement, and analytics in one unified platform
            built for modern commerce.
          </p>
          <div className="hero-actions">
            {!isAuthenticated ? (
              <>
                <button className="btn-hero-primary" onClick={() => navigate('/login')}>
                  Log In to Your Shop
                </button>
                <button className="btn-hero-secondary" onClick={() => navigate('/register')}>
                  Request Demo
                </button>
              </>
            ) : (
              <button className="btn-hero-primary" onClick={() => navigate('/dashboard')}>
                Access Dashboard
              </button>
            )}
          </div>
        </div>
        <div className="hero-illustration">
          <video
            ref={videoRef}
            className="hero-video"
            src="/hero-video.mp4"
            autoPlay={true}
            muted={true}
            loop={true}
            playsInline={true}
            preload="auto"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-header">
          <h2>Everything You Need to Scale</h2>
          <p>Professional tools designed to handle the complexity of modern retail management.</p>
        </div>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <div className="feature-icon-wrapper">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">SuperShop ERP</div>
            <p>
              The most comprehensive ERP solution for modern retail chains and independent super shops.
            </p>
            <div className="social-links">
              <span className="social-link">LinkedIn</span>
              <span className="social-link">Twitter</span>
              <span className="social-link">Facebook</span>
            </div>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <ul>
              <li><a href="#inventory">Inventory</a></li>
              <li><a href="#procurement">Procurement</a></li>
              <li><a href="#analytics">Analytics</a></li>
              <li><a href="#pos">POS System</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#blog">Blog</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#api">API Reference</a></li>
              <li><a href="#status">System Status</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SuperShop Management System. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
