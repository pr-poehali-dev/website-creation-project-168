import { useState } from 'react';
import { User } from '@/lib/store';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'catalog' | 'search' | 'subscriptions' | 'history' | 'profile' | 'favorites' | 'settings' | 'upload';

interface HeaderProps {
  currentUser: User | null;
  onAuth: () => void;
  onNav: (p: Page) => void;
  onSearch: (q: string) => void;
  onMenuToggle: () => void;
}

export default function Header({ currentUser, onAuth, onNav, onSearch, onMenuToggle }: HeaderProps) {
  const [q, setQ] = useState('');

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      onSearch(q.trim());
      onNav('search');
    }
  }

  return (
    <header className="h-14 bg-card/95 border-b border-border flex items-center gap-3 px-4 fixed top-0 left-0 right-0 z-40 glass">
      <button
        className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors lg:hidden"
        onClick={onMenuToggle}
      >
        <Icon name="Menu" size={20} />
      </button>

      <div className="hidden lg:flex items-center gap-1 min-w-[140px]">
        <button onClick={() => onNav('home')} className="text-xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          <span style={{ color: 'var(--yuvist-red)' }}>Ю</span>вист
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 max-w-xl mx-auto">
        <div className="flex-1 relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Поиск видео..."
            className="w-full bg-secondary border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
          />
        </div>
        <button
          type="submit"
          className="p-2 rounded-full bg-secondary border border-border hover:bg-accent transition-colors"
        >
          <Icon name="Search" size={16} />
        </button>
      </form>

      <div className="flex items-center gap-2">
        {currentUser ? (
          <>
            <button
              onClick={() => onNav('upload')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:bg-accent transition-all"
            >
              <Icon name="Upload" size={16} />
              <span className="hidden md:inline">Загрузить</span>
            </button>
            <button
              onClick={() => onNav('profile')}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden"
              style={{ backgroundColor: currentUser.avatar ? 'transparent' : '#e53935' }}
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                currentUser.username.charAt(0).toUpperCase()
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onAuth}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--yuvist-red)' }}
          >
            <Icon name="LogIn" size={16} />
            <span>Войти</span>
          </button>
        )}
      </div>
    </header>
  );
}
