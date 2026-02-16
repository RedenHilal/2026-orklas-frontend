import React, { useEffect, useState } from 'react';
import { Clock, Plus, Trash2, Edit, CalendarCheck, CalendarX, AlertCircle } from 'lucide-react';
import RoleGuard from '../http/ProtectedProp'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import { ScheduleApi } from '../api'; 
// Assuming you have these modals available from previous steps
import BookingModal from '../components/BookingModal';
import { type ReservationCreate, ReservationApi } from '../api';

export interface Schedule {
  id: number;
  roomId: number;
  startTime: string; 
  endTime: string;   
  isReserved: boolean;
}

const SchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const api = new ScheduleApi(config, undefined, axiosInstance);
      const response = await api.listSchedules();
      setSchedules(response.data.items || response.data);
    } catch (err) {
      console.error("Failed to fetch schedules", err);
      setError("FAILED TO SYNC GLOBAL TIMETABLE.");
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE HANDLER ---
  const handleDeleteSchedule = async (id: number) => {
    // Optional: You could add a confirmation window here like we did for Rooms
    if (!window.confirm(`Are you sure you want to purge Timeslot #${id}?`)) return;

    try {
      const api = new ScheduleApi(config, undefined, axiosInstance);
      // Adjust method name based on your swagger API
      await api.deleteSchedule(id);
      
      // Remove from local state immediately to update UI
      setSchedules(prev => prev.filter(schedule => schedule.id !== id));
      
    } catch (err) {
      console.error("Failed to delete schedule", err);
      // You might want to use a toast notification here instead of a global error
      alert("SYS.ERR: Failed to purge timeslot. It may be linked to an active reservation.");
    }
  };

  // --- BOOKING HANDLERS ---
  const openBookingModal = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setBookingModalOpen(true);
  };

  const handleCreateReservation = async (payload: ReservationCreate) => {
    try {
      const api = new ReservationApi(config, undefined, axiosInstance);
      await api.createReservation(payload);
      
      // Optionally re-fetch schedules to show it as reserved
      // fetchSchedules(); 
      
      setBookingModalOpen(false);
    } catch (err) {
      console.error("Booking failed", err);
      throw err; // Let the modal handle the error display if you set it up that way
    }
  };

  if (loading && schedules.length === 0) {
    return <div className="p-8 text-highlight animate-pulse font-mono tracking-widest">SYNCING GLOBAL TIMETABLE...</div>;
  }

  return (
    <div className="space-y-8">
      
      {/* Booking Modal Integration */}
      {selectedSchedule && (
        <BookingModal
            isOpen={bookingModalOpen}
            onClose={() => setBookingModalOpen(false)}
            scheduleId={selectedSchedule.id}
            timeFrame={`${selectedSchedule.startTime} - ${selectedSchedule.endTime}`}
            roomName={`ROOM-${selectedSchedule.roomId}`} // Generic name since we don't have room names fetched here
            onSubmit={handleCreateReservation}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Clock className="text-highlight" size={32} />
            GLOBAL TIMETABLE
          </h2>
          <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-mono">System-wide scheduling overview</p>
        </div>

        {/* ADMIN ONLY: Add Schedule Button */}
        <RoleGuard roles={['Administrator']}>
          <button className="flex items-center gap-2 bg-accent hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition-all transform hover:-translate-y-1 shadow-[4px_4px_0px_#F57D1F]">
            <Plus size={20} />
            <span>GENERATE TIMESLOT</span>
          </button>
        </RoleGuard>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border-l-4 border-accent text-white flex items-center gap-3">
          <AlertCircle size={20} className="text-accent" />
          <span className="font-mono text-sm tracking-widest">{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-[#0A0A0A] border border-gray-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-gray-800 text-gray-500 text-xs uppercase tracking-widest font-bold">
                <th className="p-4 w-24">Slot ID</th>
                <th className="p-4">Facility ID</th>
                <th className="p-4">Timeframe (24H)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-600 font-mono">
                    NO TIMESLOTS DETECTED.
                  </td>
                </tr>
              ) : (
                schedules.map((schedule) => (
                  <tr 
                    key={schedule.id} 
                    className="hover:bg-[#111111] transition-colors group"
                  >
                    {/* ID */}
                    <td className="p-4 font-mono text-gray-400">
                      #{schedule.id.toString().padStart(4, '0')}
                    </td>

                    {/* Room ID */}
                    <td className="p-4">
                      <span className="bg-gray-900 border border-gray-700 text-white px-3 py-1 rounded font-mono text-sm">
                        ROOM-{schedule.roomId}
                      </span>
                    </td>

                    {/* Time */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-mono text-white text-lg">
                        <span className="text-highlight">{schedule.startTime}</span>
                        <span className="text-gray-600">-</span>
                        <span className="text-secondary">{schedule.endTime}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {schedule.isReserved ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 border border-accent/50 text-accent bg-accent/10 rounded-sm text-xs font-black uppercase tracking-widest shadow-[0_0_8px_rgba(247,39,152,0.2)]">
                          <CalendarX size={14} /> Reserved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1 border border-highlight/50 text-highlight bg-highlight/10 rounded-sm text-xs font-black uppercase tracking-widest shadow-[0_0_8px_rgba(235,244,0,0.2)]">
                          <CalendarCheck size={14} /> Available
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      {/* Booking Action */}
                      {!schedule.isReserved && (
                        <RoleGuard roles={['Administrator', 'Lecturer', 'Student']}>
                          <button 
                            onClick={() => openBookingModal(schedule)}
                            className="text-xs bg-highlight/10 text-highlight hover:bg-highlight hover:text-black border border-highlight/30 px-4 py-1.5 rounded font-black uppercase tracking-wider transition-all"
                          >
                            Book
                          </button>
                        </RoleGuard>
                      )}

                      {/* Management Actions - Admin Only */}
                      <RoleGuard roles={['Administrator']}>
                         {/* DELETE BUTTON IMPLEMENTED HERE */}
                         <button 
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            className="p-1.5 text-gray-500 hover:text-accent bg-white/5 hover:bg-accent/20 rounded transition-colors" 
                            title="Purge Timeslot"
                          >
                           <Trash2 size={16} />
                         </button>
                      </RoleGuard>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="flex justify-between items-center text-xs text-gray-600 font-mono">
        <span>TOTAL ENTRIES: {schedules.length}</span>
        <span>SYS_TIME_SYNC: ACTIVE</span>
      </div>
      
    </div>
  );
};

export default SchedulesPage;
