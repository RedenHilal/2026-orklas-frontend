import React, { useState, useEffect } from 'react';
import { X, Settings, ImagePlus, Save, UploadCloud, AlertCircle } from 'lucide-react';
import {type RoomUpdate, type Room, type RoomStatus, type roomType } from '../api';

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Room | null;
  onUpdateDetails: (roomId: number, payload: RoomUpdate) => Promise<void>;
  onUploadImage: (roomId: number, file: File, description?: string) => Promise<void>;
}

const EditRoomModal: React.FC<EditRoomModalProps> = ({ 
  isOpen, 
  onClose, 
  initialData, 
  onUpdateDetails, 
  onUploadImage 
}) => {
  // --- State for Room Details Form ---
  const [name, setName] = useState('');
  const [status, setStatus] = useState<RoomStatus>('open');
  const [roomType, setRoomType] = useState<RoomType>('class');
  const [tagString, setTagString] = useState(''); // Comma-separated string for easy editing
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);

  // --- State for Image Upload ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // --- General State ---
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Populate form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name);
      setStatus(initialData.status);
      setRoomType(initialData.roomType);
      setTagString(initialData.tagIds.join(', '));
      
      // Reset image states
      setSelectedFile(null);
      setImageDescription('');
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen || !initialData) return null;

  // --- Handlers ---
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsUpdatingDetails(true);

    try {
      // Convert comma-separated string back to number array, filtering out invalid inputs
      const parsedTags = tagString
        .split(',')
        .map(t => parseInt(t.trim(), 10))
        .filter(n => !isNaN(n));

      const payload: RoomUpdate = {
        name: name,
        status: status,
        roomType: roomType,
        tagIds: parsedTags
      };

      await onUpdateDetails(initialData.id, payload);
      setSuccessMessage("FACILITY DATA UPDATED SUCCESSFULLY.");
    } catch (err) {
      console.error("Failed to update room", err);
      setError("SYS.ERR: Failed to modify facility configurations.");
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError(null);
    setSuccessMessage(null);
    setIsUploadingImage(true);

    try {
      await onUploadImage(initialData.id, selectedFile, imageDescription);
      setSuccessMessage("VISUAL DATA UPLOADED SUCCESSFULLY.");
      setSelectedFile(null); // Clear file after success
      setImageDescription('');
    } catch (err) {
      console.error("Failed to upload image", err);
      setError("SYS.ERR: Failed to process image upload.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-[#0A0A0A] border border-gray-800 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col my-8">
        
        {/* Header */}
        <div className="bg-[#111] p-5 border-b border-gray-800 flex justify-between items-center sticky top-0 z-10 rounded-t-lg">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Settings className="text-highlight" size={20} />
              MODIFY FACILITY
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-widest">
              ID: {initialData.id.toString().padStart(4, '0')} | CURRENT: {initialData.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-accent transition-colors p-1">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Notifications */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-accent text-accent text-xs font-mono uppercase tracking-widest flex items-start gap-2 rounded-sm shadow-[0_0_10px_rgba(247,39,152,0.1)]">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-highlight/10 border border-highlight/50 text-highlight text-xs font-mono uppercase tracking-widest flex items-start gap-2 rounded-sm shadow-[0_0_10px_rgba(235,244,0,0.1)]">
              <Save size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SECTION 1: Details Update */}
          <div className="bg-[#111] p-5 rounded border border-gray-800 relative">
            <h3 className="absolute -top-3 left-4 bg-[#0A0A0A] px-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Core Parameters
            </h3>
            
            <form onSubmit={handleDetailsSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Facility Designation</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-white p-2.5 rounded text-sm focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Operational Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as RoomStatus)}
                    className="w-full bg-black border border-gray-700 text-white p-2.5 rounded text-sm focus:outline-none focus:border-highlight transition-all capitalize"
                  >
                    <option value="open">Open</option>
                    <option value="reserved">Reserved</option>
                    <option value="closed">Closed / Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Architecture Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value as RoomType)}
                    className="w-full bg-black border border-gray-700 text-white p-2.5 rounded text-sm focus:outline-none focus:border-highlight transition-all capitalize"
                  >
                    <option value="class">Classroom</option>
                    <option value="laboratory">Laboratory</option>
                    <option value="theater">Theater</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Assigned Tags (Comma Separated IDs)</label>
                <input
                  type="text"
                  value={tagString}
                  onChange={(e) => setTagString(e.target.value)}
                  placeholder="e.g. 1, 4, 7"
                  className="w-full bg-black border border-gray-700 text-white p-2.5 rounded font-mono text-sm focus:outline-none focus:border-highlight focus:ring-1 focus:ring-highlight transition-all"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingDetails}
                  className={`flex items-center gap-2 px-5 py-2 rounded text-xs font-black uppercase tracking-widest transition-all
                    ${isUpdatingDetails 
                      ? 'bg-gray-800 text-gray-500 cursor-wait' 
                      : 'bg-highlight/10 text-highlight border border-highlight/50 hover:bg-highlight hover:text-black shadow-[2px_2px_0px_#EBF400]'
                    }`}
                >
                  {isUpdatingDetails ? 'OVERWRITING...' : <><Save size={14} /> UPDATE CORE DATA</>}
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: Image Upload */}
          <div className="bg-[#111] p-5 rounded border border-gray-800 relative">
            <h3 className="absolute -top-3 left-4 bg-[#0A0A0A] px-2 text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
               <ImagePlus size={12} /> Visual Data Link
            </h3>

            <form onSubmit={handleImageSubmit} className="space-y-4 mt-2">
              <div className="border-2 border-dashed border-gray-700 bg-black/50 p-6 rounded text-center hover:border-secondary/50 transition-colors">
                 <input
                   type="file"
                   id="room-image"
                   accept="image/*"
                   onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                   className="hidden"
                 />
                 <label htmlFor="room-image" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                   <UploadCloud size={32} className={selectedFile ? "text-secondary" : "text-gray-600"} />
                   <span className="text-sm text-gray-400 font-mono">
                     {selectedFile ? selectedFile.name : "CLICK TO BROWSE LOCAL FILESYSTEM"}
                   </span>
                 </label>
              </div>

              {/* Only show description and submit if a file is actually selected */}
              {selectedFile && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Image Description (Optional)</label>
                    <input
                      type="text"
                      value={imageDescription}
                      onChange={(e) => setImageDescription(e.target.value)}
                      placeholder="Front view of facility..."
                      className="w-full bg-black border border-gray-700 text-white p-2.5 rounded text-sm focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-all"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isUploadingImage}
                      className={`flex items-center gap-2 px-5 py-2 rounded text-xs font-black uppercase tracking-widest transition-all
                        ${isUploadingImage 
                          ? 'bg-gray-800 text-gray-500 cursor-wait' 
                          : 'bg-secondary/10 text-secondary border border-secondary/50 hover:bg-secondary hover:text-black shadow-[2px_2px_0px_#F57D1F]'
                        }`}
                    >
                      {isUploadingImage ? 'UPLOADING...' : 'TRANSMIT IMAGE DATA'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;
