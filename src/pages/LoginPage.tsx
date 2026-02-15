import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserApi } from '../api'; // The instance we created above
import type { LoginRequest } from '../api';
import { AxiosError } from 'axios';
import axiosInstance from '../http/axiosInstance';
import config from '../http/config';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State for form fields matching LoginRequest interface
  const [credentials, setCredentials] = useState<LoginRequest>({
    username: '',    // or username, depending on your swagger definition
    password: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Call the generated API method
	  const api = new UserApi(config, undefined, axiosInstance);
      const response = await api.loginUser(credentials);
      
      // 2. Extract token (Adjust 'accessToken' based on your actual API response shape)
      // The generated API usually returns { data: { ... }, status: ... }
      const token = response.data.accessToken; 

      if (token) {
        localStorage.setItem('accessToken', token);
        // 3. Navigate to Dashboard
        navigate('/'); 
      } else {
        setError("Login succeeded but no token was received.");
      }

    } catch (err) {
      const axiosError = err as AxiosError<{message: string}>;
      // Handle generic or specific errors
      if (axiosError.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError(axiosError.response?.data?.message || "Connection failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-bg p-4 font-sans">
      <div className="w-full relative flex items-center justify-center">
        
        <div className="relative bg-[#111111] border border-gray-800 p-8 rounded-lg max-w-md">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-accent tracking-tighter mb-2">
              Orkla<span className="text-white">s</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-widest uppercase">Secure your favourite spot</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border-l-4 border-accent text-white text-sm">
              <span className="font-bold mr-2">ERROR:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username */}
            <div className="group">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                User Identity
              </label>
              <input
                name="username"
                type="text"
                required
                value={credentials.username}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all placeholder-gray-600"
                placeholder="Enter username"
              />
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Passcode
              </label>
              <input
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full font-bold py-3 px-4 rounded  transition-all transform
                ${isLoading 
                  ? 'bg-gray-600 cursor-wait opacity-70' 
                  : 'bg-accent hover:bg-pink-600 hover:-translate-y-1 active:translate-y-0 text-white'
                }`}
            >
              {isLoading ? "AUTHENTICATING..." : "INITIATE SESSION"}
            </button>
          </form>

          {/* Footer Decoration */}
          <div className="mt-8 flex justify-between text-[10px] text-gray-600 font-mono">
            <span>SYS.VER.2.0</span>
            <span>ENCRYPTED_CONN</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
