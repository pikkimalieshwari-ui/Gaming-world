export type UserRole = 'owner' | 'member';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  department?: string;
  isFired: boolean;
  blockedUntil?: number | null;
  joinedAt: string;
  avatarColor?: string;
  status?: 'online' | 'offline' | 'busy';
  isApproved?: boolean;
  approvalStatus?: 'pending' | 'accepted' | 'rejected';
}

export interface LocationData {
  lat: number;
  lng: number;
  address?: string;
  mapUrl: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number; // in bytes
  type: string;
  url: string;
  uploadedAt: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  attachment?: FileAttachment;
  location?: LocationData;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  isPrivate?: boolean;
}

export interface OwnerLockStatus {
  isBlocked: boolean;
  blockedUntil: number | null; // Timestamp in milliseconds
  remainingSeconds: number;
  blockedReason?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: 'work' | 'personal' | 'important' | 'owner-note';
  createdBy: string;
}

export interface CalculatorHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export interface WorldClockCity {
  id: string;
  cityName: string;
  country: string;
  timezone: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
  duration: string;
  views: string;
  videoId: string;
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  date: string;
  createdBy: string;
}

export type ActiveTab = 
  | 'chat'
  | 'browser'
  | 'youtube'
  | 'calculator'
  | 'calendar'
  | 'clock'
  | 'owner-console';
