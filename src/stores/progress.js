import { defineStore } from 'pinia'
import { calcStreak, lastNDates, todayStr } from '@/utils/date'

const KEY = 'p100:progress:v1'

export const useProgressStore = defineStore('progress', {
  state: () => ({
    completed: {},
    starred: [],
    notes: {},
    checkins: {},
    lastVisited: null,
    goal: { startDate: todayStr(), daysPerWeek: 5 },
  }),
  getters: {
    doneCount: (s) => Object.keys(s.completed).length,
    isDone(s) {
      return (day) => !!s.completed[day]
    },
    isStarred(s) {
      return (day) => s.starred.includes(day)
    },
    noteOf(s) {
      return (day) => s.notes[day] || ''
    },
    percent(s) {
      return Math.round((Object.keys(s.completed).length / 100) * 100)
    },
    streak: (s) => calcStreak(s.checkins),
    stageStats(s) {
      return (stages) =>
        stages.map((st) => {
          const all = []
          for (let d = st.range[0]; d <= st.range[1]; d += 1) all.push(d)
          const done = all.filter((d) => s.completed[d]).length
          return { ...st, total: all.length, done, percent: Math.round((done / all.length) * 100) }
        })
    },
    trend(s) {
      return (n = 30) =>
        lastNDates(n).map((date) => ({
          date,
          count: (s.checkins[date] || []).length,
        }))
    },
    heatmap(s) {
      const map = {}
      for (const [date, list] of Object.entries(s.checkins || {})) map[date] = list.length
      return map
    },
    // 近 14 天日均完成量，为 0 时返回 0（UI 显示 —）
    dailyVelocity(s) {
      const dates = lastNDates(14)
      let sum = 0
      for (const d of dates) sum += (s.checkins[d] || []).length
      return sum / 14
    },
    eta(s) {
      const v = this.dailyVelocity
      if (v <= 0) return null
      const remain = 100 - Object.keys(s.completed).length
      return Math.ceil(remain / v)
    },
  },
  actions: {
    toggle(day) {
      this.setDone(day, !this.completed[day])
    },
    setDone(day, done) {
      const date = todayStr()
      if (done) {
        this.completed[day] = { at: new Date().toISOString() }
        const list = this.checkins[date] || []
        if (!list.includes(day)) this.checkins[date] = [...list, day]
      } else {
        delete this.completed[day]
        if (this.checkins[date]) {
          this.checkins[date] = this.checkins[date].filter((d) => d !== day)
          if (!this.checkins[date].length) delete this.checkins[date]
        }
      }
    },
    markRange(from, to, done = true) {
      for (let d = from; d <= to; d += 1) this.setDone(d, done)
    },
    toggleStar(day) {
      this.starred = this.starred.includes(day)
        ? this.starred.filter((d) => d !== day)
        : [...this.starred, day]
    },
    setNote(day, text) {
      if (text) this.notes[day] = text
      else delete this.notes[day]
    },
    touch(day) {
      this.lastVisited = day
    },
    exportJSON() {
      return JSON.stringify(
        { version: 1, completed: this.completed, starred: this.starred, notes: this.notes, checkins: this.checkins, goal: this.goal },
        null,
        2,
      )
    },
    importJSON(text) {
      const data = JSON.parse(text)
      this.completed = data.completed || {}
      this.starred = data.starred || []
      this.notes = data.notes || {}
      this.checkins = data.checkins || {}
      if (data.goal) this.goal = data.goal
    },
    reset() {
      this.completed = {}
      this.starred = []
      this.notes = {}
      this.checkins = {}
      this.lastVisited = null
    },
  },
  persist: { key: KEY },
})
