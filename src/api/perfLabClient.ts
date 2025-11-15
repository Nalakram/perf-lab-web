const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  // eslint-disable-next-line no-console
  console.warn("VITE_API_BASE_URL is not set. API calls will fail.");
}

export type PingResponse = {
  status: string;
};

export async function ping(): Promise<PingResponse> {
  const res = await fetch(`${API_BASE_URL}/ping`);
  if (!res.ok) {
    throw new Error(`Ping failed with status ${res.status}`);
  }
  return res.json();
}
