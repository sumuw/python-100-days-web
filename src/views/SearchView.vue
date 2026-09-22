<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCurriculumStore } from '@/stores/curriculum'
import { useProgressStore } from '@/stores/progress'

const route = useRoute()
const router = useRouter()
const curriculum = useCurriculumStore()
const progress = useProgressStore()

const q = ref('')
const scope = ref('days')

onMounted(() => {
  if (route.query.q) q.value = String(route.query.q)
})

const results = computed(() => {
  const kw = q.value.trim().toLowerCase()
  if (!kw) return []
  if (scope.value === 'extras') {
    return curriculum.extras
      .filter((e) => e.title.toLowerCase().includes(kw))
      .map((e) => ({ kind: 'extra', key: e.slug, title: e.title, sub: `番外篇 · ${e.wordCount} 字` }))
  }
  return curriculum.days
    .filter(
      (d) =>
        String(d.day) === kw ||
        d.title.toLowerCase().includes(kw) ||
        d.docs.some((doc) => doc.file.toLowerCase().includes(kw)),
    )
    .map((d) => ({
      kind: 'day',
      key: d.day,
      title: `Day ${d.day} · ${d.title}`,
      sub: `${d.docs.length} 篇 · ${d.blockCount} 代码块`,
      done: progress.isDone(d.day),
    }))
})

function open(r) {
  if (r.kind === 'day') router.push({ name: 'day', params: { day: r.key } })
  else router.push({ name: 'extras', query: { slug: r.key } })
}
</script>

<template>
  <div class="p100-page">
    <div class="p100-card">
      <div class="bar">
        <el-input v-model="q" size="default" placeholder="输入天号或标题关键词，如 装饰、Django、62" clearable style="max-width: 420px" />
        <el-radio-group v-model="scope" size="small">
          <el-radio-button value="days">主线 Day 1-100</el-radio-button>
          <el-radio-button value="extras">番外篇</el-radio-button>
        </el-radio-group>
      </div>
      <p class="p100-muted hint">当前为标题检索（含文件名）。正文全文检索需要在构建期生成倒排索引，尚未实现。</p>
    </div>

    <div class="p100-card list">
      <el-empty v-if="!q.trim()" description="输入关键词开始检索" />
      <el-empty v-else-if="!results.length" description="没有匹配结果" />
      <template v-else>
        <div class="p100-muted" style="margin-bottom: 10px">共 {{ results.length }} 条</div>
        <div
          v-for="r in results"
          :key="`${r.kind}-${r.key}`"
          class="item"
          :class="{ done: r.done }"
          @click="open(r)"
        >
          <span class="t">{{ r.title }}</span>
          <span class="s p100-mono">{{ r.sub }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.hint {
  margin: 10px 0 0;
  font-size: 12px;
}
.list {
  margin-top: 14px;
}
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 12px;
  border-bottom: 1px solid #f2f3f5;
  cursor: pointer;
}
.item:hover {
  background: #f5f9ff;
}
.item.done .t {
  color: #67c23a;
}
.t {
  font-size: 14px;
}
.s {
  font-size: 11px;
  color: var(--p100-muted);
}
</style>
