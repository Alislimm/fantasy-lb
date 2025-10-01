import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  hasFantasyTeam?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  initializing: boolean;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  initializing: boolean;
  login: (token: string, user?: AuthUser | null) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  initializing: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (_token: string, _user?: AuthUser | null) => {},
  logout: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateUser: async (_updates: Partial<AuthUser>) => {},
});

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ token: null, user: null, initializing: true });

  const hydrate = useCallback(async () => {
    try {
      const [token, userJson] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      console.log('[AuthContext] Hydrate - token:', token);
      console.log('[AuthContext] Hydrate - userJson:', userJson);
      
      const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
      console.log('[AuthContext] Hydrate - parsed user:', user);
      console.log('[AuthContext] Hydrate - user.id:', user?.id);
      console.log('[AuthContext] Hydrate - user.id type:', typeof user?.id);
      console.log('[AuthContext] Hydrate - user keys:', user ? Object.keys(user) : 'null');
      
      setState({ token, user, initializing: false });
    } catch (e) {
      console.log('[AuthContext] Hydrate error:', e);
      setState({ token: null, user: null, initializing: false });
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (token: string, user?: AuthUser | null) => {
    console.log('[AuthContext] Login called with user:', user);
    console.log('[AuthContext] User type:', typeof user);
    console.log('[AuthContext] User.id:', user?.id);
    console.log('[AuthContext] User.id type:', typeof user?.id);
    
    // Store token only if it's not null/undefined (since auth is disabled for now)
    if (token && token !== 'undefined' && token !== 'null') {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
    if (user) {
      console.log('[AuthContext] About to store user:', user);
      console.log('[AuthContext] User.id before storing:', user.id);
      console.log('[AuthContext] User keys before storing:', Object.keys(user));
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      console.log('[AuthContext] User stored in AsyncStorage:', JSON.stringify(user));
    }
    setState((prev) => {
      const newState = { ...prev, token, user: user ?? prev.user };
      console.log('[AuthContext] State updated:', newState);
      console.log('[AuthContext] New state user:', newState.user);
      console.log('[AuthContext] New state user.id:', newState.user?.id);
      return newState;
    });
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
    setState({ token: null, user: null, initializing: false });
  }, []);

  const updateUser = useCallback(async (updates: Partial<AuthUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      setState((prev) => ({ ...prev, user: updatedUser }));
    }
  }, [state.user]);

  const value = useMemo<AuthContextValue>(
    () => ({ token: state.token, user: state.user, initializing: state.initializing, login, logout, updateUser }),
    [state, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


