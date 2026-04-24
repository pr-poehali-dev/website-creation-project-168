import { useState, useEffect } from 'react';
import { getState, subscribe, AppState } from '@/lib/store';

export function useStore(): AppState {
  const [state, setState] = useState<AppState>(getState());

  useEffect(() => {
    const unsub = subscribe(() => {
      setState({ ...getState() });
    });
    return unsub;
  }, []);

  return state;
}
