/**
 * 国际化模块：多语言文本 + 语言切换 (EN / VI / ZH)
 */

const I18N = {
  en: {
    title: 'KittiSU GKI Kernel',
    subtitle: 'Build GKI kernels with KittiSU + SUSFS \u2014 version dashboard',
    light: 'Light',
    dark: 'Dark',
    loading: 'Loading kernel data\u2026',
    errorTitle: 'Failed to load kernel data.',
    errorHint: 'Make sure <code>web/data/</code> contains the JSON files.',
    releases: 'Releases',
    first: 'First',
    latest: 'Latest',
    latestKernel: 'Latest Kernel',
    date: 'Security Patch',
    kernelVersion: 'Kernel Version',
    deprecated: 'Deprecated',
    deprecatedInfo: 'No longer receives security patch merges',
    susfsCompatInfo: 'SUSFS patches work directly after installing KittiSU, no extra patching needed',
    footerPre: 'Data sourced from',
    footerPost: '. Updated automatically via GitHub Actions. Powered by KittiSU.',
    announce: 'Announcement',
    announceClose: 'Close',
    announceDismiss: 'Don\u2019t show today',
    modalTitle: 'GitHub Action Parameters',
    modalAndroid: 'Android Version',
    modalKernel: 'Kernel Version',
    modalSublevel: 'Sublevel',
    modalPatch: 'Security Patch Level',
    modalSectionSource: 'Source Code',
    modalRepoInit: 'Repo Init',
    modalSectionSusfs: 'SUSFS Patch',
    modalSusfsClone: 'Clone',
    modalSectionKittisu: 'KittiSU',
    modalKittisuRepo: 'Repo',
    modalKittisuBranch: 'Branch / Commit',
    copy: 'Copy',
    copied: 'Copied',
    tcTitle: 'Time Converter',
    tcDate: 'Date',
    tcTime: 'Time (UTC)',
    tcToast: 'Copied to clipboard',
    langSwitch: 'VI',
    searchPlaceholder: 'Search date or kernel version\u2026',
    noResults: 'No matching results',
    newBadge: 'NEW',
    susfsCompat: 'SUSFS',
    guide: 'Guide',
  },
  vi: {
    title: 'KittiSU GKI Kernel',
    subtitle: 'Build kernel GKI với KittiSU + SUSFS \u2014 bảng theo dõi phiên bản',
    light: 'Sáng',
    dark: 'Tối',
    loading: 'Đang tải dữ liệu kernel\u2026',
    errorTitle: 'Không tải được dữ liệu kernel.',
    errorHint: 'Hãy đảm bảo <code>web/data/</code> có các file JSON.',
    releases: 'Bản phát hành',
    first: 'Đầu',
    latest: 'Mới nhất',
    latestKernel: 'Kernel mới nhất',
    date: 'Bản vá bảo mật',
    kernelVersion: 'Phiên bản Kernel',
    deprecated: 'Ngừng hỗ trợ',
    deprecatedInfo: 'Không còn nhận merge bản vá bảo mật',
    susfsCompatInfo: 'Cài KittiSU xong có thể dùng SUSFS trực tiếp, không cần patch thêm',
    footerPre: 'Dữ liệu từ',
    footerPost: '. Cập nhật tự động qua GitHub Actions. Powered by KittiSU.',
    announce: 'Thông báo',
    announceClose: 'Đóng',
    announceDismiss: 'Không hiện hôm nay',
    modalTitle: 'Tham số GitHub Action',
    modalAndroid: 'Phiên bản Android',
    modalKernel: 'Phiên bản Kernel',
    modalSublevel: 'Sublevel',
    modalPatch: 'Mức bản vá bảo mật',
    modalSectionSource: 'Mã nguồn',
    modalRepoInit: 'Repo Init',
    modalSectionSusfs: 'Patch SUSFS',
    modalSusfsClone: 'Clone',
    modalSectionKittisu: 'KittiSU',
    modalKittisuRepo: 'Repo',
    modalKittisuBranch: 'Branch / Commit',
    copy: 'Sao chép',
    copied: 'Đã chép',
    tcTitle: 'Đổi múi giờ',
    tcDate: 'Ngày',
    tcTime: 'Giờ (UTC)',
    tcToast: 'Đã sao chép',
    langSwitch: '中文',
    searchPlaceholder: 'Tìm ngày hoặc phiên bản kernel\u2026',
    noResults: 'Không có kết quả',
    newBadge: 'MỚI',
    susfsCompat: 'SUSFS',
    guide: 'Hướng dẫn',
  },
  zh: {
    title: 'KittiSU GKI 内核',
    subtitle: '使用 KittiSU + SUSFS 构建 GKI 内核 \u2014 版本跟踪看板',
    light: '浅色',
    dark: '深色',
    loading: '正在加载内核数据\u2026',
    errorTitle: '加载内核数据失败。',
    errorHint: '请确保 <code>web/data/</code> 包含 JSON 文件。',
    releases: '发布数',
    first: '起始',
    latest: '最新',
    latestKernel: '最新内核',
    date: '安全补丁日期',
    kernelVersion: '内核版本',
    deprecated: '已弃用',
    deprecatedInfo: '不再接受安全补丁的合并',
    susfsCompatInfo: '安装 KittiSU 后可直接使用 SUSFS 补丁，无需二次修复',
    footerPre: '数据来源于',
    footerPost: '。通过 GitHub Actions 自动更新。Powered by KittiSU。',
    announce: '公告',
    announceClose: '关闭',
    announceDismiss: '今日不再显示',
    modalTitle: 'GitHub Action 参数',
    modalAndroid: 'Android 版本',
    modalKernel: '内核版本',
    modalSublevel: '子版本号',
    modalPatch: '安全补丁级别',
    modalSectionSource: '源码拉取',
    modalRepoInit: 'Repo 初始化',
    modalSectionSusfs: 'SUSFS 补丁拉取',
    modalSusfsClone: '克隆',
    modalSectionKittisu: 'KittiSU',
    modalKittisuRepo: '仓库',
    modalKittisuBranch: '分支 / 提交',
    copy: '复制',
    copied: '已复制',
    tcTitle: '时间转换',
    tcDate: '日期',
    tcTime: '时间 (UTC)',
    tcToast: '已复制到剪贴板',
    langSwitch: 'EN',
    searchPlaceholder: '搜索日期或内核版本\u2026',
    noResults: '无匹配结果',
    newBadge: '最新',
    susfsCompat: 'SUSFS兼容',
    guide: '教程',
  },
};

// 语言优先级：localStorage > navigator.language
var savedLang = localStorage.getItem('lang');
function detectLang() {
  if (savedLang && I18N[savedLang]) return savedLang;
  var nav = (navigator.language || 'en').toLowerCase();
  if (/^vi\b/.test(nav)) return 'vi';
  if (/^zh\b/.test(nav)) return 'zh';
  return 'en';
}
export var lang = detectLang();
export var t = I18N[lang];

var LANG_ORDER = ['en', 'vi', 'zh'];

/**
 * 初始化 i18n：设置页面语言属性、静态文本、语言切换按钮
 */
export function initI18n() {
  var htmlLang = lang === 'zh' ? 'zh-CN' : (lang === 'vi' ? 'vi' : 'en');
  document.documentElement.lang = htmlLang;

  document.getElementById('headerTitle').textContent = t.title;
  document.getElementById('headerSubtitle').textContent = t.subtitle;
  document.getElementById('loadingText').textContent = t.loading;
  document.getElementById('footerPre').textContent = t.footerPre;
  document.getElementById('footerPost').textContent = t.footerPost;
  document.getElementById('tcTitle').textContent = t.tcTitle;
  document.getElementById('tcDateLabel').textContent = t.tcDate;
  document.getElementById('tcTimeLabel').textContent = t.tcTime;
  document.getElementById('tcCopy').textContent = t.copy;
  document.getElementById('guideLabel').textContent = t.guide;
  document.title = t.title;

  var langBtn = document.getElementById('langToggle');
  var langLabel = document.getElementById('langLabel');
  if (langLabel) langLabel.textContent = t.langSwitch;

  if (langBtn) {
    langBtn.addEventListener('click', function () {
      var idx = LANG_ORDER.indexOf(lang);
      var next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
      localStorage.setItem('lang', next);
      location.reload();
    });
  }
}
