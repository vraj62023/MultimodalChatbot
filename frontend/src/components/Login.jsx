import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { Lock, Mail } from 'lucide-react';
import { login } from '../utils/api'; // Use the API helper now

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Call Backend via API helper
      const res = await login(email, password);

      // --- ROBUST FIX START ---
      // 2. Check: Did we actually get a token?
      // Some backends send 'token', others 'accessToken'. Let's check both.
      const receivedToken = res.data.token || res.data.accessToken;

      if (!receivedToken) {
        console.error("Login successful, but no token found in response:", res.data);
        setError("Login failed: Server sent no token.");
        return; 
      }

      // 3. Save Valid Token
      localStorage.setItem('token', receivedToken);
      
      // 4. Go to Chat
      navigate('/chat');
      // --- ROBUST FIX END ---

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">AI Chatbot Login</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign In
          </button>
        </form>

        {/* --- NEW SIGNUP LINK --- */}
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign Up
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default Login;