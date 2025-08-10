import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';

const SignUpPage = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';

    if (!form.email) newErrors.email = 'Email is required';
    else if (!/@conestogac\.on\.ca$/.test(form.email)) {
      newErrors.email = 'Email must end with @conestogac.on.ca';
    }

    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Show toast for each error
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((error) => toast.error(error, { duration: 3000 }));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/signUp`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      toast.success(res.data.message, { duration: 3000 });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed', { duration: 3000 });
    }
  };

  return (
    <div className="app-background d-flex justify-content-center align-items-center">
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <div className="card shadow p-4 card-overlay" style={{ width: '100%', maxWidth: '400px' }}>
        <h3 className="text-center mb-4" style={{ color: '#e1c212' }}>Sign Up</h3>
        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-3"
            placeholder="First Name"
            name="firstName"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Last Name"
            name="lastName"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            placeholder="Email"
            name="email"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Password"
            name="password"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            type="password"
            placeholder="Confirm Password"
            name="confirmPassword"
            onChange={handleChange}
          />

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">Register</button>
          </div>
        </form>

        <p className="text-center mt-3" style={{ color: '#e1c212' }}>
          Already have an account? <Link to="/login" style={{ color: '#8c8888' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;