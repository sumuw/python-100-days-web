<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchDoc } from '@/api/content'

const props = defineProps({
  blocks: { type: Array, default: () => [] },
  files: { type: Array, default: () => [] },
})

const source = ref('blocks')
const lang = ref('')
const fileContent = ref('')
const fileLoading = ref(false)
const activeFile = ref(null)

const langs = computed(() => [...new Set(props.blocks.map((b) => b.lang))].sort())

const shownBlocks = computed(() =>
  props.blocks
    .map((b, i) => ({ ...b, idx: i }))
    .filter((b) => !lang.value || b.lang === lang.value),
)

async function openFile(f) {
  activeFile.value = f.path
  fileLoading.value = true
  fileContent.value = ''
  try {
    fileContent.value = await fetchDoc(f.path)
  } catch (e) {
    fileContent.value = `// 读取失败: ${e.message}`
  } finally {
    fileLoading.value = false
  }
}

watch(
  () => props.files,
  (files) => {
    if (files?.length && source.value === 'files' && !activeFile.value) openFile(files[0])
  },
  { immediate: true },
)

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制')
  } catch {
    ElMessage.warning('复制失败，请手动选择')
  }
}
</script>

<template>
  <div class="panel">
    <div class="bar">
      <el-radio-group v-model="source" size="small">
        <el-radio-button value="blocks">文档内代码块 ({{ blocks.length }})</el-radio-button>
        <el-radio-button value="files">配套代码文件 ({{ files.length }})</el-radio-button>
      </el-radio-group>

      <el-select v-if="source === 'blocks'" v-model="lang" size="small" clearable placeholder="语言" style="width: 130px">
        <el-option v-for="l in langs" :key="l" :label="l" :value="l" />
      </el-select>
      <span v-else class="p100-muted">点击文件名查看内容</span>
    </div>

    <div v-if="source === 'blocks'">
      <el-empty v-if="!shownBlocks.length" description="该天文档中没有抽取到代码块" :image-size="70" />
      <div v-for="b in shownBlocks" :key="b.idx" class="block">
        <div class="bhead">
          <el-tag size="small" type="info">{{ b.lang }}</el-tag>
          <span class="btitle">{{ b.docTitle }}</span>
          <span class="p100-muted p100-mono">第 {{ b.startLine }} 行</span>
          <el-button size="small" text @click="copy(b.code)">复制</el-button>
        </div>
        <pre class="hljs code"><code>{{ b.code }}</code></pre>
      </div>
    </div>

    <div v-else class="files">
      <el-empty v-if="!files.length" description="该天没有配套代码文件" :image-size="70" />
      <div class="flist">
        <div
          v-for="f in files"
          :key="f.path"
          class="fitem"
          :class="{ active: f.path === activeFile }"
          @click="openFile(f)"
        >
          <span class="p100-mono fname">{{ f.name }}</span>
          <el-tag size="small" type="info">{{ f.lang }}</el-tag>
          <span class="p100-muted p100-mono">{{ Math.round(f.size / 1024) }}K</span>
        </div>
      </div>
      <div class="fbody">
        <div v-if="fileLoading" class="p100-muted">加载中…</div>
        <pre v-else-if="fileContent" class="hljs code"><code>{{ fileContent }}</code></pre>
        <div v-else class="p100-muted">选择左侧文件查看</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.block {
  margin-bottom: 14px;
  border: 1px solid var(--p100-border);
  border-radius: 8px;
  overflow: hidden;
}
.bhead {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #fafbfc;
  border-bottom: 1px solid var(--p100-border);
}
.btitle {
  font-size: 12px;
  color: #606266;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.code {
  margin: 0;
  padding: 12px 14px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  background: #f8f9fb;
}
.files {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 14px;
}
.flist {
  border: 1px solid var(--p100-border);
  border-radius: 8px;
  max-height: 520px;
  overflow-y: auto;
}
.fitem {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f2f3f5;
  font-size: 12px;
}
.fitem:hover {
  background: #f5f9ff;
}
.fitem.active {
  background: #ecf5ff;
}
.fname {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fbody {
  border: 1px solid var(--p100-border);
  border-radius: 8px;
  min-height: 200px;
  max-height: 520px;
  overflow: auto;
}
</style>
