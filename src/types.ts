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

export interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  priority: 'normal' | 'important' | 'emergency';
  author: string;
  createdAt: string;
}

export type NewsCategory = 'all' | 'world' | 'technology' | 'science' | 'space' | 'business' | 'environment';

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  publishedAt: string;
  summary: string;
  category: 'world' | 'technology' | 'science' | 'space' | 'business' | 'environment';
  imageUrl: string;
  readTime: string;
  audioText: string;
  isBreaking?: boolean;
  url?: string;
  audioDurationSec?: number;
}

export type KnowledgeCategory = 'all' | 'tesla' | 'physics' | 'nasa' | 'isro';

export interface KnowledgeArticle {
  id: string;
  category: 'tesla' | 'physics' | 'nasa' | 'isro';
  headline: string;
  summary: string;
  fullExplanation: string;
  publishedAt: string;
  source: string;
  status: 'Confirmed Mission' | 'Peer-Reviewed Discovery' | 'Official Announcement' | 'Technology Milestone';
  imageUrl: string;
  tags: string[];
  keyFacts: string[];
  readMoreUrl?: string;
}

export interface SiteFeatureFlags {
  chatEnabled?: boolean;
  browserEnabled?: boolean;
  youtubeEnabled?: boolean;
  audioNewsEnabled?: boolean;
  knowledgeEnabled?: boolean;
  calculatorEnabled?: boolean;
  calendarEnabled?: boolean;
  clockEnabled?: boolean;
  notesEnabled?: boolean;
  whiteboardEnabled?: boolean;
  [key: string]: boolean | undefined;
}

export interface ActivityLogItem {
  id: string;
  action: string;
  details: string;
  actorEmail: string;
  category: 'security' | 'admin' | 'auth';
  timestamp: string;
}

export type ActiveTab = 
  | 'chat'
  | 'browser'
  | 'youtube'
  | 'news'
  | 'knowledge'
  | 'calculator'
  | 'calendar'
  | 'clock'
  | 'owner-console';
