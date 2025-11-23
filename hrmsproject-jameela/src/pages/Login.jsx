import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // clear field error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  // Submit Request
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('https://hrms-jsproject.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log("data=",data)

      if (!response.ok) {
        throw new Error(data.error || "Invalid login credentials");
      }

      // Save JWT
      Cookies.set('jwt_token', data.token, {
        expires: 7,
        path: '/'
      });
      Cookies.set("user", JSON.stringify(data.user));
      // Redirect to dashboard or employees
      navigate('/dashboard');

    } catch (error) {
      setApiError(error.message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="login-container">
      <div className="login-box">

        <div className="login-header">
          <h2>Welcome back</h2>
          <p>
            Don’t have an account?{' '}
            <button onClick={() => navigate('/register')} className="register-link">
              Register Organisation
            </button>
          </p>
        </div>

        {apiError && <div className="error-alert">{apiError}</div>}

        <form onSubmit={handleSubmit} className="login-form">

          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              autoComplete="email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              autoComplete="current-password"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <span className="loading-text">
                <span className="loading-spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

        </form>
        
      </div>
    </div>
  );
};

export default Login;
