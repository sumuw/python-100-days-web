<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCurriculumStore } from '@/stores/curriculum'
import { useProgressStore } from '@/stores/progress'
import { fetchBlocks, fetchDoc, rewriteContentUrls } from '@/api/content'
import { bindHeaderScroll, uiState } from '@/stores/ui'
import { extractToc, renderMarkdown } from '@/utils/markdown'
import MarkdownView from '@/components/content/MarkdownView.vue'
import CodePanel from '@/components/content/CodePanel.vue'
import MarkButton from '@/components/common/MarkButton.vue'

const route = useRoute()
const router = useRouter()
const curriculum = useCurriculumStore()
const progress = useProgressStore()

const dayNum = computed(() => Number(route.params.day))
const day = computed(() => curriculum.day(dayNum.value))
const stage = computed(() => (day.value ? curriculum.stageMap[day.value.stageId] : null))

const tab = ref('doc')
const docIndex = ref(0)
const html = ref('')
const toc = ref([])
const blocks = ref([])
const loading = ref(false)
const contentScroller = ref(null)

const codeFiles = computed(() => (day.value ? curriculum.codeFilesOfDay(dayNum.value) : []))

async function loadDoc() {
  const d = day.value
  if (!d || !d.docs.length) return
  loading.value = true
  try {
    const doc = d.docs[docIndex.value] || d.docs[0]
    const text = await fetchDoc(doc.url)
    html.value = renderMarkdown(rewriteContentUrls(text))
    toc.value = extractToc(html.value)
  } catch (e) {
    html.value = `<p style="color:#f56c6c">文档加载失败：${e.message}</p>`
    toc.value = []
  } finally {
    loading.value = false
  }
}

async function loadBlocks() {
  const d = day.value
  if (!d) return
  try {
    blocks.value = await fetchBlocks(d.codeBlocksUrl)
  } catch {
    blocks.value = []
  }
}

watch(
  () => dayNum.value,
  async (n) => {
    docIndex.value = 0
    tab.value = 'doc'
    progress.touch(n)
    await Promise.all([loadDoc(), loadBlocks()])
  },
  { immediate: true },
)

watch(docIndex, loadDoc)

function go(delta) {
  const next = dayNum.value + delta
  if (next >= 1 && next <= 100) router.push({ name: 'day', params: { day: next } })
}

function onKey(e) {
  const t = e.target
  if (t && ['INPUT', 'TEXTAREA'].includes(t.tagName)) return
  if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}

let unbindHeaderScroll = () => {}

onMounted(() => {
  document.documentElement.classList.add('course-view')
  window.addEventListener('keydown', onKey)
  unbindHeaderScroll = bindHeaderScroll(contentScroller.value)
  if (route.query.tab === 'code') tab.value = 'code'
})
onBeforeUnmount(() => {
  document.documentElement.classList.remove('course-view')
  window.removeEventListener('keydown', onKey)
  unbindHeaderScroll()
})
</script>

<template>
  <div class="p100-page day-detail-page" :class="{ 'navigation-hidden': uiState.headerHidden }">
    <el-empty v-if="!day" description="没有这一天" />

    <template v-else>
      <div class="p100-card head" :class="{ 'head-detached': uiState.headerHidden }">
        <div class="hleft">
          <div class="title-row">
            <span class="dayno p100-mono">Day {{ day.day }}</span>
            <h2 class="title">{{ day.title }}</h2>
            <el-tag v-if="stage" size="small" :color="stage.color" effect="dark">{{ stage.title }}</el-tag>
            <el-tag v-if="day.thin" size="small" type="warning">内容待补充</el-tag>
            <el-tag v-if="day.sharedWith.length" size="small" type="info">
              与 Day{{ day.sharedWith.join('、Day') }} 共用
            </el-tag>
          </div>
          <div class="p100-muted meta p100-mono">
            {{ day.docs.length }} 篇文档 · {{ day.blockCount }} 个代码块 ·
            {{ codeFiles.length }} 个配套文件 · 预计 {{ day.estimatedMinutes }} 分钟
          </div>
        </div>
        <div class="hright">
          <MarkButton
            :day="day.day"
            :done="progress.isDone(day.day)"
            :starred="progress.isStarred(day.day)"
            :note="progress.noteOf(day.day)"
            @toggle="progress.toggle(day.day)"
            @star="progress.toggleStar(day.day)"
            @note="(v) => progress.setNote(day.day, v)"
          />
          <div class="pager">
            <el-button size="small" :disabled="day.day === 1" @click="go(-1)">← 前一天</el-button>
            <el-button size="small" :disabled="day.day === 100" @click="go(1)">后一天 →</el-button>
          </div>
        </div>
      </div>

      <div v-if="day.docs.length > 1" class="p100-card doc-tabs">
        <el-radio-group v-model="docIndex" size="small">
          <el-radio-button v-for="(d, i) in day.docs" :key="d.url" :value="i">
            {{ i + 1 }}. {{ d.title }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <div ref="contentScroller" class="p100-card body">
        <el-tabs v-model="tab">
          <el-tab-pane label="文档" name="doc">
            <el-skeleton v-if="loading" :rows="8" animated />
            <MarkdownView v-else :html="html" :toc="toc" />
          </el-tab-pane>
          <el-tab-pane label="代码" name="code">
            <CodePanel :blocks="blocks" :files="codeFiles" />
          </el-tab-pane>
        </el-tabs>
      </div>

      <p class="p100-muted tip">快捷键：← / → 切换天</p>
    </template>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  z-index: 50;
  background: var(--p100-card);
  border-color: #dce4ee;
  box-shadow: 0 2px 8px rgba(31, 35, 41, 0.04);
  isolation: isolate;
  flex: 0 0 auto;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.head::after {
  content: '';
  position: absolute;
  z-index: -1;
  right: -1px;
  bottom: -14px;
  left: -1px;
  height: 14px;
  background: linear-gradient(to bottom, rgba(31, 35, 41, 0.1), transparent);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}
.head-detached {
  border-bottom-color: #c7d3e1;
  box-shadow: 0 8px 18px rgba(31, 35, 41, 0.12);
}
.head-detached::after {
  opacity: 1;
}
.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.dayno {
  font-size: 13px;
  color: #409eff;
}
.title {
  margin: 0;
  font-size: 19px;
  font-weight: 500;
}
.meta {
  margin-top: 8px;
  font-size: 12px;
}
.hright {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}
.pager {
  display: flex;
  gap: 8px;
}
.doc-tabs {
  flex: 0 0 auto;
  margin-top: 16px;
}
.body {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 16px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
.tip {
  flex: 0 0 auto;
  margin-top: 12px;
  font-size: 12px;
}
.day-detail-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding-bottom: 8px;
  transition: padding-top 0.25s ease;
}
.navigation-hidden {
  padding-top: max(8px, 1vh);
}
</style>
