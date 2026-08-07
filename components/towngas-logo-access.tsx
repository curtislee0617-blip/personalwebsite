"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

export function TowngasLogoAccess({
  children,
  initiallyAuthenticated,
}: {
  children: ReactNode;
  initiallyAuthenticated: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [authenticated, setAuthenticated] = useState(initiallyAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !wrapperRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/towngas-access/session", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        setError(response.status === 503 ? "Project access is not configured." : "Wrong password.");
        return;
      }

      setAuthenticated(true);
      setPassword("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not check the password. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleLogout() {
    setPending(true);
    try {
      await fetch("/api/towngas-access/session", { method: "DELETE", cache: "no-store" });
      setAuthenticated(false);
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="towngas-affiliation-access" ref={wrapperRef}>
      <button
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Towngas project access"
        className="towngas-affiliation-logos towngas-affiliation-access-trigger"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {children}
      </button>

      {open ? (
        <div aria-label="Towngas project access" className="towngas-access-panel" role="dialog">
          {authenticated ? (
            <div className="towngas-access-status">
              <div><span>Private project access</span><strong>Full detail unlocked</strong></div>
              <button disabled={pending} onClick={handleLogout} type="button">{pending ? "Signing out…" : "Sign out"}</button>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
              <label htmlFor="towngas-access-password">Towngas project access</label>
              <input
                autoFocus
                autoComplete="current-password"
                id="towngas-access-password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Password"
                type="password"
                value={password}
              />
              <button disabled={pending || password.length === 0} type="submit">{pending ? "Checking…" : "Unlock full project"}</button>
              {error ? <p role="alert">{error}</p> : null}
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
