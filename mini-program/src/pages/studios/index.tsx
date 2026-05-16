import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getCities, getStudios } from '../../services/studio'
import type { StudioListItem } from '../../types'
import './index.scss'

export default function Studios() {
  const router = useRouter()
  const initialCity = decodeURIComponent(router.params.city || '')

  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [studios, setStudios] = useState<StudioListItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    loadCities()
  }, [])

  useEffect(() => {
    loadStudios()
  }, [selectedCity, searchKeyword])

  async function loadCities() {
    try {
      const list = await getCities()
      setCities(list)
    } catch (e) {
      // cities 加载失败不阻塞主流程
    }
  }

  async function loadStudios() {
    try {
      setLoading(true)
      setError('')
      const res = await getStudios({
        city: selectedCity,
        search: searchKeyword,
        size: 200,
      })
      setStudios(res.items || [])
      setTotal(res.total || 0)
    } catch (e) {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((e) => {
    setSearchKeyword(e.detail.value)
  }, [])

  function handleCitySelect(city: string) {
    if (selectedCity === city) {
      setSelectedCity('')
    } else {
      setSelectedCity(city)
    }
  }

  function clearSearch() {
    setSearchKeyword('')
  }

  function handleStudioClick(id: number) {
    Taro.navigateTo({ url: `/pages/studio-detail/index?id=${id}` })
  }

  function handleSubmit() {
    Taro.navigateTo({ url: '/pages/submit-studio/index' })
  }

  function handleFeedback() {
    Taro.navigateTo({ url: '/pages/feedback/index' })
  }

  function getPriceLabel(studio: StudioListItem): string {
    if (studio.charging_method) return studio.charging_method
    if (studio.price_per_hour) return `${studio.price_per_hour}元/时`
    if (studio.price_per_day) return `${studio.price_per_day}元/天`
    return '详询'
  }

  function getLocationText(studio: StudioListItem): string {
    const parts: string[] = []
    if (studio.district) parts.push(studio.district)
    if (studio.address) parts.push(studio.address)
    return parts.join(' · ') || studio.city || ''
  }

  return (
    <View className='page-studios'>
      {/* Search Bar */}
      <View className='search-bar'>
        <View className='search-input-wrap'>
          <Text className='search-icon'>&#x1F50D;</Text>
          <Input
            className='search-input'
            placeholder='搜索录音室名称或地址'
            placeholderClass='search-placeholder'
            value={searchKeyword}
            onInput={handleSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            confirmType='search'
          />
          {searchKeyword ? (
            <Text className='search-clear' onClick={clearSearch}>✕</Text>
          ) : null}
        </View>
      </View>

      {/* City Filter */}
      <ScrollView scrollX className='city-filter'>
        <View className='city-chips'>
          <Text
            className={`city-chip ${!selectedCity ? 'city-chip--active' : ''}`}
            onClick={() => handleCitySelect('')}
          >
            全部
          </Text>
          {cities.map(city => (
            <Text
              key={city}
              className={`city-chip ${selectedCity === city ? 'city-chip--active' : ''}`}
              onClick={() => handleCitySelect(city)}
            >
              {city}
            </Text>
          ))}
        </View>
      </ScrollView>

      {/* Result Summary */}
      <View className='result-bar'>
        <Text className='result-text'>
          {selectedCity ? `${selectedCity} · ` : ''}
          {loading ? '加载中...' : `${total} 间录音室`}
        </Text>
      </View>

      {/* Studio List */}
      {loading ? (
        <View className='studio-list'>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} className='list-card list-card--skeleton'>
              <View className='sk-cover' />
              <View className='sk-info'>
                <View className='sk-bar sk-bar--lg' />
                <View className='sk-bar sk-bar--md' />
                <View className='sk-bar sk-bar--sm' />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <View className='state-block'>
          <Text className='state-text'>{error}</Text>
          <View className='state-btn' onClick={loadStudios}>
            <Text className='state-btn-text'>重新加载</Text>
          </View>
        </View>
      ) : studios.length === 0 ? (
        <View className='state-block'>
          <Text className='state-text'>
            {searchKeyword
              ? `没有找到"${searchKeyword}"相关的录音室`
              : selectedCity
                ? `${selectedCity}暂无录音室`
                : '暂无录音室数据'}
          </Text>
          {searchKeyword ? (
            <View className='state-btn' onClick={clearSearch}>
              <Text className='state-btn-text'>清除搜索</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <ScrollView scrollY className='studio-scroll'>
          <View className='studio-list'>
            {studios.map(studio => (
              <View
                key={studio.id}
                className='list-card'
                onClick={() => handleStudioClick(studio.id)}
              >
                {studio.cover_image ? (
                  <Image
                    className='card-cover'
                    src={studio.cover_image}
                    mode='aspectFill'
                  />
                ) : (
                  <View className='card-cover card-cover--empty'>
                    <Text className='cover-letter'>
                      {studio.name.slice(0, 1)}
                    </Text>
                  </View>
                )}
                <View className='card-body'>
                  <Text className='card-name'>{studio.name}</Text>
                  <View className='card-tags'>
                    <Text className='card-price'>{getPriceLabel(studio)}</Text>
                    {studio.capacity ? (
                      <Text className='card-capacity'>容纳{studio.capacity}人</Text>
                    ) : null}
                  </View>
                  <Text className='card-location'>{getLocationText(studio)}</Text>
                </View>
              </View>
            ))}
          </View>
          {/* Bottom Actions */}
          <View className='studios-actions'>
            <View className='action-btn action-btn--primary' onClick={handleSubmit}>
              <Text className='action-text action-text--primary'>提交录音室</Text>
            </View>
            <View className='action-btn action-btn--secondary' onClick={handleFeedback}>
              <Text className='action-text action-text--secondary'>意见反馈</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}
