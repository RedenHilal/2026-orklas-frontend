import React, { useState } from 'react';
import { X, PlusSquare, AlertCircle } from 'lucide-react';
import { type RoomCreate, type RoomType } from '../api';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RoomCreate) => Promise<void>;
}

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState<RoomType>('class');
  const [tagString, setTagString] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when closed
  React.useEffect(() => {
    if (!isOpen) {
      setName('');
      setRoomType('class');
      setTagString('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Parse the comma-separated string into an array of numbers
      const parsedTags = tagString
        .split(',')
        .map(t => parseInt(t.trim(), 10))
        .filter(n => !isNaN(n));

      // Construct payload matching the imported RoomCreate interface exactly
      const payload: RoomCreate = {
        name,
        roomType,
        tagIds: parsedTags
      };

      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error("Failed to create room", err);
      setError("SYS.ERR: Failed to initialize new facility.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0A0A0A] border-2 border-accent/50 w-full max-w-md rounded-lg shadow-[0_0_30px_rgba(247,39,152,0.15)] flex flex-col">
        
        {/* Header */}
        <div className="bg-[#111] p-4 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <PlusSquare className="text-accent" size={20} />
              INITIALIZE FACILITY
            </h2>
          </div>
          <button onClick={onClose} disabled={isSubmitting} className="text-gray-500 hover:text-accent transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-900/20 border border-accent text-accent text-xs font-mono uppercase tracking-widest flex items-start gap-2 rounded-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Facility Designation</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cyber Lab Alpha"
              className="w-full bg-black border border-gray-700 text-white p-2.5 rounded text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Architecture Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="w-full bg-black border border-gray-700 text-white p-2.5 rounded text-sm focus:outline-none focus:border-accent capitalize"
              >
                <option value="class">Classroom</option>
                <option value="laboratory">Laboratory</option>
                <option value="theater">Theater</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Tags (Comma Separated IDs)</label>
              <input
                type="text"
                value={tagString}
                onChange={(e) => setTagString(e.target.value)}
                placeholder="1, 4, 7"
                className="w-full bg-black border border-gray-700 text-white p-2.5 rounded font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-5 py-2 rounded text-xs font-black uppercase tracking-widest transition-all
                ${isSubmitting 
                  ? 'bg-gray-800 text-gray-500 cursor-wait' 
                  : 'bg-accent/10 text-accent border border-accent/50 hover:bg-accent hover:text-white shadow-[2px_2px_0px_#F72798]'
                }`}
            >
              {isSubmitting ? 'PROCESSING...' : 'CREATE ROOM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
