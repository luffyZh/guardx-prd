export type EChartsInstance = {
  setOption: (option: unknown, notMerge?: boolean) => void
  resize: () => void
  dispose: () => void
}

export type EChartsStatic = {
  init: (el: HTMLDivElement) => EChartsInstance
}

declare global {
  interface Window {
    echarts?: unknown
  }
}

function isECharts(x: unknown): x is EChartsStatic {
  if (!x || typeof x !== 'object') return false
  const obj = x as Record<string, unknown>
  return typeof obj.init === 'function'
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-guardx-echarts="${src}"]`)
    if (existing) {
      if ((existing as HTMLScriptElement).dataset.loaded === '1') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.guardxEcharts = src
    script.onload = () => {
      script.dataset.loaded = '1'
      resolve()
    }
    script.onerror = () => reject(new Error(`Failed to load ${src}`))
    document.head.appendChild(script)
  })
}

export async function loadECharts(): Promise<EChartsStatic> {
  if (isECharts(window.echarts)) return window.echarts

  const echartsUrl = 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js'
  const chinaMapUrl = 'https://cdn.jsdelivr.net/npm/echarts@5/map/js/china.js'

  await loadScript(echartsUrl)
  await loadScript(chinaMapUrl)

  if (!isECharts(window.echarts)) throw new Error('ECharts not available on window')
  return window.echarts
}
