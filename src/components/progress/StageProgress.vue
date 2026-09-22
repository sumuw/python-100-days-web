<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
})
const emit = defineEmits(['pick'])

function color(p) {
  if (p === 100) return '#67c23a'
  if (p >= 50) return '#409eff'
  if (p > 0) return '#e6a23c'
  return '#c0c4cc'
}
</script>

<template>
  <div class="stages">
    <div v-for="st in props.items" :key="st.id" class="row" @click="emit('pick', st)">
      <div class="meta">
        <span class="name">{{ st.title }}</span>
        <span class="range p100-mono">Day{{ st.range[0] }}-{{ st.range[1] }}</span>
      </div>
      <el-progress :percentage="st.percent" :color="color(st.percent)" :stroke-width="12" :show-text="false" />
      <span class="val p100-mono">{{ st.done }}/{{ st.total }}</span>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 1fr 220px 64px;
  align-items: center;
  gap: 12px;
  padding: 7px 0;
  cursor: pointer;
  border-radius: 6px;
}
.row:hover {
  background: #f7f9fc;
}
.meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.range {
  font-size: 11px;
  color: var(--p100-muted);
}
.val {
  font-size: 12px;
  color: var(--p100-muted);
  text-align: right;
}
@media (max-width: 760px) {
  .row {
    grid-template-columns: 1fr 64px;
  }
  .row :deep(.el-progress) {
    grid-column: 1 / -1;
  }
}
</style>
