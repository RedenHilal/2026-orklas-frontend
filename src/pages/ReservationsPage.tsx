import React, { useEffect, useState } from 'react';
import { BookOpenCheck, ShieldAlert, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import RoleGuard from '../http/ProtectedProp'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import getRole from '../http/Role';
import { 
  ReservationApi, 
  ReservationAdminApi, 
  ScheduleApi, 
  RoomApi, // Added RoomApi
  type Reservation, 
  type Schedule, 
  type Room, // Added Room
  ReservationStatusUpdateStatusEnum 
} from '../api'; 

export const ReservationStatus = {
  Waiting: 'waiting',
  Accepted: 'accepted',
  Denied: 'denied'
} as const;

export type ReservationStatusType = typeof ReservationStatus[keyof typeof ReservationStatus];

// --- SUB-COMPONENT: Single Reservation Card ---
const ReservationCard: React.FC<{ 
  reservation: Reservation; 
  schedule?: Schedule; 
  room?: Room; // Now accepts the matched room
  isAdminView?: boolean;
  onUpdate: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
}> = ({ reservation, schedule, room, isAdminView, onUpdate, onDelete }) => {
  
  const updateStatus = async (id: number, status: ReservationStatusUpdateStatusEnum) => {
    try {
      const api = new ReservationAdminApi(config, undefined, axiosInstance);
      const response = await api.updateReservationStatus(id, {
        status: status
      });

      if (response.status === 200) {
        onUpdate({ ...reservation, status: status as ReservationStatusType });
      }
    } catch (error) {
      console.error("Failed to update status", error);
    }
  }

  const cancelReservation = async (id: number) => {
    try {
      const api = new ReservationApi(config, undefined, axiosInstance);
      const response = await api.cancelReservation(id);
      
      if (response.status === 204) {
        onDelete(reservation);
      }
    } catch (error) {
      console.error("Failed to cancel reservation", error);
    }
  }

  const getStatusBadge = (status: ReservationStatusType) => {
    switch (status) {
      case 'accepted': 
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-highlight/10 text-highlight border border-highlight/50 rounded-sm text-xs font-black uppercase tracking-widest"><CheckCircle size={14} /> Accepted</span>;
      case 'waiting': 
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 text-white border border-gray-500 rounded-sm text-xs font-black uppercase tracking-widest"><Clock size={14} /> Waiting</span>;
      case 'denied': 
        return <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-accent/10 text-accent border border-accent/50 rounded-sm text-xs font-black uppercase tracking-widest"><XCircle size={14} /> Denied</span>;
      default: 
        return <span className="text-gray-500">{status}</span>;
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-gray-800 rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-600 transition-colors group">
      
      {/* Info Section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <div className="text-white font-black text-lg">
            {new Date(reservation.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div className="text-gray-500 font-mono text-xs mt-1">
            ID: #{reservation.id.toString().padStart(4, '0')}
          </div>
        </div>

        <div className="space-y-2">
          {/* Time Block */}
          <div className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Clock size={14} className="text-gray-500"/>
            <span className="text-highlight font-mono">
              {schedule ? `${schedule.startTime} - ${schedule.endTime}` : `Slot #${reservation.schedId}`}
            </span>
          </div>
          
          {/* Room Name Block */}
          <div className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <MapPin size={14} className="text-gray-500"/>
            <span className="text-secondary font-mono truncate max-w-[150px]" title={room ? room.name : 'Unknown'}>
              {room ? room.name : (schedule ? `Room ID: ${schedule.roomId}` : 'Unknown')}
            </span>
          </div>

          {/* Only show User ID in the Global Admin view */}
          {isAdminView && (
            <div className="text-xs text-accent font-mono bg-accent/10 inline-block px-1 border border-accent/30 rounded-sm mt-1">
              USER ID: {reservation.userId}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="text-sm text-gray-400 italic">
            {reservation.description ? `"${reservation.description}"` : "No description provided."}
          </div>
          <div className="text-[10px] text-gray-600 font-mono mt-2 uppercase">
            Logged: {new Date(reservation.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="flex items-center justify-between md:flex-col md:items-end md:justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-800 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
        {getStatusBadge(reservation.status)}

        {/* User actions */}
        {!isAdminView && (reservation.status === 'waiting') && (
          <button 
            className="text-[10px] text-accent border border-accent/30 hover:bg-accent hover:text-white px-3 py-1 rounded transition-all uppercase font-bold tracking-widest mt-1 shadow-[2px_2px_0px_#F72798]"
            onClick={() => cancelReservation(reservation.id)}
          >
            Cancel
          </button>
        )}
        
        {/* Admin Specific Actions for Global Registry */}
        {isAdminView && reservation.status === 'waiting' && (
          <div className="flex gap-2 mt-2">
            <button 
              className="text-[10px] text-highlight border border-highlight/30 hover:bg-highlight hover:text-black px-2 py-1 rounded transition-all uppercase font-bold tracking-widest shadow-[2px_2px_0px_#EBF400]"
              onClick={() => updateStatus(reservation.id, ReservationStatusUpdateStatusEnum.Accepted)}
            >
              Accept
            </button>
            <button 
              className="text-[10px] text-accent border border-accent/30 hover:bg-accent hover:text-white px-2 py-1 rounded transition-all uppercase font-bold tracking-widest shadow-[2px_2px_0px_#F72798]"
              onClick={() => updateStatus(reservation.id, ReservationStatusUpdateStatusEnum.Denied)}
            >
              Deny
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
const ReservationsPage: React.FC = () => {
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [allSchedules, setAllSchedules] = useState<Schedule[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  const onUpdate = (updated: Reservation) => {
    setAllReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
    setMyReservations(prev => prev.map(r => r.id === updated.id ? updated : r));
  }

  const onDelete = (deleted: Reservation) => {
    setAllReservations(prev => prev.filter(r => r.id !== deleted.id));
    setMyReservations(prev => prev.filter(r => r.id !== deleted.id));
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Schedules
        const schedApi = new ScheduleApi(config, undefined, axiosInstance);
        const schedResponse = await schedApi.listSchedules();
        setAllSchedules(schedResponse.data.items || schedResponse.data);

        // 2. Fetch Rooms
        const roomApi = new RoomApi(config, undefined, axiosInstance);
        const roomResponse = await roomApi.listRooms();
        // Fixed: Ensure we set the state here!
        setAllRooms(roomResponse.data.items || roomResponse.data);

        // 3. Fetch Reservations
        const resApi = new ReservationApi(config, undefined, axiosInstance);
        const myResponse = await resApi.listMyReservations();
        setMyReservations(myResponse.data.items || myResponse.data);

        if (getRole() === "Administrator"){
            const allResponse = await resApi.listReservationAll();
            setAllReservations(allResponse.data.items || allResponse.data);
        }

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper functions for matching
  const getScheduleForReservation = (schedId: number) => {
    return allSchedules.find(s => s.id === schedId);
  };

  const getRoomForSchedule = (schedId: number) => {
    const schedule = getScheduleForReservation(schedId);
    if (!schedule) return undefined;
    return allRooms.find(r => r.id === schedule.roomId);
  };

  if (loading) {
    return <div className="p-8 text-secondary animate-pulse font-mono tracking-widest">QUERYING DATABANKS...</div>;
  }

  return (
    <div className="space-y-12">
      
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-6">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <BookOpenCheck className="text-secondary" size={32} />
          RESERVATIONS
        </h2>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">
          Manage system bookings
        </p>
      </div>

      {/* SECTION 1: Personal Reservations (Visible to Everyone) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2 border-l-4 border-highlight pl-3">
          MY LOGS
        </h3>
        
        <div className="grid gap-4">
          {myReservations.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-gray-800 p-8 text-center text-gray-500 font-mono rounded-lg">
              NO PERSONAL RESERVATIONS FOUND.
            </div>
          ) : (
            myReservations.map((res) => (
              <ReservationCard 
                key={res.id} 
                reservation={res} 
                schedule={getScheduleForReservation(res.schedId)}
                room={getRoomForSchedule(res.schedId)} // Passed Room Data
                isAdminView={false} 
                onUpdate={onUpdate} 
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* SECTION 2: Global Registry (Visible ONLY to Administrators) */}
      <RoleGuard roles={['Administrator']}>
        <div className="space-y-4 pt-8 border-t border-gray-800 border-dashed">
          <h3 className="text-xl font-bold text-secondary flex items-center gap-2 border-l-4 border-secondary pl-3">
            <ShieldAlert size={20} />
            GLOBAL REGISTRY (ADMIN ACCESS)
          </h3>
          
          <div className="grid gap-4">
            {allReservations.length === 0 ? (
              <div className="bg-[#0A0A0A] border border-gray-800 p-8 text-center text-gray-500 font-mono rounded-lg">
                GLOBAL REGISTRY IS EMPTY.
              </div>
            ) : (
              allReservations.map((res) => (
                <ReservationCard 
                  key={`global-${res.id}`} 
                  reservation={res} 
                  schedule={getScheduleForReservation(res.schedId)}
                  room={getRoomForSchedule(res.schedId)} // Passed Room Data
                  isAdminView={true} 
                  onUpdate={onUpdate}
                  onDelete={onDelete} 
                />
              ))
            )}
          </div>
        </div>
      </RoleGuard>

    </div>
  );
};

export default ReservationsPage;
