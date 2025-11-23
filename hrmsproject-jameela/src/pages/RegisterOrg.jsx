import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterOrg.css';

const RegisterOrg = () => {
  const [formData, setFormData] = useState({
    orgName: '',
    adminName: '',
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate input
  const validateForm = () => {
    const newErrors = {};

    if (!formData.orgName.trim()) {
      newErrors.orgName = 'Organisation name is required';
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch(`https://hrms-jsproject.onrender.com/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to login page
      navigate('/login');

    } catch (error) {
      setApiError(error.message);
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">

        <div className="register-header">
          <h2>Create Organisation Account</h2>
          <p>
            Already have an account?{" "}
            <button className="login-link" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </p>
        </div>

        {apiError && <div className="error-alert">{apiError}</div>}

        <form onSubmit={handleSubmit} className="register-form">

          <div className="form-group">
            <label>Organisation Name</label>
            <input
              type="text"
              name="orgName"
              value={formData.orgName}
              onChange={handleChange}
              className={errors.orgName ? "error" : ""}
            />
            {errors.orgName && <p className="error-message">{errors.orgName}</p>}
          </div>

          <div className="form-group">
            <label>Admin Name</label>
            <input
              type="text"
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              className={errors.adminName ? "error" : ""}
            />
            {errors.adminName && <p className="error-message">{errors.adminName}</p>}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              autoComplete="email"
            />
            {errors.email && <p className="error-message">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              autoComplete="new-password"
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <span className="loading-text">
                <span className="loading-spinner"></span>
                Creating account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default RegisterOrg;
