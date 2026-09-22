export function todayStr(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function shiftDays(dateStr, delta) {
  const d = new Date(`${dateStr}T00:00:00`)
  d.setDate(d.getDate() + delta)
  return todayStr(d)
}

export function lastNDates(n) {
  const out = []
  const today = todayStr()
  for (let i = n - 1; i >= 0; i -= 1) out.push(shiftDays(today, -i))
  return out
}

// 连续打卡天数：今天没打卡则从昨天起算
export function calcStreak(checkins) {
  const set = new Set(Object.keys(checkins || {}))
  if (!set.size) return 0
  let cursor = todayStr()
  if (!set.has(cursor)) cursor = shiftDays(cursor, -1)
  let n = 0
  while (set.has(cursor)) {
    n += 1
    cursor = shiftDays(cursor, -1)
  }
  return n
}
