// 上游课程中无法通过相对 res/ 路径收集的图片，文件保存在 scripts/offline-assets/。
export const OFFLINE_EXTERNAL_ASSETS = new Map([
  ['http://latex.codecogs.com/gif.latex?O(c)', 'complexity-o-c.gif'],
  ['http://latex.codecogs.com/gif.latex?O(log_2n)', 'complexity-o-log-2n.gif'],
  ['http://latex.codecogs.com/gif.latex?O(n)', 'complexity-o-n.gif'],
  ['http://latex.codecogs.com/gif.latex?O(n*log_2n)', 'complexity-o-n-log-2n.gif'],
  ['http://latex.codecogs.com/gif.latex?O(n^2)', 'complexity-o-n-squared.gif'],
  ['http://latex.codecogs.com/gif.latex?O(n^3)', 'complexity-o-n-cubed.gif'],
  ['http://latex.codecogs.com/gif.latex?O(2^n)', 'complexity-o-2n.gif'],
  ['http://latex.codecogs.com/gif.latex?O(n!)', 'complexity-o-n-factorial.gif'],
  ['https://gitee.com/jackfrued/mypic/raw/master/20211107163448.png', '20211107163448.png'],
  ['https://gitee.com/jackfrued/mypic/raw/master/20211107163741.png', '20211107163741.png'],
  ['http://localhost/mypic/20211121135117.png', '20211121135117.png'],
  ['http://localhost/mypic/20211121225327.png', '20211121225327.png'],
])

// 上游 Markdown 引用了但仓库和历史均未包含的文件，以明确标注的占位图保证离线阅读不中断。
export const OFFLINE_MISSING_ASSETS = new Map([
  ['Day36-45/res/QQ20220708-235815@2x.png', 'hive-overview-source-missing.svg'],
  ['Day36-45/res/QQ20220707-195545@2x.png', 'hive-rdbms-comparison-source-missing.svg'],
])
