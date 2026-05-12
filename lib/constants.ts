/** 高德地图 API Key（从环境变量读取） */
export const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_JS_KEY || ''

/** 已知的城市中心坐标（新增城市时追加即可，API 动态城市的 fallback 按录音室坐标平均值计算） */
export const CITY_CENTERS: Record<string, [number, number]> = {
  '上海': [121.47, 31.23],
  '北京': [116.40, 39.90],
  '深圳': [114.06, 22.55],
  '广州': [113.26, 23.13],
  '成都': [104.07, 30.67],
  '杭州': [120.15, 30.28],
  '福州': [119.30, 26.08],
  '天津': [117.20, 39.13],
  '景德镇': [117.21, 29.29],
}

/** 全国地图默认中心点 */
export const NATIONAL_MAP_CENTER: [number, number] = [104.1954, 35.8617]

/** 全国地图默认缩放级别 */
export const NATIONAL_MAP_ZOOM = 4.8

/** sessionStorage 缓存前缀 */
export const STUDIOS_CACHE_PREFIX = 'podcasthub:studios:'

/** sessionStorage 缓存有效期（毫秒） */
export const STUDIOS_CACHE_TTL = 5 * 60 * 1000
