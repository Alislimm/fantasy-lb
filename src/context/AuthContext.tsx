import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthUser = {
  id: number;
  email: string;
  roles?: string[];
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
};

export const AuthContext = createContext<AuthContextValue>({
  token: null,
  user: null,
  initializing: true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (_token: string, _user?: AuthUser | null) => {},
  logout: async () => {},
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
      const user = userJson ? (JSON.parse(userJson) as AuthUser) : null;
      setState({ token, user, initializing: false });
    } catch (e) {
      setState({ token: null, user: null, initializing: false });
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = useCallback(async (token: string, user?: AuthUser | null) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    if (user) {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    setState((prev) => ({ ...prev, token, user: user ?? prev.user }));
  }, []);

  const logout = useCallback(async () => {
    await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
    setState({ token: null, user: null, initializing: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token: state.token, user: state.user, initializing: state.initializing, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


