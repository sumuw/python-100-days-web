<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  day: { type: Number, required: true },
  done: { type: Boolean, default: false },
  starred: { type: Boolean, default: false },
  note: { type: String, default: '' },
})
const emit = defineEmits(['toggle', 'star', 'note'])

const noteVisible = ref(false)
const draft = ref(props.note)

watch(() => props.day, () => {
  draft.value = props.note
  noteVisible.value = false
})

function saveNote() {
  emit('note', draft.value)
  noteVisible.value = false
}
</script>

<template>
  <div class="mark">
    <el-button :type="done ? 'success' : 'default'" size="small" @click="emit('toggle')">
      {{ done ? '已完成' : '标记为完成' }}
    </el-button>
    <el-button size="small" :type="starred ? 'warning' : 'default'" @click="emit('star')">
      {{ starred ? '已收藏' : '收藏' }}
    </el-button>
    <el-button size="small" @click="noteVisible = !noteVisible">
      笔记{{ note ? ' ·' : '' }}
    </el-button>

    <el-dialog v-model="noteVisible" :title="`Day ${day} 笔记`" width="480px">
      <el-input v-model="draft" type="textarea" :rows="6" placeholder="记录要点、疑问、待复习内容…" />
      <template #footer>
        <el-button size="small" @click="noteVisible = false">取消</el-button>
        <el-button size="small" type="primary" @click="saveNote">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.mark {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
</style>
