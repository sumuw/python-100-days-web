import { defineStore } from 'pinia'
import { fetchManifest } from '@/api/content'

export const useCurriculumStore = defineStore('curriculum', {
  state: () => ({
    manifest: null,
    loading: false,
    error: null,
  }),
  getters: {
    ready: (s) => !!s.manifest,
    stages: (s) => s.manifest?.stages ?? [],
    days: (s) => s.manifest?.days ?? [],
    extras: (s) => s.manifest?.extras ?? [],
    codeFiles: (s) => s.manifest?.codeFiles ?? [],
    stats: (s) => s.manifest?.stats ?? {},
    source: (s) => s.manifest?.source ?? {},
    dayMap: (s) => {
      const m = {}
      for (const d of s.manifest?.days ?? []) m[d.day] = d
      return m
    },
    stageMap: (s) => {
      const m = {}
      for (const st of s.manifest?.stages ?? []) m[st.id] = st
      return m
    },
    day(s) {
      return (n) => this.dayMap[n] || null
    },
  },
  actions: {
    async load() {
      if (this.manifest || this.loading) return
      this.loading = true
      try {
        this.manifest = await fetchManifest()
      } catch (e) {
        this.error = e.message || String(e)
      } finally {
        this.loading = false
      }
    },
    codeFilesOfDay(n) {
      return this.codeFiles.filter((f) => f.day === n)
    },
    codeFilesOfStage(stageId) {
      return this.codeFiles.filter((f) => !f.day && f.stageId === stageId)
    },
  },
})
