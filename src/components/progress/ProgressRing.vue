<script setup>
import { computed } from 'vue'

const props = defineProps({
  percent: { type: Number, default: 0 },
  size: { type: Number, default: 140 },
  label: { type: String, default: '总进度' },
})

const stroke = 12
const radius = computed(() => props.size / 2 - stroke / 2 - 2)
const center = computed(() => props.size / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)
const dash = computed(() => (circumference.value * Math.min(props.percent, 100)) / 100)
</script>

<template>
  <div class="ring">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <circle
        :cx="center" :cy="center" :r="radius"
        fill="none" stroke="#ebeef5" :stroke-width="stroke"
      />
      <circle
        :cx="center" :cy="center" :r="radius"
        fill="none" stroke="#409EFF" :stroke-width="stroke" stroke-linecap="round"
        :stroke-dasharray="`${dash} ${circumference}`"
        :transform="`rotate(-90 ${center} ${center})`"
      />
      <text
        :x="center" :y="center - 4" text-anchor="middle"
        font-size="26" font-weight="500" fill="#303133"
      >{{ percent }}%</text>
      <text
        :x="center" :y="center + 20" text-anchor="middle"
        font-size="12" fill="#909399"
      >{{ label }}</text>
    </svg>
  </div>
</template>

<style scoped>
.ring {
  display: flex;
  justify-content: center;
}
</style>
