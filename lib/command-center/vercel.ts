/** Vercel deployments for the projects on your team. Server-side only. */

const API = "https://api.vercel.com";

export type Deployment = {
  uid: string;
  name: string;
  url: string;
  created: number;
  state: string;
  target: string | null;
  meta?: Record<string, string>;
  inspectorUrl?: string;
  project?: string;
};

async function vercel<T>(path: string): Promise<T> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) throw new Error("Missing VERCEL_API_TOKEN");
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Vercel API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function listDeployments(limit = 8): Promise<Deployment[]> {
  const teamId = process.env.VERCEL_TEAM_ID;
  const team = teamId ? `teamId=${encodeURIComponent(teamId)}&` : "";

  const { projects } = await vercel<{ projects: { id: string; name: string }[] }>(
    `/v9/projects?${team}limit=10`
  );

  const groups = await Promise.all(
    projects.slice(0, 3).map(async (p) => {
      try {
        const { deployments } = await vercel<{ deployments: Deployment[] }>(
          `/v6/deployments?${team}projectId=${p.id}&limit=${limit}`
        );
        return deployments.map((d) => ({ ...d, project: p.name }));
      } catch {
        return [];
      }
    })
  );

  return groups.flat().sort((a, b) => b.created - a.created).slice(0, limit);
}
