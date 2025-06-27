import { INSTAGRAM_CONFIG } from "./config"

export interface InstagramAuthState {
  userId: string
  teamId?: string
  accountType: "personal" | "business"
  returnUrl?: string
}

export function generateInstagramAuthUrl(state: InstagramAuthState): string {
  const stateString = Buffer.from(JSON.stringify(state)).toString("base64url")
  const config = state.accountType === "business" ? INSTAGRAM_CONFIG.graph : INSTAGRAM_CONFIG.basicDisplay

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: "code",
    state: stateString,
  })

  return `${config.authUrl}?${params.toString()}`
}

export function parseInstagramAuthState(stateString: string): InstagramAuthState {
  try {
    const decoded = Buffer.from(stateString, "base64url").toString("utf-8")
    return JSON.parse(decoded)
  } catch (error) {
    throw new Error("Invalid auth state")
  }
}

export async function exchangeInstagramCode(code: string, accountType: "personal" | "business") {
  const config = accountType === "business" ? INSTAGRAM_CONFIG.graph : INSTAGRAM_CONFIG.basicDisplay

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
      code,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Instagram token exchange failed: ${error}`)
  }

  return await response.json()
}

export async function refreshInstagramToken(refreshToken: string, accountType: "personal" | "business") {
  const config = accountType === "business" ? INSTAGRAM_CONFIG.graph : INSTAGRAM_CONFIG.basicDisplay

  // Instagram Basic Display uses long-lived tokens that need to be refreshed differently
  if (accountType === "personal") {
    const response = await fetch(`${config.apiUrl}/refresh_access_token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "ig_refresh_token",
        access_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh Instagram token")
    }

    return await response.json()
  } else {
    // Facebook/Instagram Business API token refresh
    const response = await fetch(`${config.apiUrl}/oauth/access_token`, {
      method: "GET",
      body: JSON.stringify({
        grant_type: "fb_exchange_token",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        fb_exchange_token: refreshToken,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh Instagram business token")
    }

    return await response.json()
  }
}
