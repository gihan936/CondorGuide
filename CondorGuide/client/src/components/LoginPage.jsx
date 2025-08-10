import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Toaster, toast } from "react-hot-toast"; // Added for toast notifications
import "../App.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setError] = useState({});
  const [message, setMessage] = useState(""); // Kept for legacy alert, can be removed if using only toast
  const [variant, setVariant] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/";

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = "Email required";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter valid email";

    if (!password) newErrors.password = "Password required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/users/login`,
          {
            email,
            password,
          }
        );

        if (response.status === 200) {
          login(response.data.user, response.data.token);
          toast.success("Login successful!", { duration: 3000 }); // Success toast
          setTimeout(() => {
            navigate(from, { state: { from: undefined }, replace: true });
          }, 1000);
        }
      } catch (error) {
        toast.error("Login failed. Please check credentials.", {
          duration: 3000,
        }); // Error toast
      }
    }
  };

  return (
    <div className="app-background d-flex justify-content-center align-items-center">
      <Toaster position="top-right" reverseOrder={false} />
      <div
        className="card shadow p-4 card-overlay"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <h2 className="text-center mb-4" style={{ color: "#e1c212" }}>
          Condor Guide Login
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              type="email"
              className={`form-control custom-input ${
                errors.email ? "is-invalid" : ""
              }`}
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && (
              <div className="invalid-feedback d-block">{errors.email}</div>
            )}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              className={`form-control custom-input ${
                errors.password ? "is-invalid" : ""
              }`}
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && (
              <div className="invalid-feedback d-block">{errors.password}</div>
            )}
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Login
            </button>
          </div>
          <div className="text-center mt-2">
            <Link
              to="/forgot-password"
              className="btn btn-link text-decoration-none"
              style={{ color: "#8c8888" }}
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        {/* Removed message alert since we're using toast */}
        {/* {message && (
          <div className={`alert alert-${variant} text-center mt-3`} role="alert">
            {message}
          </div>
        )} */}

        <p className="text-center mt-3" style={{ color: "#e1c212" }}>
          Don't have an account?{" "}
          <Link to="/signup" style={{ color: "#8c8888" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
