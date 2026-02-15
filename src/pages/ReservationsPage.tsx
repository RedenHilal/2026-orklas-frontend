import React, { useEffect, useState } from 'react';
import { BookOpenCheck, ShieldAlert, CheckCircle, Clock, XCircle } from 'lucide-react';
import RoleGuard from '../http/ProtectedProp'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import { ReservationApi, type ReservationListResponse, type Reservation, type ReservationStatus, ReservationAdminApi, ReservationStatusUpdateStatusEnum } from '../api'; 
import getRole from '../http/Role';

export const ReservationStatus = {
  Waiting: 'waiting',
  Accepted: 'accepted',
  Denied: 'denied'
} as const;


// --- SUB-COMPONENT: Single Reservation Card ---
const ReservationCard: React.FC<{ 
  reservation: Reservation; 
  isAdminView?: boolean;
}> = ({ reservation, isAdminView }) => {
  
  const updateStatus = async (id : number, status : ReservationStatusUpdateStatusEnum) => {
	const api = new ReservationAdminApi(config, undefined, axiosInstance);
	const response = await api.updateReservationStatus(id, {
		status : status
	});
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

        <div className="space-y-1">
          <div className="text-sm font-bold text-gray-300 uppercase tracking-wider">
            Sched ID: <span className="text-highlight font-mono">{reservation.schedId}</span>
          </div>
          {/* Only show User ID in the Global Admin view */}
          {isAdminView && (
            <div className="text-xs text-secondary font-mono bg-secondary/10 inline-block px-1 border border-secondary/30 rounded-sm">
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

        {/* User actions (or Admin revoking from their own list) */}
        {!isAdminView && (reservation.status === 'waiting' || reservation.status === 'accepted') && (
          <button className="text-[10px] text-accent border border-accent/30 hover:bg-accent hover:text-white px-3 py-1 rounded transition-all uppercase font-bold tracking-widest mt-1">
            Cancel
          </button>
        )}
        
        {/* Admin Specific Actions for Global Registry */}
        {isAdminView && reservation.status === 'waiting' && (
          <div className="flex gap-2 mt-2">
            <button className="text-[10px] text-highlight border border-highlight/30 hover:bg-highlight hover:text-black px-2 py-1 rounded transition-all uppercase font-bold tracking-widest"
			onClick={() => updateStatus(reservation.id, ReservationStatusUpdateStatusEnum.Accepted)}
>
              Accept
            </button>
            <button className="text-[10px] text-accent border border-accent/30 hover:bg-accent hover:text-white px-2 py-1 rounded transition-all uppercase font-bold tracking-widest"
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
  const [loading, setLoading] = useState(true);
  
  const currentUserId = 99; // Mock: Replace with actual auth context user ID

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
		const api = new ReservationApi(config, undefined, axiosInstance);
		const myResponse = await api.listMyReservations();
		setMyReservations(myResponse.data.items);

		if (getRole() == "Administrator"){
			const allResponse = await api.listReservationAll();
			setAllReservations(allResponse.data.items);
		}

		setLoading(false);
      } catch (error) {
        console.error("Failed to fetch reservations", error);
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);


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
              <ReservationCard key={res.id} reservation={res} isAdminView={false} />
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
                <ReservationCard key={`global-${res.id}`} reservation={res} isAdminView={true} />
              ))
            )}
          </div>
        </div>
      </RoleGuard>

    </div>
  );
};

export default ReservationsPage;
