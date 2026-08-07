"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { loginAction, logoutAction } from "@/app/recipes/admin/actions";

export function FooterAdminLogin({ label, strict = false }: { label?: string; strict?: boolean }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [configured, setConfigured] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const controller = new AbortController();
    fetch(strict ? "/api/recipe-admin/session?strict=1" : "/api/recipe-admin/session", { cache: "no-store", signal: controller.signal })
      .then((response) => response.json() as Promise<{ authenticated: boolean; configured?: boolean }>)
      .then((result) => {
        setAuthenticated(result.authenticated);
        setConfigured(result.configured ?? true);
      })
      .catch(() => undefined);
    return () => controller.abort();
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
    const result = await loginAction(password);
    setPending(false);
    if (result.ok) {
      setAuthenticated(true);
      setOpen(false);
      setPassword("");
      setError(false);
      window.dispatchEvent(new Event("recipe-admin-session-changed"));
      router.refresh();
    } else {
      setError(true);
    }
  }

  async function handleLogout() {
    await logoutAction();
    setAuthenticated(false);
    setOpen(false);
    window.dispatchEvent(new Event("recipe-admin-session-changed"));
    router.refresh();
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
              <button className="text-xs font-semibold text-clay hover:text-ink" onClick={handleLogout} type="button">Sign out</button>
            </div>
          ) : configured ? (
            <form className="flex flex-col gap-2" onSubmit={handleLogin}>
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink/40">Admin login</p>
              <input
                autoFocus
                className="rounded-full border border-ink/20 bg-surface px-3 py-1.5 text-sm"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(false);
                }}
                placeholder="Password"
                type="password"
                value={password}
              />
              <button className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-moss disabled:opacity-50" disabled={pending} type="submit">
                {pending ? "Checking…" : "Sign in"}
              </button>
              {error && <p className="text-xs text-clay">Wrong password.</p>}
            </form>
          ) : (
            <p className="text-xs leading-relaxed text-ink/60">Admin login is not configured for this environment.</p>
          )}
        </div>
      )}
    </div>
  );
}
