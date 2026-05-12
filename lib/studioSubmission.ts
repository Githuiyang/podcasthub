function normalizeUrl(value?: string) {
  return value?.trim().replace(/\/+$/, '') || ''
}

// 飞书问卷链接（收集入口，2026-04-12 更新）
export const STUDIO_SUBMISSION_FORM_URL =
  'https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15'

// 飞书结果表链接（整理和同步工作台）
export const STUDIO_RESULT_TABLE_URL =
  'https://my.feishu.cn/base/GbOqbmrqEaM7F2sWDhecsjr4nOd'
