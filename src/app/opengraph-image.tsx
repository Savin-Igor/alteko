import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }
export const alt = 'ALTEKO — Mājas gatavības platforma'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg,#2563EB 0%,#1D4ED8 100%)',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: '#fff',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            A
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>ALTEKO</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            Mājas gatavības platforma
          </div>
          <div style={{ fontSize: 32, opacity: 0.9, lineHeight: 1.3 }}>
            Sagatavojiet māju nākamajam finansējuma logam — dati, dokumenti,
            īpašnieku lēmumi.
          </div>
        </div>

        <div style={{ fontSize: 24, opacity: 0.8 }}>alteko.lv</div>
      </div>
    ),
    size,
  )
}
