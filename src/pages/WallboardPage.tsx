import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CarImg from '../assets/monitor/car.png'
import PeopleImg from '../assets/monitor/people.jpeg'
import UavImg from '../assets/monitor/uav.png'
import { Badge, StatusDot } from '../components/Badge'
import { Button } from '../components/Button'
import { Card, CardBody, CardHeader } from '../components/Card'
import { cn } from '../lib/cn'
import { useAuth } from '../app/auth/useAuth'
import { useTheme } from '../app/theme/useTheme'

function SunIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.55 1.55M18.25 18.25l1.55 1.55M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.55-1.55M18.25 5.75l1.55-1.55"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 15.2a7.7 7.7 0 0 1-10.25-10.2 1 1 0 0 0-1.2-1.25A9 9 0 1 0 22.2 16.4a1 1 0 0 0-1.2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M6.7 9.4 12 14.7l5.3-5.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M4.7 4.7h6.3v6.3H4.7V4.7ZM13 4.7h6.3v6.3H13V4.7ZM4.7 13h6.3v6.3H4.7V13ZM13 13h6.3v6.3H13V13Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M10 7.5V6.3A1.8 1.8 0 0 1 11.8 4.5h6A1.8 1.8 0 0 1 19.5 6.3v11.4a1.8 1.8 0 0 1-1.7 1.8h-6A1.8 1.8 0 0 1 10 17.7v-1.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4.5 12h9M8.2 8.8 4.5 12l3.7 3.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function useNow(tickMs: number) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), tickMs)
    return () => window.clearInterval(id)
  }, [tickMs])
  return now
}

function formatTwo(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function weekdayZh(d: Date) {
  const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return map[d.getDay()] ?? ''
}

function initials(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return '?'
  const parts = trimmed.split(/\s+/)
  const first = parts[0]?.[0] ?? '?'
  const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : trimmed[1] ?? ''
  return `${first}${second}`.toUpperCase()
}

function formatCoord(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  const latAbs = Math.abs(lat).toFixed(5)
  const lngAbs = Math.abs(lng).toFixed(5)
  return `${latDir} ${latAbs}, ${lngDir} ${lngAbs}`
}

function Donut({
  segments,
}: {
  segments: Array<{
    label: string
    value: number
    tone: 'success' | 'warning' | 'danger' | 'info' | 'brand'
  }>
}) {
  const total = segments.reduce((a, b) => a + b.value, 0) || 1
  const normalized = segments.map((s) => ({ ...s, ratio: s.value / total }))
  const r = 42
  const c = 2 * Math.PI * r

  const strokeFor = (tone: string) => {
    if (tone === 'success') return 'rgb(var(--success))'
    if (tone === 'warning') return 'rgb(var(--warning))'
    if (tone === 'danger') return 'rgb(var(--danger))'
    if (tone === 'info') return 'rgb(var(--info))'
    return 'rgb(var(--brand-600))'
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-[120px] w-[120px]">
        <svg viewBox="0 0 120 120" className="h-full w-full">
          <circle cx="60" cy="60" r={r} stroke="rgb(var(--border))" strokeWidth="12" fill="none" />
          {normalized.map((s, idx) => {
            const prevRatio = normalized.slice(0, idx).reduce((a, b) => a + b.ratio, 0)
            const dash = c * s.ratio
            const offset = c * (1 - prevRatio)
            return (
              <circle
                key={s.label}
                cx="60"
                cy="60"
                r={r}
                stroke={strokeFor(s.tone)}
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={offset}
                transform="rotate(-90 60 60)"
              />
            )
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-semibold">{Math.round(normalized[0]?.ratio * 100)}%</div>
          <div className="text-xs text-muted">{normalized[0]?.label ?? '—'}</div>
        </div>
      </div>

      <div className="space-y-2">
        {normalized.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <StatusDot tone={s.tone} />
              <span className="text-muted">{s.label}</span>
            </div>
            <div className="font-medium">{Math.round(s.ratio * 100)}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendChart({
  series,
}: {
  series: Array<{
    label: string
    tone: 'success' | 'warning' | 'danger' | 'info'
    values: number[]
  }>
}) {
  const w = 560
  const h = 240
  const pad = 26
  const all = series.flatMap((s) => s.values)
  const min = Math.min(...all)
  const max = Math.max(...all)
  const y = (v: number) => {
    const t = max === min ? 0.5 : (v - min) / (max - min)
    return pad + (1 - t) * (h - pad * 2)
  }
  const x = (i: number, n: number) => pad + (i / Math.max(1, n - 1)) * (w - pad * 2)

  const strokeFor = (tone: string) => {
    if (tone === 'success') return 'rgb(var(--success))'
    if (tone === 'warning') return 'rgb(var(--warning))'
    if (tone === 'danger') return 'rgb(var(--danger))'
    return 'rgb(var(--info))'
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-bg/20 p-3">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-[210px] w-full">
          {Array.from({ length: 5 }).map((_, i) => {
            const yy = pad + (i / 4) * (h - pad * 2)
            return <line key={i} x1={pad} x2={w - pad} y1={yy} y2={yy} stroke="rgb(var(--border))" />
          })}
          {Array.from({ length: 7 }).map((_, i) => {
            const xx = x(i, 7)
            return <line key={i} y1={pad} y2={h - pad} x1={xx} x2={xx} stroke="rgb(var(--border))" opacity={0.45} />
          })}
          {series.map((s) => {
            const pts = s.values.map((v, i) => `${x(i, s.values.length)},${y(v)}`).join(' ')
            return (
              <g key={s.label}>
                <polyline points={pts} fill="none" stroke={strokeFor(s.tone)} strokeWidth="3" strokeLinejoin="round" />
                {s.values.map((v, i) => (
                  <circle key={i} cx={x(i, s.values.length)} cy={y(v)} r="4.2" fill={strokeFor(s.tone)} />
                ))}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: strokeFor(s.tone) }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RingGauge({ value, tone }: { value: number; tone: 'success' | 'warning' | 'danger' | 'info' }) {
  const r = 14
  const c = 2 * Math.PI * r
  const dash = (Math.max(0, Math.min(100, value)) / 100) * c
  const color =
    tone === 'success'
      ? 'rgb(var(--success))'
      : tone === 'warning'
        ? 'rgb(var(--warning))'
        : tone === 'danger'
          ? 'rgb(var(--danger))'
          : 'rgb(var(--info))'
  return (
    <div className="relative h-10 w-10">
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <circle cx="20" cy="20" r={r} stroke="rgb(var(--border))" strokeWidth="5" fill="none" />
        <circle
          cx="20"
          cy="20"
          r={r}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 20 20)"
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold">{value}%</div>
    </div>
  )
}

export function WallboardPage() {
  const navigate = useNavigate()
  const { toggle, isDark } = useTheme()
  const { user, logout, isAuthenticated } = useAuth()
  const now = useNow(1000)

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!userMenuOpen) return
    const onDown = (e: MouseEvent) => {
      const el = userMenuWrapRef.current
      if (!el) return
      if (e.target instanceof Node && el.contains(e.target)) return
      setUserMenuOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [userMenuOpen])

  const alarms = useMemo(
    () => [
      {
        id: 'GX-010001',
        category: '人员闯入',
        coords: { lat: 30.74866, lng: 120.76123 },
        time: '10:55',
        tone: 'danger' as const,
        image: PeopleImg,
      },
      {
        id: 'GX-020013',
        category: '车辆违停',
        coords: { lat: 30.70842, lng: 120.69291 },
        time: '10:42',
        tone: 'warning' as const,
        image: CarImg,
      },
      {
        id: 'GX-030007',
        category: '无人机靠近',
        coords: { lat: 30.52637, lng: 120.93408 },
        time: '10:18',
        tone: 'info' as const,
        image: UavImg,
      },
      {
        id: 'GX-010019',
        category: '异常徘徊',
        coords: { lat: 30.67621, lng: 121.01488 },
        time: '09:57',
        tone: 'warning' as const,
        image: PeopleImg,
      },
      {
        id: 'GX-020021',
        category: '设备遮挡',
        coords: { lat: 30.84215, lng: 120.92567 },
        time: '09:22',
        tone: 'danger' as const,
        image: CarImg,
      },
    ],
    [],
  )

  const sentinels = useMemo(
    () => [
      { id: 'GX-010001', name: '南湖-七星', x: 56, y: 46, status: 'warning' as const },
      { id: 'GX-010019', name: '平湖-当湖', x: 79, y: 38, status: 'success' as const },
      { id: 'GX-020013', name: '秀洲-新塍', x: 40, y: 36, status: 'danger' as const },
      { id: 'GX-020021', name: '嘉善-魏塘', x: 62, y: 26, status: 'success' as const },
      { id: 'GX-030007', name: '海盐-武原', x: 52, y: 66, status: 'info' as const },
      { id: 'GX-040002', name: '桐乡-梧桐', x: 30, y: 52, status: 'success' as const },
    ],
    [],
  )

  const [activeSentinelId, setActiveSentinelId] = useState<string | null>(sentinels[0]?.id ?? null)
  const activeSentinel = useMemo(
    () => sentinels.find((s) => s.id === activeSentinelId) ?? null,
    [sentinels, activeSentinelId],
  )

  const donutSegments = useMemo(
    () => [
      { label: '人员闯入', value: 46, tone: 'danger' as const },
      { label: '异常徘徊', value: 24, tone: 'warning' as const },
      { label: '车辆违停', value: 18, tone: 'info' as const },
      { label: '设备遮挡', value: 12, tone: 'brand' as const },
    ],
    [],
  )

  const trendSeries = useMemo(
    () => [
      { label: '人员', tone: 'success' as const, values: [120, 240, 190, 320, 410, 520, 610] },
      { label: '车辆', tone: 'info' as const, values: [90, 120, 160, 200, 240, 260, 310] },
      { label: '无人机', tone: 'warning' as const, values: [20, 40, 28, 66, 44, 30, 18] },
      { label: '告警数量', tone: 'danger' as const, values: [230, 400, 310, 540, 690, 810, 940] },
    ],
    [],
  )

  const deviceList = useMemo(
    () => [
      { id: 'TESTES010001', status: '异常' as const, risk: 21, tone: 'danger' as const },
      { id: 'TESTES010002', status: '异常' as const, risk: 16, tone: 'danger' as const },
      { id: 'TESTES010003', status: '正常' as const, risk: 53, tone: 'warning' as const },
      { id: 'TESTES010004', status: '正常' as const, risk: 73, tone: 'success' as const },
      { id: 'TESTES010005', status: '正常' as const, risk: 69, tone: 'success' as const },
      { id: 'TESTES020001', status: '异常' as const, risk: 13, tone: 'danger' as const },
      { id: 'TESTES020002', status: '正常' as const, risk: 83, tone: 'success' as const },
      { id: 'TESTES020003', status: '正常' as const, risk: 88, tone: 'success' as const },
      { id: 'TESTES030001', status: '正常' as const, risk: 88, tone: 'success' as const },
      { id: 'TESTES030002', status: '正常' as const, risk: 86, tone: 'success' as const },
      { id: 'TESTES030003', status: '异常' as const, risk: 10, tone: 'danger' as const },
      { id: 'TESTES040001', status: '正常' as const, risk: 65, tone: 'success' as const },
    ],
    [],
  )

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bg text-fg">
      <header className="border-b border-border bg-surface/90 backdrop-blur">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-10 w-1.5 rounded-full bg-gradient-to-b from-brand-600 to-brand-800" />
            <div>
              <div className="text-lg font-semibold tracking-wide">电子哨兵告警大屏</div>
              <div className="mt-0.5 text-xs text-muted">嘉兴市 · GIS 态势 · 告警闭环</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={toggle}
              className="h-12 w-12 rounded-xl p-0"
              aria-label="切换主题"
            >
              {isDark ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </Button>

            <div className="relative" ref={userMenuWrapRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className={cn(
                  'flex h-10 items-center rounded-xl px-2.5 transition hover:bg-bg/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60',
                  userMenuOpen && 'bg-bg/30',
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-600/80 to-brand-800 text-[11px] font-semibold text-white">
                    {initials(user?.name ?? '访客')}
                  </div>
                  <div className="max-w-[140px] truncate text-xs font-semibold">{user?.name ?? '访客'}</div>
                  <ChevronDownIcon className={cn('h-4 w-4 text-muted transition', userMenuOpen && 'rotate-180')} />
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-[44px] z-30 w-[210px] overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-bg/40"
                    onClick={() => {
                      setUserMenuOpen(false)
                      navigate(isAuthenticated ? '/admin/overview' : '/login')
                    }}
                  >
                    <GridIcon className="h-5 w-5 text-muted" />
                    <span className="font-medium">前往 Admin 系统</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-bg/40"
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                      navigate('/login')
                    }}
                  >
                    <LogoutIcon className="h-5 w-5 text-status-danger" />
                    <span className="font-medium text-status-danger">退出登录</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-6">
        <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[320px_1fr_320px]">
          <Card className="flex min-h-0 flex-col">
            <CardHeader>
              <div className="text-sm font-semibold">最新告警</div>
              <Badge tone="danger">
                <StatusDot tone="danger" />
                Live
              </Badge>
            </CardHeader>
            <CardBody className="min-h-0 flex-1 space-y-4 overflow-auto">
              {alarms.map((a) => (
                <div
                  key={a.id}
                  className="overflow-hidden rounded-2xl border border-border bg-bg/20 transition hover:shadow-cardHover"
                >
                  <div className="relative">
                    <img src={a.image} alt={a.category} className="h-36 w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg/90 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div>
                        <div className="text-[11px] text-muted">设备 ID</div>
                        <div className="text-lg font-semibold tracking-wide">{a.id}</div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs font-semibold text-muted">{a.time}</div>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/10',
                            a.tone === 'danger' && 'bg-status-danger',
                            a.tone === 'warning' && 'bg-status-warning',
                            a.tone === 'info' && 'bg-status-info',
                          )}
                        >
                          {a.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-xs text-muted">经纬度</div>
                    <div className="mt-1 text-sm font-semibold tracking-tight">{formatCoord(a.coords.lat, a.coords.lng)}</div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="flex min-h-0 flex-col">
            <CardHeader>
              <div className="space-y-0.5">
                <div className="text-sm font-semibold">GIS 区域态势</div>
                <div className="text-xs text-muted">嘉兴市（简化示意）</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="brand">
                  <StatusDot tone="brand" />
                  电子哨兵
                </Badge>
                {activeSentinel && <Badge tone={activeSentinel.status}>{activeSentinel.id}</Badge>}
              </div>
            </CardHeader>
            <CardBody className="min-h-0 flex-1">
              <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-bg via-bg to-surface">
                <div className="pointer-events-none absolute inset-0 opacity-80">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(53,94,59,.28),transparent_55%),radial-gradient(circle_at_80%_72%,rgba(56,189,248,.18),transparent_52%)]" />
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(227,231,226,.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(227,231,226,.55)_1px,transparent_1px)] bg-[size:28px_28px] opacity-30 dark:opacity-20" />
                </div>

                <svg viewBox="0 0 800 520" className="absolute inset-0 h-full w-full">
                  <defs>
                    <linearGradient id="jxFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--brand-600))" stopOpacity="0.25" />
                      <stop offset="55%" stopColor="rgb(var(--brand-700))" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="rgb(var(--info))" stopOpacity="0.12" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M147 118 233 86 314 103 382 76 454 108 516 94 606 124 664 194 640 278 686 332 644 404 556 442 470 424 412 474 334 442 268 466 208 416 156 370 114 298 92 220Z"
                    fill="url(#jxFill)"
                    stroke="rgb(var(--border))"
                    strokeWidth="2"
                  />
                  <path
                    d="M246 165 314 146 382 160 460 142 530 166 586 210 574 260 520 292 448 276 396 310 322 292 272 320 222 284 198 226Z"
                    fill="rgba(255,255,255,.04)"
                    stroke="rgb(var(--border))"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  <text x="420" y="255" textAnchor="middle" fill="rgb(var(--muted))" fontSize="26" fontWeight="700">
                    嘉兴市
                  </text>
                </svg>

                {sentinels.map((s) => (
                  <button
                    key={s.id}
                    className={cn(
                      'absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60',
                    )}
                    style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    onClick={() => setActiveSentinelId(s.id)}
                  >
                    <span
                      className={cn(
                        'absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-[0.2px]',
                        s.status === 'success' && 'bg-status-success',
                        s.status === 'warning' && 'bg-status-warning',
                        s.status === 'danger' && 'bg-status-danger',
                        s.status === 'info' && 'bg-status-info',
                        activeSentinelId === s.id ? 'animate-ping' : 'animate-pulse',
                      )}
                      style={{ left: '50%', top: '50%' }}
                    />
                    <span
                      className={cn(
                        'relative block h-3.5 w-3.5 rounded-full border border-border bg-surface shadow-card',
                        s.status === 'success' && 'ring-2 ring-status-success/60',
                        s.status === 'warning' && 'ring-2 ring-status-warning/60',
                        s.status === 'danger' && 'ring-2 ring-status-danger/60',
                        s.status === 'info' && 'ring-2 ring-status-info/60',
                      )}
                    />
                    {activeSentinelId === s.id && (
                      <div className="absolute left-1/2 top-[18px] w-[180px] -translate-x-1/2">
                        <div className="rounded-2xl border border-border bg-surface/95 px-3 py-2 text-left shadow-card">
                          <div className="text-xs text-muted">电子哨兵</div>
                          <div className="mt-0.5 flex items-center justify-between gap-3">
                            <div className="truncate text-sm font-semibold">{s.name}</div>
                            <Badge tone={s.status}>{s.id}</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="flex min-h-0 flex-col gap-4 overflow-hidden">
            <Card className="min-h-0">
              <CardHeader>
                <div className="text-sm font-semibold">告警类型分布</div>
                <Badge tone="muted">{weekdayZh(now)}</Badge>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4">
                  <div className="rounded-2xl border border-border bg-bg/20 p-4">
                    <div className="text-xs text-muted">今日告警</div>
                    <div className="mt-2 text-4xl font-semibold">
                      {formatTwo(now.getHours())}:{formatTwo(now.getMinutes())}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {now.getMonth() + 1}月{now.getDate()}日
                    </div>
                  </div>
                  <Donut segments={donutSegments} />
                </div>
              </CardBody>
            </Card>

            <Card className="min-h-0">
              <CardHeader>
                <div className="text-sm font-semibold">近 7 天告警趋势</div>
                <Badge tone="info">多源叠加</Badge>
              </CardHeader>
              <CardBody>
                <TrendChart series={trendSeries} />
              </CardBody>
            </Card>

            <Card className="flex min-h-0 flex-1 flex-col">
              <CardHeader>
                <div className="text-sm font-semibold">设备健康</div>
                <Link to="/admin/devices">
                  <Button size="sm">进入设备管理</Button>
                </Link>
              </CardHeader>
              <CardBody className="min-h-0 flex-1 space-y-4 overflow-hidden">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                    <div className="text-xs text-muted">设备总数</div>
                    <div className="mt-1 text-2xl font-semibold">42</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                    <div className="text-xs text-muted">设备在线</div>
                    <div className="mt-1 text-2xl font-semibold text-status-success">34</div>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg/20 px-4 py-3">
                    <div className="text-xs text-muted">设备异常</div>
                    <div className="mt-1 text-2xl font-semibold text-status-danger">8</div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto rounded-2xl border border-border">
                  <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
                    <div className="text-xs font-semibold text-muted">设备列表</div>
                    <div className="text-xs text-muted">风险值</div>
                  </div>
                  <div className="divide-y divide-border">
                    {deviceList.map((d) => (
                      <div key={d.id} className="flex items-center justify-between gap-3 bg-bg/10 px-4 py-2.5">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{d.id}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <Badge tone={d.tone}>{d.status}</Badge>
                            <span className="text-muted">心跳正常 · 近 10m</span>
                          </div>
                        </div>
                        <RingGauge value={d.risk} tone={d.tone} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
