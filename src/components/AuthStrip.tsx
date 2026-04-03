import { useState } from "react";
import { useAuth } from "../auth/useAuth";

export function AuthStrip() {
  const {
    email,
    setEmail,
    user,
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
  } = useAuth();
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    try {
      await login(email.trim(), password);
      setPassword("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Login failed";
      setLocalError(msg);
    }
  }

  async function onRegisterClick() {
    setLocalError(null);
    try {
      await register(email.trim(), password);
      setPassword("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Registration failed";
      setLocalError(msg);
    }
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md sm:max-w-sm sm:items-end">
        <div className="flex items-center gap-3 sm:justify-end">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-teal-900/20">
            {user.email.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 text-left sm:text-right">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-slate-400">
              Signed in
            </p>
            <p className="truncate text-sm font-semibold text-slate-800">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            setPassword("");
          }}
          className="btn-secondary w-full sm:w-auto"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-md sm:items-stretch"
      onSubmit={onLogin}
    >
      {localError ? (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {localError}
        </p>
      ) : null}
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        className="input-control"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        className="input-control"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void onRegisterClick()}
          className="btn-secondary flex-1 min-w-[6rem]"
        >
          Register
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 min-w-[6rem]"
        >
          {isLoading ? "…" : "Log in"}
        </button>
      </div>
    </form>
  );
}
