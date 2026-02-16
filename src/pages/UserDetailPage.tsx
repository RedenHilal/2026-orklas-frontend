import React, { useEffect, useState } from 'react';
import { User, Mail, Phone, Shield, Edit, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import getRole from '../http/Role'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import { UserApi, type UserUpdate } from '../api'; 

// Inferred full user interface
export interface FullUser {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

const UserDetailPage: React.FC = () => {
  const [user, setUser] = useState<FullUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserUpdate>({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const currentRole = getRole();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = new UserApi(config, undefined, axiosInstance);
        const response = await api.getCurrentUser();
        
        const userData = response.data;
        setUser(userData);
        
        // Pre-fill form data
        setFormData({
          email: userData.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || ''
        });
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setError("SYS.ERR: UNABLE TO RETRIEVE IDENTITY DATA.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear notifications when user types
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check: Ensure we have the user ID from the fetched profile
    if (!user?.id) {
      setError("CRITICAL: Identity ID missing from system payload.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const api = new UserApi(config, undefined, axiosInstance);
      
      // Clean empty strings into undefined so we don't overwrite with blanks accidentally
      const payload: UserUpdate = {
        email: formData.email,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        phone: formData.phone || undefined
      };

      // Pass user.id directly
      await api.updateUser(user.id, payload);
      
      // Update local view state
      setUser(prev => prev ? { ...prev, ...payload } : null);
      setSuccess("IDENTITY PARAMETERS UPDATED SUCCESSFULLY.");
      setIsEditing(false); // Close edit mode on success

    } catch (err) {
      console.error("Update failed", err);
      setError("UPDATE REJECTED: Invalid data or network error.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-highlight animate-pulse font-mono tracking-widest">DECRYPTING IDENTITY MATRICES...</div>;
  }

  if (!user) {
    return (
      <div className="p-8 text-red-500 font-mono border border-red-900 bg-red-900/10 rounded">
        FATAL ERROR: IDENTITY NOT FOUND.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <User className="text-highlight" size={32} />
            USER PROFILE
          </h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">
            Identity & Authorization Terminal
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Clearance:</span>
          <span className={`px-3 py-1 text-xs font-black uppercase tracking-widest rounded-sm border shadow-[0_0_10px_rgba(255,255,255,0.1)]
            ${currentRole === 'Administrator' ? 'bg-secondary/20 text-secondary border-secondary/50 shadow-[0_0_10px_rgba(245,125,31,0.2)]' : 'bg-white/10 text-white border-white/30'}`}
          >
            <Shield size={12} className="inline mr-1.5 mb-0.5" />
            {currentRole || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-900/20 border-l-4 border-accent text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={20} className="text-accent shrink-0" />
          <span className="font-mono text-sm tracking-widest uppercase">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-highlight/10 border-l-4 border-highlight text-white flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle size={20} className="text-highlight shrink-0" />
          <span className="font-mono text-sm tracking-widest uppercase">{success}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: Identity Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-lg text-center relative overflow-hidden group">
            <div className="w-24 h-24 mx-auto bg-gray-900 border-2 border-gray-800 rounded-full flex items-center justify-center mb-4 group-hover:border-highlight transition-colors relative z-10">
              <User size={40} className="text-gray-600 group-hover:text-highlight transition-colors" />
            </div>
            
            <h3 className="text-xl font-black text-white uppercase tracking-wider">{user.username}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">ID: #{user.id.toString().padStart(4, '0')}</p>
            
            <div className="mt-6 pt-6 border-t border-gray-800 space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-secondary" />
                <span className="text-gray-300 truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-accent" />
                  <span className="text-gray-300 font-mono">{user.phone}</span>
                </div>
              )}
            </div>

            {/* Decorative background lines */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-highlight/5 rounded-full blur-2xl pointer-events-none"></div>
          </div>
        </div>

        {/* RIGHT PANEL: Details & Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-lg h-full relative">
            
            {/* Panel Header */}
            <div className="bg-[#111] p-5 border-b border-gray-800 flex justify-between items-center rounded-t-lg">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                {isEditing ? 'MODIFY PARAMETERS' : 'IDENTITY PARAMETERS'}
              </h3>
              
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-xs font-bold text-secondary bg-highlight hover:bg-[#d4db00] px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-[2px_2px_0px_#F57D1F]"
                >
                  <Edit size={14} /> Edit
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data back to current user state if they cancel
                    setFormData({
                      email: user.email,
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      phone: user.phone || ''
                    });
                  }}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white bg-gray-900 px-3 py-1.5 rounded uppercase tracking-wider transition-colors"
                >
                  <X size={14} /> Cancel
                </button>
              )}
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">First Name</label>
                  <div className="text-white text-lg">{user.firstName || <span className="text-gray-700 italic text-sm">Not specified</span>}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Last Name</label>
                  <div className="text-white text-lg">{user.lastName || <span className="text-gray-700 italic text-sm">Not specified</span>}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Email Address</label>
                  <div className="text-white">{user.email}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Comms Link (Phone)</label>
                  <div className="text-white font-mono">{user.phone || <span className="text-gray-700 italic text-sm">Not specified</span>}</div>
                </div>
              </div>
            ) : (
              /* Edit Mode Form */
              <form onSubmit={handleSave} className="p-6 space-y-6 animate-in fade-in duration-300">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                    <input
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all"
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Email Address *</label>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Comms Link (Phone)</label>
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-black border border-gray-700 text-white px-3 py-2.5 rounded text-sm focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-2 rounded text-xs font-black uppercase tracking-widest transition-all
                      ${isSaving 
                        ? 'bg-gray-800 text-gray-500 cursor-wait' 
                        : 'bg-highlight/10 text-highlight border border-highlight/50 hover:bg-highlight hover:text-black shadow-[2px_2px_0px_#EBF400]'
                      }`}
                  >
                    {isSaving ? 'OVERWRITING...' : <><Save size={16} /> SAVE CHANGES</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDetailPage;
