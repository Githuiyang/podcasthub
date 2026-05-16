import { useState, useEffect, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getCities, getStudios } from '../../services/studio'
import type { StudioListItem } from '../../types'
import './index.scss'

/**
 * 首页 — 发现页（列表优先）
 *
 * 页面结构：品牌头部 → 城市入口 → 城市录音室卡片列表 → 操作入口 → 底部
 *
 * 职责分工：
 * - 首页：发现 + 浏览（城市筛选联动卡片列表）
 * - 列表页：筛选、比较、深度浏览
 * - 详情页：决策、预约、交通确认
 */
export default function Home() {
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [allStudios, setAllStudios] = useState<StudioListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      setError('')
      const [citiesList, studiosRes] = await Promise.all([
        getCities(),
        getStudios({ size: 50 }),
      ])
      setCities(citiesList)
      setAllStudios(studiosRes.items || [])
      // 默认选中第一个城市
      if (citiesList.length > 0) {
        setSelectedCity(citiesList[0])
      }
    } catch (e) {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 按城市筛选录音室
  const displayStudios = useMemo(() => {
    if (!selectedCity) return allStudios.slice(0, 8)
    return allStudios.filter(s => s.city === selectedCity).slice(0, 8)
  }, [allStudios, selectedCity])

  function handleCityClick(city: string) {
    setSelectedCity(city)
  }

  function handleStudioClick(id: number) {
    Taro.navigateTo({ url: `/pages/studio-detail/index?id=${id}` })
  }

  function handleViewAll() {
    Taro.switchTab({ url: '/pages/studios/index' })
  }

  function handleSubmit() {
    Taro.navigateTo({ url: '/pages/submit-studio/index' })
  }

  function handleFeedback() {
    Taro.navigateTo({ url: '/pages/feedback/index' })
  }

  function getPriceText(studio: StudioListItem): string {
    if (studio.charging_method) return studio.charging_method
    return '详询'
  }

  function getDistrict(studio: StudioListItem): string {
    if (studio.district) return studio.district
    if (studio.city) return studio.city
    return ''
  }

  return (
    <ScrollView scrollY className='page-home'>
      {/* 品牌头部 */}
      <View className='home-header'>
        <Text className='home-title'>PodcastHub</Text>
        <Text className='home-subtitle'>找到适合你的播客录音室</Text>
      </View>

      {/* 城市入口 — 选中城市后筛选下方录音室列表 */}
      <View className='home-section'>
        <View className='section-header'>
          <Text className='section-title'>按城市查看</Text>
        </View>
        {loading ? (
          <View className='city-grid'>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <View key={i} className='city-item city-item--skeleton'>
                <View className='skeleton-bar' />
              </View>
            ))}
          </View>
        ) : (
          <View className='city-grid'>
            {cities.map(city => (
              <View
                key={city}
                className={`city-item ${selectedCity === city ? 'city-item--active' : ''}`}
                onClick={() => handleCityClick(city)}
              >
                <Text className={`city-name ${selectedCity === city ? 'city-name--active' : ''}`}>
                  {city}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 城市录音室列表 */}
      <View className='home-section'>
        <View className='section-header'>
          <Text className='section-title'>
            {selectedCity ? `${selectedCity}的录音室` : '推荐录音室'}
          </Text>
          <Text className='section-action' onClick={handleViewAll}>
            查看全部
          </Text>
        </View>
        {loading ? (
          <View className='studio-list'>
            {[1, 2, 3].map(i => (
              <View key={i} className='studio-card studio-card--skeleton'>
                <View className='skeleton-block' />
              </View>
            ))}
          </View>
        ) : error ? (
          <View className='empty-state'>
            <Text className='empty-text'>{error}</Text>
            <View className='retry-btn' onClick={loadData}>
              <Text className='retry-text'>重新加载</Text>
            </View>
          </View>
        ) : displayStudios.length === 0 ? (
          <View className='empty-state'>
            <Text className='empty-text'>
              {selectedCity ? `${selectedCity}暂无录音室` : '暂无录音室数据'}
            </Text>
          </View>
        ) : (
          <View className='studio-list'>
            {displayStudios.map(studio => (
              <View
                key={studio.id}
                className='studio-card'
                onClick={() => handleStudioClick(studio.id)}
              >
                {/* 封面 */}
                {studio.cover_image ? (
                  <Image
                    className='studio-cover'
                    src={studio.cover_image}
                    mode='aspectFill'
                  />
                ) : (
                  <View className='studio-cover studio-cover--placeholder'>
                    <Text className='placeholder-letter'>
                      {studio.name.slice(0, 1)}
                    </Text>
                  </View>
                )}
                {/* 信息区 */}
                <View className='studio-body'>
                  <View className='studio-top'>
                    <Text className='studio-name'>{studio.name}</Text>
                    <View className='studio-price-badge'>
                      <Text className='price-badge-text'>{getPriceText(studio)}</Text>
                    </View>
                  </View>
                  <Text className='studio-district'>{getDistrict(studio)}</Text>
                  {studio.address && (
                    <Text className='studio-address'>{studio.address}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* 操作入口 */}
      <View className='home-actions'>
        <View className='action-btn action-btn--primary' onClick={handleSubmit}>
          <Text className='action-text action-text--primary'>提交录音室</Text>
        </View>
        <View className='action-btn action-btn--secondary' onClick={handleFeedback}>
          <Text className='action-text action-text--secondary'>意见反馈</Text>
        </View>
      </View>

      {/* 底部文案 */}
      <View className='home-footer'>
        <Text className='footer-text'>PodcastHub · 全国播客录音室平台</Text>
      </View>
    </ScrollView>
  )
}
