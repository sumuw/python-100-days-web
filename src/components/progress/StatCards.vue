<script setup>
defineProps({
  done: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  etaDays: { type: [Number, null], default: null },
  starred: { type: Number, default: 0 },
  blocks: { type: Number, default: 0 },
})
</script>

<template>
  <div class="stats">
    <div class="stat">
      <div class="num">{{ done }}<span class="unit">/100</span></div>
      <div class="cap">已学天数</div>
    </div>
    <div class="stat">
      <div class="num">{{ remaining }}</div>
      <div class="cap">剩余天数</div>
    </div>
    <div class="stat">
      <div class="num">{{ streak }}<span class="unit">天</span></div>
      <div class="cap">连续打卡</div>
    </div>
    <div class="stat">
      <div class="num">{{ etaDays === null ? '—' : etaDays }}<span class="unit">天</span></div>
      <div class="cap">预计还需</div>
    </div>
    <div class="stat">
      <div class="num">{{ starred }}</div>
      <div class="cap">收藏</div>
    </div>
    <div class="stat">
      <div class="num">{{ blocks }}</div>
      <div class="cap">代码块总量</div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.stat {
  background: var(--p100-card);
  border: 1px solid var(--p100-border);
  border-radius: 10px;
  padding: 14px 12px;
  text-align: center;
}
.num {
  font-size: 22px;
  font-weight: 500;
  color: #303133;
}
.unit {
  font-size: 12px;
  color: var(--p100-muted);
  margin-left: 2px;
}
.cap {
  margin-top: 4px;
  font-size: 12px;
  color: var(--p100-muted);
}
@media (max-width: 900px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
