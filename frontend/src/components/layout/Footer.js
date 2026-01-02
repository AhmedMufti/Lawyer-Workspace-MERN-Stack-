import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaBalanceScale,
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaInstagram,
    FaYoutube,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaPaperPlane,
    FaGavel,
    FaBook,
    FaUsers,
    FaShieldAlt,
    FaHeart,
    FaArrowUp
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setEmail('');
            setTimeout(() => setSubscribed(false), 3000);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            {/* Main Footer Content */}
            <div className="footer-main">
                <div className="footer-container">
                    {/* Brand Section */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <FaBalanceScale className="logo-icon" />
                            <div className="logo-text">
                                <span className="logo-title">Pakistan Legal Nexus</span>
                                <span className="logo-tagline">Justice Through Technology</span>
                            </div>
                        </div>
                        <p className="footer-description">
                            Empowering legal professionals across Pakistan with cutting-edge technology.
                            Your trusted platform for case management, legal research, and professional networking.
                        </p>

                        {/* Social Links */}
                        <div className="social-links">
                            <a href="#" className="social-link facebook" aria-label="Facebook">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="social-link twitter" aria-label="Twitter">
                                <FaTwitter />
                            </a>
                            <a href="#" className="social-link linkedin" aria-label="LinkedIn">
                                <FaLinkedinIn />
                            </a>
                            <a href="#" className="social-link instagram" aria-label="Instagram">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-link youtube" aria-label="YouTube">
                                <FaYoutube />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">
                            <FaGavel className="heading-icon" />
                            Quick Links
                        </h4>
                        <ul className="footer-links">
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/find-lawyers">Find a Lawyer</Link></li>
                            <li><Link to="/marketplace">Marketplace</Link></li>
                            <li><Link to="/research">Legal Research</Link></li>
                            <li><Link to="/dashboard/cases">Case Management</Link></li>
                            <li><Link to="/dashboard/polls">Polls & Elections</Link></li>
                        </ul>
                    </div>

                    {/* Legal Resources */}
                    <div className="footer-section">
                        <h4 className="footer-heading">
                            <FaBook className="heading-icon" />
                            Legal Resources
                        </h4>
                        <ul className="footer-links">
                            <li><a href="#">Pakistan Penal Code</a></li>
                            <li><a href="#">Civil Procedure Code</a></li>
                            <li><a href="#">Constitution of Pakistan</a></li>
                            <li><a href="#">Family Laws</a></li>
                            <li><a href="#">Corporate Laws</a></li>
                            <li><a href="#">Supreme Court Judgments</a></li>
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div className="footer-section footer-contact">
                        <h4 className="footer-heading">
                            <FaUsers className="heading-icon" />
                            Get In Touch
                        </h4>

                        <div className="contact-info">
                            <div className="contact-item">
                                <FaMapMarkerAlt className="contact-icon" />
                                <span>Islamabad, Pakistan</span>
                            </div>
                            <div className="contact-item">
                                <FaPhone className="contact-icon" />
                                <span>+92 51 123 4567</span>
                            </div>
                            <div className="contact-item">
                                <FaEnvelope className="contact-icon" />
                                <span>contact@pln.pk</span>
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="newsletter">
                            <h5 className="newsletter-title">Subscribe to Updates</h5>
                            <form onSubmit={handleSubscribe} className="newsletter-form">
                                <div className="newsletter-input-wrapper">
                                    <FaEnvelope className="input-icon" />
                                    <input
                                        type="email"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="newsletter-btn">
                                    <FaPaperPlane />
                                </button>
                            </form>
                            {subscribed && (
                                <p className="subscribe-success">✓ Thanks for subscribing!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="footer-stats">
                    <div className="stat-item">
                        <span className="stat-number">5,000+</span>
                        <span className="stat-label">Registered Lawyers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">10,000+</span>
                        <span className="stat-label">Cases Managed</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">50,000+</span>
                        <span className="stat-label">Legal Documents</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">100+</span>
                        <span className="stat-label">Bar Associations</span>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <div className="footer-container bottom-content">
                    <div className="copyright">
                        <p>
                            © {currentYear} <strong>Pakistan Legal Nexus</strong>. All rights reserved.
                        </p>
                        <p className="made-with">
                            Made with <FaHeart className="heart-icon" /> for the legal community of Pakistan
                        </p>
                    </div>

                    <div className="bottom-links">
                        <a href="#">Privacy Policy</a>
                        <span className="divider">•</span>
                        <a href="#">Terms of Service</a>
                        <span className="divider">•</span>
                        <a href="#">Cookie Policy</a>
                    </div>

                    <div className="certifications">
                        <div className="cert-badge">
                            <FaShieldAlt />
                            <span>SSL Secured</span>
                        </div>
                        <div className="cert-badge">
                            <FaBalanceScale />
                            <span>PBC Verified</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
                <FaArrowUp />
            </button>
        </footer>
    );
};

export default Footer;
