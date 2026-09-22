export const STAGES = [
  { id: 's1', range: [1, 20], dir: 'Day01-20', title: 'Python 语言基础', color: '#409EFF' },
  { id: 's2', range: [21, 30], dir: 'Day21-30', title: 'Python 语言应用', color: '#67C23A' },
  { id: 's3', range: [31, 35], dir: 'Day31-35', title: 'Python进阶 / Web前端 / Linux', color: '#E6A23C' },
  { id: 's4', range: [36, 45], dir: 'Day36-45', title: '数据库基础和进阶', color: '#F56C6C' },
  { id: 's5', range: [46, 60], dir: 'Day46-60', title: '实战 Django', color: '#909399' },
  { id: 's6', range: [61, 65], dir: 'Day61-65', title: '网络数据采集', color: '#409EFF' },
  { id: 's7', range: [66, 80], dir: 'Day66-80', title: 'Python 数据分析', color: '#67C23A' },
  { id: 's8', range: [81, 90], dir: 'Day81-90', title: '机器学习', color: '#E6A23C' },
  { id: 's9', range: [91, 100], dir: 'Day91-100', title: '团队项目开发 / 面试', color: '#F56C6C' },
]

export const TOTAL_DAYS = 100

export function stageOfDay(day) {
  return STAGES.find((s) => day >= s.range[0] && day <= s.range[1]) || null
}

export function pad2(n) {
  return String(n).padStart(2, '0')
}
