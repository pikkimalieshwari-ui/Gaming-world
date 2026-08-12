import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage, ChatChannel, FileAttachment, LocationData } from '../types';
import { Send, Paperclip, FileText, Image as ImageIcon, Download, Trash2, Hash, Crown, AlertCircle, FileArchive, MapPin, ExternalLink, Navigation, Sparkles } from 'lucide-react';

interface ChatTabProps {
  currentUser: User | null;
}

const CHANNELS: ChatChannel[] = [
  { id: 'general', name: 'general', description: 'Main chat room for MK creative X members', icon: 'Hash' },
  { id: 'projects', name: 'projects-hub', description: 'Collaborate on creative & tech ideas', icon: 'Hash' },
  { id: 'files', name: 'file-exchange', description: 'High-speed media & asset uploads (Up to 100MB)', icon: 'Paperclip' },
  { id: 'owner-lounge', name: 'owner-channel', description: 'Direct communications & announcements', icon: 'Crown' },
];

export const ChatTab: React.FC<ChatTabProps> = ({ currentUser }) => {
  const [activeChannel, setActiveChannel] = useState('general');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [fileAttachment, setFileAttachment] = useState<FileAttachment | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [manualPlace, setManualPlace] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (channelId: string) => {
    try {
      const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(channelId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      }
    } catch {
      // Ignore transient network errors during server restarts or polling
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(activeChannel)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setMessages(data);
          }
        }
      } catch {
        // Silent catch for background polling
      }
    };

    load();
    const interval = setInterval(load, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_100MB = 100 * 1024 * 1024;
    if (file.size > MAX_100MB) {
      setFileError(`File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the 100 MB limit.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    const reader = new FileReader();
    reader.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = Math.round((evt.loaded / evt.total) * 90);
        setUploadProgress(percent);
      }
    };

    reader.onload = () => {
      setUploadProgress(100);
      setTimeout(() => {
        setFileAttachment({
          id: 'file_' + Date.now(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: reader.result as string,
          uploadedAt: new Date().toISOString(),
        });
        setIsUploading(false);
        setUploadProgress(0);
      }, 300);
    };

    reader.onerror = () => {
      setFileError('Failed to read file.');
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleFetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setIsLocationModalOpen(true);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        setLocationData({
          lat,
          lng,
          address: `GPS: ${lat}, ${lng}`,
          mapUrl,
        });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        setIsLocationModalOpen(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPlace.trim()) return;

    const encoded = encodeURIComponent(manualPlace.trim());
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encoded}`;

    setLocationData({
      lat: 0,
      lng: 0,
      address: manualPlace.trim(),
      mapUrl,
    });
    setIsLocationModalOpen(false);
    setManualPlace('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !fileAttachment && !locationData) return;

    if (!currentUser) {
      alert('Please sign in to send messages.');
      return;
    }

    const payload = {
      channelId: activeChannel,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      senderRole: currentUser.role,
      text: text.trim(),
      attachment: fileAttachment || undefined,
      location: locationData || undefined,
    };

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to send message.');
        return;
      }

      setText('');
      setFileAttachment(null);
      setLocationData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchMessages(activeChannel);
    } catch (err) {
      alert('Error delivering message.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-[calc(100vh-5rem)] max-w-7xl mx-auto p-2 sm:p-4 flex gap-4 text-white font-sans">
      {/* Sidebar Channels - High Contrast B&W */}
      <div className="w-64 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 hidden md:flex flex-col justify-between shrink-0 shadow-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-white" />
            Chat Channels
          </div>

          <div className="space-y-1">
            {CHANNELS.map((ch) => {
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannel(ch.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-mono font-semibold transition flex items-center gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-white text-black font-bold shadow'
                      : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {ch.icon === 'Crown' ? (
                    <Crown className="w-4 h-4 shrink-0" />
                  ) : ch.icon === 'Paperclip' ? (
                    <Paperclip className="w-4 h-4 shrink-0" />
                  ) : (
                    <Hash className="w-4 h-4 shrink-0 opacity-70" />
                  )}
                  <span className="truncate">#{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Features Box */}
        <div className="bg-black border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-zinc-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-white font-bold">
            <Paperclip className="w-3.5 h-3.5" />
            100 MB Media & GPS Location
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Attach zip files up to 100 MB and share GPS location pins.
          </p>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 bg-black border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">#{activeChannel}</h2>
              <p className="text-[11px] text-zinc-400 font-mono">
                {CHANNELS.find((c) => c.id === activeChannel)?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-white font-mono bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            Signal Active
          </div>
        </div>

        {/* Mobile Channel Selector */}
        <div className="md:hidden p-2 bg-black border-b border-zinc-800 flex overflow-x-auto gap-2">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap ${
                activeChannel === ch.id
                  ? 'bg-white text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400'
              }`}
            >
              #{ch.name}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-500 font-mono">
              <Hash className="w-12 h-12 mb-2 text-zinc-800" />
              <p className="text-sm font-bold text-zinc-300">Welcome to #{activeChannel}</p>
              <p className="text-xs text-zinc-600 mt-1">Post a message, share files up to 100MB, or send live location pins.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwner = msg.senderRole === 'owner';
              return (
                <div key={msg.id} className="flex items-start gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-white text-black font-black flex items-center justify-center shrink-0 border border-zinc-300 text-sm shadow">
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-xs text-white">{msg.senderName}</span>
                      {isOwner && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-white text-black flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" /> OWNER
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {msg.text && (
                      <p className="text-xs text-zinc-200 leading-relaxed bg-black border border-zinc-800 rounded-xl p-3 inline-block max-w-2xl break-words">
                        {msg.text}
                      </p>
                    )}

                    {/* Location Badge Renderer */}
                    {msg.location && (
                      <div className="mt-2 p-3 bg-black border border-zinc-700 rounded-xl max-w-md space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 bg-zinc-900 text-white rounded-lg border border-zinc-700">
                              <MapPin className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">
                                {msg.location.address || 'Location Pin'}
                              </p>
                              {msg.location.lat !== 0 && (
                                <p className="text-[10px] text-zinc-400 font-mono">
                                  GPS: {msg.location.lat}, {msg.location.lng}
                                </p>
                              )}
                            </div>
                          </div>

                          <a
                            href={msg.location.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-white text-black font-bold rounded-lg text-xs font-mono transition flex items-center gap-1 shrink-0 shadow hover:bg-zinc-200"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Maps
                          </a>
                        </div>
                      </div>
                    )}

                    {/* File Attachment Renderer */}
                    {msg.attachment && (
                      <div className="mt-2 p-3 bg-black border border-zinc-700 rounded-xl max-w-md space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 bg-zinc-900 text-white rounded-lg border border-zinc-700">
                              {msg.attachment.type.startsWith('image/') ? (
                                <ImageIcon className="w-5 h-5" />
                              ) : (
                                <FileArchive className="w-5 h-5" />
                              )}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">{msg.attachment.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono">
                                {formatFileSize(msg.attachment.size)} / 100 MB
                              </p>
                            </div>
                          </div>

                          <a
                            href={msg.attachment.url}
                            download={msg.attachment.name}
                            className="px-3 py-1.5 bg-white text-black font-bold rounded-lg text-xs font-mono transition flex items-center gap-1 shrink-0 hover:bg-zinc-200 shadow"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Save
                          </a>
                        </div>

                        {msg.attachment.type.startsWith('image/') && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-zinc-800 max-h-60 bg-black flex items-center justify-center">
                            <img
                              src={msg.attachment.url}
                              alt={msg.attachment.name}
                              className="max-h-60 object-contain hover:scale-105 transition duration-300"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Location Pending Preview */}
        {locationData && (
          <div className="mx-4 mb-2 p-2.5 bg-black border border-zinc-700 rounded-xl flex items-center justify-between text-xs text-white font-mono">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-white shrink-0" />
              <span className="truncate font-bold">{locationData.address}</span>
            </div>
            <button
              onClick={() => setLocationData(null)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* File Pending Preview */}
        {fileAttachment && (
          <div className="mx-4 mb-2 p-2.5 bg-black border border-zinc-700 rounded-xl flex items-center justify-between text-xs text-white font-mono">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-4 h-4 text-white shrink-0" />
              <span className="truncate font-bold">{fileAttachment.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono">
                ({formatFileSize(fileAttachment.size)})
              </span>
            </div>
            <button
              onClick={() => setFileAttachment(null)}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mx-4 mb-2 p-2 bg-black border border-zinc-800 rounded-xl space-y-1 font-mono">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Uploading Attachment...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* File Error Notice */}
        {fileError && (
          <div className="mx-4 mb-2 p-2 bg-black border border-zinc-700 rounded-xl text-zinc-200 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-white" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-black border-t border-zinc-800 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach file (Up to 100 MB)"
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-mono border border-zinc-700 shrink-0 cursor-pointer"
          >
            <Paperclip className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Attach (100MB)</span>
          </button>

          <button
            type="button"
            onClick={handleFetchCurrentLocation}
            disabled={isLocating}
            title="Share GPS Location Pin"
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-mono border border-zinc-700 shrink-0 cursor-pointer"
          >
            <MapPin className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-bold">{isLocating ? 'Locating...' : 'Location'}</span>
          </button>

          <input
            type="text"
            placeholder={currentUser ? `Message #${activeChannel}...` : 'Please sign in to send messages'}
            disabled={!currentUser}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white disabled:opacity-50 font-mono"
          />

          <button
            type="submit"
            disabled={!currentUser || (!text.trim() && !fileAttachment && !locationData)}
            className="p-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs transition disabled:opacity-40 shrink-0 cursor-pointer shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Manual Location Dialog Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 space-y-4 text-white relative">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Navigation className="w-5 h-5 text-white" />
              GPS & Custom Location Pin
            </div>
            <p className="text-xs text-zinc-400">
              Enter city name, address or landmark to generate a shareable location link:
            </p>

            <form onSubmit={handleManualLocationSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="e.g. Times Square, New York"
                value={manualPlace}
                onChange={(e) => setManualPlace(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white"
              />

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs shadow"
                >
                  Share Pin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
