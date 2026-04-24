export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  bio: string;
  channelName: string;
  subscribers: number;
  cardNumber?: string;
  createdAt: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  views: number;
  likes: number;
  dislikes: number;
  comments: Comment[];
  tags: string[];
  isAdult: boolean;
  duration: string;
  createdAt: string;
  playlist?: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  authorId: string;
  videoIds: string[];
  createdAt: string;
}

export interface AppState {
  users: User[];
  videos: Video[];
  playlists: Playlist[];
  currentUserId: string | null;
  savedAccounts: string[];
  theme: 'dark' | 'light';
  history: string[];
  subscriptions: string[];
  favorites: string[];
  likedVideos: string[];
  dislikedVideos: string[];
}

const CENSORED_WORDS = ['хуй', 'пизда', 'еб', 'блядь', 'сука', 'хуя', 'пиздец', 'нахуй', 'fuck', 'shit', 'ass', 'bitch', 'damn'];

export function censorText(text: string): string {
  let result = text;
  for (const word of CENSORED_WORDS) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  }
  return result;
}

const DEMO_VIDEOS: Video[] = [];

const DEFAULT_STATE: AppState = {
  users: [],
  videos: DEMO_VIDEOS,
  playlists: [],
  currentUserId: null,
  savedAccounts: [],
  theme: 'dark',
  history: [],
  subscriptions: [],
  favorites: [],
  likedVideos: [],
  dislikedVideos: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem('yuvist_state');
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    parsed.videos = (parsed.videos || []).filter((v: Video) => v.authorId !== 'system');
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: AppState) {
  localStorage.setItem('yuvist_state', JSON.stringify(state));
}

let _state: AppState = loadState();
const _listeners: Array<() => void> = [];

export function getState(): AppState {
  return _state;
}

export function setState(updater: (s: AppState) => AppState) {
  _state = updater(_state);
  saveState(_state);
  _listeners.forEach(fn => fn());
}

export function subscribe(fn: () => void) {
  _listeners.push(fn);
  return () => {
    const i = _listeners.indexOf(fn);
    if (i >= 0) _listeners.splice(i, 1);
  };
}

export function getCurrentUser(): User | null {
  if (!_state.currentUserId) return null;
  return _state.users.find(u => u.id === _state.currentUserId) || null;
}

export function formatViews(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'М';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'К';
  return String(n);
}

export function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'только что';
  if (diff < 3600) return Math.floor(diff / 60) + ' мин. назад';
  if (diff < 86400) return Math.floor(diff / 3600) + ' ч. назад';
  if (diff < 2592000) return Math.floor(diff / 86400) + ' дн. назад';
  if (diff < 31536000) return Math.floor(diff / 2592000) + ' мес. назад';
  return Math.floor(diff / 31536000) + ' лет назад';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}