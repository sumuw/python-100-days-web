<script setup>
defineProps({
  toc: { type: Array, default: () => [] },
  activeId: { type: String, default: '' },
})
const emit = defineEmits(['jump'])
</script>

<template>
  <nav v-if="toc.length" class="toc">
    <div class="cap">目录</div>
    <a
      v-for="t in toc"
      :key="t.id"
      class="item"
      :class="[`lv${t.level}`, { active: t.id === activeId }]"
      :title="t.text"
      @click="emit('jump', t.id)"
    >{{ t.text }}</a>
  </nav>
</template>

<style scoped>
.toc {
  position: sticky;
  top: 70px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  font-size: 12px;
}
.cap {
  color: var(--p100-muted);
  margin-bottom: 8px;
}
.item {
  display: block;
  padding: 3px 8px;
  border-left: 2px solid transparent;
  color: #606266;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item:hover {
  color: #409eff;
}
.item.lv3 {
  padding-left: 20px;
  color: #909399;
}
.item.active {
  border-left-color: #409eff;
  color: #409eff;
  background: #f5f9ff;
}
</style>
