// src/api/perfLabClient.ts
import type {
  UnifiedStateVector,
  WorkoutPrescription,
  WorkoutLog,
  StressDose,
  ApiError,
} from "../types";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL as string | undefined;
const API_ROOT = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "";
const API_V1_BASE = API_ROOT ? `${API_ROOT}/v1` : "";

if (!API_ROOT) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not set. API calls will fail.");
}

async function handleResponse<T>(res: Response): Promise<T> {
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
        (detail as any)?.detail ??
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

  return (undefined as unknown) as T;
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

/**
 * Digital Twin: Controller – get recommended next session u_t.
 */
export async function getNextSession(
  goal: string = "Strength",
): Promise<WorkoutPrescription> {
  if (!API_V1_BASE) {
    throw new Error("VITE_API_BASE_URL is not configured (no /v1 base)");
  }
  const url = `${API_V1_BASE}/next-session?goal=${encodeURIComponent(goal)}`;
  const res = await fetch(url);
  return handleResponse<WorkoutPrescription>(res);
}

/**
 * Digital Twin: Log a workout, update S_t -> S_{t+1}, return new state.
 */
export async function logWorkout(
  log: WorkoutLog,
): Promise<UnifiedStateVector> {
  if (!API_V1_BASE) {
    throw new Error("VITE_API_BASE_URL is not configured (no /v1 base)");
  }
  const res = await fetch(`${API_V1_BASE}/log-workout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
  return handleResponse<UnifiedStateVector>(res);
}

/**
 * Digital Twin: Pure sensor map – compute D_t from a log without updating S_t.
 */
export async function simulateDose(
  log: WorkoutLog,
): Promise<StressDose> {
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
