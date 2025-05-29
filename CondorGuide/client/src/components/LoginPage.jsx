import React from 'react';
import '../App.css';
const LoginPage = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 ">
      <div className="card shadow p-4 card-overlay" style={{ width: '100%', maxWidth: '400px' }}>
        <h2 className="text-center mb-4 " style={{ color: '#e1c212' }}>Condor Guide Login</h2>
        <form>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              type="email"
              className="form-control custom-input"
              id="email"
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control custom-input"
              id="password"
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Login</button>
          </div>
        </form>
        <p className="text-center mt-3"  style={{ color: '#e1c212' }}>
          Don’t have an account? <a href="#" style={{ color: '#8c8888' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;