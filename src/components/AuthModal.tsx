import { useState } from 'react';
import { getState, setState, generateId, User } from '@/lib/store';
import Icon from '@/components/ui/icon';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const state = getState();
    const user = state.users.find(
      u => (u.username === form.username || u.email === form.username) && u.password === form.password
    );
    if (!user) { setError('Неверный логин или пароль'); return; }
    setState(s => ({
      ...s,
      currentUserId: user.id,
      savedAccounts: s.savedAccounts.includes(user.id) ? s.savedAccounts : [...s.savedAccounts, user.id]
    }));
    onClose();
  }

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.email.trim() || !form.password) {
      setError('Заполните все поля'); return;
    }
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return; }
    if (form.password.length < 4) { setError('Пароль минимум 4 символа'); return; }
    const state = getState();
    if (state.users.find(u => u.username === form.username)) {
      setError('Такой логин уже занят'); return;
    }
    if (state.users.find(u => u.email === form.email)) {
      setError('Такой email уже зарегистрирован'); return;
    }
    const newUser: User = {
      id: generateId(),
      username: form.username,
      email: form.email,
      password: form.password,
      avatar: '',
      bio: '',
      channelName: form.username,
      subscribers: 0,
      createdAt: new Date().toISOString(),
    };
    setState(s => ({
      ...s,
      users: [...s.users, newUser],
      currentUserId: newUser.id,
      savedAccounts: [...s.savedAccounts, newUser.id]
    }));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-md p-8 animate-scale-in shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="X" size={20} />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span style={{ color: 'var(--yuvist-red)' }}>Ю</span>вист
          </h2>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-border mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium transition-all ${tab === 'login' ? 'bg-yuvist-red text-white' : 'text-muted-foreground hover:text-foreground'}`}
            style={tab === 'login' ? { backgroundColor: 'var(--yuvist-red)' } : {}}
            onClick={() => setTab('login')}
          >
            Войти
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium transition-all ${tab === 'register' ? 'bg-yuvist-red text-white' : 'text-muted-foreground hover:text-foreground'}`}
            style={tab === 'register' ? { backgroundColor: 'var(--yuvist-red)' } : {}}
            onClick={() => setTab('register')}
          >
            Регистрация
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Логин или email"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="password"
              placeholder="Пароль"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--yuvist-red)' }}
            >
              Войти
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Логин"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="password"
              placeholder="Пароль (минимум 4 символа)"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="password"
              placeholder="Подтвердите пароль"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--yuvist-red)' }}
            >
              Создать аккаунт
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
