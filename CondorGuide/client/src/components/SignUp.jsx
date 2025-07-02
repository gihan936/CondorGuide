import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const SignUpPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';

    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email';

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post('http://localhost:5000/api/users/signUp', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      setMessage(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="app-background d-flex justify-content-center align-items-center">
      <div className="card shadow p-4 card-overlay" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4" style={{ color: '#e1c212' }}>Sign Up</h3>
        <form onSubmit={handleSubmit}>
          {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
          <input
            className={`form-control mb-3 ${errors.firstName ? 'is-invalid' : ''}`}
            placeholder="First Name"
            name="firstName"
            onChange={handleChange}
          />

          {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
          <input
            className={`form-control mb-3 ${errors.lastName ? 'is-invalid' : ''}`}
            placeholder="Last Name"
            name="lastName"
            onChange={handleChange}
          />

          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          <input
            className={`form-control mb-3 ${errors.email ? 'is-invalid' : ''}`}
            placeholder="Email"
            name="email"
            onChange={handleChange}
          />

          {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          <input
            className={`form-control mb-3 ${errors.password ? 'is-invalid' : ''}`}
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />

          {errors.confirmPassword && (
            <div className="invalid-feedback">{errors.confirmPassword}</div>
          )}
          <input
            className={`form-control mb-3 ${errors.confirmPassword ? 'is-invalid' : ''}`}
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={handleChange}
          />

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>

        {message && (
          <div className="alert alert-info text-center mt-3" role="alert">
            {message}
          </div>
        )}

        <p className="text-center mt-3" style={{ color: '#e1c212' }}>
          Already have an account? <Link to="/login" style={{ color: '#8c8888' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
