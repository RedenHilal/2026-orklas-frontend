import React, { useEffect, useState } from 'react';
import { type RoomListResponse, RoomApi } from '../api';
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import RoleGuard from '../http/ProtectedProp';
import { 
  PieChart, 
  Activity, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Lock,
  MonitorPlay
} from 'lucide-react';

// --- Component ---
const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    reserved: 0,
    closed: 0,
    class: 0,
    laboratory: 0,
    theater: 0
  });

  useEffect(() => {
    // Simulate API Call - Replace this with: const response = await roomApi.getRooms();
    const fetchStats = async () => {
      try {
        setLoading(true);
		const api = new RoomApi(config, undefined, axiosInstance);
		const response = await api.listRooms(undefined, undefined, undefined, undefined, undefined, undefined);
        
		const data = response.data;
        // Calculate Statistics
        const newStats = data.reduce((acc, room) => {
          // Count Status
          acc[room.status]++;
          // Count Type
          acc[room.roomType]++;
          return acc;
        }, {
          total: data.length, // or mockData.items.length
          open: 0,
          reserved: 0,
          closed: 0,
          class: 0,
          laboratory: 0,
          theater: 0
        });

        setStats(newStats);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-8 text-accent animate-pulse">LOADING SYSTEM METRICS...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-bold text-white tracking-tight">DASHBOARD</h2>
        <p className="text-gray-500 text-sm">Real-time facility monitoring</p>
      </div>

      {/* --- TOP STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Rooms */}
        <div className="bg-[#111] p-6 rounded border-l-4 border-gray-500 shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <PieChart size={64} />
          </div>
          <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Total Facilities</p>
          <h3 className="text-4xl font-black text-white mt-2">{stats.total}</h3>
        </div>

        {/* Available (Open) */}
        <div className="bg-[#111] p-6 rounded border-l-4 border-highlight shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-highlight">
            <CheckCircle2 size={64} />
          </div>
          <p className="text-highlight text-xs uppercase tracking-wider font-semibold">Available Now</p>
          <h3 className="text-4xl font-black text-white mt-2">{stats.open}</h3>
        </div>

        {/* Reserved */}
        <div className="bg-[#111] p-6 rounded border-l-4 border-accent shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-accent">
            <Users size={64} />
          </div>
          <p className="text-accent text-xs uppercase tracking-wider font-semibold">Currently Reserved</p>
          <h3 className="text-4xl font-black text-white mt-2">{stats.reserved}</h3>
        </div>

        {/* Closed/Maintenance */}
        <div className="bg-[#111] p-6 rounded border-l-4 border-secondary shadow-lg relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-secondary">
            <Lock size={64} />
          </div>
          <p className="text-secondary text-xs uppercase tracking-wider font-semibold">Maintenance / Closed</p>
          <h3 className="text-4xl font-black text-white mt-2">{stats.closed}</h3>
        </div>
      </div>

      {/* --- DETAILED STATISTICS SECTIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Room Type Distribution */}
        <div className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MonitorPlay className="text-secondary" size={20} />
              ROOM COMPOSITION
            </h3>
          </div>

          <div className="space-y-6">
            {/* Classrooms */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Classrooms</span>
                <span className="text-gray-500">{stats.class} Units</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary" 
                  style={{ width: `${(stats.class / stats.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Laboratories */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Laboratories</span>
                <span className="text-gray-500">{stats.laboratory} Units</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent" 
                  style={{ width: `${(stats.laboratory / stats.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Theaters */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">Theaters</span>
                <span className="text-gray-500">{stats.theater} Units</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-highlight" 
                  style={{ width: `${(stats.theater / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Health / Status Overview */}
        <div className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-lg">
           <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="text-highlight" size={20} />
              OPERATIONAL STATUS
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-[#111] p-4 rounded text-center border border-gray-800">
                <span className="block text-3xl font-bold text-highlight mb-1">
                  {Math.round((stats.open / stats.total) * 100) || 0}%
                </span>
                <span className="text-xs text-gray-500 uppercase">Availability Rate</span>
             </div>
             
             <div className="bg-[#111] p-4 rounded text-center border border-gray-800">
                <span className="block text-3xl font-bold text-accent mb-1">
                  {Math.round((stats.reserved / stats.total) * 100) || 0}%
                </span>
                <span className="text-xs text-gray-500 uppercase">Utilization Rate</span>
             </div>

             <div className="col-span-2 mt-2 p-3 bg-secondary/10 border border-secondary/30 rounded flex items-start gap-3">
                <AlertCircle className="text-secondary shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-bold text-secondary">Maintenance Alert</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats.closed} facilities are currently marked as "Closed" and require attention or schedule adjustment.
                  </p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
