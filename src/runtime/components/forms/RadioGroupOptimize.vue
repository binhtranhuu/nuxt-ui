<template>
  <component
    :is="tag"
    role="group"
    :class="radioGroupOptimizeClass"
    v-bind="attrs"
  >
    <slot name="default" />
  </component>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, provide, toRef, toRefs } from 'vue'
import type { PropType } from 'vue'
import { pick } from 'lodash-es'
import { twMerge, twJoin } from 'tailwind-merge'
import { useUI } from '../../composables/useUI'
import { useFormGroup } from '../../composables/useFormGroup'
import { mergeConfig } from '../../utils'
import type { Strategy } from '../../types/index'
// @ts-expect-error
import appConfig from '#build/app.config'
import { radioGroupOptimize } from '#ui/ui.config'
import colors from '#ui-colors'

const config = mergeConfig<typeof radioGroupOptimize>(appConfig.ui.strategy, appConfig.ui.radioGroupOptimize, radioGroupOptimize)

export default defineComponent({
  inheritAttrs: false,
  props: {
    /**
     * @description binding value
     */
    modelValue: {
      type: [String, Number],
      default: ''
    },
    /**
     * @description whether the nesting radios are disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * @description element tag of the radio group
     */
    tag: {
      type: String,
      default: 'div'
    },
    /**
     * @description orientation of the radio group
     */
    orientation: {
      type: String,
      values: ['horizontal', 'vertical'],
      default: 'vertical'
    },
    /**
     * @description spacing of the radio group
     */
    spacing: {
      type: String,
      values: ['sm', 'md', 'lg'],
      default: 'md'
    },
    color: {
      type: String as PropType<typeof colors[number]>,
      default: () => config.default.color,
      validator (value: string) {
        return appConfig.ui.colors.includes(value)
      }
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
  emits: ['update:modelValue', 'change'],
  setup (props, { emit }) {
    const { ui, attrs } = useUI('radioGroupOptimize', toRef(props, 'ui'), config, toRef(props, 'class'))
    const { emitFormChange, color, name } = useFormGroup(props, config)

    const changeEvent = async (value) => {
      emit('update:modelValue', value)
      nextTick(() => emit('change', value))
      emitFormChange()
    }

    const modelValue = computed({
      get () {
        return props.modelValue
      },
      set (val) {
        changeEvent(val)
      }
    })

    provide('radio-group-optimize', {
      ...pick(toRefs(props), ['disabled']),
      color,
      name,
      modelValue,
      changeEvent
    })

    const radioGroupOptimizeClass = computed(() => {
      return twMerge(twJoin(
        ui.value.base,
        ui.value.orientation[props.orientation],
        ui.value.spacing[props.spacing]
      ), props.class)
    })


    return {
      attrs,
      radioGroupOptimizeClass
    }
  }
})
</script>

<style scoped>

</style>
