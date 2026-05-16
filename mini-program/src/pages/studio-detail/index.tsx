import { useState, useEffect } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getStudioDetail } from '../../services/studio'
import type { Studio } from '../../types'
import './index.scss'

export default function StudioDetail() {
  const router = useRouter()
  const id = Number(router.params.id)

  const [studio, setStudio] = useState<Studio | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) loadDetail()
  }, [id])

  async function loadDetail() {
    try {
      setLoading(true)
      setError('')
      const data = await getStudioDetail(id)
      setStudio(data)
      Taro.setNavigationBarTitle({ title: data.name || '录音室详情' })
    } catch (e) {
      setError('加载失败')
    } finally {
      setLoading(false)
    }
  }

  function getPriceText(s: Studio): string {
    if (s.charging_method) return s.charging_method
    if (s.price_per_hour) return `${s.price_per_hour}元/小时`
    if (s.price_per_day) return `${s.price_per_day}元/天`
    return '详询'
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

  function handleBooking() {
    if (!studio) return
    if (studio.booking_url) {
      copyText(studio.booking_url, '预约链接')
    }
  }

  // ---------- Loading ----------
  if (loading) {
    return (
      <View className='page-detail'>
        <View className='dt-header dt-header--skeleton'>
          <View className='sk-line sk-line--xl' />
          <View className='sk-line sk-line--md' />
        </View>
        <View className='dt-body'>
          {[1, 2, 3, 4].map(i => (
            <View key={i} className='dt-section dt-section--skeleton'>
              <View className='sk-line sk-line--sm' />
              <View className='sk-line sk-line--lg' />
            </View>
          ))}
        </View>
      </View>
    )
  }

  // ---------- Error ----------
  if (error || !studio) {
    return (
      <View className='page-detail'>
        <View className='dt-error'>
          <Text className='dt-error-text'>{error || '录音室不存在'}</Text>
          <View className='dt-error-btn' onClick={loadDetail}>
            <Text className='dt-error-btn-text'>重新加载</Text>
          </View>
        </View>
      </View>
    )
  }

  const s = studio
  const hasPrice = s.charging_method || s.price_per_hour || s.price_per_day || s.price_note
  const hasBooking = s.booking_url || s.booking_note || s.booking_qr_image
  const hasContact = s.contact_name || s.contact_phone || s.contact_wechat || s.contact_info
  const hasEquipment = s.equipment && s.equipment.length > 0
  const hasImages = s.portfolio_images && s.portfolio_images.length > 0

  return (
    <ScrollView scrollY className='page-detail'>
      {/* Header */}
      <View className='dt-header'>
        <Text className='dt-name'>{s.name}</Text>
        <View className='dt-tags'>
          {s.tags && s.tags.map(tag => (
            <Text key={tag} className='dt-tag'>{tag}</Text>
          ))}
          {s.capacity ? (
            <Text className='dt-tag dt-tag--muted'>容纳{s.capacity}人</Text>
          ) : null}
          {s.room_count > 1 ? (
            <Text className='dt-tag dt-tag--muted'>{s.room_count}间录音室</Text>
          ) : null}
        </View>
      </View>

      {/* Cover Image */}
      {s.cover_image ? (
        <View className='dt-cover'>
          <Image className='dt-cover-img' src={s.cover_image} mode='widthFix' />
        </View>
      ) : null}

      {/* Address */}
      {(s.city || s.address) ? (
        <View className='dt-section'>
          <Text className='dt-label'>地址</Text>
          <Text
            className='dt-value dt-value--link'
            onClick={() => {
              const addr = [s.city, s.district, s.address].filter(Boolean).join(' ')
              if (addr) copyText(addr, '地址')
            }}
          >
            {[s.city, s.district, s.address].filter(Boolean).join(' ')}
          </Text>
        </View>
      ) : null}

      {/* Price */}
      {hasPrice ? (
        <View className='dt-section'>
          <Text className='dt-label'>价格</Text>
          <View className='dt-price-row'>
            <Text className='dt-price-main'>{getPriceText(s)}</Text>
          </View>
          {s.price_note ? (
            <Text className='dt-note'>{s.price_note}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Open Hours */}
      {s.open_hours ? (
        <View className='dt-section'>
          <Text className='dt-label'>开放时间</Text>
          <Text className='dt-value'>{s.open_hours}</Text>
        </View>
      ) : null}

      {/* Booking */}
      {hasBooking ? (
        <View className='dt-section'>
          <Text className='dt-label'>预约方式</Text>
          {s.booking_note ? (
            <Text className='dt-value'>{s.booking_note}</Text>
          ) : null}
          {s.booking_qr_image ? (
            <View className='dt-qr'>
              <Image className='dt-qr-img' src={s.booking_qr_image} mode='widthFix' />
              <Text className='dt-qr-hint'>扫码预约</Text>
            </View>
          ) : null}
          {s.booking_url ? (
            <View className='dt-action-btn' onClick={handleBooking}>
              <Text className='dt-action-text'>复制预约链接</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Equipment */}
      {hasEquipment ? (
        <View className='dt-section'>
          <Text className='dt-label'>设备</Text>
          <View className='dt-chips'>
            {s.equipment!.map(eq => (
              <Text key={eq} className='dt-chip'>{eq}</Text>
            ))}
          </View>
        </View>
      ) : null}

      {/* Description */}
      {s.description ? (
        <View className='dt-section'>
          <Text className='dt-label'>介绍</Text>
          <Text className='dt-value dt-value--block'>{s.description}</Text>
        </View>
      ) : null}

      {/* Contact */}
      {hasContact ? (
        <View className='dt-section'>
          <Text className='dt-label'>联系方式</Text>
          {s.contact_name ? (
            <Text className='dt-value'>联系人：{s.contact_name}</Text>
          ) : null}
          {s.contact_phone ? (
            <Text
              className='dt-value dt-value--link'
              onClick={() => handleCall(s.contact_phone!)}
            >
              电话：{s.contact_phone}
            </Text>
          ) : null}
          {s.contact_wechat ? (
            <Text
              className='dt-value dt-value--link'
              onClick={() => copyText(s.contact_wechat!, '微信号')}
            >
              微信：{s.contact_wechat}
            </Text>
          ) : null}
          {s.contact_info && !s.contact_phone && !s.contact_wechat ? (
            <Text
              className='dt-value dt-value--link'
              onClick={() => copyText(s.contact_info!, '联系方式')}
            >
              {s.contact_info}
            </Text>
          ) : null}
        </View>
      ) : null}

      {/* Images */}
      {hasImages ? (
        <View className='dt-section'>
          <Text className='dt-label'>图片</Text>
          <ScrollView scrollX className='dt-images'>
            {s.portfolio_images!.map((img, i) => (
              <Image key={i} className='dt-img' src={img} mode='aspectFill' onClick={() => {
                Taro.previewImage({ current: img, urls: s.portfolio_images! })
              }} />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Bottom Spacer */}
      <View className='dt-bottom' />
    </ScrollView>
  )
}
