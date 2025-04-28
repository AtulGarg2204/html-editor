import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        name,
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-dark-900 rounded-xl shadow-lg p-8 border border-dark-800">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-serif text-primary font-bold">DARWIN</Link>
          <h2 className="text-2xl font-serif text-white mt-6 mb-2">Create Account</h2>
          <p className="text-gray-300">Sign up to get started with DARWIN</p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="name" className="block text-gray-200 mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleChange}
              className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

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
            <label htmlFor="password" className="block text-gray-200 mb-2">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength="6"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-gray-200 mb-2">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              className="w-full bg-dark-800 border border-dark-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="w-full btn btn-primary shadow-glow mb-6"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="text-center text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-primary-400">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;