import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { UserApi } from '../api'; // Utilizing your generated API instance
import { 
  LayoutDashboard, 
  DoorOpen, 
  CalendarClock, 
  BookOpenCheck, 
  Users, 
  LogOut,
  Menu
} from 'lucide-react';
import '../App.css';

const RootLayout: React.FC = () => {
  const navigate = useNavigate();

  // Navigation Items Configuration
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Rooms', path: '/rooms', icon: DoorOpen },
    { name: 'Schedules', path: '/schedules', icon: CalendarClock },
    { name: 'Reservations', path: '/reservations', icon: BookOpenCheck },
    { name: 'Users', path: '/users', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      // Attempt server-side logout (optional based on your API strictness)
      await userApi.logoutUser();
    } catch (error) {
      console.error("Logout request failed, clearing local session anyway.", error);
    } finally {
      // Always clear token and redirect
      localStorage.removeItem("accessToken");
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-bg min-w-screen text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 flex flex-col border-r border-gray-800 bg-[#050505]">
        
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-2xl font-black tracking-tighter text-accent">
            Orkla<span className="text-white">s</span>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'} 
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200 group
                ${isActive 
                  ? 'bg-accent/10 text-accent border-r-2 border-accent' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={isActive ? "text-accent" : "text-gray-500 group-hover:text-white"} 
                  />
                  <span className="font-medium">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-3 py-3 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-md transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-bg relative">
        
        {/* Top Header (Optional - good for showing page title or user info) */}
        <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-[#050505]">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-highlight animate-pulse"></span>
            SYSTEM ONLINE
          </div>
          <div className="flex items-center gap-4">
             {/* You can add a user avatar or current date here */}
             <div className="w-8 h-8 rounded bg-gray-800 border border-gray-700"></div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-8 relative">
           {/* Decorative background glow */}
           <div className="fixed top-0 left-64 w-[500px] h-[500px] bg-accent/5 blur-[100px] pointer-events-none rounded-full" />
           
           {/* The actual page content renders here */}
           <div className="relative z-10 max-w-7xl mx-auto">
             <Outlet />
           </div>
        </div>
      </main>

    </div>
  );
};

export default RootLayout;
