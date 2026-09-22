<script setup>
import { computed } from 'vue'

const props = defineProps({
  day: { type: Object, required: true },
  done: { type: Boolean, default: false },
  starred: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])

const short = computed(() => {
  const t = props.day.title || ''
  return t.length > 18 ? `${t.slice(0, 18)}…` : t
})
</script>

<template>
  <div
    class="card"
    :class="{ done: props.done }"
    :title="`Day ${props.day.day} · ${props.day.title}`"
    @click="emit('select', props.day.day)"
  >
    <div class="top">
      <span class="p100-mono num">Day{{ props.day.day }}</span>
      <span v-if="props.starred" class="star">★</span>
      <span v-if="props.day.thin" class="thin" title="内容为占位存根">简</span>
    </div>
    <div class="title">{{ short }}</div>
    <div class="foot p100-mono">{{ props.day.docs.length }}篇 · {{ props.day.blockCount }}码</div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid var(--p100-border);
  border-radius: 8px;
  background: #fff;
  padding: 8px 10px;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 76px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}
.card.done {
  background: #f0f9eb;
  border-color: #b3e19d;
}
.card.done .num {
  color: #67c23a;
}
.top {
  display: flex;
  align-items: center;
  gap: 4px;
}
.num {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}
.star {
  color: #e6a23c;
  font-size: 12px;
}
.thin {
  font-size: 10px;
  color: #909399;
  border: 1px solid var(--p100-border);
  border-radius: 3px;
  padding: 0 3px;
  margin-left: auto;
}
.title {
  font-size: 12px;
  color: #303133;
  line-height: 1.4;
  flex: 1;
}
.foot {
  font-size: 10px;
  color: var(--p100-muted);
}
</style>
