<template>
  <div ref="root" :style="rootStyle">
    <div :class="{ 'fixed': fixed }" :style="affixStyle">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, shallowRef, onMounted, watch, watchEffect } from 'vue'
import type { CSSProperties } from 'vue'
import { camelize } from '@vue/shared'
import { isClient, useElementBounding, useEventListener, useWindowSize } from '@vueuse/core'

export default defineComponent({
  inheritAttrs: false,
  props: {
    /**
     * @description affix element zIndex value
     * */
    zIndex: {
      type: [Number, String],
      default: 100
    },
    /**
     * @description target container. (CSS selector)
     */
    target: {
      type: String,
      default: ''
    },
    /**
     * @description offset distance
     * */
    offset: {
      type: Number,
      default: 0
    },
    /**
     * @description position of affix
     * */
    position: {
      type: String,
      values: ['top', 'bottom'],
      default: 'top'
    }
  },
  emits: ['scroll', 'change'],
  setup (props, { emit }) {
    const target = shallowRef<HTMLElement>()
    const root = shallowRef<HTMLDivElement>()
    const scrollContainer = shallowRef<HTMLElement | Window>()
    const { height: windowHeight } = useWindowSize()
    const {
      height: rootHeight,
      width: rootWidth,
      top: rootTop,
      bottom: rootBottom,
      update: updateRoot
    } = useElementBounding(root, { windowScroll: false })
    const targetRect = useElementBounding(target)

    const fixed = ref(false)
    const scrollTop = ref(0)
    const transform = ref(0)

    const rootStyle = computed<CSSProperties>(() => {
      return {
        height: fixed.value ? `${rootHeight.value}px` : '',
        width: fixed.value ? `${rootWidth.value}px` : ''
      }
    })

    const affixStyle = computed<CSSProperties>(() => {
      if (!fixed.value) return {}

      const offset = props.offset || 0
      return {
        height: `${rootHeight.value}px`,
        width: `${rootWidth.value}px`,
        top: props.position === 'top' ? `${offset}px` : '',
        bottom: props.position === 'bottom' ? `${offset}px` : '',
        transform: transform.value ? `translateY(${transform.value}px)` : '',
        zIndex: props.zIndex
      }
    })

    const update = () => {
      if (!scrollContainer.value) return

      scrollTop.value =
        scrollContainer.value instanceof Window
          ? document.documentElement.scrollTop
          : scrollContainer.value.scrollTop || 0

      if (props.position === 'top') {
        if (props.target) {
          const difference =
            targetRect.bottom.value - props.offset - rootHeight.value
          fixed.value = props.offset > rootTop.value && targetRect.bottom.value > 0
          transform.value = difference < 0 ? difference : 0
        } else {
          fixed.value = props.offset > rootTop.value
        }
      } else if (props.target) {
        const difference =
          windowHeight.value -
          targetRect.top.value -
          props.offset -
          rootHeight.value
        fixed.value =
          windowHeight.value - props.offset < rootBottom.value &&
          windowHeight.value > targetRect.top.value
        transform.value = difference < 0 ? -difference : 0
      } else {
        fixed.value = windowHeight.value - props.offset < rootBottom.value
      }
    }

    const handleScroll = () => {
      updateRoot()
      emit('scroll', {
        scrollTop: scrollTop.value,
        fixed: fixed.value
      })
    }

    const getStyle = (
      element: HTMLElement,
      styleName: keyof CSSProperties
    ): string => {
      if (!isClient || !element || !styleName) return ''

      let key = camelize(styleName)
      if (key === 'float') key = 'cssFloat'
      try {
        const style = (element.style as any)[key]
        if (style) return style
        const computed: any = document.defaultView?.getComputedStyle(element, '')
        return computed ? computed[key] : ''
      } catch {
        return (element.style as any)[key]
      }
    }

    const isScroll = (el: HTMLElement, isVertical?: boolean): boolean => {
      if (!isClient) return false

      const key = (
        {
          undefined: 'overflow',
          true: 'overflow-y',
          false: 'overflow-x'
        } as const
      )[String(isVertical)]!
      const overflow = getStyle(el, key)
      return ['scroll', 'auto', 'overlay'].some((s) => overflow.includes(s))
    }

    const getScrollContainer = (
      el: HTMLElement,
      isVertical?: boolean
    ): Window | HTMLElement | undefined => {
      if (!isClient) return

      let parent: HTMLElement = el
      while (parent) {
        if ([window, document, document.documentElement].includes(parent))
          return window

        if (isScroll(parent, isVertical)) return parent

        parent = parent.parentNode as HTMLElement
      }

      return parent
    }

    watch(fixed, (val) => emit('change', val))

    onMounted(() => {
      if (props.target) {
        target.value =
          document.querySelector<HTMLElement>(props.target) ?? undefined
        if (!target.value)
          throw new Error(`Target does not exist: ${props.target}`)
      } else {
        target.value = document.documentElement
      }
      scrollContainer.value = getScrollContainer(root.value!, true)
      updateRoot()
    })

    useEventListener(scrollContainer, 'scroll', handleScroll)
    watchEffect(update)

    return {
      root,
      fixed,
      rootStyle,
      affixStyle
    }
  }
})
</script>

<style scoped>

</style>
