<template>
  <transition-group tag="ul" :class="ui.wrapper">
    <li
      v-for="file in files"
      :key="file.uid || file.name"
      tabindex="0"
      :class="ui.container"
      v-bind="attrs"
      @keydown.delete="handleRemove(file)"
      @focus="focusing = true"
      @blur="focusing = false"
      @click="focusing = false"
    >
      <slot :file="file">
        <div v-if="file.status === 'ready'" :class="ui.status.ready.wrapper">
          <div :class="ui.status.ready.card.base">
            <img
              v-if="file.url"
              :src="file.url"
              :crossorigin="crossorigin"
              :alt="file.name"
              :class="ui.status.ready.card.image"
            >
            <UIcon v-else :class="ui.status.ready.card.icon" :name="ui.default.documentIcon" />
          </div>
          <div :class="ui.status.ready.body.base">
            <h5 :class="ui.status.ready.body.title" :title="file.name">
              {{ file.name }}
            </h5>
            <UButton
              square
              size="2xs"
              variant="ghost"
              color="red"
              :icon="ui.default.trashIcon"
              :class="ui.status.ready.body.action"
              @click="handleRemove(file)"
            />
          </div>
        </div>

        <div v-else-if="file.status === 'uploading'" :class="ui.status.uploading.wrapper">
          <div :class="ui.status.uploading.card.base">
            <UProgress indicator :value="file.percentage" :class="ui.status.uploading.card.progress" />
          </div>
          <div :class="ui.status.uploading.body.base">
            <h5 :class="ui.status.uploading.body.title" :title="file.name">
              {{ file.name }}
            </h5>
            <UButton
              square
              size="2xs"
              variant="ghost"
              color="red"
              :icon="ui.default.trashIcon"
              :class="ui.status.uploading.body.action"
              @click="handleRemove(file)"
            />
          </div>
        </div>

        <div v-else-if="file.status === 'success'" :class="ui.status.success.wrapper">
          <div :class="ui.status.success.card.base">
            <img
              v-if="file.url"
              :src="file.url"
              :crossorigin="crossorigin"
              :alt="file.name"
              :class="ui.status.success.card.image"
            >
            <UIcon v-else :class="ui.status.success.card.icon" :name="ui.default.documentIcon" />
          </div>
          <div :class="ui.status.success.body.base">
            <h5 :class="ui.status.success.body.title" :title="file.name">
              {{ file.name }}
            </h5>
            <UButton
              square
              size="2xs"
              variant="ghost"
              color="red"
              :icon="ui.default.trashIcon"
              :class="ui.status.success.body.action"
              @click="handleRemove(file)"
            />
          </div>
        </div>

        <div v-else-if="file.status === 'fail'" :class="ui.status.fail.wrapper">
          <div :class="ui.status.fail.card.base">
            <UIcon :class="ui.status.fail.card.icon" :name="ui.default.documentIcon" />
          </div>
          <div :class="ui.status.fail.body.base">
            <h5 :class="ui.status.fail.body.title" :title="file.name">
              {{ file.name }}
            </h5>
            <UButton
              square
              size="2xs"
              variant="ghost"
              color="red"
              :icon="ui.default.trashIcon"
              :class="ui.status.fail.body.action"
              @click="handleRemove(file)"
            />
          </div>
        </div>
      </slot>
    </li>
  </transition-group>
</template>

<script lang="ts">
import { NOOP } from '@vue/shared'
import { defineComponent, ref, toRef, type PropType } from 'vue'
import { useUI } from '../../composables/useUI'
import type { Strategy, UploadFile, UploadFiles, UploadHooks } from '../../types'
import { mutable } from '../../utils/typescript'
import { uploadListTypes } from '../../utils/upload'
import { mergeConfig } from '../../utils'
import { uploadList } from '#ui/ui.config'
// @ts-expect-error
import appConfig from '#build/app.config'
import UIcon from '../elements/Icon.vue'
import UProgress from '../elements/Progress.vue'

export const config = mergeConfig<typeof uploadList>(
  appConfig.ui.strategy,
  appConfig.ui.uploadList,
  uploadList
)

export default defineComponent({
  components: { UIcon, UProgress },
  inheritAttrs: false,
  props: {
    files: {
      type: Array as PropType<UploadFiles>,
      default: () => mutable([])
    },
    disabled: {
      type: Boolean,
      default: false
    },
    handlePreview: {
      type: Function as PropType<UploadHooks['onPreview']>,
      default: NOOP
    },
    listType: {
      type: String,
      values: uploadListTypes,
      default: () => uploadListTypes[0]
    },
    /**
     * @description set HTML attribute: crossorigin.
     */
    crossorigin: {
      type: String as PropType<'anonymous' | 'use-credentials' | ''>,
      default: ''
    },
    class: {
      type: String,
      default: () => ''
    },
    ui: {
      type: Object as PropType<Partial<typeof config> & { strategy?: Strategy }>,
      default: () => ({})
    }
  },
  emits: {
    remove: (file: UploadFile) => !!file
  },
  setup (props, { emit }) {
    const focusing = ref(false)
    const { ui, attrs } = useUI('progress', toRef(props, 'ui'), config, toRef(props, 'class'))

    const handleRemove = (file: UploadFile) => {
      if (props.disabled) return
      emit('remove', file)
    }

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      focusing,
      handleRemove
    }
  }
})
</script>

<style scoped></style>
