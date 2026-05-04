// eParaksts (LVRTC) OAuth 2.0 integration.
// Production requires registration at https://developer.eparaksts.lv/
//
// Scopes needed: openid, profile, eid
// Auth endpoint:  https://id.eidentity.lv/op/authorize
// Token endpoint: https://id.eidentity.lv/op/token
// JWKS endpoint:  https://id.eidentity.lv/op/jwks

import { createRemoteJWKSet, jwtVerify } from 'jose'

const LVRTC_JWKS_URL = 'https://id.eidentity.lv/op/jwks'
const LVRTC_ISSUER = 'https://id.eidentity.lv/op'

export interface EparakstsClaims {
  sub: string               // LVRTC subject identifier
  personalCode: string      // Latvian personal code
  givenName: string
  surname: string
  signature: string
  signedAt: Date
}

export function buildAuthorizationUrl(state: string, nonce: string): string {
  const clientId = process.env.EPARAKSTS_CLIENT_ID ?? 'alteko-dev'
  const redirectUri = process.env.EPARAKSTS_REDIRECT_URI ?? 'http://localhost:3000/api/auth/eparaksts/callback'
  const authEndpoint = process.env.EPARAKSTS_AUTH_URL ?? 'https://id.eidentity.lv/op/authorize'

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'openid profile eid',
    state,
    nonce,
  })

  return `${authEndpoint}?${params}`
}

export async function exchangeCodeForClaims(code: string): Promise<EparakstsClaims> {
  const clientId = process.env.EPARAKSTS_CLIENT_ID ?? ''
  const clientSecret = process.env.EPARAKSTS_CLIENT_SECRET ?? ''
  const redirectUri = process.env.EPARAKSTS_REDIRECT_URI ?? 'http://localhost:3000/api/auth/eparaksts/callback'
  const tokenEndpoint = process.env.EPARAKSTS_TOKEN_URL ?? 'https://id.eidentity.lv/op/token'

  if (!clientId || !clientSecret) {
    // Development mock — only active when eParaksts credentials are not configured
    return {
      sub: `mock-eparaksts-${code}`,
      personalCode: 'LV-020202-54321',
      givenName: 'Test',
      surname: 'EParaksts',
      signature: `mock-eparaksts-sig-${code}`,
      signedAt: new Date(),
    }
  }

  const res = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) throw new Error(`eParaksts token exchange failed: ${res.status}`)

  const tokens = await res.json() as { id_token: string }
  const idToken = tokens.id_token

  // Verify JWT signature using LVRTC JWKS — prevents token forgery / replay attacks (issue #42)
  const jwksUri = new URL(process.env.EPARAKSTS_JWKS_URL ?? LVRTC_JWKS_URL)
  const JWKS = createRemoteJWKSet(jwksUri)

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: process.env.EPARAKSTS_ISSUER ?? LVRTC_ISSUER,
    audience: clientId,
  })

  return {
    sub: payload.sub ?? '',
    personalCode: (payload['personal_code'] as string | undefined) ?? payload.sub ?? '',
    givenName: (payload['given_name'] as string | undefined) ?? '',
    surname: (payload['family_name'] as string | undefined) ?? '',
    signature: idToken,
    signedAt: new Date(),
  }
}
