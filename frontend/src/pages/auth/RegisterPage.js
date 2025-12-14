import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../../store/slices/authSlice';
import './AuthPages.css';

const RegisterPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, success } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'litigant',
        barLicenseNumber: '',
        enrollmentDate: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    useEffect(() => {
        if (success) {
            setTimeout(() => navigate('/login'), 2000);
        }
        return () => {
            dispatch(clearError());
        };
    }, [success, navigate, dispatch]);

    useEffect(() => {
        // Calculate password strength
        const password = formData.password;
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        setPasswordStrength(strength);
    }, [formData.password]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        const { confirmPassword, ...dataToSend } = formData;
        dispatch(register(dataToSend));
    };

    const getStrengthColor = () => {
        if (passwordStrength === 0) return '#ef4444';
        if (passwordStrength <= 2) return '#f59e0b';
        return '#10b981';
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return 'Weak';
        if (passwordStrength <= 2) return 'Medium';
        return 'Strong';
    };

    return (
        <div className="auth-page">
            <div className="auth-container register-container">
                <div className="auth-left">
                    <div className="auth-branding">
                        <h1 className="brand-title">⚖️ Join Pakistan Legal Nexus</h1>
                        <p className="brand-subtitle">Create your account and start managing your legal work efficiently</p>
                    </div>
                    <div className="auth-stats">
                        <div className="stat-box">
                            <div className="stat-number">1000+</div>
                            <div className="stat-label">Legal Professionals</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">5000+</div>
                            <div className="stat-label">Cases Managed</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-number">10000+</div>
                            <div className="stat-label">Legal Documents</div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-container">
                        <h2 className="auth-title">Create Account</h2>
                        <p className="auth-description">Fill in your details to get started</p>

                        {error && (
                            <div className="alert alert-error">
                                <span>⚠️</span>
                                {error.message || 'Registration failed. Please try again.'}
                            </div>
                        )}

                        {success && (
                            <div className="alert alert-success">
                                <span>✅</span>
                                Account created successfully! Redirecting to login...
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="firstName">First Name</label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📧</span>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john.doe@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">Phone Number</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">📱</span>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+92 300 1234567"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">I am a</label>
                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="form-select"
                                >
                                    <option value="lawyer">Lawyer</option>
                                    <option value="litigant">Litigant</option>
                                    <option value="clerk">Clerk</option>
                                </select>
                            </div>

                            {formData.role === 'lawyer' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="barLicenseNumber">Bar License Number</label>
                                        <input
                                            type="text"
                                            id="barLicenseNumber"
                                            name="barLicenseNumber"
                                            value={formData.barLicenseNumber}
                                            onChange={handleChange}
                                            placeholder="ABC12345"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="enrollmentDate">Enrollment Date</label>
                                        <input
                                            type="date"
                                            id="enrollmentDate"
                                            name="enrollmentDate"
                                            value={formData.enrollmentDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Create a strong password"
                                        required
                                        minLength="8"
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                </div>
                                {formData.password && (
                                    <div className="password-strength">
                                        <div className="strength-bar">
                                            <div
                                                className="strength-fill"
                                                style={{
                                                    width: `${(passwordStrength / 4) * 100}%`,
                                                    backgroundColor: getStrengthColor()
                                                }}
                                            ></div>
                                        </div>
                                        <span className="strength-text" style={{ color: getStrengthColor() }}>
                                            {getStrengthText()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Re-enter your password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <input type="checkbox" required />
                                    <span>I agree to the <a href="#" className="link-primary">Terms and Conditions</a></span>
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Already have an account? <Link to="/login" className="link-primary">Login here</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
