import { useState, useEffect, useCallback } from 'react'
import { View, Text, Image, ScrollView, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getEditors, getBusinessList } from '../../services/creator'
import type { EditorListItem, BusinessListItem } from '../../types'
import './index.scss'

type CreatorKind = 'editor' | 'business'

export default function Creators() {
  const [activeTab, setActiveTab] = useState<CreatorKind>('editor')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [editors, setEditors] = useState<EditorListItem[]>([])
  const [editorTotal, setEditorTotal] = useState(0)
  const [businessList, setBusinessList] = useState<BusinessListItem[]>([])
  const [businessTotal, setBusinessTotal] = useState(0)

  useEffect(() => {
    if (activeTab === 'editor') loadEditors()
    else loadBusiness()
  }, [activeTab, searchKeyword])

  async function loadEditors() {
    try {
      setLoading(true)
      setError('')
      const res = await getEditors({ search: searchKeyword, size: 200 })
      setEditors(res.items || [])
      setEditorTotal(res.total || 0)
    } catch (e) {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  async function loadBusiness() {
    try {
      setLoading(true)
      setError('')
      const res = await getBusinessList({ search: searchKeyword, size: 200 })
      setBusinessList(res.items || [])
      setBusinessTotal(res.total || 0)
    } catch (e) {
      setError('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = useCallback((e) => {
    setSearchKeyword(e.detail.value)
  }, [])

  function clearSearch() {
    setSearchKeyword('')
  }

  function handleEditorClick(id: number) {
    Taro.navigateTo({ url: `/pages/creator-detail/index?id=${id}&kind=editor` })
  }

  function handleBusinessClick(id: number) {
    Taro.navigateTo({ url: `/pages/creator-detail/index?id=${id}&kind=business` })
  }

  function getEditorPriceText(e: EditorListItem): string {
    if (e.price_note) return e.price_note
    if (e.price_per_episode) return `${e.price_per_episode}元/期`
    return '详询'
  }

  const total = activeTab === 'editor' ? editorTotal : businessTotal

  return (
    <View className='page-creators'>
      {/* Segment Control */}
      <View className='segment-bar'>
        <View
          className={`segment-item ${activeTab === 'editor' ? 'segment-item--active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Text className='segment-text'>剪辑师</Text>
        </View>
        <View
          className={`segment-item ${activeTab === 'business' ? 'segment-item--active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          <Text className='segment-text'>制作人</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View className='search-bar'>
        <View className='search-input-wrap'>
          <Text className='search-icon'>&#x1F50D;</Text>
          <Input
            className='search-input'
            placeholder={activeTab === 'editor' ? '搜索剪辑师' : '搜索制作人'}
            placeholderClass='search-placeholder'
            value={searchKeyword}
            onInput={handleSearch}
            confirmType='search'
          />
          {searchKeyword ? (
            <Text className='search-clear' onClick={clearSearch}>&#x2715;</Text>
          ) : null}
        </View>
      </View>

      {/* Result Summary */}
      <View className='result-bar'>
        <Text className='result-text'>
          {loading ? '加载中...' : `${total} 位${activeTab === 'editor' ? '剪辑师' : '制作人'}`}
        </Text>
      </View>

      {/* Content */}
      {loading ? (
        <View className='creator-list'>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} className='creator-card creator-card--skeleton'>
              <View className='sk-avatar' />
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
          <View className='state-btn' onClick={activeTab === 'editor' ? loadEditors : loadBusiness}>
            <Text className='state-btn-text'>重新加载</Text>
          </View>
        </View>
      ) : total === 0 ? (
        <View className='state-block'>
          <Text className='state-icon'>{activeTab === 'editor' ? '\uD83C\uDFA4' : '\uD83C\uDFA7'}</Text>
          <Text className='state-title'>
            {activeTab === 'editor' ? '剪辑师正在入驻中' : '制作人正在入驻中'}
          </Text>
          <Text className='state-subtitle'>
            {activeTab === 'editor'
              ? '优秀的播客剪辑师将在这里展示他们的技能和作品'
              : '播客生态商务伙伴将在这里展示合作机会'}
          </Text>
        </View>
      ) : activeTab === 'editor' ? (
        <ScrollView scrollY className='creator-scroll'>
          <View className='creator-list'>
            {editors.map(editor => (
              <View
                key={editor.id}
                className='creator-card'
                onClick={() => handleEditorClick(editor.id)}
              >
                {editor.avatar ? (
                  <Image className='card-avatar' src={editor.avatar} mode='aspectFill' />
                ) : (
                  <View className='card-avatar card-avatar--placeholder'>
                    <Text className='avatar-letter'>{editor.name.slice(0, 1)}</Text>
                  </View>
                )}
                <View className='card-body'>
                  <View className='card-top'>
                    <Text className='card-name'>{editor.name}</Text>
                    {editor.availability_status ? (
                      <Text className='card-status'>{editor.availability_status}</Text>
                    ) : null}
                  </View>
                  {editor.editor_type ? (
                    <Text className='card-type'>{editor.editor_type}</Text>
                  ) : null}
                  <View className='card-meta'>
                    {editor.experience_years > 0 ? (
                      <Text className='meta-item'>{editor.experience_years}年经验</Text>
                    ) : null}
                    <Text className='meta-item meta-item--price'>{getEditorPriceText(editor)}</Text>
                  </View>
                  {editor.skills && editor.skills.length > 0 ? (
                    <View className='card-skills'>
                      {editor.skills.slice(0, 3).map(skill => (
                        <Text key={skill} className='skill-tag'>{skill}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView scrollY className='creator-scroll'>
          <View className='creator-list'>
            {businessList.map(biz => (
              <View
                key={biz.id}
                className='creator-card'
                onClick={() => handleBusinessClick(biz.id)}
              >
                {biz.avatar ? (
                  <Image className='card-avatar' src={biz.avatar} mode='aspectFill' />
                ) : (
                  <View className='card-avatar card-avatar--placeholder'>
                    <Text className='avatar-letter'>{biz.name.slice(0, 1)}</Text>
                  </View>
                )}
                <View className='card-body'>
                  <View className='card-top'>
                    <Text className='card-name'>{biz.name}</Text>
                  </View>
                  {biz.company ? (
                    <Text className='card-company'>{biz.company}</Text>
                  ) : null}
                  <View className='card-meta'>
                    {biz.business_type ? (
                      <Text className='meta-item'>{biz.business_type}</Text>
                    ) : null}
                    {biz.budget_range ? (
                      <Text className='meta-item meta-item--price'>{biz.budget_range}</Text>
                    ) : null}
                  </View>
                  {biz.cooperation_types && biz.cooperation_types.length > 0 ? (
                    <View className='card-skills'>
                      {biz.cooperation_types.slice(0, 3).map(ct => (
                        <Text key={ct} className='skill-tag'>{ct}</Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
