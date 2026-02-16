import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckSquare } from 'lucide-react';
import {type ReservationCreate} from '../api';


interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: number;
  timeFrame: string; // e.g., "08:00 - 10:00"
  roomName: string;
  onSubmit: (payload: ReservationCreate) => Promise<void>; // Passes payload up to parent
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  scheduleId, 
  timeFrame, 
  roomName,
  onSubmit 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mocking database of booked dates for this specific schedule
  const [bookedDates, setBookedDates] = useState<number[]>([]);

  useEffect(() => {
    // Simulate fetching availability when month or schedule changes
    setBookedDates([]); 
    setSelectedDate(null); 
    setDescription(''); // Reset description on open
  }, [currentMonth, scheduleId, isOpen]);

  if (!isOpen) return null;

  // --- Calendar Logic ---
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const handlePrevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleBook = async () => {
    if (!selectedDate) return;
    setIsSubmitting(true);
    
    // 1. Construct the payload using your exact schema
    const payload: ReservationCreate = {
      schedId: scheduleId,
      date: `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`,
      description: description.trim() !== '' ? description : undefined,
    };

    try {
      // 2. Pass it to the parent component to handle the actual API call
      await onSubmit(payload);
      onClose();
    } catch (error) {
      console.error("Booking failed:", error);
      // You could set an error state here to show in the modal
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-[#0A0A0A] border-2 border-highlight/50 w-full max-w-2xl rounded-lg shadow-[0_0_30px_rgba(235,244,0,0.1)] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#111] p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="text-highlight" size={20} />
              SLOT RESERVATION
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              TARGET: <span className="text-secondary">{roomName}</span> | SLOT: <span className="text-highlight">{timeFrame}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-accent transition-colors p-1 disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            
            {/* LEFT: Calendar UI */}
            <div>
              <div className="flex justify-between items-center mb-4 border border-gray-800 rounded p-2 bg-[#111]">
                <button onClick={handlePrevMonth} className="text-gray-400 hover:text-highlight p-1">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-white font-bold tracking-widest uppercase text-sm font-mono">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="text-gray-400 hover:text-highlight p-1">
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-[10px] font-black text-gray-600 tracking-wider py-1">
                    {day}
                  </div>
                ))}
                
                {paddingDays.map(pad => (
                  <div key={`pad-${pad}`} className="p-2" />
                ))}

                {days.map(day => {
                  const isPast = isCurrentMonth && day < today.getDate();
                  const isBooked = bookedDates.includes(day);
                  const isSelected = selectedDate === day;
                  const isAvailable = !isPast && !isBooked;

                  return (
                    <button
                      key={day}
                      disabled={!isAvailable || isSubmitting}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square flex items-center justify-center text-sm font-mono rounded-sm border transition-all
                        ${isPast ? 'border-transparent text-gray-800 cursor-not-allowed' : ''}
                        ${isBooked ? 'border-accent/30 bg-accent/10 text-accent/50 cursor-not-allowed line-through' : ''}
                        ${isAvailable && !isSelected ? 'border-gray-800 text-gray-400 hover:border-highlight hover:text-highlight bg-[#111]' : ''}
                        ${isSelected ? 'border-highlight bg-highlight text-black font-black shadow-[0_0_10px_#EBF400] transform scale-110 z-10' : ''}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex justify-between text-[10px] font-mono text-gray-500 mt-4 px-2">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-[#111] border border-gray-800"></div> Free</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-highlight"></div> Selected</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent/20 border border-accent/30"></div> Booked</span>
              </div>
            </div>

            {/* RIGHT: Form & Submission */}
            <div className="flex flex-col h-full border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Reservation Details</h3>
              
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selected Date</label>
                  <div className={`p-3 border rounded font-mono text-lg ${selectedDate ? 'border-highlight text-highlight bg-highlight/5' : 'border-gray-800 text-gray-600 bg-[#111]'}`}>
                    {selectedDate 
                      ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}` 
                      : 'AWAITING SELECTION...'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Purpose / Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!selectedDate || isSubmitting}
                    placeholder={selectedDate ? "Enter reason for booking (optional)..." : "Select a date first."}
                    className="w-full bg-[#111] border border-gray-800 text-white p-3 rounded focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight min-h-[120px] resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={!selectedDate || isSubmitting}
                className={`mt-6 w-full flex items-center justify-center gap-2 py-3 rounded font-black uppercase tracking-widest transition-all
                  ${!selectedDate || isSubmitting 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-highlight text-black hover:bg-[#d4db00] shadow-[4px_4px_0px_#F57D1F] transform hover:-translate-y-1 active:translate-y-0'
                  }`}
              >
                {isSubmitting ? 'TRANSMITTING...' : (
                  <>
                    <CheckSquare size={18} />
                    CONFIRM BOOKING
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
