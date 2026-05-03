import { ImageResponse } from 'next/og'
import { type NextRequest } from 'next/server'

export const runtime = 'edge'

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Fynn M.'
  const subtitle = searchParams.get('subtitle') ?? ''
  const type = searchParams.get('type') ?? 'page'

  const showBadge = type !== 'page'
  const titleSize = title.length > 40 ? '52px' : '64px'

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#0a0a0a',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'monospace',
        }}
      >
        {/* Top accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '4px',
              height: '40px',
              background: '#22c55e',
              borderRadius: '2px',
            }}
          />
          {showBadge && (
            <span
              style={{
                background: 'rgba(34,197,94,0.1)',
                border: '1px solid #22c55e',
                color: '#22c55e',
                padding: '4px 14px',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '2px',
              }}
            >
              {type}
            </span>
          )}
        </div>

        {/* Title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: 1.1,
              fontFamily: 'monospace',
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: '24px',
                color: '#a1a1aa',
                fontFamily: 'monospace',
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {/* Bottom: decorative line + site name */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ width: '60px', height: '1px', background: '#22c55e' }} />
          <div
            style={{
              fontSize: '20px',
              color: '#22c55e',
              fontFamily: 'monospace',
              letterSpacing: '2px',
            }}
          >
            Fynn M.
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
