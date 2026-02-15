import React, { useState, useEffect } from 'react';
import { X, Clock, PlusSquare, AlertCircle } from 'lucide-react';
import { type ScheduleCreate, ScheduleApi } from '../api';

export interface ScheduleCreate {
  startTime: string; // Expected format: "HH:mm" (e.g., "08:00")
  endTime: string;   // Expected format: "HH:mm" (e.g., "10:00")
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
  roomName?: string; // Optional, just to display to the admin what room they are editing
  onSubmit: (roomId: number, payload: ScheduleCreate) => Promise<void>;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  roomId, 
  roomName = "UNKNOWN FACILITY", 
  onSubmit 
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStartTime('');
      setEndTime('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!startTime || !endTime) {
      setError("Both start and end times are required.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after the start time.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: ScheduleCreate = {
        startTime: `${startTime}:00`, // Ensure seconds are attached if your backend expects HH:mm:ss
        endTime: `${endTime}:00`
      };

      await onSubmit(roomId, payload);
      onClose(); // Close on success
    } catch (err) {
      console.error("Failed to create schedule", err);
      setError("System rejection. Failed to inject timeslot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Modal Container */}
      <div className="bg-[#0A0A0A] border-2 border-secondary/50 w-full max-w-md rounded-lg shadow-[0_0_30px_rgba(245,125,31,0.15)] flex flex-col transform transition-all">
        
        {/* Header */}
        <div className="bg-[#111] p-4 border-b border-gray-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="text-secondary" size={20} />
              GENERATE TIMESLOT
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">
              TARGET: <span className="text-highlight truncate max-w-[200px] inline-block align-bottom">{roomName}</span> (ID: {roomId})
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting} 
            className="text-gray-500 hover:text-accent transition-colors p-1 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          
          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-accent/10 border border-accent/50 text-accent text-xs font-mono uppercase tracking-widest flex items-start gap-2 rounded-sm shadow-[0_0_10px_rgba(247,39,152,0.1)]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Time Inputs */}
          <div className="flex items-center gap-4">
            
            {/* Start Time */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Start Sequence
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#111] border border-gray-800 text-white font-mono text-lg p-3 rounded focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-50"
              />
            </div>

            <span className="text-gray-600 font-bold mt-6">-</span>

            {/* End Time */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                End Sequence
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#111] border border-gray-800 text-white font-mono text-lg p-3 rounded focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all disabled:opacity-50"
              />
            </div>

          </div>

          {/* Helper / Warning text */}
          <div className="bg-gray-900 border border-gray-800 p-3 rounded-sm">
            <p className="text-[10px] text-gray-500 font-mono uppercase leading-relaxed">
              * Timeslots are generated globally in 24-hour format. Overlapping schedules may cause system conflicts during user reservations.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-2 border-t border-gray-800 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white uppercase tracking-wider transition-colors disabled:opacity-50"
            >
              Abort
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-6 py-2 rounded font-black uppercase tracking-widest transition-all
                ${isSubmitting 
                  ? 'bg-gray-800 text-gray-500 cursor-wait' 
                  : 'bg-secondary text-black hover:bg-[#ff8a2b] shadow-[4px_4px_0px_#EBF400] transform hover:-translate-y-1 active:translate-y-0'
                }`}
            >
              {isSubmitting ? 'INJECTING...' : (
                <>
                  <PlusSquare size={16} />
                  INJECT TIMESLOT
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
