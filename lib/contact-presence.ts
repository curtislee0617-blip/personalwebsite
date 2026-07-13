export const contactPresenceCities = ["losAngeles", "london", "hongKong"] as const;

export type ContactPresenceCity = (typeof contactPresenceCities)[number];

export type ContactPresenceStatus = {
  city: ContactPresenceCity | null;
  isTravelling: boolean;
  message: string;
  updatedAt: string | null;
};

export const emptyContactPresence: ContactPresenceStatus = {
  city: null,
  isTravelling: false,
  message: "",
  updatedAt: null,
};

export function isContactPresenceCity(value: unknown): value is ContactPresenceCity {
  return typeof value === "string" && contactPresenceCities.includes(value as ContactPresenceCity);
}
