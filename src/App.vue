<script setup>
import { onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import { useCurriculumStore } from '@/stores/curriculum'

const curriculum = useCurriculumStore()
onMounted(() => curriculum.load())
</script>

<template>
  <MainLayout>
    <div v-if="curriculum.error" class="p100-page">
      <el-alert type="error" show-icon :closable="false" title="课程索引加载失败">
        <p>未找到 <code>public/content/manifest.json</code>。</p>
        <p>请先在项目根目录执行：</p>
        <pre class="p100-mono">npm run sync</pre>
        <p class="p100-muted">若已克隆源仓库，可使用 npm run sync -- --offline</p>
      </el-alert>
    </div>
    <div v-else-if="!curriculum.ready" class="p100-page">
      <el-skeleton :rows="6" animated />
    </div>
    <router-view v-else />
  </MainLayout>
</template>
