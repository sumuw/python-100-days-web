import { reactive } from 'vue'

/**
 * 全局 UI 状态（非持久化）。
 * headerHidden: 顶部菜单栏是否隐藏 —— 页面下滑时隐藏，上滑时显示。
 */
export const uiState = reactive({
  headerHidden: false,
})

const HEADER_HEIGHT = 58
const HIDE_THRESHOLD = 80 // 滚动超过该距离才允许隐藏
const DELTA = 4 // 过滤微小抖动

let lastY = 0
let listening = false

function onScroll() {
  const y = window.scrollY
  if (Math.abs(y - lastY) < DELTA) return
  if (y <= HIDE_THRESHOLD) {
    uiState.headerHidden = false
  } else if (y > lastY) {
    uiState.headerHidden = true
  } else {
    uiState.headerHidden = false
  }
  lastY = y
}

/** 在布局组件里调用一次，绑定滚动监听并同步吸顶偏移量 CSS 变量 */
export function bindHeaderScroll() {
  if (listening) return () => {}
  listening = true
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('scroll', onScroll)
    listening = false
  }
}
