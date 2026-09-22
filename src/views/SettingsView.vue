<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCurriculumStore } from '@/stores/curriculum'
import { useProgressStore } from '@/stores/progress'

const curriculum = useCurriculumStore()
const progress = useProgressStore()
const importText = ref('')

function download() {
  const blob = new Blob([progress.exportJSON()], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `python-100-days-progress-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

async function doImport() {
  try {
    progress.importJSON(importText.value)
    ElMessage.success('导入成功')
    importText.value = ''
  } catch (e) {
    ElMessage.error(`导入失败：${e.message}`)
  }
}

async function clearAll() {
  try {
    await ElMessageBox.confirm('将清空全部学习进度，且无法恢复。建议先导出备份。', '确认清空', {
      type: 'warning',
    })
    progress.reset()
    ElMessage.success('已清空')
  } catch {
    /* 用户取消 */
  }
}

function markRangeDone() {
  const from = Number(promptStart.value)
  const to = Number(promptEnd.value)
  if (!from || !to || from > to) {
    ElMessage.warning('请输入合法的天号区间')
    return
  }
  progress.markRange(from, to, true)
  ElMessage.success(`已标记 Day ${from}-${to}`)
}

const promptStart = ref(1)
const promptEnd = ref(20)
</script>

<template>
  <div class="p100-page">
    <div class="p100-grid-2">
      <div class="p100-card">
        <h3 class="p100-section-title">数据概览</h3>
        <el-descriptions :column="1" size="small" border>
          <el-descriptions-item label="源仓库">{{ curriculum.source.repo }}</el-descriptions-item>
          <el-descriptions-item label="Commit">{{ curriculum.source.commit?.slice(0, 7) }}</el-descriptions-item>
          <el-descriptions-item label="生成时间">{{ curriculum.source.date }}</el-descriptions-item>
          <el-descriptions-item label="天覆盖">{{ curriculum.stats.coveredDays }} / {{ curriculum.stats.totalDays }}</el-descriptions-item>
          <el-descriptions-item label="文档">{{ curriculum.stats.docs }} 篇</el-descriptions-item>
          <el-descriptions-item label="代码块">{{ curriculum.stats.blocks }} 个</el-descriptions-item>
          <el-descriptions-item label="配套代码文件">{{ curriculum.stats.codeFiles }} 个</el-descriptions-item>
          <el-descriptions-item label="图片">{{ curriculum.stats.assets }} 张</el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="p100-card">
        <h3 class="p100-section-title">批量标记</h3>
        <div class="row">
          <el-input-number v-model="promptStart" :min="1" :max="100" size="small" />
          <span>—</span>
          <el-input-number v-model="promptEnd" :min="1" :max="100" size="small" />
          <el-button size="small" type="primary" @click="markRangeDone">标记为完成</el-button>
        </div>

        <h3 class="p100-section-title" style="margin-top: 22px">备份与恢复</h3>
        <div class="row">
          <el-button size="small" @click="download">导出进度 JSON</el-button>
          <el-button size="small" type="danger" plain @click="clearAll">清空全部进度</el-button>
        </div>
        <el-input
          v-model="importText"
          type="textarea"
          :rows="5"
          placeholder="粘贴此前导出的 JSON 内容后点击导入"
          style="margin-top: 10px"
        />
        <el-button size="small" type="primary" style="margin-top: 8px" @click="doImport">导入</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
