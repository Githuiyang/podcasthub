import { View, Text } from '@tarojs/components'
import './index.scss'

export default function Feedback() {
  return (
    <View className='page-feedback'>
      <View className='feedback-card'>
        <Text className='feedback-title'>意见反馈</Text>
        <Text className='feedback-desc'>
          无论是使用的体验还是功能的期待，欢迎提出你的建议。
        </Text>
        <View className='feedback-hint'>
          <Text className='hint-text'>功能开发中，敬请期待</Text>
        </View>
      </View>
    </View>
  )
}
