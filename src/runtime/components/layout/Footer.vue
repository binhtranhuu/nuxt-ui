<template>
  <footer :class="wrapperClass" v-bind="attrs">
    <div v-if="$slots.top" :class="ui.top.wrapper">
      <div :class="ui.top.container">
        <slot name="top" />
      </div>
    </div>
    <div :class="ui.bottom.wrapper">
      <div :class="ui.bottom.container">
        <div v-if="$slots.left" :class="ui.bottom.left">
          <slot name="left" />
        </div>
        <div v-if="$slots.center" :class="ui.bottom.center">
          <slot name="center" />
        </div>
        <div v-if="$slots.right" :class="ui.bottom.right">
          <slot name="right" />
        </div>
      </div>
    </div>
  </footer>
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
import { footer } from '#ui/ui.config'

const config = mergeConfig<typeof footer>(appConfig.ui.strategy, appConfig.ui.footer, footer)

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
    const { ui, attrs } = useUI('footer', toRef(props, 'ui'), config)

    const wrapperClass = computed(() => {
      return twMerge(twJoin(
        ui.value.wrapper
      ), props.class)
    })

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      wrapperClass
    }
  }
})
</script>

<style scoped>

</style>
