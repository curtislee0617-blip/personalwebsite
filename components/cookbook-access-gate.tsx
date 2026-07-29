"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export function CookbookAccessGate({
  adminAuthenticated = false,
  authenticated,
}: {
  adminAuthenticated?: boolean;
  authenticated: boolean;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/cookbook-access/session", {
        body: JSON.stringify({ password }),
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      if (!response.ok) {
        setError("Wrong password.");
        return;
      }

      setPassword("");
      window.dispatchEvent(new Event("cookbook-access-session-changed"));
      router.refresh();
    } catch {
      setError("The cookbook login could not be checked.");
    } finally {
      setPending(false);
    }
  }

  async function logout() {
    setPending(true);
    try {
      await fetch("/api/cookbook-access/session", { method: "DELETE" });
      window.dispatchEvent(new Event("cookbook-access-session-changed"));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (adminAuthenticated) {
    return (
      <span className="inline-flex rounded-full border border-moss/20 bg-lime/25 px-4 py-2 text-xs font-semibold text-moss">
        Open with admin access
      </span>
    );
  }

  if (authenticated) {
    return (
      <button
        className="inline-flex rounded-full border border-ink/12 bg-paper/70 px-4 py-2 text-xs font-semibold text-ink/50 transition hover:border-ink/25 hover:text-ink disabled:opacity-50"
        disabled={pending}
        onClick={logout}
        type="button"
      >
        {pending ? "Locking…" : "Lock recipe books"}
      </button>
    );
  }

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-2 rounded-[1.35rem] border border-ink/10 bg-surface/65 p-3 shadow-sm sm:flex-row sm:items-center"
      onSubmit={login}
    >
      <label className="sr-only" htmlFor="cookbook-access-password">Password</label>
      <input
        autoComplete="current-password"
        className="min-w-0 flex-1 rounded-full border border-ink/15 bg-paper/80 px-4 py-2 text-sm outline-none transition focus:border-moss/45"
        id="cookbook-access-password"
        onChange={(event) => {
          setPassword(event.currentTarget.value);
          setError("");
        }}
        placeholder="Password"
        type="password"
        value={password}
      />
      <button
        className="shrink-0 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper transition hover:bg-moss disabled:opacity-50"
        disabled={pending || !password}
        type="submit"
      >
        {pending ? "Checking…" : "Open books"}
      </button>
      {error && <p className="text-xs text-clay sm:basis-full">{error}</p>}
    </form>
  );
}
