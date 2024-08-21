<template>
  <component
    :is="tag"
    role="group"
    :class="checkboxGroupClass"
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
import { checkboxGroup } from '#ui/ui.config'
import colors from '#ui-colors'

const config = mergeConfig<typeof checkboxGroup>(appConfig.ui.strategy, appConfig.ui.checkboxGroup, checkboxGroup)

export default defineComponent({
  inheritAttrs: false,
  props: {
    /**
     * @description binding value
     */
    modelValue: {
      type: Array,
      default: () => []
    },
    /**
     * @description whether the nesting checkboxes are disabled
     */
    disabled: Boolean,
    /**
     * @description minimum number of checkbox checked
     */
    min: Number,
    /**
     * @description maximum number of checkbox checked
     */
    max: Number,
    /**
     * @description element tag of the checkbox group
     */
    tag: {
      type: String,
      default: 'div'
    },
    /**
     * @description orientation of the checkbox group
     */
    orientation: {
      type: String,
      values: ['horizontal', 'vertical'],
      default: 'vertical'
    },
    /**
     * @description spacing of the checkbox group
     */
    spacing: {
      type: String,
      values: ['md'],
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
    const { ui, attrs } = useUI('checkboxGroup', toRef(props, 'ui'), config, toRef(props, 'class'))
    const { emitFormChange, color, name } = useFormGroup(props, config)

    const changeEvent = async (value) => {
      emit('update:modelValue', value)
      await nextTick()
      emit('change', value)
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

    provide('checkbox-group', {
      ...pick(toRefs(props), ['min', 'max', 'disabled']),
      color,
      name,
      modelValue,
      changeEvent
    })

    const checkboxGroupClass = computed(() => {
      return twMerge(twJoin(
        ui.value.base,
        ui.value.orientation[props.orientation],
        ui.value.spacing[props.spacing]
      ), props.class)
    })


    return {
      attrs,
      checkboxGroupClass
    }
  }
})
</script>

<style scoped>

</style>
