import { FACEBOOK_CONFIG } from "./config"

export interface FacebookAuthState {
  userId: string
  teamId?: string
  returnUrl?: string
}

export function generateFacebookAuthUrl(state: FacebookAuthState): string {
  const stateString = Buffer.from(JSON.stringify(state)).toString("base64url")

  const params = new URLSearchParams({
    client_id: FACEBOOK_CONFIG.clientId,
    redirect_uri: FACEBOOK_CONFIG.redirectUri,
    scope: FACEBOOK_CONFIG.scope,
    response_type: "code",
    state: stateString,
  })

  return `${FACEBOOK_CONFIG.authUrl}?${params.toString()}`
}

export function parseFacebookAuthState(stateString: string): FacebookAuthState {
  try {
    const decoded = Buffer.from(stateString, "base64url").toString("utf-8")
    return JSON.parse(decoded)
  } catch (error) {
    throw new Error("Invalid auth state")
  }
}

export async function exchangeFacebookCode(code: string) {
  const response = await fetch(FACEBOOK_CONFIG.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: FACEBOOK_CONFIG.clientId,
      client_secret: FACEBOOK_CONFIG.clientSecret,
      redirect_uri: FACEBOOK_CONFIG.redirectUri,
      code,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Facebook token exchange failed: ${error}`)
  }

  return await response.json()
}

export async function exchangeForLongLivedToken(shortLivedToken: string) {
  const response = await fetch(`${FACEBOOK_CONFIG.apiUrl}/oauth/access_token`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "fb_exchange_token",
      client_id: FACEBOOK_CONFIG.clientId,
      client_secret: FACEBOOK_CONFIG.clientSecret,
      fb_exchange_token: shortLivedToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Facebook long-lived token exchange failed: ${error}`)
  }

  return await response.json()
}

export async function refreshFacebookToken(accessToken: string) {
  // Facebook doesn't have traditional refresh tokens
  // Instead, we can extend the token validity
  const response = await fetch(`${FACEBOOK_CONFIG.apiUrl}/oauth/access_token`, {
    method: "GET",
    body: JSON.stringify({
      grant_type: "fb_exchange_token",
      client_id: FACEBOOK_CONFIG.clientId,
      client_secret: FACEBOOK_CONFIG.clientSecret,
      fb_exchange_token: accessToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Facebook token refresh failed: ${error}`)
  }

  return await response.json()
}

export async function debugFacebookToken(accessToken: string) {
  const response = await fetch(
    `${FACEBOOK_CONFIG.apiUrl}/debug_token?input_token=${accessToken}&access_token=${FACEBOOK_CONFIG.clientId}|${FACEBOOK_CONFIG.clientSecret}`,
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Facebook token debug failed: ${error}`)
  }

  return await response.json()
}
