<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCurriculumStore } from '@/stores/curriculum'
import { fetchDoc } from '@/api/content'
import { extractToc, renderMarkdown } from '@/utils/markdown'
import MarkdownView from '@/components/content/MarkdownView.vue'

const route = useRoute()
const curriculum = useCurriculumStore()

const active = ref('')
const html = ref('')
const toc = ref([])
const loading = ref(false)

async function load(slug) {
  const item = curriculum.extras.find((e) => e.slug === slug)
  if (!item) return
  loading.value = true
  try {
    html.value = renderMarkdown(await fetchDoc(item.url))
    toc.value = extractToc(html.value)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const want = route.query.slug ? String(route.query.slug) : curriculum.extras[0]?.slug
  if (want) active.value = want
})

watch(active, (v) => v && load(v))
</script>

<template>
  <div class="p100-page">
    <div class="cols">
      <aside class="p100-card side">
        <h3 class="p100-section-title">番外篇 ({{ curriculum.extras.length }})</h3>
        <div
          v-for="e in curriculum.extras"
          :key="e.slug"
          class="item"
          :class="{ active: e.slug === active }"
          @click="active = e.slug"
        >
          {{ e.title }}
        </div>
      </aside>

      <main class="p100-card main">
        <el-skeleton v-if="loading" :rows="8" animated />
        <MarkdownView v-else-if="html" :html="html" :toc="toc" />
        <el-empty v-else description="选择左侧文章" />
      </main>
    </div>
  </div>
</template>

<style scoped>
.cols {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}
.side {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.item {
  padding: 7px 10px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  color: #606266;
}
.item:hover {
  background: #f5f9ff;
}
.item.active {
  background: #ecf5ff;
  color: #409eff;
}
.main {
  min-height: 420px;
}
@media (max-width: 900px) {
  .cols {
    grid-template-columns: 1fr;
  }
}
</style>
