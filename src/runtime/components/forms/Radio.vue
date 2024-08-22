<template>
  <div :class="ui.wrapper" :data-n-ids="attrs['data-n-ids']">
    <div :class="ui.container">
      <input
        :id="inputId"
        v-model="pick"
        :name="name"
        :required="required"
        :value="value"
        :disabled="isDisabled"
        type="radio"
        :class="inputClass"
        v-bind="attrs"
        @change="onChange"
      >
    </div>
    <div v-if="label || $slots.label" :class="ui.inner">
      <label :for="inputId" :class="ui.label">
        <slot name="label" :label="label">{{ label }}</slot>
        <span v-if="required" :class="ui.required">*</span>
      </label>
      <p v-if="help || $slots.help" :class="ui.help">
        <slot name="help" :help="help">
          {{ help }}
        </slot>
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, inject, toRef } from 'vue'
import type { PropType } from 'vue'
import { isNil } from 'lodash-es'
import { twMerge, twJoin } from 'tailwind-merge'
import { useUI } from '../../composables/useUI'
import { useFormGroup } from '../../composables/useFormGroup'
import { mergeConfig } from '../../utils'
import type { Strategy } from '../../types/index'
// @ts-expect-error
import appConfig from '#build/app.config'
import { radio } from '#ui/ui.config'
import colors from '#ui-colors'
import { useId } from '#imports'

const config = mergeConfig<typeof radio>(appConfig.ui.strategy, appConfig.ui.radio, radio)

export default defineComponent({
  inheritAttrs: false,
  props: {
    id: {
      type: String,
      default: null
    },
    value: {
      type: [String, Number, Boolean],
      default: null
    },
    modelValue: {
      type: [String, Number, Boolean, Object],
      default: null
    },
    name: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
    help: {
      type: String,
      default: null
    },
    label: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    color: {
      type: String as PropType<typeof colors[number]>,
      default: () => config.default.color,
      validator (value: string) {
        return appConfig.ui.colors.includes(value)
      }
    },
    inputClass: {
      type: String,
      default: null
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
    const { ui, attrs } = useUI('radio', toRef(props, 'ui'), config, toRef(props, 'class'))

    const inputId = props.id ?? useId()

    const radioGroup = inject('radio-group', null)
    const radioGroupOptimize = inject('radio-group-optimize', null)
    const { emitFormChange, color, name } = radioGroup ?? radioGroupOptimize ?? useFormGroup(props, config)

    const isGroup = computed(() => !isNil(radioGroup))
    const isGroupOptimize = computed(() => !isNil(radioGroupOptimize))

    const pick = computed({
      get () {
        return isGroupOptimize.value ? radioGroupOptimize?.modelValue?.value : props.modelValue
      },
      set (value) {
        if (isGroupOptimize.value) {
          radioGroupOptimize?.changeEvent?.(value)
        } else {
          emit('update:modelValue', value)
          if (isGroup.value === false) {
            emitFormChange()
          }
        }
      }
    })

    const isDisabled = computed(() => {
      return props.disabled || radioGroupOptimize?.disabled.value
    })

    function onChange () {
      nextTick(() => emit('change', pick.value))
    }

    const inputClass = computed(() => {
      return twMerge(twJoin(
        ui.value.base,
        ui.value.form,
        ui.value.background,
        ui.value.border,
        color.value && ui.value.ring.replaceAll('{color}', color.value),
        color.value && ui.value.color.replaceAll('{color}', color.value)
      ), props.inputClass)
    })

    return {
      inputId,
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      pick,
      // eslint-disable-next-line vue/no-dupe-keys
      name,
      // eslint-disable-next-line vue/no-dupe-keys
      inputClass,
      isDisabled,
      onChange
    }
  }
})
</script>
