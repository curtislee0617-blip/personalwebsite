"use client";

import { useEffect, useRef, useState } from "react";
import { loginAction, logoutAction } from "@/app/recipes/admin/actions";

export function FooterAdminLogin({ label, strict = false }: { label?: string; strict?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadSession = () => fetch(strict ? "/api/recipe-admin/session?strict=1" : "/api/recipe-admin/session", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json() as Promise<{ authenticated: boolean; configured?: boolean }>)
      .then((result) => {
        setAuthenticated(result.authenticated);
        setConfigured(result.configured ?? true);
      })
      .catch(() => undefined);
    void loadSession();
    window.addEventListener("recipe-admin-session-changed", loadSession);
    return () => {
      controller.abort();
      window.removeEventListener("recipe-admin-session-changed", loadSession);
    };
  }, [strict]);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (wrapperRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const result = await loginAction(password);
      if (result.ok) {
        setAuthenticated(true);
        setOpen(false);
        setPassword("");
        window.dispatchEvent(new Event("recipe-admin-session-changed"));
        // Start a fresh request with the new cookie so protected server-rendered
        // pages cannot keep a previously signed-out router response.
        window.location.reload();
      } else {
        setError("Wrong password.");
      }
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    setPending(true);
    setError("");
    try {
      await logoutAction();
      setAuthenticated(false);
      setOpen(false);
      window.dispatchEvent(new Event("recipe-admin-session-changed"));
      window.location.reload();
    } catch {
      setError("Unable to sign out. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button className="text-left hover:text-ink" onClick={() => setOpen((v) => !v)} type="button">
        {label ?? `© ${new Date().getFullYear()} Curtis Lee.`}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-56 rounded-2xl border border-ink/10 bg-surface p-3 shadow-lg">
          {authenticated ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold text-ink/60">Signed in</p>
              <button className="text-xs font-semibold text-clay hover:text-ink" disabled={pending} onClick={handleLogout} type="button">{pending ? "Signing out…" : "Sign out"}</button>
            </div>
          ) : configured ? (
            <form className="flex flex-col gap-2" onSubmit={handleLogin}>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/40">Admin login</p>
              <input
                autoFocus
                className="rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-sm"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Password"
                type="password"
                value={password}
              />
              <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-moss disabled:opacity-50" disabled={pending} type="submit">
                {pending ? "Checking…" : "Sign in"}
              </button>
            </form>
          ) : (
            <p className="text-xs leading-relaxed text-ink/60">Admin login is not configured for this environment.</p>
          )}
          {error && <p className="mt-2 text-xs text-clay" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
