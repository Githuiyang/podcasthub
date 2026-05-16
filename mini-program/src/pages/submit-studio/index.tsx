import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const FEISHU_FORM_URL = 'https://my.feishu.cn/share/base/form/shrcn9doOMBwCO0nL76ovDqMG15'

export default function SubmitStudio() {
  function handleOpenForm() {
    Taro.setClipboardData({
      data: FEISHU_FORM_URL,
      success: () => {
        Taro.showToast({ title: '链接已复制，请在浏览器打开', icon: 'none', duration: 2500 })
      },
    })
  }

  return (
    <View className='page-submit'>
      <View className='submit-card'>
        <Text className='submit-title'>提交录音室</Text>
        <Text className='submit-desc'>
          如果你是录音室主理人，欢迎把录音室信息提交给我们，审核通过后会展示在平台上。
        </Text>
        <View className='submit-steps'>
          <Text className='step-text'>1. 复制问卷链接</Text>
          <Text className='step-text'>2. 在浏览器中打开并填写</Text>
          <Text className='step-text'>3. 等待人工审核确认</Text>
          <Text className='step-text'>4. 审核通过后自动上线</Text>
        </View>
        <View className='submit-btn' onClick={handleOpenForm}>
          <Text className='submit-btn-text'>复制问卷链接</Text>
        </View>
      </View>
    </View>
  )
}
