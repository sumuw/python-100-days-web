<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCurriculumStore } from '@/stores/curriculum'
import { useProgressStore } from '@/stores/progress'
import { uiState } from '@/stores/ui'

const router = useRouter()
const curriculum = useCurriculumStore()
const progress = useProgressStore()
const kw = ref('')

function submit() {
  const q = kw.value.trim()
  router.push(q ? { name: 'search', query: { q } } : { name: 'search' })
}

function gotoResume() {
  const day = progress.lastVisited || 1
  router.push({ name: 'day', params: { day } })
}
</script>

<template>
  <el-container class="layout">
    <el-header class="header" :class="{ 'header-hidden': uiState.headerHidden }" height="58px">
      <div class="brand" @click="router.push('/')">
        <span class="brand-main">Python 100 天</span>
        <span class="brand-sub">学习导航台</span>
      </div>

      <el-menu mode="horizontal" :default-active="$route.name" :router="false" class="nav" :ellipsis="false">
        <el-menu-item index="dashboard" @click="router.push('/')">总览</el-menu-item>
        <el-menu-item index="curriculum" @click="router.push('/curriculum')">课程大纲</el-menu-item>
        <el-menu-item index="extras" @click="router.push('/extras')">番外篇</el-menu-item>
        <el-menu-item index="search" @click="router.push('/search')">检索</el-menu-item>
        <el-menu-item index="settings" @click="router.push('/settings')">设置</el-menu-item>
      </el-menu>

      <div class="right">
        <el-input v-model="kw" size="small" placeholder="搜索标题" clearable style="width: 160px" @keyup.enter="submit" />
        <el-button size="small" type="primary" @click="gotoResume">继续学习</el-button>
        <span class="pct p100-mono">{{ progress.percent }}%</span>
      </div>
    </el-header>

    <el-main
      class="main"
      :class="{
        'day-main': $route.name === 'day',
        'header-hidden-main': $route.name === 'day' && uiState.headerHidden,
      }"
    >
      <slot />
    </el-main>

    <el-footer class="footer" height="42px">
      <span v-if="curriculum.source.commit" class="p100-muted p100-mono">
        源仓库 {{ curriculum.source.repo }} @ {{ curriculum.source.commit.slice(0, 7) }}
      </span>
      <span class="p100-muted">本地静态站点 · 学习进度保存在浏览器 localStorage</span>
    </el-footer>
  </el-container>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.header {
  display: flex;
  align-items: center;
  gap: 20px;
  background: #fff;
  border-bottom: 1px solid var(--p100-border);
  padding: 0 24px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: transform 0.25s ease;
}
.header-hidden {
  transform: translateY(-100%);
}
.brand {
  display: flex;
  align-items: baseline;
  gap: 8px;
  cursor: pointer;
  white-space: nowrap;
}
.brand-main {
  font-size: 17px;
  font-weight: 500;
}
.brand-sub {
  font-size: 12px;
  color: var(--p100-muted);
}
.nav {
  flex: 1;
  border-bottom: none;
  min-width: 0;
}
.right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pct {
  font-size: 13px;
  color: #409eff;
  min-width: 38px;
  text-align: right;
}
.main {
  flex: 1;
  min-height: 0;
  padding: 0;
  margin-top: 58px;
  overflow: visible;
  transition: margin-top 0.25s ease;
}
.day-main {
  overflow: hidden;
}
.day-main.header-hidden-main {
  margin-top: 0;
}
.footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--p100-border);
  background: #fff;
  font-size: 12px;
  padding: 0 24px;
}
</style>
