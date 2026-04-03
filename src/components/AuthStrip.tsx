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
      <div className="flex flex-col items-end gap-2 text-[0.7rem] text-slate-600">
        <span className="text-slate-500">
          Signed in as <span className="font-medium text-slate-800">{user.email}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            logout();
            setPassword("");
          }}
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100"
        >
          Log out
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2 text-[0.7rem] sm:items-end"
      onSubmit={onLogin}
    >
      {localError ? (
        <p className="w-full text-right text-rose-600">{localError}</p>
      ) : null}
      <input
        type="email"
        autoComplete="email"
        placeholder="Email"
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 sm:max-w-[14rem]"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Password"
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 sm:max-w-[14rem]"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void onRegisterClick()}
          className="rounded-md border border-slate-300 px-2 py-1 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Register
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-slate-800 px-2 py-1 text-white hover:bg-slate-900 disabled:opacity-50"
        >
          {isLoading ? "…" : "Log in"}
        </button>
      </div>
    </form>
  );
}
