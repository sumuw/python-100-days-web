<script setup>
import { computed } from 'vue'
import { shiftDays, todayStr } from '@/utils/date'

const props = defineProps({
  heat: { type: Object, default: () => ({}) },
  weeks: { type: Number, default: 18 },
})

const WEEK_LABEL = ['一', '二', '三', '四', '五', '六', '日']

const cells = computed(() => {
  const today = todayStr()
  // 回退到本周周一，再往前推 weeks-1 周
  const dow = (new Date(`${today}T00:00:00`).getDay() + 6) % 7 // 0=周一
  const start = shiftDays(today, -(dow + (props.weeks - 1) * 7))
  const out = []
  for (let i = 0; i < props.weeks * 7; i += 1) {
    const date = shiftDays(start, i)
    out.push({ date, count: props.heat[date] || 0, future: date > today })
  }
  return out
})

const columns = computed(() => {
  const cols = []
  for (let i = 0; i < cells.value.length; i += 7) cols.push(cells.value.slice(i, i + 7))
  return cols
})

function level(count) {
  if (!count) return 0
  if (count === 1) return 1
  if (count <= 2) return 2
  if (count <= 4) return 3
  return 4
}

const COLORS = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
</script>

<template>
  <div class="heat">
    <div class="grid">
      <div class="labels">
        <span v-for="w in WEEK_LABEL" :key="w">{{ w }}</span>
      </div>
      <div class="cols">
        <div v-for="(col, ci) in columns" :key="ci" class="col">
          <span
            v-for="c in col"
            :key="c.date"
            class="cell"
            :class="{ future: c.future }"
            :style="{ background: c.future ? 'transparent' : COLORS[level(c.count)] }"
            :title="`${c.date} · ${c.count} 天`"
          />
        </div>
      </div>
    </div>
    <div class="legend">
      <span class="p100-muted">少</span>
      <span v-for="c in COLORS" :key="c" class="cell" :style="{ background: c }" />
      <span class="p100-muted">多</span>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  gap: 6px;
}
.labels {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
  font-size: 10px;
  color: var(--p100-muted);
}
.cols {
  display: flex;
  gap: 3px;
  overflow-x: auto;
}
.col {
  display: grid;
  grid-template-rows: repeat(7, 12px);
  gap: 3px;
}
.cell {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: block;
}
.cell.future {
  border: 1px dashed #e4e7ed;
}
.legend {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  justify-content: flex-end;
  font-size: 11px;
}
</style>
