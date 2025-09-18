import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEFAULT_BASE_URL = Platform.select({
  ios: "http://localhost:8080",
  android: "http://10.0.2.2:8080",
  default: "http://localhost:8080",
});

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Debug: verify the resolved base URL at runtime
// You can remove this after confirming
// eslint-disable-next-line no-console
console.log("[API] Base URL:", BASE_URL);

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  // lightweight redaction for sensitive fields
  const maybeRedact = (payload: unknown) => {
    if (payload && typeof payload === "object") {
      const copy: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
      if (typeof copy.password !== "undefined") copy.password = "***";
      return copy;
    }
    return payload;
  };

  // eslint-disable-next-line no-console
  console.log(
    "[API][Request]",
    (config.method || "GET").toUpperCase(),
    config.baseURL ? `${config.baseURL}${config.url}` : config.url,
    {
      headers: config.headers,
      params: config.params,
      data: maybeRedact(config.data),
    }
  );
  return config;
});

api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.log(
      "[API][Response]",
      (response.config.method || "GET").toUpperCase(),
      response.config.baseURL ? `${response.config.baseURL}${response.config.url}` : response.config.url,
      {
        status: response.status,
        data: response.data,
      }
    );
    return response;
  },
  (error) => {
    const cfg = error?.config || {};
    const url = cfg.baseURL ? `${cfg.baseURL}${cfg.url}` : cfg.url;
    // eslint-disable-next-line no-console
    console.log("[API][Error]", (cfg.method || "GET").toUpperCase(), url, {
      message: error?.message,
      status: error?.response?.status,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  }
);

export type LoginResponse = {
  token: string;
  user?: {
    id: number;
    email: string;
    username: string;
    role: string;
  };
};

export async function loginApi(usernameOrEmail: string, password: string) {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { usernameOrEmail, password });
  return data;
}

export type MeResponse = {
  id: number;
  email: string;
  username: string;
  roles: string;
};

export async function getMe() {
  const { data } = await api.get<MeResponse>("/api/auth/me");
  return data;
}

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
  favouriteTeamId: number;
  nationality: string;
};

export type RegisterResponse = {
  id: number;
  email: string;
};

export async function registerApi(data: RegisterRequest) {
  const { data: response } = await api.post<RegisterResponse>("/api/auth/register", data);
  return response;
}

// Players
export type Player = {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  teamId: number;
  teamName: string;
  price: number;
  ownershipPct: number;
};

export type PlayersQuery = {
  teamId?: number;
  position?: string;
  minPrice?: number;
  maxPrice?: number;
  ownershipGte?: number;
  ownershipLte?: number;
  page?: number;
  size?: number;
};

export async function getPlayers(params: PlayersQuery = {}) {
  const { data } = await api.get<Player[]>("/api/players", { params });
  return data;
}

// Teams
export type Team = {
  id: number;
  name: string;
};

export async function getTeams() {
  const { data } = await api.get<Team[]>("/api/teams");
  return data;
}

export async function getTeamPlayers(teamId: number) {
  const { data } = await api.get<Player[]>(`/api/teams/${teamId}/players`);
  return data;
}


