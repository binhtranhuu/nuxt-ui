<template>
  <transition name="backtop-fade-in">
    <div
      v-if="visible"
      :style="backTopStyle"
      :class="wrapperClass"
    >
      <slot name="default" v-bind="{ handleClick }">
        <UButton
          v-bind="{ ...(ui.default.backtopButton || {}), ...backtopButton }"
          @click="handleClick"
        />
      </slot>
    </div>
  </transition>
</template>

<script lang="ts">
import { computed, defineComponent, ref, shallowRef, onMounted, toRef } from 'vue'
import type { PropType } from 'vue'
import { twMerge, twJoin } from 'tailwind-merge'
import { useEventListener, useThrottleFn } from '@vueuse/core'
import { useUI } from '../../composables/useUI'
import { mergeConfig } from '../../utils'
import type { Button, Strategy } from '../../types'
// @ts-expect-error
import appConfig from '#build/app.config'
import { backtop } from '#ui/ui.config'

const config = mergeConfig<typeof backtop>(appConfig.ui.strategy, appConfig.ui.backtop, backtop)

export default defineComponent({

  inheritAttrs: false,
  props: {
    /**
   * @description the button will not show until the scroll height reaches this value.
   */
    visibilityHeight: {
      type: Number,
      default: 200
    },
    /**
     * @description the target to trigger scroll.
     */
    target: {
      type: String,
      default: ''
    },
    /**
     * @description right distance.
     */
    right: {
      type: Number,
      default: 40
    },
    /**
     * @description bottom distance.
     */
    bottom: {
      type: Number,
      default: 40
    },
    backtopButton: {
      type: Object as PropType<Button>,
      default: () => config.default.backtopButton as Button
    },
    class: {
      type: [String, Object, Array] as PropType<any>,
      default: () => ''
    },
    ui: {
      type: Object as PropType<Partial<typeof config> & { strategy?: Strategy }>,
      default: () => ({})
    }
  },
  emits: ['click'],
  setup (props, { emit }) {
    const { ui, attrs } = useUI('backtop', toRef(props, 'ui'), config, toRef(props, 'class'))

    const el = shallowRef<HTMLElement>()
    const container = shallowRef<Document | HTMLElement>()
    const visible = ref(false)

    const handleScroll = () => {
      if (el.value) visible.value = el.value.scrollTop >= props.visibilityHeight
    }

    const handleClick = (event: MouseEvent) => {
      el.value?.scrollTo({ top: 0, behavior: 'smooth' })
      emit('click', event)
    }

    const handleScrollThrottled = useThrottleFn(handleScroll, 300, true)

    useEventListener(container, 'scroll', handleScrollThrottled)
    onMounted(() => {
      container.value = document
      el.value = document.documentElement

      if (props.target) {
        el.value = document.querySelector<HTMLElement>(props.target) ?? undefined
        if (!el.value) {
          throw new Error(`Target does not exist: ${props.target}`)
        }
        container.value = el.value
      }
      // Give visible an initial value, fix #13066
      handleScroll()
    })

    const backTopStyle = computed(() => ({
      right: `${props.right}px`,
      bottom: `${props.bottom}px`
    }))

    const wrapperClass = computed(() => {
      return twMerge(twJoin(
        ui.value.wrapper
      ), props.class)
    })

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      visible,
      backTopStyle,
      wrapperClass,
      handleClick
    }
  }
})
</script>

<style scoped>
.backtop-fade-in-enter-active,
.backtop-fade-in-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.backtop-fade-in-enter-from,
.backtop-fade-in-leave-active {
  opacity: 0;
}
</style>
