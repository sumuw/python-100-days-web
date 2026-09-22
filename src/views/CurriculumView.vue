<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCurriculumStore } from '@/stores/curriculum'
import { useProgressStore } from '@/stores/progress'
import DayGrid from '@/components/nav/DayGrid.vue'

const route = useRoute()
const router = useRouter()
const curriculum = useCurriculumStore()
const progress = useProgressStore()

const stage = ref('')
const status = ref('all')

onMounted(() => {
  if (route.query.stage) stage.value = String(route.query.stage)
})

const filtered = computed(() => {
  let list = curriculum.days
  if (stage.value) list = list.filter((d) => d.stageId === stage.value)
  if (status.value === 'todo') list = list.filter((d) => !progress.isDone(d.day))
  if (status.value === 'done') list = list.filter((d) => progress.isDone(d.day))
  if (status.value === 'star') list = list.filter((d) => progress.isStarred(d.day))
  return list
})

const doneInView = computed(() => filtered.value.filter((d) => progress.isDone(d.day)).length)

function goto(day) {
  router.push({ name: 'day', params: { day } })
}
</script>

<template>
  <div class="p100-page">
    <div class="p100-card">
      <div class="filters">
        <el-select v-model="stage" size="small" clearable placeholder="全部阶段" style="width: 220px">
          <el-option
            v-for="s in curriculum.stages"
            :key="s.id"
            :label="`${s.title} (Day${s.range[0]}-${s.range[1]})`"
            :value="s.id"
          />
        </el-select>
        <el-radio-group v-model="status" size="small">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="todo">未完成</el-radio-button>
          <el-radio-button value="done">已完成</el-radio-button>
          <el-radio-button value="star">收藏</el-radio-button>
        </el-radio-group>
        <span class="p100-muted p100-mono">{{ doneInView }}/{{ filtered.length }} 已完成</span>
      </div>
    </div>

    <div style="margin-top: 16px">
      <el-empty v-if="!filtered.length" description="没有符合条件的天" />
      <DayGrid
        v-else
        :days="filtered"
        :stages="curriculum.stages"
        :is-done="(d) => progress.isDone(d)"
        :is-starred="(d) => progress.isStarred(d)"
        @select="goto"
      />
    </div>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
</style>
