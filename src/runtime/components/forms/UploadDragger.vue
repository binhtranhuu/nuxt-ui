<template>
  <div @drop.prevent="onDrop" @dragover.prevent="onDragover" @dragleave.prevent="dragover = false">
    <slot v-bind="{ dragover }" />
  </div>
</template>

<script lang="ts">
import { isArray } from 'lodash-es'
import { defineComponent, inject, ref } from 'vue'
import { uploadContextKey } from '../../utils/upload'
import { throwError } from '../../utils/error'

const COMPONENT_NAME = 'UploadDrag'

export default defineComponent({
  inheritAttrs: false,
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    file: (file: File[]) => isArray(file)
  },
  setup (props, { emit }) {
    const uploaderContext = inject(uploadContextKey)
    if (!uploaderContext) {
      throwError(COMPONENT_NAME, 'usage: <upload><upload-dragger /></upload>')
    }

    const dragover = ref(false)

    const onDrop = (e: DragEvent) => {
      if (props.disabled) return
      dragover.value = false

      e.stopPropagation()

      const files = Array.from(e.dataTransfer!.files)
      emit('file', files)
    }

    const onDragover = () => {
      if (props.disabled) return
      dragover.value = true
    }
    return {
      dragover,
      onDrop,
      onDragover
    }
  }
})
</script>

<style scoped></style>
