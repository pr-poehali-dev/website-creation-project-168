import { getState, setState } from '@/lib/store';
import { useStore } from '@/hooks/useStore';
import Icon from '@/components/ui/icon';

interface AccountsPanelProps {
  onClose: () => void;
  onAuth: () => void;
}

export default function AccountsPanel({ onClose, onAuth }: AccountsPanelProps) {
  const state = useStore();
  const savedUsers = state.savedAccounts.map(id => state.users.find(u => u.id === id)).filter(Boolean);

  function switchAccount(uid: string) {
    setState(s => ({ ...s, currentUserId: uid }));
    onClose();
  }

  function removeAccount(uid: string) {
    setState(s => ({
      ...s,
      savedAccounts: s.savedAccounts.filter(id => id !== uid),
      currentUserId: s.currentUserId === uid ? null : s.currentUserId,
    }));
  }

  function logout() {
    setState(s => ({ ...s, currentUserId: null }));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 glass" />
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-sm animate-slide-up shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Аккаунты</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={18} />
            </button>
          </div>

          <div className="space-y-2 mb-4">
            {savedUsers.map(u => u && (
              <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary group">
                <button
                  className="flex items-center gap-3 flex-1 text-left"
                  onClick={() => switchAccount(u.id)}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: '#e53935' }}
                  >
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : u.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  </div>
                  {state.currentUserId === u.id && (
                    <Icon name="Check" size={16} className="ml-auto flex-shrink-0" style={{ color: 'var(--yuvist-red)' }} />
                  )}
                </button>
                <button
                  onClick={() => removeAccount(u.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-400 flex-shrink-0"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            <button
              onClick={() => { onClose(); onAuth(); }}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-sm"
            >
              <Icon name="UserPlus" size={18} className="text-muted-foreground" />
              Добавить аккаунт
            </button>
            {state.currentUserId && (
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary text-sm text-red-400"
              >
                <Icon name="LogOut" size={18} />
                Выйти
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
