import type { IProjectConfig, UnknownShorthandCompoundProps } from "@theatre/core";

/**
 * Loads Theatre's authoring UI only in development. Production should consume
 * an exported state file through `createTheatreSheet` instead.
 */
export async function initializeTheatreStudio() {
  if (process.env.NODE_ENV !== "development" || typeof window === "undefined") return null;
  const { default: studio } = await import("@theatre/studio");
  studio.initialize();
  return studio;
}

export async function createTheatreSheet(
  projectId: string,
  sheetId: string,
  state?: IProjectConfig["state"],
) {
  const { getProject } = await import("@theatre/core");
  const project = getProject(projectId, state ? { state } : undefined);
  await project.ready;
  return project.sheet(sheetId);
}

export type TheatreObjectSchema = UnknownShorthandCompoundProps;
