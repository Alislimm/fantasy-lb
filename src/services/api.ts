import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Platform-specific URLs
const DEFAULT_BASE_URL = Platform.select({
  ios: "http://192.168.1.53:8080",
  android: "http://192.168.1.53:8080", 
  default: "http://192.168.1.53:8080",
});

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_BASE_URL;

// Debug logging
console.log("🔧 [API] FORCED BASE_URL:", BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Debug: verify the resolved base URL at runtime
// eslint-disable-next-line no-console
console.log("[API] Environment variable EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
// eslint-disable-next-line no-console
console.log("[API] Final Base URL being used:", BASE_URL);

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
    "🚀 [API][Request]",
    (config.method || "GET").toUpperCase(),
    config.baseURL ? `${config.baseURL}${config.url}` : config.url,
    {
      headers: config.headers,
      params: config.params,
      data: maybeRedact(config.data),
    }
  );
  
  // Force the base URL to ensure it's correct
  config.baseURL = "http://192.168.1.53:8080";
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
  userId: number;
  username: string;
  role: string;
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
  team: Team;
  nationality: string;
  marketValue: number;
  ownershipPct: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PlayersQuery = {
  teamId?: number;
  minPrice?: number;
  maxPrice?: number;
  ownershipGte?: number;
  ownershipLte?: number;
  page?: number;
  size?: number;
};

// Fantasy Team types
export type User = {
  id: number;
  username: string;
  email: string;
};

export type FantasyTeamPlayer = {
  id: number;
  player: Player;
  purchasePrice: number;
  active: boolean;
  acquiredAt: string;
  releasedAt: string | null;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isOnBench?: boolean;
  position?: string;
};

export type FantasyTeam = {
  id: number;
  teamName: string;
  owner: User;
  budget: number;
  totalPoints: number;
  transfersRemaining: number;
  createdAt: string;
  updatedAt: string;
  squad: FantasyTeamPlayer[];
};

export type CreateTeamRequest = {
  teamName: string;
  ownerUserId: number;
};

export type InitialSquadBuildRequest = {
  teamName: string;
  ownerUserId: number;
  starters: number[]; // 5 player IDs
  bench: number[];    // 3 player IDs
  captainPlayerId?: number; // optional, must be among starters
  viceCaptainPlayerId?: number; // optional, must be among starters
};

// Lineup types
export type GameWeek = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

export type LineupSlot = {
  id: number;
  player: Player;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isOnBench: boolean;
  position: string;
};

export type Lineup = {
  id: number;
  fantasyTeam: FantasyTeam;
  gameWeek: GameWeek;
  createdAt: string;
  slots: LineupSlot[];
};

export type CreateLineupRequest = {
  fantasyTeamId: number;
  gameWeekId: number;
  starters: number[]; // 5 player IDs
  bench: number[];    // 3 player IDs
  captainPlayerId?: number; // optional, must be among starters
};

export async function getPlayers(params: PlayersQuery = {}) {
  const { data } = await api.get<Player[]>("/api/players", { params });
  return data;
}

// Teams
export type Team = {
  id: number;
  name: string;
  shortName: string;
  city: string;
  imageUrl: string;
  jerseyUrl: string;
  createdAt: string;
};

export async function getTeams() {
  console.log("[API] Calling /api/teams");
  try {
    const response = await api.get<Team[]>("/api/teams");
    console.log("[API] Teams response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[API] Teams error:", error);
    throw error;
  }
}

export async function getTeamPlayers(teamId: number) {
  const { data } = await api.get<Player[]>(`/api/teams/${teamId}/players`);
  return data;
}

// Fantasy Team API
export async function createTeam(request: CreateTeamRequest): Promise<FantasyTeam> {
  console.log("[API] Creating team:", request);
  try {
    const response = await api.post<FantasyTeam>("/api/user/team", request);
    console.log("[API] Team created:", response.data);
    return response.data;
  } catch (error) {
    console.error("[API] Create team error:", error);
    throw error;
  }
}

export async function buildInitialSquad(request: InitialSquadBuildRequest): Promise<FantasyTeam> {
  console.log("[API] Building initial squad:", request);
  try {
    const response = await api.post<FantasyTeam>("/api/user/squad/build", request);
    console.log("[API] Squad built:", response.data);
    return response.data;
  } catch (error) {
    console.error("[API] Build squad error:", error);
    throw error;
  }
}

// Lineup API
export async function createLineup(request: CreateLineupRequest): Promise<Lineup> {
  console.log("[API] Creating lineup:", request);
  try {
    const response = await api.post<Lineup>("/api/user/lineup", request);
    console.log("[API] Lineup created:", response.data);
    return response.data;
  } catch (error) {
    console.error("[API] Create lineup error:", error);
    throw error;
  }
}

// User Fantasy Team API
export async function hasFantasyTeam(userId: number) {
  console.log("[API] Checking if user has fantasy team:", userId);
  try {
    const { data } = await api.get<boolean>(`/api/user/${userId}/has-fantasy-team`);
    console.log("[API] Has fantasy team response:", data);
    return data;
  } catch (error) {
    console.error("[API] Has fantasy team error:", error);
    throw error;
  }
}

export async function getUserFantasyTeam(userId: number) {
  console.log("[API] Getting user fantasy team:", userId);
  try {
    const { data } = await api.get<FantasyTeam>(`/api/user/${userId}/fantasy-team`);
    console.log("[API] Fantasy team response:", data);
    return data;
  } catch (error) {
    console.error("[API] Get fantasy team error:", error);
    throw error;
  }
}


