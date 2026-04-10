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
      <div className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:max-w-sm sm:items-end">
        <div className="flex items-center gap-3 sm:justify-end">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-neon-cyan to-neon-violet text-xs font-bold text-black">
            {user.email.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 text-left sm:text-right">
            <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-400">
              Signed in
            </p>
            <p className="truncate text-sm font-semibold text-white">{user.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            setPassword("");
          }}
          className="w-full sm:w-auto rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:border-neon-cyan/40 transition-colors"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl p-4 sm:items-stretch"
      onSubmit={onLogin}
    >
      {localError ? (
        <p className="rounded-lg border border-rose-400/40 bg-rose-950/60 px-3 py-2 text-xs text-rose-200">
          {localError}
        </p>
      ) : null}
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-neon-cyan/50 focus:outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-neon-cyan/50 focus:outline-none"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void onRegisterClick()}
          className="flex-1 min-w-[6rem] rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:border-neon-cyan/40 disabled:opacity-40 transition-colors"
        >
          Register
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 min-w-[6rem] rounded-xl bg-gradient-to-r from-neon-cyan to-neon-violet px-4 py-2 text-sm font-semibold text-black disabled:opacity-40 transition-opacity"
        >
          {isLoading ? "..." : "Log in"}
        </button>
      </div>
    </form>
  );
}
