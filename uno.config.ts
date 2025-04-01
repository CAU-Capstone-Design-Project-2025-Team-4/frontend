import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetIcons } from 'unocss'

export default defineConfig({
  rules: [
    ['font-pretendard', { 'font-family': 'Pretendard' }],
  ],
  presets: [
    presetWind4(),
    presetIcons()
  ]
})