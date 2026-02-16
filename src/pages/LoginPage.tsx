import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { UserApi } from '../api'; 
import type { LoginRequest, UserCreate } from '../api';
import { AxiosError } from 'axios';
import axiosInstance from '../http/axiosInstance';
import config from '../http/config';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // View Toggle State
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // State for Login
  const [loginCredentials, setLoginCredentials] = useState<LoginRequest>({
    username: '',    
    password: ''
  });

  // State for Registration
  const [registerData, setRegisterData] = useState<UserCreate>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginCredentials({
      ...loginCredentials,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleToggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError(null);
  };

  // Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const api = new UserApi(config, undefined, axiosInstance);
      const response = await api.loginUser(loginCredentials);
      
      const token = response.data.accessToken; 

      if (token) {
        localStorage.setItem('accessToken', token);
        navigate('/'); 
      } else {
        setError("Login succeeded but no token was received.");
      }
    } catch (err) {
      const axiosError = err as AxiosError<{message: string}>;
      if (axiosError.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError(axiosError.response?.data?.message || "Connection failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register Submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const api = new UserApi(config, undefined, axiosInstance);
      
      // Clean up optional fields so we don't send empty strings if not needed
      const payload: UserCreate = {
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        ...(registerData.firstName && { firstName: registerData.firstName }),
        ...(registerData.lastName && { lastName: registerData.lastName }),
        ...(registerData.phone && { phone: registerData.phone }),
      };

      // 1. Create the user
      await api.createUser(payload);

      // 2. Automatically log them in after successful registration
      const loginResponse = await api.loginUser({
        username: payload.username,
        password: payload.password
      });

      const token = loginResponse.data.accessToken;
      if (token) {
        localStorage.setItem('accessToken', token);
        navigate('/'); 
      }

    } catch (err) {
      const axiosError = err as AxiosError<{message: string}>;
      setError(axiosError.response?.data?.message || "Registration failed. Username or email might be taken.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center bg-bg p-4 font-sans">
      <div className="w-full relative flex items-center justify-center">
        
        <div className="relative bg-[#111111] border border-gray-800 p-8 rounded-lg w-full max-w-md shadow-2xl transition-all duration-300">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-black text-accent tracking-tighter mb-2">
              Orkla<span className="text-white">s</span>
            </h1>
            <p className="text-gray-400 text-sm tracking-widest uppercase">
              {isLoginMode ? "Secure your favourite spot" : "Create new account"}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex bg-black p-1 rounded border border-gray-800 mb-6">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                isLoginMode ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Access
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                !isLoginMode ? 'bg-secondary/20 text-secondary' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Register
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border-l-4 border-accent text-white text-sm">
              <span className="font-bold mr-2">ERROR:</span> {error}
            </div>
          )}

          {/* === LOGIN FORM === */}
          {isLoginMode ? (
            <form onSubmit={handleLoginSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="group">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">User Identity</label>
                <input
                  name="username"
                  type="text"
                  required
                  value={loginCredentials.username}
                  onChange={handleLoginChange}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all placeholder-gray-600"
                  placeholder="Enter username"
                />
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">Passcode</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={loginCredentials.password}
                  onChange={handleLoginChange}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all placeholder-gray-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-3 px-4 rounded transition-all transform
                  ${isLoading 
                    ? 'bg-gray-600 cursor-wait opacity-70' 
                    : 'bg-accent hover:bg-pink-600 hover:-translate-y-1 active:translate-y-0 text-white'
                  }`}
              >
                {isLoading ? "Authenticating..." : "Log In"}
              </button>
            </form>
          ) : (
            /* === REGISTER FORM === */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="group">
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Username *</label>
                <input
                  name="username"
                  type="text"
                  required
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-secondary transition-all"
                  placeholder="sys_admin_99"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-secondary transition-all"
                  placeholder="user@network.com"
                />
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1">Passcode *</label>
                <input
                  name="password"
                  type="password"
                  required
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-secondary transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="group">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    value={registerData.firstName}
                    onChange={handleRegisterChange}
                    className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-secondary transition-all"
                    placeholder="Optional"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    value={registerData.lastName}
                    onChange={handleRegisterChange}
                    className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-secondary transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  name="phone"
                  type="text"
                  value={registerData.phone}
                  onChange={handleRegisterChange}
                  className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-secondary transition-all"
                  placeholder="Optional"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-bold py-3 px-4 rounded mt-2 transition-all transform
                  ${isLoading 
                    ? 'bg-gray-600 cursor-wait opacity-70' 
                    : 'bg-secondary hover:bg-[#ff8a2b] hover:-translate-y-1 active:translate-y-0 text-black'
                  }`}
              >
                {isLoading ? "PROCESSING..." : "Create Account"}
              </button>
            </form>
          )}

          {/* Footer Decoration */}
          <div className="mt-8 flex justify-between text-[10px] text-gray-600 font-mono">
            <span>Always <span className="text-accent">Orkla<span className="text-white">s</span></span></span>
            <span>Always the Best</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
