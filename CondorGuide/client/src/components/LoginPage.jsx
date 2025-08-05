import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setError] = useState({});
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [showForgotForm, setShowForgotForm] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter valid email';

    if (!password) newErrors.password = 'Password required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5000/api/users/login', {
          email,
          password,
        });

        if (response.status === 200) {
          login(response.data.user, response.data.token);
          setMessage('Login successful!');
          setVariant('success');

          setTimeout(() => {
            navigate(from, { state: { from: undefined }, replace: true });
          }, 1000);
        }
      } catch {
        setMessage('Login failed. Please check credentials.');
        setVariant('danger');
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/users/forgot-password', {
        email: forgotEmail,
      });
      if (response.status === 200) {
        setForgotMessage('Reset code sent to your email.');
        setShowResetForm(true);
      }
    } catch (error) {
      setForgotMessage('Error sending reset email.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage('');
    try {
      const response = await axios.post('http://localhost:5000/api/users/reset-password', {
        email: forgotEmail,
        resetCode,
        newPassword,
      });
      if (response.status === 200) {
        setResetMessage('Password changed successfully. Redirecting to login...');
        setTimeout(() => {
          setShowForgotForm(false);
          setShowResetForm(false);
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setResetMessage('Failed to reset password. Check code and try again.');
    }
  };

  return (
    <div className="app-background d-flex justify-content-center align-items-center">
      <div className="card shadow p-4 card-overlay" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4" style={{ color: '#e1c212' }}>Condor Guide Login</h2>

        {!showForgotForm ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email address</label>
              <input
                type="email"
                className={`form-control custom-input ${errors.email ? 'is-invalid' : ''}`}
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className={`form-control custom-input ${errors.password ? 'is-invalid' : ''}`}
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
            <div className="text-center mt-2">
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                style={{ color: '#8c8888' }}
                onClick={() => setShowForgotForm(true)}
              >
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <>
            {!showResetForm ? (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-3">
                  <label htmlFor="forgotEmail" className="form-label">Enter your email to reset password</label>
                  <input
                    type="email"
                    className="form-control custom-input"
                    id="forgotEmail"
                    placeholder="Enter your email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-warning">Send Reset Code</button>
                </div>
                <div className="text-center mt-2">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    style={{ color: '#8c8888' }}
                    onClick={() => setShowForgotForm(false)}
                  >
                    Back to Login
                  </button>
                </div>
                {forgotMessage && <div className="alert alert-info text-center mt-3">{forgotMessage}</div>}
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="mb-3">
                  <label htmlFor="resetCode" className="form-label">Enter Reset Code</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    id="resetCode"
                    placeholder="6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    id="newPassword"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="d-grid">
                  <button type="submit" className="btn btn-success">Reset Password</button>
                </div>
                {resetMessage && <div className="alert alert-info text-center mt-3">{resetMessage}</div>}
              </form>
            )}
          </>
        )}

        {message && !showForgotForm && (
          <div className={`alert alert-${variant} text-center mt-3`} role="alert">
            {message}
          </div>
        )}

        {!showForgotForm && (
          <p className="text-center mt-3" style={{ color: '#e1c212' }}>
            Don't have an account? <Link to="/signup" style={{ color: '#8c8888' }}>Sign up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
