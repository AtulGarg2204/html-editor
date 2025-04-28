import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-900 rounded-xl shadow-lg p-8 border border-dark-800">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif text-primary font-bold">DARWIN</Link>
          <h2 className="text-2xl font-serif text-white mt-6 mb-2">Welcome Back</h2>
          <p className="text-gray-300">Sign in to continue to your account</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-gray-200 mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="text-gray-200">Password</label>
              <Link to="/forgot-password" className="text-primary hover:text-primary-400 text-sm">
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary shadow-glow mb-6"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="text-center text-gray-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-primary-400">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;