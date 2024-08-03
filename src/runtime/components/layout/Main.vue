<template>
  <div :class="mainClass" v-bind="attrs">
    <slot />
  </div>
</template>

<script lang="ts">
import { computed, toRef, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { twMerge, twJoin } from 'tailwind-merge'
import { useUI } from '../../composables/useUI'
import { mergeConfig } from '../../utils'
import type { Strategy } from '../../types'
// @ts-expect-error
import appConfig from '#build/app.config'
import { main } from '#ui/ui.config'

const config = mergeConfig<typeof main>(appConfig.ui.strategy, appConfig.ui.main, main)

export default defineComponent({
  inheritAttrs: false,
  props: {
    class: {
      type: [String, Object, Array] as PropType<any>,
      default: () => ''
    },
    ui: {
      type: Object as PropType<Partial<typeof config> & { strategy?: Strategy }>,
      default: () => ({})
    }
  },
  setup (props) {
    const { ui, attrs } = useUI('main', toRef(props, 'ui'), config)

    const mainClass = computed(() => {
      return twMerge(twJoin(
        ui.value.wrapper
      ), props.class)
    })

    return {
      attrs,
      mainClass
    }
  }
})
</script>

<style scoped>

</style>
