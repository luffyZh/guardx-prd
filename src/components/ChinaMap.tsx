import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import chinaMapData from '../assets/china.json'

type RegisterMapInput = Parameters<typeof echarts.registerMap>[1]
echarts.registerMap('china', chinaMapData as unknown as RegisterMapInput)

export function ChinaMap() {
  const orgSites = [
    {
      place: '北京',
      coord: [116.405285, 39.904989] as [number, number],
      labelCoord: [124.5, 42.0] as [number, number],
      org: '北京市公安局 BJ01_GA',
    },
    {
      place: '云南',
      coord: [102.712251, 25.040609] as [number, number],
      labelCoord: [112.0, 23.0] as [number, number],
      org: '中缅边境公安局 YN01_GA',
    },
    {
      place: '新疆',
      coord: [86.174633, 41.725891] as [number, number],
      labelCoord: [96.5, 44.5] as [number, number],
      org: '新疆库尔勒特战大队 XJ01_KEL',
    },
  ]

  const option = {
    backgroundColor: 'transparent',
    geo: {
      map: 'china',
      roam: false,
      zoom: 1.15,
      layoutCenter: ['50%', '65%'],
      layoutSize: '110%',
      label: { show: false },
      itemStyle: {
        areaColor: '#e3f2fd',
        borderColor: '#ffffff',
        borderWidth: 1.5,
      },
      emphasis: {
        itemStyle: { areaColor: '#bbdefb' },
        label: { show: false },
      },
      regions: [
        {
          name: '浙江省',
          itemStyle: { areaColor: '#1976d2' },
          emphasis: { itemStyle: { areaColor: '#1565c0' } },
        },
      ],
    },
    series: [
      {
        name: 'NormalMarkers',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: [
          { name: '上海', value: [121.472644, 31.231706] },
          { name: '广州', value: [113.280637, 23.125178] },
          { name: '成都', value: [104.065735, 30.659462] },
          { name: '武汉', value: [114.298572, 30.584355] },
          { name: '西安', value: [108.948024, 34.263161] },
          { name: '郑州', value: [113.665412, 34.757975] },
          { name: '济南', value: [117.000923, 36.675807] },
          { name: '南京', value: [118.79647, 32.05838] },
          { name: '杭州', value: [120.153576, 30.287459] },
          { name: '福州', value: [119.306239, 26.075302] },
          { name: '南昌', value: [115.892151, 28.676493] },
          { name: '长沙', value: [112.982279, 28.19409] },
          { name: '贵阳', value: [106.713478, 26.578343] },
          { name: '重庆', value: [106.504962, 29.533155] },
          { name: '南宁', value: [108.320004, 22.82402] },
          { name: '兰州', value: [103.823557, 36.058039] },
          { name: '银川', value: [106.278179, 38.46637] },
          { name: '呼和浩特', value: [111.670801, 40.818311] },
          { name: '沈阳', value: [123.384186, 41.813082] },
          { name: '长春', value: [125.3245, 43.886841] },
          { name: '哈尔滨', value: [126.642464, 45.756967] },
          { name: '石家庄', value: [114.489777, 38.045128] },
          { name: '太原', value: [112.549248, 37.857014] },
        ],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: '#1976d2',
          shadowBlur: 2,
          shadowColor: 'rgba(0,0,0,0.2)',
          shadowOffsetY: 1,
        },
      },
      {
        name: 'OrgCallouts',
        type: 'lines',
        coordinateSystem: 'geo',
        polyline: true,
        silent: true,
        zlevel: 2,
        lineStyle: {
          color: 'rgba(239,68,68,0.85)',
          width: 1.5,
        },
        data: orgSites.map((s) => ({
          coords: [s.coord, [s.coord[0], s.labelCoord[1]], s.labelCoord],
        })),
      },
      {
        name: 'OrgCards',
        type: 'scatter',
        coordinateSystem: 'geo',
        zlevel: 3,
        symbol: 'roundRect',
        symbolSize: (_: unknown, params: unknown) => {
          const org =
            params && typeof params === 'object' && 'data' in params
              ? String((params as { data?: unknown }).data && (params as { data: { org?: unknown } }).data.org ? (params as { data: { org?: unknown } }).data.org : '')
              : ''
          const width = Math.min(240, Math.max(128, org.length * 8 + 36))
          return [width, 34]
        },
        itemStyle: {
          color: '#ffffff',
          borderColor: 'rgba(15, 23, 42, 0.12)',
          borderWidth: 1,
          shadowBlur: 12,
          shadowColor: 'rgba(15, 23, 42, 0.10)',
          shadowOffsetY: 3,
        },
        label: {
          show: true,
          position: 'inside',
          color: '#0f172a',
          fontSize: 12,
          fontWeight: 600,
          formatter: (p: unknown) => {
            if (!p || typeof p !== 'object' || !('data' in p)) return ''
            const d = (p as { data?: unknown }).data
            if (!d || typeof d !== 'object' || !('org' in d)) return ''
            return String((d as { org?: unknown }).org ?? '')
          },
        },
        data: orgSites.map((s) => ({ name: s.place, value: s.labelCoord, org: s.org })),
        tooltip: {
          formatter: (p: unknown) => {
            if (!p || typeof p !== 'object' || !('data' in p)) return ''
            const d = (p as { data?: unknown }).data
            if (!d || typeof d !== 'object' || !('org' in d)) return ''
            return String((d as { org?: unknown }).org ?? '')
          },
        },
      },
      {
        name: 'SpecialMarkers',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: orgSites.map((s) => ({ name: s.place, value: s.coord })),
        symbol: 'circle',
        symbolSize: 8,
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'fill',
          scale: 5,
          period: 6,
          number: 2,
        },
        itemStyle: {
          color: '#ef4444',
          shadowBlur: 4,
          shadowColor: 'rgba(239,68,68,0.5)',
        },
        zlevel: 4,
      },
    ],
  }

  return (
    <ReactECharts
      echarts={echarts}
      option={option}
      style={{ height: '100%', width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  )
}

