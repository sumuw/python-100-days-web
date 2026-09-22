<script setup>
import { computed } from 'vue'
import DayCard from './DayCard.vue'

const props = defineProps({
  days: { type: Array, default: () => [] },
  stages: { type: Array, default: () => [] },
  isDone: { type: Function, required: true },
  isStarred: { type: Function, required: true },
  groupByStage: { type: Boolean, default: true },
})
const emit = defineEmits(['select'])

const groups = computed(() => {
  if (!props.groupByStage) return [{ key: 'all', title: '', days: props.days }]
  return props.stages
    .map((st) => ({
      key: st.id,
      title: st.title,
      range: st.range,
      color: st.color,
      days: props.days.filter((d) => d.stageId === st.id),
    }))
    .filter((g) => g.days.length)
})
</script>

<template>
  <div class="wrap">
    <section v-for="g in groups" :key="g.key" class="group">
      <div v-if="g.title" class="ghead">
        <span class="dot" :style="{ background: g.color }" />
        <span class="gtitle">{{ g.title }}</span>
        <span class="grange p100-mono">Day{{ g.range[0] }}-{{ g.range[1] }}</span>
        <span class="gcount p100-mono">{{ g.days.filter((d) => isDone(d.day)).length }}/{{ g.days.length }}</span>
      </div>
      <div class="cells">
        <DayCard
          v-for="d in g.days"
          :key="d.day"
          :day="d"
          :done="isDone(d.day)"
          :starred="isStarred(d.day)"
          @select="emit('select', $event)"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.group {
  margin-bottom: 22px;
}
.ghead {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.gtitle {
  font-size: 14px;
  font-weight: 500;
}
.grange {
  font-size: 11px;
  color: var(--p100-muted);
}
.gcount {
  margin-left: auto;
  font-size: 12px;
  color: #409eff;
}
.cells {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}
</style>
