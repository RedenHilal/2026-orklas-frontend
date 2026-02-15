import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router'; // Changed to react-router-dom for consistency
import { Plus, MapPin, Tag, ArrowRight } from 'lucide-react';
import RoleGuard from '../http/ProtectedProp'; 
import { type Room, RoomApi, type RoomCreate } from '../api'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import CreateRoomModal from '../components/CreateRoomModal'; // Import the new modal

const RoomsPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // Abstracted fetchRooms so we can reuse it after creating a new room
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const api = new RoomApi(config, undefined, axiosInstance);
      const response = await api.listRooms();
      setRooms(response.data.items || response.data);
    } catch (error) {
      console.error("Failed to load facilities", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Handler for creating a new room
  const handleCreateRoom = async (payload: RoomCreate) => {
    const api = new RoomApi(config, undefined, axiosInstance);
    // Assuming your generated API has a createRoom method
    await api.createRoom(payload); 
    
    // Refresh the list seamlessly
    fetchRooms();
  };

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'open': return 'text-highlight border-highlight';
      case 'reserved': return 'text-accent border-accent';
      case 'closed': return 'text-secondary border-secondary';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  if (loading && rooms.length === 0) {
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
        <RoleGuard roles={['Administrator']}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-accent hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_#F57D1F]"
          >
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
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="bg-[#0A0A0A] border border-gray-800 rounded-lg overflow-hidden group hover:border-highlight/50 hover:shadow-[0_0_15px_rgba(235,244,0,0.1)] transition-all relative cursor-pointer"
          >
            {/* Status Indicator Bar */}
            <div className={`h-1 w-full border-t-2 ${getStatusColor(room.status)}`}></div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider group-hover:text-highlight transition-colors">
                  {room.name}
                </h3>
                
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 border rounded-sm ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>

              <div className="space-y-3 mb-2">
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <MapPin size={16} className="text-secondary" />
                  <span className="capitalize font-mono">{room.roomType}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Tag size={16} className="text-highlight" />
                  <span className="font-mono truncate">Tags: {room.tagIds.length > 0 ? room.tagIds.join(', ') : 'None'}</span>
                </div>
              </div>

              {/* Subdued action hint on hover */}
              <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-mono text-highlight flex items-center gap-1 uppercase tracking-widest">
                  Access Terminal <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Hidden Create Modal */}
      <CreateRoomModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRoom}
      />

    </div>
  );
};

export default RoomsPage;
