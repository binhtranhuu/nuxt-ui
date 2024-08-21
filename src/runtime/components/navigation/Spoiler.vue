<template>
  <div :class="wrapperClass" v-bind="attrs">
    <slot v-if="show === false && isSpoiler" name="mask">
      <div :class="ui.mask" />
    </slot>

    <div
      role="region"
      :style="{ maxHeight: show ? `${height}px` : `${maxHeight}px` }"
      :class="[ui.content.base, ui.content.transition]"
    >
      <div ref="contentRef">
        <slot />
      </div>
    </div>
  </div>

  <div :class="ui.spoiler.base">
    <slot name="spoiler" v-bind="{ show, onToggleSpoiler }">
      <UButton
        v-if="isSpoiler"
        v-bind="{ ...(ui.default.spoilerButton || {}), ...spoilerButton }"
        :label="spoilerMoreContent"
        :trailing-icon="show ? ui.default.hideIcon : ui.default.showIcon"
        @click="onToggleSpoiler"
      />
    </slot>
  </div>
</template>

<script lang="ts">
import { computed, ref, defineComponent, toRef } from 'vue'
import type { PropType } from 'vue'
import { useElementSize, useVModel } from '@vueuse/core'
import { twMerge, twJoin } from 'tailwind-merge'
import { useUI } from '../../composables/useUI'
import { mergeConfig } from '../../utils'
import type { Button, Strategy } from '../../types'
// @ts-expect-error
import appConfig from '#build/app.config'
import { spoiler } from '#ui/ui.config'

const config = mergeConfig<typeof spoiler>(appConfig.ui.strategy, appConfig.ui.spoiler, spoiler)

export default defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    maxHeight: {
      type: Number,
      required: true
    },
    hideLabel: {
      type: String,
      default: 'Hide'
    },
    showLabel: {
      type: String,
      default: 'More'
    },
    spoilerButton: {
      type: Object as PropType<Button>,
      default: () => config.default.spoilerButton as Button
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
  emits: ['update:modelvalue'],
  setup (props, { emit }) {
    const { ui, attrs } = useUI('spoiler', toRef(props, 'ui'), config, toRef(props, 'class'))

    const contentRef = ref<HTMLDivElement>(null)
    const show = useVModel(props, 'modelValue', emit, { passive: true })

    const { height } = useElementSize(contentRef)

    const spoilerMoreContent = computed(() => {
      return show.value ? props.hideLabel : props.showLabel
    })

    const isSpoiler = computed(() => {
      return spoilerMoreContent.value !== null && props.maxHeight! < height.value
    })

    function onToggleSpoiler () {
      show.value = !show.value
    }

    const wrapperClass = computed(() => {
      return twMerge(twJoin(
        ui.value.wrapper
      ), props.class)
    })

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      height,
      show,
      contentRef,
      spoilerMoreContent,
      isSpoiler,
      wrapperClass,
      onToggleSpoiler
    }
  }
})
</script>

<style scoped>

</style>
