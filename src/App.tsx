import { useEffect, useState } from "react";
import { ping } from "./api/perfLabClient";

type PingState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; data: unknown }
    | { status: "error"; error: string };

function App() {
    const [pingState, setPingState] = useState<PingState>({ status: "idle" });

    useEffect(() => {
        setPingState({ status: "loading" });
        ping()
            .then((data) => setPingState({ status: "ok", data }))
            .catch((err: unknown) =>
                setPingState({
                    status: "error",
                    error: err instanceof Error ? err.message : "Unknown error",
                })
            );
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
                <h1 className="text-xl font-semibold mb-4 text-slate-50">
                    Performance Lab Web
                </h1>
                <p className="text-sm text-slate-400 mb-4">
                    Frontend for the Performance Lab API. This page just checks{" "}
                    <code className="px-1 py-0.5 rounded bg-slate-800 text-xs">
                        /ping
                    </code>{" "}
                    on the backend.
                </p>

                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-sm">
                    <div className="mb-2 font-mono text-xs text-slate-500">
                        API_BASE_URL = {import.meta.env.VITE_API_BASE_URL || "NOT SET"}
                    </div>

                    {pingState.status === "idle" && (
                        <div className="text-slate-400">Idle.</div>
                    )}

                    {pingState.status === "loading" && (
                        <div className="text-slate-300 animate-pulse">
                            Pinging backend…
                        </div>
                    )}

                    {pingState.status === "ok" && (
                        <div className="space-y-1">
                            <div className="text-emerald-400 font-semibold">
                                Connected to API ✅
                            </div>
                            <pre className="mt-1 overflow-x-auto rounded bg-slate-950/80 p-2 text-xs text-slate-100">
                                {JSON.stringify(pingState.data, null, 2)}
                            </pre>
                        </div>
                    )}

                    {pingState.status === "error" && (
                        <div className="space-y-1">
                            <div className="text-rose-400 font-semibold">
                                Failed to reach API ❌
                            </div>
                            <div className="text-rose-300 text-xs">
                                {pingState.error}
                            </div>
                            <div className="text-slate-500 text-xs mt-1">
                                Check your <code>VITE_API_BASE_URL</code> and CORS settings on
                                the backend.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
