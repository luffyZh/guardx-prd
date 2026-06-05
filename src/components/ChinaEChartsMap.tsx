import { useEffect, useMemo, useRef } from 'react'
import { useTheme } from '../app/theme/useTheme'
import { loadECharts } from '../lib/loadECharts'
import type { EChartsInstance } from '../lib/loadECharts'

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'brand'

type MapPoint = {
  name: string
  coord: [number, number]
  tone: Tone
  kind: 'org' | 'sentinel'
}

function toneColor(tone: Tone) {
  if (tone === 'success') return 'rgb(var(--success))'
  if (tone === 'warning') return 'rgb(var(--warning))'
  if (tone === 'danger') return 'rgb(var(--danger))'
  if (tone === 'info') return 'rgb(var(--info))'
  return 'rgb(var(--brand-700))'
}

function hexFromRgbVar(varName: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  const parts = raw.split(/\s+/).map((n) => Number(n))
  if (parts.length < 3 || parts.some((v) => Number.isNaN(v))) return '#3b82f6'
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`
}

export function ChinaEChartsMap() {
  const { isDark } = useTheme()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<EChartsInstance | null>(null)

  const points = useMemo<MapPoint[]>(
    () => [
      { kind: 'org', name: '新疆合作组织', coord: [87.6168, 43.8256], tone: 'danger' },
      { kind: 'org', name: '广东合作组织', coord: [113.2644, 23.1291], tone: 'danger' },
      { kind: 'org', name: '浙江合作组织', coord: [120.1536, 30.2875], tone: 'brand' },

      { kind: 'sentinel', name: '北京 · 哨兵', coord: [116.4074, 39.9042], tone: 'info' },
      { kind: 'sentinel', name: '上海 · 哨兵', coord: [121.4737, 31.2304], tone: 'info' },
      { kind: 'sentinel', name: '杭州 · 哨兵', coord: [120.1551, 30.2741], tone: 'info' },
      { kind: 'sentinel', name: '武汉 · 哨兵', coord: [114.3054, 30.5931], tone: 'info' },
      { kind: 'sentinel', name: '成都 · 哨兵', coord: [104.0665, 30.5723], tone: 'info' },
      { kind: 'sentinel', name: '西安 · 哨兵', coord: [108.9398, 34.3416], tone: 'info' },
      { kind: 'sentinel', name: '南京 · 哨兵', coord: [118.7969, 32.0603], tone: 'info' },
      { kind: 'sentinel', name: '长沙 · 哨兵', coord: [112.9388, 28.2282], tone: 'info' },
      { kind: 'sentinel', name: '福州 · 哨兵', coord: [119.2965, 26.0745], tone: 'info' },
      { kind: 'sentinel', name: '沈阳 · 哨兵', coord: [123.4315, 41.8057], tone: 'info' },
      { kind: 'sentinel', name: '哈尔滨 · 哨兵', coord: [126.5349, 45.8038], tone: 'info' },
      { kind: 'sentinel', name: '昆明 · 哨兵', coord: [102.8329, 24.8801], tone: 'info' },
      { kind: 'sentinel', name: '南宁 · 哨兵', coord: [108.3669, 22.8170], tone: 'info' },
    ],
    [],
  )

  useEffect(() => {
    let stopped = false
    const el = rootRef.current
    if (!el) return

    const onResize = () => {
      chartRef.current?.resize()
    }
    window.addEventListener('resize', onResize)

    const init = async () => {
      try {
        const echarts = await loadECharts()
        if (stopped) return

        const mapFill = isDark ? '#0b1c3d' : '#dbefff'
        const borderColor = isDark ? 'rgba(255,255,255,.28)' : '#ffffff'
        const areaEmphasis = isDark ? '#123a86' : '#b8def8'
        const provinceActive = isDark ? '#1b5fd6' : '#1f6fe5'
        const baseDot = isDark ? '#6fb2ff' : '#2f80ed'

        const brand700 = hexFromRgbVar('--brand-700')

        const orgPoints = points.filter((p) => p.kind === 'org')
        const sentinelPoints = points.filter((p) => p.kind === 'sentinel')

        const option = {
          backgroundColor: 'transparent',
          tooltip: { trigger: 'item' },
          geo: {
            map: 'china',
            roam: false,
            zoom: 1.08,
            aspectScale: 0.98,
            layoutCenter: ['50%', '52%'],
            layoutSize: '112%',
            itemStyle: {
              areaColor: mapFill,
              borderColor,
              borderWidth: 1.2,
            },
            emphasis: {
              itemStyle: {
                areaColor: areaEmphasis,
              },
              label: { show: false },
            },
            regions: [
              {
                name: '浙江',
                itemStyle: {
                  areaColor: provinceActive,
                },
                emphasis: {
                  itemStyle: {
                    areaColor: provinceActive,
                  },
                },
              },
            ],
          },
          series: [
            {
              name: '哨兵',
              type: 'scatter',
              coordinateSystem: 'geo',
              zlevel: 3,
              symbolSize: 6,
              itemStyle: { color: baseDot },
              data: sentinelPoints.map((p) => ({ name: p.name, value: [...p.coord, 1] })),
              tooltip: { formatter: '{b}' },
            },
            {
              name: '合作组织',
              type: 'effectScatter',
              coordinateSystem: 'geo',
              zlevel: 4,
              rippleEffect: { period: 4, scale: 6, brushType: 'fill' },
              symbolSize: 10,
              itemStyle: {
                color: (params: unknown) => {
                  const idx =
                    params && typeof params === 'object' && 'dataIndex' in params
                      ? Number((params as { dataIndex?: unknown }).dataIndex ?? 0)
                      : 0
                  const p = orgPoints[idx]
                  return p ? toneColor(p.tone) : brand700
                },
                shadowBlur: 18,
                shadowColor: 'rgba(0,0,0,.2)',
              },
              data: orgPoints.map((p) => ({ name: p.name, value: [...p.coord, 2] })),
              tooltip: { formatter: '{b}' },
            },
            {
              name: '光晕',
              type: 'scatter',
              coordinateSystem: 'geo',
              zlevel: 2,
              symbolSize: 28,
              itemStyle: { color: 'rgba(47,128,237,.12)' },
              data: orgPoints.map((p) => ({ name: p.name, value: [...p.coord, 0] })),
              tooltip: { show: false },
            },
          ],
        }

        const chart = chartRef.current ?? echarts.init(el)
        chartRef.current = chart
        chart.setOption(option, true)
      } catch (e) {
        void e
        if (stopped) return
      }
    }

    init()

    return () => {
      stopped = true
      window.removeEventListener('resize', onResize)
      try {
        chartRef.current?.dispose()
      } catch (e) {
        void e
      } finally {
        chartRef.current = null
      }
    }
  }, [isDark, points])

  return <div ref={rootRef} className="h-full w-full" />
}
