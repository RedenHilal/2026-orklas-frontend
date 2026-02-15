import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router'
import { Plus, Edit, Trash2, CalendarPlus, MapPin, Tag } from 'lucide-react';
import RoleGuard from '../http/ProtectedProp'; // Adjust path as needed
import { type Room, type RoomListResponse, RoomApi} from '../api'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API Call - Replace with: const response = await roomApi.getRooms();
    const fetchRooms = async () => {
      setLoading(true);
      try {
		const api = new RoomApi(config, undefined, axiosInstance);
		const response = await api.listRooms();
		const data = response.data;
        
        setRooms(data);
      } catch (error) {
        console.error("Failed to load facilities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // Helper to get neon colors based on room status
  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'open': return 'text-highlight border-highlight';
      case 'reserved': return 'text-accent border-accent';
      case 'closed': return 'text-secondary border-secondary';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  if (loading) {
    return <div className="p-8 text-accent animate-pulse font-mono tracking-widest">SCANNING FACILITIES...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">FACILITIES DIRECTORY</h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">View and manage system rooms</p>
        </div>

        {/* ADMIN ONLY: Add Room Button */}
        <RoleGuard roles={['administrator']}>
          <button className="flex items-center gap-2 bg-accent hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_#F57D1F]">
            <Plus size={20} />
            <span>INITIALIZE NEW ROOM</span>
          </button>
        </RoleGuard>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div 
            key={room.id} 
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg overflow-hidden group hover:border-gray-600 transition-colors relative"
          >
            {/* Status Indicator Bar (Top edge) */}
            <div className={`h-1 w-full border-t-2 ${getStatusColor(room.status)}`}></div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">{room.name}</h3>
                
                {/* Status Badge */}
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border rounded-sm ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <MapPin size={16} className="text-secondary" />
                  <span className="capitalize font-mono">{room.roomType}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Tag size={16} className="text-highlight" />
                  <span className="font-mono">Tags: {room.tagIds.length > 0 ? room.tagIds.join(', ') : 'None'}</span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800/50">
                
                {/* EVERYONE: Reserve Button (Disable if closed) */}
                <RoleGuard roles={['Administrator', 'Lecturer', 'Student']}>
                  <button 
                    disabled={room.status === 'closed'}
					onClick={() => navigate(`/rooms/${room.id}`)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded text-sm font-bold transition-all
                      ${room.status === 'closed' 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'bg-white/5 text-highlight hover:bg-highlight hover:text-black border border-highlight/30 hover:border-highlight'
                      }`}
                  >
                    <CalendarPlus size={16} />
                    RESERVE
                  </button>
                </RoleGuard>

                {/* ADMIN ONLY: Edit & Delete */}
                <RoleGuard roles={['Administrator']}>
                  <button className="p-2 text-gray-400 hover:text-secondary bg-white/5 hover:bg-secondary/20 rounded transition-colors" title="Edit Room">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-accent bg-white/5 hover:bg-accent/20 rounded transition-colors" title="Delete Room">
                    <Trash2 size={16} />
                  </button>
                </RoleGuard>

              </div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default RoomsPage;
