<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import DocToc from './DocToc.vue'

const props = defineProps({
  html: { type: String, default: '' },
  toc: { type: Array, default: () => [] },
  showToc: { type: Boolean, default: true },
})

const activeId = ref('')
let observer = null

function jump(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function observe() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activeId.value = e.target.id
      }
    },
    { rootMargin: '-80px 0px -70% 0px' },
  )
  for (const t of props.toc) {
    const el = document.getElementById(t.id)
    if (el) observer.observe(el)
  }
}

watch(
  () => props.html,
  async () => {
    await nextTick()
    observe()
  },
)

onMounted(observe)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="md-wrap" :class="{ 'with-toc': showToc && toc.length }">
    <div class="md-body" v-html="html" />
    <aside v-if="showToc && toc.length" class="side">
      <DocToc :toc="toc" :active-id="activeId" @jump="jump" />
    </aside>
  </div>
</template>

<style scoped>
.md-wrap {
  display: block;
}
.md-wrap.with-toc {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 24px;
}
.side {
  min-width: 0;
}
@media (max-width: 1100px) {
  .md-wrap.with-toc {
    grid-template-columns: 1fr;
  }
  .side {
    display: none;
  }
}
</style>
