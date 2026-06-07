export function formatCoord(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  const latAbs = Math.abs(lat).toFixed(5)
  const lngAbs = Math.abs(lng).toFixed(5)
  return `${latDir} ${latAbs}, ${lngDir} ${lngAbs}`
}

