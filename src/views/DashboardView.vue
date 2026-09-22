<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCurriculumStore } from '@/stores/curriculum'
import { useProgressStore } from '@/stores/progress'
import StatCards from '@/components/progress/StatCards.vue'
import ProgressRing from '@/components/progress/ProgressRing.vue'
import StageProgress from '@/components/progress/StageProgress.vue'
import HeatmapCalendar from '@/components/progress/HeatmapCalendar.vue'
import TrendChart from '@/components/progress/TrendChart.vue'

const router = useRouter()
const curriculum = useCurriculumStore()
const progress = useProgressStore()

const stageStats = computed(() => progress.stageStats(curriculum.stages))
const trend = computed(() => progress.trend(30))
const resumeDay = computed(() => {
  if (progress.lastVisited) return progress.lastVisited
  const next = curriculum.days.find((d) => !progress.isDone(d.day))
  return next ? next.day : 1
})

function goto(day) {
  router.push({ name: 'day', params: { day } })
}
function pickStage(st) {
  router.push({ name: 'curriculum', query: { stage: st.id } })
}
</script>

<template>
  <div class="p100-page">
    <div class="hero p100-card">
      <ProgressRing :percent="progress.percent" />
      <div class="hero-main">
        <h2>Python 100 天 · 从新手到大师</h2>
        <p class="p100-muted">
          已完成 <b>{{ progress.doneCount }}</b> / 100 天 · 连续打卡 <b>{{ progress.streak }}</b> 天
          <template v-if="progress.etaDays !== null">
            · 按近 14 天速度预计还需 <b>{{ progress.etaDays }}</b> 天
          </template>
          <template v-else>· 暂无近期学习记录，无法预估完成时间</template>
        </p>
        <div class="acts">
          <el-button type="primary" @click="goto(resumeDay)">继续 Day {{ resumeDay }}</el-button>
          <el-button @click="router.push('/curriculum')">查看全部大纲</el-button>
        </div>
      </div>
    </div>

    <div style="margin: 16px 0">
      <StatCards
        :done="progress.doneCount"
        :streak="progress.streak"
        :remaining="100 - progress.doneCount"
        :eta-days="progress.etaDays"
        :starred="progress.starred.length"
        :blocks="curriculum.stats.blocks || 0"
      />
    </div>

    <div class="p100-grid-2" style="margin-bottom: 16px">
      <div class="p100-card">
        <h3 class="p100-section-title">阶段进度</h3>
        <StageProgress :items="stageStats" @pick="pickStage" />
      </div>
      <div class="p100-card">
        <h3 class="p100-section-title">近 30 天完成趋势</h3>
        <TrendChart :data="trend" />
      </div>
    </div>

    <div class="p100-card">
      <h3 class="p100-section-title">
        打卡日历
        <span class="p100-muted" style="font-size: 12px">最近 18 周，每格表示当天完成的天数</span>
      </h3>
      <HeatmapCalendar :heat="progress.heatmap" />
    </div>
  </div>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  gap: 32px;
}
.hero-main h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 500;
}
.hero-main p {
  margin: 0 0 14px;
  font-size: 13px;
}
.acts {
  display: flex;
  gap: 10px;
}
@media (max-width: 760px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
