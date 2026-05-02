// Smart-ID integration stub.
// Production implementation requires:
//   1. Agreement with SK ID Solutions (smart-id.com/developers)
//   2. API keys from Smart-ID developer portal
//   3. Test against https://sid.demo.sk.ee/smart-id-rp/v2/
//
// This module provides the interface contract and a mock for development.

export interface SmartIdSession {
  sessionId: string
  verificationCode: string  // 4-digit code shown to user in app
}

export interface SmartIdResult {
  personalCode: string      // Latvian personal code (personas kods)
  givenName: string
  surname: string
  signature: string         // base64 certificate signature
  signedAt: Date
}

// Initiate a Smart-ID authentication session
export async function initiateSmartIdSession(
  personalCode: string,
  countryCode: string = 'LV',
): Promise<SmartIdSession> {
  const apiUrl = process.env.SMART_ID_API_URL ?? 'https://sid.demo.sk.ee/smart-id-rp/v2'
  const relyingPartyUUID = process.env.SMART_ID_RELYING_PARTY_UUID ?? ''
  const relyingPartyName = process.env.SMART_ID_RELYING_PARTY_NAME ?? 'ALTEKO'

  if (!relyingPartyUUID) {
    // Development mock — return fake session
    return {
      sessionId: `mock-session-${Date.now()}`,
      verificationCode: '1234',
    }
  }

  const randomChallenge = Buffer.from(
    crypto.getRandomValues(new Uint8Array(32))
  ).toString('base64')

  const res = await fetch(
    `${apiUrl}/authentication/pno/${countryCode}/${personalCode}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        relyingPartyUUID,
        relyingPartyName,
        certificateLevel: 'QUALIFIED',
        hash: randomChallenge,
        hashType: 'SHA256',
        allowedInteractionsOrder: [
          { type: 'displayTextAndPIN', displayText60: 'Autorizācija ALTEKO' },
        ],
      }),
    }
  )

  if (!res.ok) throw new Error(`Smart-ID initiate failed: ${res.status}`)
  const data = await res.json()
  return { sessionId: data.sessionID, verificationCode: data.verificationCode }
}

// Poll for Smart-ID result (call every 2s, max 90s)
export async function pollSmartIdSession(
  sessionId: string,
): Promise<SmartIdResult | null> {
  const apiUrl = process.env.SMART_ID_API_URL ?? 'https://sid.demo.sk.ee/smart-id-rp/v2'
  const relyingPartyUUID = process.env.SMART_ID_RELYING_PARTY_UUID ?? ''

  if (!relyingPartyUUID) {
    // Development mock — return fake result after first poll
    if (sessionId.startsWith('mock-session-')) {
      return {
        personalCode: 'LV-010101-12345',
        givenName: 'Test',
        surname: 'User',
        signature: 'mock-signature-' + sessionId,
        signedAt: new Date(),
      }
    }
    return null
  }

  const res = await fetch(`${apiUrl}/session/${sessionId}?timeoutMs=2000`)
  if (!res.ok) return null

  const data = await res.json()
  if (data.state !== 'COMPLETE') return null
  if (data.result?.endResult !== 'OK') return null

  return {
    personalCode: data.cert?.subjectPN ?? '',
    givenName: data.cert?.subjectGivenName ?? '',
    surname: data.cert?.subjectSurname ?? '',
    signature: data.signature?.value ?? '',
    signedAt: new Date(),
  }
}
