"use client";

import Image from "next/image";
import { useEffect, useState, createContext, useContext, type FormEvent, type PropsWithChildren } from "react";
import { loginAction } from "@/app/recipes/admin/actions";
import {
  emptyContactPresence,
  isContactPresenceCity,
  type ContactPresenceCity,
  type ContactPresenceStatus,
} from "@/lib/contact-presence";

const cityLabels: Record<ContactPresenceCity, string> = {
  losAngeles: "Los Angeles",
  london: "London",
  hongKong: "Hong Kong",
};

type ContactPresenceContextValue = {
  authenticated: boolean;
  draftMessage: string;
  editorOpen: boolean;
  error: string;
  login: (password: string) => Promise<boolean>;
  pending: boolean;
  publishMessage: () => Promise<void>;
  clearPresence: () => Promise<void>;
  selectCity: (city: ContactPresenceCity) => Promise<void>;
  selectTravelling: () => Promise<void>;
  setDraftMessage: (message: string) => void;
  status: ContactPresenceStatus;
  toggleEditor: () => void;
};

const ContactPresenceContext = createContext<ContactPresenceContextValue | null>(null);

function parseStatus(value: unknown): ContactPresenceStatus {
  if (!value || typeof value !== "object") return emptyContactPresence;
  const candidate = value as { city?: unknown; isTravelling?: unknown; message?: unknown; updatedAt?: unknown };

  return {
    city: candidate.city === null || isContactPresenceCity(candidate.city) ? candidate.city : null,
    isTravelling: candidate.isTravelling === true,
    message: typeof candidate.message === "string" ? candidate.message.slice(0, 140) : "",
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : null,
  };
}

export function ContactPresenceProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ContactPresenceStatus>(emptyContactPresence);
  const [authenticated, setAuthenticated] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadStatus = () => fetch("/api/contact-presence", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => response.json() as Promise<{ status?: unknown }>)
      .then((result) => {
        const nextStatus = parseStatus(result.status);
        setStatus(nextStatus);
        setDraftMessage((current) => current || nextStatus.message);
      })
      .catch(() => undefined);

    void Promise.all([
      loadStatus(),
      fetch("/api/recipe-admin/session", { cache: "no-store", signal: controller.signal })
        .then((response) => response.json() as Promise<{ authenticated?: boolean }>)
        .then((result) => setAuthenticated(result.authenticated === true))
        .catch(() => undefined),
    ]);

    const refreshInterval = window.setInterval(loadStatus, 60_000);
    return () => {
      controller.abort();
      window.clearInterval(refreshInterval);
    };
  }, []);

  async function persist(nextStatus: ContactPresenceStatus) {
    const previousStatus = status;
    setPending(true);
    setError("");
    setStatus(nextStatus);

    try {
      const response = await fetch("/api/contact-presence", {
        body: JSON.stringify({
          city: nextStatus.city,
          isTravelling: nextStatus.isTravelling,
          message: nextStatus.message,
        }),
        headers: { "Content-Type": "application/json" },
        method: "PUT",
      });
      const result = await response.json() as { error?: string; status?: unknown };

      if (!response.ok) {
        if (response.status === 401) setAuthenticated(false);
        throw new Error(result.error || "Unable to publish the update.");
      }

      setStatus(parseStatus(result.status));
      return true;
    } catch (requestError) {
      setStatus(previousStatus);
      setError(requestError instanceof Error ? requestError.message : "Unable to publish the update.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function login(password: string) {
    setPending(true);
    setError("");
    const result = await loginAction(password);
    setPending(false);
    setAuthenticated(result.ok);
    if (!result.ok) setError("Wrong password.");
    return result.ok;
  }

  async function selectCity(city: ContactPresenceCity) {
    if (!authenticated || pending) return;
    if (await persist({ ...status, city, isTravelling: false })) {
      setEditorOpen(false);
    }
  }

  async function selectTravelling() {
    if (!authenticated || pending) return;
    setEditorOpen(true);
    await persist({ ...status, city: null, isTravelling: true });
  }

  async function clearPresence() {
    if (!authenticated || pending) return;
    if (await persist({ ...status, city: null, isTravelling: false })) {
      setEditorOpen(false);
    }
  }

  async function publishMessage() {
    if (!authenticated || pending) return;
    const message = draftMessage.trim().replace(/\s+/g, " ");
    if (await persist({ ...status, message })) {
      setEditorOpen(false);
    }
  }

  function toggleEditor() {
    setDraftMessage(status.message);
    setError("");
    setEditorOpen((open) => !open);
  }

  return (
    <ContactPresenceContext.Provider
      value={{
        authenticated,
        clearPresence,
        draftMessage,
        editorOpen,
        error,
        login,
        pending,
        publishMessage,
        selectCity,
        selectTravelling,
        setDraftMessage,
        status,
        toggleEditor,
      }}
    >
      {children}
    </ContactPresenceContext.Provider>
  );
}

function useContactPresence() {
  const context = useContext(ContactPresenceContext);
  if (!context) throw new Error("Contact presence components must be inside ContactPresenceProvider.");
  return context;
}

export function ContactPresenceControls() {
  const {
    authenticated,
    clearPresence,
    draftMessage,
    editorOpen,
    error,
    login,
    pending,
    publishMessage,
    setDraftMessage,
    status,
    toggleEditor,
  } = useContactPresence();
  const [password, setPassword] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await login(password)) setPassword("");
  }

  async function handlePublish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await publishMessage();
  }

  return (
    <div className="contact-presence-controls">
      <button
        aria-expanded={editorOpen}
        aria-label={authenticated ? "Edit current location" : "Admin sign in"}
        className="contact-presence-edit-button"
        onClick={toggleEditor}
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M12 21s6-5.4 6-12A6 6 0 0 0 6 9c0 6.6 6 12 6 12Z" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="9" r="2" fill="currentColor" />
        </svg>
      </button>

      {editorOpen ? (
        <div className="contact-presence-editor">
          {authenticated ? (
            <>
              <div className="contact-presence-editor-heading">
                <div>
                  <span>Current location</span>
                  <strong>
                    {status.city
                      ? cityLabels[status.city]
                      : status.isTravelling
                        ? status.message || "Travelling elsewhere"
                        : "No location selected"}
                  </strong>
                </div>
                <button disabled={pending || (!status.city && !status.isTravelling)} onClick={() => void clearPresence()} type="button">
                  Clear
                </button>
              </div>
              <p className="contact-presence-editor-hint">Tap a city, or tap the suitcase corner for somewhere else.</p>
              {status.isTravelling ? (
                <form onSubmit={handlePublish}>
                  <label htmlFor="contact-presence-message">Location beneath the traveller</label>
                  <input
                    autoFocus
                    id="contact-presence-message"
                    maxLength={140}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder="Travelling in Paris"
                    type="text"
                    value={draftMessage}
                  />
                  <div className="contact-presence-editor-actions">
                    <span>{draftMessage.length}/140</span>
                    <button disabled={pending} type="submit">{pending ? "Saving…" : "Publish"}</button>
                  </div>
                </form>
              ) : (
                <p className="contact-presence-editor-empty">Select the suitcase corner to add a custom location.</p>
              )}
            </>
          ) : (
            <form className="contact-presence-login" onSubmit={handleLogin}>
              <label htmlFor="contact-presence-password">Admin password</label>
              <input
                autoFocus
                id="contact-presence-password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                type="password"
                value={password}
              />
              <button disabled={pending || !password} type="submit">{pending ? "Checking…" : "Sign in"}</button>
            </form>
          )}
          {error ? <p className="contact-presence-editor-error" role="alert">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

export function ContactPresenceCityTargets() {
  const { authenticated, editorOpen, pending, selectCity, selectTravelling, status } = useContactPresence();
  if (!authenticated) return null;

  return (
    <div className="contact-presence-city-targets" aria-label="Choose current city" data-editing={editorOpen}>
      {(Object.keys(cityLabels) as ContactPresenceCity[]).map((city) => (
        <button
          aria-label={`Set current location to ${cityLabels[city]}`}
          aria-pressed={status.city === city}
          className={`contact-presence-city-target contact-presence-city-target-${city}`}
          disabled={pending}
          key={city}
          onClick={() => void selectCity(city)}
          type="button"
        >
          {editorOpen ? <span>{cityLabels[city]}</span> : null}
        </button>
      ))}
      <button
        aria-label="Set current location to somewhere else"
        aria-pressed={status.isTravelling}
        className="contact-presence-travel-target"
        disabled={pending}
        onClick={() => void selectTravelling()}
        type="button"
      >
        {editorOpen ? <span>Elsewhere</span> : null}
      </button>
    </div>
  );
}

export function ContactTravellingPresence() {
  const { status } = useContactPresence();
  if (!status.isTravelling || status.city) return null;

  return (
    <span className="contact-travelling-presence" aria-label={status.message || "Curtis is travelling"}>
      <Image
        alt=""
        className="contact-travelling-presence-person"
        height={1648}
        src="/contact-presence-traveller-v3.png"
        width={954}
      />
      {status.message ? <span className="contact-travelling-presence-location">{status.message}</span> : null}
    </span>
  );
}

export function ContactCityPresence({ city }: { city: ContactPresenceCity }) {
  const { status } = useContactPresence();
  if (status.city !== city) return null;

  return (
    <span aria-label={`Curtis is currently in ${cityLabels[city]}`} className={`contact-city-presence contact-city-presence-${city}`}>
      <Image
        alt=""
        className="contact-city-presence-person"
        height={836}
        src="/contact-presence-person-v2.png"
        width={1881}
      />
      <span className="contact-city-presence-sign">I&apos;m here</span>
    </span>
  );
}
