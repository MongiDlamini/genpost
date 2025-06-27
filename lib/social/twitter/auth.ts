import { TWITTER_CONFIG } from "./config"
import crypto from "crypto"

export interface TwitterAuthState {
  userId: string
  teamId?: string
  returnUrl?: string
  codeVerifier: string
}

export function generateCodeChallenge(codeVerifier: string): string {
  return crypto.createHash("sha256").update(codeVerifier).digest("base64url")
}

export function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString("base64url")
}

export function generateTwitterAuthUrl(state: TwitterAuthState): string {
  const stateString = Buffer.from(
    JSON.stringify({
      userId: state.userId,
      teamId: state.teamId,
      returnUrl: state.returnUrl,
    }),
  ).toString("base64url")

  const codeChallenge = generateCodeChallenge(state.codeVerifier)

  const params = new URLSearchParams({
    response_type: "code",
    client_id: TWITTER_CONFIG.clientId,
    redirect_uri: TWITTER_CONFIG.redirectUri,
    scope: TWITTER_CONFIG.scope,
    state: stateString,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  return `${TWITTER_CONFIG.authUrl}?${params.toString()}`
}

export function parseTwitterAuthState(stateString: string): Omit<TwitterAuthState, "codeVerifier"> {
  try {
    const decoded = Buffer.from(stateString, "base64url").toString("utf-8")
    return JSON.parse(decoded)
  } catch (error) {
    throw new Error("Invalid auth state")
  }
}

export async function exchangeTwitterCode(code: string, codeVerifier: string) {
  const response = await fetch(TWITTER_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${TWITTER_CONFIG.clientId}:${TWITTER_CONFIG.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: TWITTER_CONFIG.clientId,
      redirect_uri: TWITTER_CONFIG.redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twitter token exchange failed: ${error}`)
  }

  return await response.json()
}

export async function refreshTwitterToken(refreshToken: string) {
  const response = await fetch(TWITTER_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${TWITTER_CONFIG.clientId}:${TWITTER_CONFIG.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: TWITTER_CONFIG.clientId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twitter token refresh failed: ${error}`)
  }

  return await response.json()
}

export async function revokeTwitterToken(token: string) {
  const response = await fetch(TWITTER_CONFIG.revokeUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${TWITTER_CONFIG.clientId}:${TWITTER_CONFIG.clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      token,
      token_type_hint: "access_token",
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Twitter token revocation failed: ${error}`)
  }

  return true
}
