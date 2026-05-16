import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getEditorDetail, getBusinessDetail } from '../../services/creator'
import type { Editor, Business } from '../../types'
import './index.scss'

type CreatorKind = 'editor' | 'business'

export default function CreatorDetail() {
  const router = useRouter()
  const id = Number(router.params.id)
  const kind = (router.params.kind || 'editor') as CreatorKind

  const [editorData, setEditorData] = useState<Editor | null>(null)
  const [businessData, setBusinessData] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id && kind) loadDetail()
  }, [id, kind])

  async function loadDetail() {
    try {
      setLoading(true)
      setError('')
      if (kind === 'editor') {
        const data = await getEditorDetail(id)
        setEditorData(data)
        Taro.setNavigationBarTitle({ title: data.name || '剪辑师详情' })
      } else {
        const data = await getBusinessDetail(id)
        setBusinessData(data)
        Taro.setNavigationBarTitle({ title: data.name || '制作人详情' })
      }
    } catch (e) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  function copyText(text: string, label: string) {
    Taro.setClipboardData({
      data: text,
      success: () => Taro.showToast({ title: `${label}已复制`, icon: 'none', duration: 1500 }),
    })
  }

  function handleCall(phone: string) {
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {
      copyText(phone, '电话号码')
    })
  }

  function getEditorPriceText(e: Editor): string {
    if (e.price_note) return e.price_note
    if (e.price_per_episode) return `${e.price_per_episode}元/期`
    if (e.price_per_hour) return `${e.price_per_hour}元/小时`
    return '详询'
  }

  // ---------- Loading ----------
  if (loading) {
    return (
      <View className='page-cd'>
        <View className='cd-header cd-header--skeleton'>
          <View className='sk-circle' />
          <View className='sk-lines'>
            <View className='sk-bar sk-bar--lg' />
            <View className='sk-bar sk-bar--md' />
          </View>
        </View>
        <View className='cd-body'>
          {[1, 2, 3, 4].map(i => (
            <View key={i} className='cd-section cd-section--skeleton'>
              <View className='sk-bar sk-bar--sm' />
              <View className='sk-bar sk-bar--lg' />
            </View>
          ))}
        </View>
      </View>
    )
  }

  // ---------- Error ----------
  if (error || (!editorData && !businessData)) {
    return (
      <View className='page-cd'>
        <View className='cd-error'>
          <Text className='cd-error-text'>{error || '创作者不存在'}</Text>
          <View className='cd-error-btn' onClick={loadDetail}>
            <Text className='cd-error-btn-text'>重新加载</Text>
          </View>
        </View>
      </View>
    )
  }

  const data = kind === 'editor' ? editorData! : businessData!
  const hasAvatar = !!data.avatar
  const hasBio = !!data.bio
  const hasTags = data.tags && data.tags.length > 0
  const hasContact = data.contact_phone || data.contact_wechat || data.contact_email

  return (
    <ScrollView scrollY className='page-cd'>
      {/* Shared Header: Avatar + Name + Tags + Bio */}
      <View className='cd-header'>
        {hasAvatar ? (
          <Image className='cd-avatar' src={data.avatar!} mode='aspectFill' />
        ) : (
          <View className='cd-avatar cd-avatar--placeholder'>
            <Text className='cd-avatar-letter'>{data.name.slice(0, 1)}</Text>
          </View>
        )}
        <Text className='cd-name'>{data.name}</Text>
        {kind === 'editor' && editorData!.editor_type ? (
          <Text className='cd-type-badge'>{editorData!.editor_type}</Text>
        ) : null}
        {kind === 'editor' && editorData!.availability_status ? (
          <Text className='cd-status-badge'>{editorData!.availability_status}</Text>
        ) : null}
        {kind === 'business' && businessData!.company ? (
          <Text className='cd-company-badge'>{businessData!.company}</Text>
        ) : null}
        {hasTags ? (
          <View className='cd-tags'>
            {data.tags!.map(tag => (
              <Text key={tag} className='cd-tag'>{tag}</Text>
            ))}
          </View>
        ) : null}
        {hasBio ? (
          <Text className='cd-bio'>{data.bio}</Text>
        ) : null}
      </View>

      {/* Editor-specific sections */}
      {kind === 'editor' && editorData && (
        <>
          {/* Skills */}
          {editorData.skills && editorData.skills.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>技能</Text>
              <View className='cd-chips'>
                {editorData.skills.map(s => (
                  <Text key={s} className='cd-chip'>{s}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Software */}
          {editorData.software && editorData.software.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>软件</Text>
              <View className='cd-chips'>
                {editorData.software.map(s => (
                  <Text key={s} className='cd-chip'>{s}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Experience */}
          {editorData.experience_years > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>经验</Text>
              <Text className='cd-value'>{editorData.experience_years}年</Text>
            </View>
          ) : null}

          {/* Specialties */}
          {editorData.specialties && editorData.specialties.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>擅长方向</Text>
              <View className='cd-chips'>
                {editorData.specialties.map(s => (
                  <Text key={s} className='cd-chip'>{s}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Strengths */}
          {editorData.strengths ? (
            <View className='cd-section'>
              <Text className='cd-label'>优势</Text>
              <Text className='cd-value cd-value--block'>{editorData.strengths}</Text>
            </View>
          ) : null}

          {/* Pricing */}
          {editorData.price_note || editorData.price_per_episode || editorData.price_per_hour ? (
            <View className='cd-section'>
              <Text className='cd-label'>报价</Text>
              <Text className='cd-value'>{getEditorPriceText(editorData)}</Text>
            </View>
          ) : null}

          {/* Portfolio Works */}
          {editorData.portfolio_works ? (
            <View className='cd-section'>
              <Text className='cd-label'>过往作品</Text>
              <Text className='cd-value cd-value--block'>{editorData.portfolio_works}</Text>
            </View>
          ) : null}

          {/* Coop Review */}
          {editorData.coop_review ? (
            <View className='cd-section'>
              <Text className='cd-label'>合作评价</Text>
              <Text className='cd-value cd-value--block cd-quote'>{editorData.coop_review}</Text>
            </View>
          ) : null}

          {/* Portfolio Images */}
          {editorData.portfolio_images && editorData.portfolio_images.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>作品图片</Text>
              <ScrollView scrollX className='cd-images'>
                {editorData.portfolio_images.map((img, i) => (
                  <Image
                    key={i}
                    className='cd-img'
                    src={img}
                    mode='aspectFill'
                    onClick={() => Taro.previewImage({ current: img, urls: editorData.portfolio_images! })}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </>
      )}

      {/* Business-specific sections */}
      {kind === 'business' && businessData && (
        <>
          {/* Title */}
          {businessData.title ? (
            <View className='cd-section'>
              <Text className='cd-label'>职位</Text>
              <Text className='cd-value'>{businessData.title}</Text>
            </View>
          ) : null}

          {/* Business Type */}
          {businessData.business_type ? (
            <View className='cd-section'>
              <Text className='cd-label'>类型</Text>
              <Text className='cd-value'>{businessData.business_type}</Text>
            </View>
          ) : null}

          {/* Industry */}
          {businessData.industry ? (
            <View className='cd-section'>
              <Text className='cd-label'>行业</Text>
              <Text className='cd-value'>{businessData.industry}</Text>
            </View>
          ) : null}

          {/* Budget Range */}
          {businessData.budget_range ? (
            <View className='cd-section'>
              <Text className='cd-label'>预算范围</Text>
              <Text className='cd-value'>{businessData.budget_range}</Text>
            </View>
          ) : null}

          {/* Cooperation Types */}
          {businessData.cooperation_types && businessData.cooperation_types.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>合作类型</Text>
              <View className='cd-chips'>
                {businessData.cooperation_types.map(ct => (
                  <Text key={ct} className='cd-chip'>{ct}</Text>
                ))}
              </View>
            </View>
          ) : null}

          {/* Reference Podcasts */}
          {businessData.reference_podcasts && businessData.reference_podcasts.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>参考节目</Text>
              {businessData.reference_podcasts.map((podcast, i) => (
                <Text key={i} className='cd-value cd-value--block'>{podcast}</Text>
              ))}
            </View>
          ) : null}

          {/* Case Images */}
          {businessData.case_images && businessData.case_images.length > 0 ? (
            <View className='cd-section'>
              <Text className='cd-label'>案例图片</Text>
              <ScrollView scrollX className='cd-images'>
                {businessData.case_images.map((img, i) => (
                  <Image
                    key={i}
                    className='cd-img'
                    src={img}
                    mode='aspectFill'
                    onClick={() => Taro.previewImage({ current: img, urls: businessData.case_images! })}
                  />
                ))}
              </ScrollView>
            </View>
          ) : null}
        </>
      )}

      {/* Shared Contact Section */}
      {hasContact ? (
        <View className='cd-section'>
          <Text className='cd-label'>联系方式</Text>
          {data.contact_phone ? (
            <Text
              className='cd-value cd-value--link'
              onClick={() => handleCall(data.contact_phone!)}
            >
              电话：{data.contact_phone}
            </Text>
          ) : null}
          {data.contact_wechat ? (
            <Text
              className='cd-value cd-value--link'
              onClick={() => copyText(data.contact_wechat!, '微信号')}
            >
              微信：{data.contact_wechat}
            </Text>
          ) : null}
          {data.contact_email ? (
            <Text
              className='cd-value cd-value--link'
              onClick={() => copyText(data.contact_email!, '邮箱')}
            >
              邮箱：{data.contact_email}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Bottom Spacer */}
      <View className='cd-bottom' />
    </ScrollView>
  )
}
