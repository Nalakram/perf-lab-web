// src/api/perfLabClient.ts
import { notifyUnauthorized } from "../auth/sessionBridge";
import type {
  ApiError,
  StressDose,
  TokenResponse,
  UnifiedStateVector,
  UserResponse,
  WorkoutLog,
  WorkoutPrescription,
} from "../types";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_ROOT = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";
const API_V1_BASE = API_ROOT ? `${API_ROOT}/v1` : "";

if (!API_ROOT) {
  console.warn("VITE_API_BASE_URL is not set. API calls will fail.");
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

type HandleOpts = {
  /** If true, notify auth layer to clear session on 401 */
  sessionOn401?: boolean;
};

async function handleResponse<T>(
  res: Response,
  opts?: HandleOpts,
): Promise<T> {
  if (res.status === 401 && opts?.sessionOn401) {
    notifyUnauthorized();
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!res.ok) {
    let detail: unknown;
    if (isJson) {
      try {
        detail = await res.json();
      } catch {
        // ignore
      }
    } else {
      try {
        detail = await res.text();
      } catch {
        // ignore
      }
    }

    const error: ApiError = {
      message:
        (detail as { detail?: string })?.detail ??
        res.statusText ??
        "API request failed",
      status: res.status,
      details: detail,
    };
    throw error;
  }

  if (isJson) {
    return res.json() as Promise<T>;
  }

  return undefined as unknown as T;
}

export type PingResponse = {
  status: string;
};

export async function ping(): Promise<PingResponse> {
  if (!API_ROOT) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  const res = await fetch(`${API_ROOT}/ping`);
  return handleResponse<PingResponse>(res);
}

export async function register(
  email: string,
  password: string,
): Promise<UserResponse> {
  if (!API_ROOT) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  const res = await fetch(`${API_ROOT}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<UserResponse>(res);
}

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  if (!API_ROOT) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  const body = new URLSearchParams();
  body.set("username", email);
  body.set("password", password);
  const res = await fetch(`${API_ROOT}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  return handleResponse<TokenResponse>(res);
}

export async function fetchMe(token: string): Promise<UserResponse> {
  if (!API_ROOT) {
    throw new Error("VITE_API_BASE_URL is not configured");
  }
  const res = await fetch(`${API_ROOT}/auth/me`, {
    headers: { ...authHeaders(token) },
  });
  return handleResponse<UserResponse>(res, { sessionOn401: true });
}

/**
 * Digital Twin: Controller – get recommended next session u_t.
 */
export async function getNextSession(
  goal: string,
  token: string,
): Promise<WorkoutPrescription> {
  if (!API_V1_BASE) {
    throw new Error("VITE_API_BASE_URL is not configured (no /v1 base)");
  }
  const url = `${API_V1_BASE}/next-session?goal=${encodeURIComponent(goal)}`;
  const res = await fetch(url, { headers: { ...authHeaders(token) } });
  return handleResponse<WorkoutPrescription>(res, { sessionOn401: true });
}

/**
 * Digital Twin: Log a workout, update S_t -> S_{t+1}, return new state.
 */
export async function logWorkout(
  log: WorkoutLog,
  token: string,
): Promise<UnifiedStateVector> {
  if (!API_V1_BASE) {
    throw new Error("VITE_API_BASE_URL is not configured (no /v1 base)");
  }
  const res = await fetch(`${API_V1_BASE}/log-workout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(log),
  });
  return handleResponse<UnifiedStateVector>(res, { sessionOn401: true });
}

/**
 * Digital Twin: Pure sensor map – compute D_t from a log without updating S_t.
 */
export async function simulateDose(log: WorkoutLog): Promise<StressDose> {
  if (!API_V1_BASE) {
    throw new Error("VITE_API_BASE_URL is not configured (no /v1 base)");
  }
  const res = await fetch(`${API_V1_BASE}/simulate-dose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
  return handleResponse<StressDose>(res);
}
