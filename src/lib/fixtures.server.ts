import "server-only";
import type { Session } from "./types";

/**
 * Returns synthetic sessions. Strictly empty: no mock data is generated or served.
 */
export function syntheticSessions(): Session[] {
  return [];
}
