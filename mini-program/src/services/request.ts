import Taro from '@tarojs/taro'

export const API_BASE = 'https://api.daydayup.media'

export function request<T>(url: string, options?: { params?: Record<string, string | number> }): Promise<T> {
  let fullUrl = `${API_BASE}${url}`
  if (options?.params) {
    const qs = Object.entries(options.params)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&')
    if (qs) fullUrl += `?${qs}`
  }

  return Taro.request({ url: fullUrl, method: 'GET' }).then(res => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T
    }
    throw new Error(`API Error: ${res.statusCode}`)
  })
}
