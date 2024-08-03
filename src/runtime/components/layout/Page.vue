<template>
  <div :class="wrapperClass" v-bind="attrs">
    <div v-if="$slots.left" :class="ui.left">
      <slot name="left" />
    </div>

    <div :class="bodyClass">
      <slot />
    </div>

    <div v-if="$slots.right" :class="ui.right">
      <slot name="right" />
    </div>
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
import { page } from '#ui/ui.config'

const config = mergeConfig<typeof page>(appConfig.ui.strategy, appConfig.ui.page, page)

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
  setup (props, { slots }) {
    const { ui, attrs } = useUI('page', toRef(props, 'ui'), config)

    const wrapperClass = computed(() => {
      return twMerge(twJoin(
        ui.value.wrapper
      ), props.class)
    })

    const bodyClass = computed(() => {
      if (slots.left && slots.right) {
        return ui.value.center.narrow
      }

      if (slots.left || slots.right) {
        return ui.value.center.base
      }

      return ui.value.center.full
    })

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      wrapperClass,
      bodyClass
    }
  }
})
</script>

<style scoped>

</style>
