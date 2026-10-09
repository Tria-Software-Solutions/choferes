// Server-side refresh-token sessions: rotation, reuse detection and revocation.
//
// The refresh JWT embeds a session id (`sid`) and the current token id (`jti`).
// Only the row in `auth_sessions` decides whether a refresh token is still
// accepted, so a token can be rotated or revoked even though JWTs are stateless.
import * as crypto from "crypto";
import { AuthSession } from "../models/AuthSession";

// Must match the refresh JWT lifetime in generateSecret.ts (7d).
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// A rotated-out token is still accepted for this window so concurrent refreshes
// from multiple tabs don't get treated as token theft (and log the user out).
const REUSE_GRACE_MS = 60 * 1000;

export interface SessionTokens {
  sid: string;
  jti: string;
}

export type RotateResult =
  { status: "rotated"; sid: string; jti: string; userId: number } | { status: "invalid" };

// Starts a new session (on login) and returns its identifiers.
export const createSession = async (userId: number): Promise<SessionTokens> => {
  const sid = crypto.randomUUID();
  const jti = crypto.randomUUID();

  await AuthSession.create({
    id: sid,
    userId,
    refreshJti: jti,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });

  return { sid, jti };
};

// Validates `presentedJti` against the session and rotates it. Returns
// "invalid" (and revokes the session) when an unknown/stale token is replayed.
export const rotateSession = async (
  sid: string,
  presentedJti: string,
  allowRetry = true,
): Promise<RotateResult> => {
  const session = await AuthSession.findByPk(sid);

  if (!session || session.revokedAt || session.expiresAt.getTime() <= Date.now()) {
    return { status: "invalid" };
  }

  const now = Date.now();
  const isCurrent = presentedJti === session.refreshJti;
  const isRecentPrevious =
    session.previousJti != null &&
    presentedJti === session.previousJti &&
    session.rotatedAt != null &&
    now - session.rotatedAt.getTime() < REUSE_GRACE_MS;

  if (!isCurrent && !isRecentPrevious) {
    // Replay of an old token: assume compromise and kill the whole session.
    await AuthSession.update({ revokedAt: new Date() }, { where: { id: sid } });
    return { status: "invalid" };
  }

  const newJti = crypto.randomUUID();
  const [affected] = await AuthSession.update(
    {
      refreshJti: newJti,
      previousJti: session.refreshJti,
      rotatedAt: new Date(now),
      expiresAt: new Date(now + SESSION_TTL_MS),
    },
    { where: { id: sid, refreshJti: session.refreshJti } },
  );

  // Conditional update lost a race with a concurrent refresh from another tab:
  // re-read once; the token we were given is now the "recent previous" one.
  if (!affected && allowRetry) {
    return rotateSession(sid, presentedJti, false);
  }

  if (!affected) {
    return { status: "invalid" };
  }

  return { status: "rotated", sid, jti: newJti, userId: session.userId };
};

// Revokes a single session (logout of the current device).
export const revokeSession = async (sid: string): Promise<void> => {
  await AuthSession.update({ revokedAt: new Date() }, { where: { id: sid } });
};

// Revokes every active session for a user (e.g. after a password change).
export const revokeAllSessionsForUser = async (userId: number): Promise<void> => {
  await AuthSession.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
};

// Housekeeping: drop revoked/expired sessions. Intended to run periodically.
export const pruneExpiredSessions = async (): Promise<number> => {
  const cutoff = new Date(Date.now() - SESSION_TTL_MS);
  return AuthSession.destroy({
    where: {
      $or: [{ expiresAt: { $lt: new Date() } }, { revokedAt: { $lt: cutoff } }],
    },
  });
};
