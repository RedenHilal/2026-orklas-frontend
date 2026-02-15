import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  ArrowLeft, 
  MapPin, 
  Tag as TagIcon, 
  Image as ImageIcon,
  Clock,
  CalendarCheck,
  CalendarX
} from 'lucide-react';
import RoleGuard from '../http/ProtectedProp'; 
import config from '../http/config';
import axiosInstance from '../http/axiosInstance';
import { type Room, type Schedule, RoomApi, ScheduleApi, ReservationApi, type ReservationCreate } from '../api'; 
import BookingModal from '../components/BookingModal';
import ScheduleModal from '../components/ScheduleModal';
import EditRoomModal from '../components/RoomEditModal';

const RoomDetailPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [room, setRoom] = useState<Room | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [schedModal, setSchedModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

	
  const closeSchedModal = () => {
	setSchedModal(false);
  }

  const submitSchedModal = async (id : number, payload : ScheduleCreate) => {
	const api = new ScheduleApi(config, undefined, axiosInstance);
	const response = await api.createSchedule(id, payload);

	if (response.status == 201){
		const scheduleApi = new ScheduleApi(config, undefined, axiosInstance);
		const scheduleResponse = await scheduleApi.listRoomSchedules(Number(roomId));

		setSchedules(scheduleResponse.data);
		closeSchedModal();
	}
  }

  const closeEditModal = () => {
	setEditModal(false);
  }

  const onUpdateDetails = async (id : number, payload : RoomUpdate) => {
	const api = new RoomApi(config, undefined, axiosInstance);
	const response = await api.updateRoom(id, payload);
	console.log(response);
  }

  const onUploadImage = async (id : number, file : File, description? : string) => {
	const api = new RoomApi(config, undefined, axiosInstance);
	const response = await api.uploadRoomImage(id, file, description);
  }

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId) return;
      
      setLoading(true);
      try {
        const roomApi = new RoomApi(config, undefined, axiosInstance);
        // Assuming your generated API has a getRoom or getRoomById method:
        const roomResponse = await roomApi.getRoomById(Number(roomId));
        setRoom(roomResponse.data);

		const scheduleApi = new ScheduleApi(config, undefined, axiosInstance);
		const scheduleResponse = await scheduleApi.listRoomSchedules(Number(roomId));

		console.log(scheduleResponse.data)
        // MOCK SCHEDULE DATA for now
        setSchedules(scheduleResponse.data);

      } catch (err) {
        console.error("Failed to load room data", err);
        setError("UNABLE TO RETRIEVE FACILITY DATA.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  // Helper for status colors
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'open': return 'text-highlight border-highlight shadow-[0_0_10px_rgba(235,244,0,0.2)]';
      case 'reserved': return 'text-accent border-accent shadow-[0_0_10px_rgba(247,39,152,0.2)]';
      case 'closed': return 'text-secondary border-secondary shadow-[0_0_10px_rgba(245,125,31,0.2)]';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  const closeModal = () => {
	setModalOpen(false);
  }

  const openModal = (schedule : Schedule) => {
	setSchedule(schedule);
	setModalOpen(true);
  }

  const makeReserv = async (payload : ReservationCreate) => {
	const api = new ReservationApi(config, undefined, axiosInstance);
	console.log("gasdga");
	const response = await api.createReservation(payload);
	closeModal();
  }


  if (loading) {
    return <div className="p-8 text-highlight animate-pulse font-mono tracking-widest">ACCESSING FACILITY MAINFRAME...</div>;
  }

  if (error || !room) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border-l-4 border-accent p-4 text-white">
          <span className="font-bold mr-2">SYS.ERR:</span> {error || "Facility not found."}
        </div>
        <button onClick={() => navigate('/rooms')} className="mt-4 text-gray-400 hover:text-white underline font-mono text-sm">
          RETURN TO DIRECTORY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
	<BookingModal
		isOpen={modalOpen}
		onClose={closeModal}
		scheduleId={schedule?.id}
		roomname={room.name}
		onSubmit={makeReserv}
	/>

	<ScheduleModal
		isOpen={schedModal}
		onClose={closeSchedModal}
		roomId={room.id}
		roomName={room.name}
		onSubmit={submitSchedModal}
	/>

	<EditRoomModal
		isOpen={editModal}
		onClose={closeEditModal}
		initialData={room}
		onUpdateDetails={onUpdateDetails}
		onUploadImage={onUploadImage}
	/>
      
      {/* Navigation & Header */}
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <button 
          onClick={() => navigate('/rooms')}
          className="p-2 text-gray-500 hover:text-highlight hover:bg-white/5 rounded transition-all"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{room.name}</h1>
          <p className="text-gray-500 font-mono text-sm">FACILITY ID: {room.id.toString().padStart(4, '0')}</p>
        </div>
        <div className={`ml-auto px-4 py-1 border-2 font-black uppercase tracking-widest text-sm rounded-sm ${getStatusStyle(room.status)}`}>
          {room.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Room Information */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Photos / Placeholder */}
          <div className="bg-[#0A0A0A] border border-gray-800 rounded-lg overflow-hidden aspect-video flex items-center justify-center relative group">
            {room.photoUrls && room.photoUrls.length > 0 ? (
               <img src={`http://localhost:8080${room.photoUrls[5]}`} alt={room.photoUrls[2]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
            ) : (
               <div className="flex flex-col items-center text-gray-700">
                 <ImageIcon size={48} className="mb-2" />
                 <span className="font-mono text-xs uppercase tracking-widest">No Visual Data</span>
               </div>
            )}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-highlight/30 transition-colors pointer-events-none"></div>
          </div>

          {/* Details Card */}
          <div className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-lg space-y-6">
            <div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">Specifications</h3>
              <div className="flex items-center gap-3 text-white">
                <MapPin size={18} className="text-secondary" />
                <span className="capitalize text-lg">{room.roomType}</span>
              </div>
            </div>

            <div>
              <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 border-b border-gray-800 pb-1">Assigned Tags (IDs)</h3>
              <div className="flex flex-wrap gap-2">
                {room.tagIds && room.tagIds.length > 0 ? (
                  room.tagIds.map(tagId => (
                    <span key={tagId} className="flex items-center gap-1 bg-gray-900 border border-gray-700 text-gray-300 text-xs px-2 py-1 rounded-sm font-mono">
                      <TagIcon size={12} className="text-highlight" />
                      #{tagId}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-600 text-sm italic">No tags assigned.</span>
                )}
              </div>
            </div>
            
            {/* Admin Actions Container */}
            <RoleGuard roles={['Administrator']}>
              <div className="pt-4 border-t border-gray-800">
                 <button className="w-full bg-transparent border border-accent text-accent hover:bg-accent hover:text-white font-bold py-2 px-4 rounded transition-all uppercase text-sm tracking-wider"
				onClick={()=>setEditModal(true)}
				 >
                   Modify Facility Data
                 </button>
              </div>
            </RoleGuard>
          </div>
        </div>

        {/* RIGHT COLUMN: Timetable / Schedules */}
        <div className="lg:col-span-2">
          <div className="bg-[#0A0A0A] border border-gray-800 p-6 rounded-lg h-full">
            <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-highlight" size={24} />
                TODAY'S TIMETABLE
              </h3>
              
              {/* Only admins can inject new schedules freely */}
              <RoleGuard roles={['Administrator']}>
                <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded font-mono uppercase tracking-wider transition-colors" 
				onClick={()=>setSchedModal(true)}>
                  + Add Timeslot
                </button>
              </RoleGuard>
            </div>

            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-12 text-gray-600 font-mono">
                  NO SCHEDULES DETECTED IN DATABASE.
                </div>
              ) : (
                schedules.map((schedule) => (
                  <div 
                    key={schedule.id}
                    className={`flex items-center justify-between p-4 rounded border-l-4 bg-[#111111] transition-all
                      ${schedule.isReserved 
                        ? 'border-accent opacity-75' 
                        : 'border-highlight hover:bg-[#1a1a1a]'
                      }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-center w-24 border-r border-gray-800 pr-4">
                        <div className="text-white font-bold">{schedule.startTime}</div>
                        <div className="text-xs text-gray-500 font-mono">-</div>
                        <div className="text-white font-bold">{schedule.endTime}</div>
                      </div>
                      
                      <div>
                        {schedule.isReserved ? (
                          <span className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-sm">
                            <CalendarX size={18} /> Unavailable (Reserved)
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-highlight font-bold uppercase tracking-widest text-sm">
                            <CalendarCheck size={18} /> Available Slot
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Booking Action */}
                    {!schedule.isReserved && room.status !== 'closed' && (
                      <RoleGuard roles={['Administrator', 'Lecturer', 'Student']}>
                        <button className="bg-highlight/10 text-highlight hover:bg-highlight hover:text-white border border-highlight/30 px-6 py-2 rounded font-black uppercase text-sm tracking-wider transition-all shadow-[2px_2px_0px_#EBF400]"
						onClick={() => openModal(schedule)}
						>
                          Book Slot
                        </button>
                      </RoleGuard>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoomDetailPage;
