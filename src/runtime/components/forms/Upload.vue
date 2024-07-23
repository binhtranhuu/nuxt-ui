<template>
  <upload-list
    v-if="isPictureCard && showFileList"
    :disabled="disabled"
    :list-type="listType"
    :files="uploadFiles"
    :crossorigin="crossorigin"
    :handle-preview="onPreview"
    @remove="handleRemove"
  >
    <template v-if="$slots.file" #default="{ file }">
      <slot name="file" :file="file" />
    </template>
    <template #append>
      <upload-content ref="uploadRef" v-bind="uploadContentProps">
        <slot v-if="$slots.trigger" name="trigger" />
        <slot v-if="!$slots.trigger && $slots.default" />
      </upload-content>
    </template>
  </upload-list>

  <upload-content v-if="!isPictureCard || (isPictureCard && !showFileList)" ref="uploadRef" v-bind="uploadContentProps">
    <slot v-if="$slots.trigger" name="trigger" />
    <slot v-if="!$slots.trigger && $slots.default" />
  </upload-content>

  <slot v-if="$slots.trigger" name="default" />
  <slot name="tip" />
  <upload-list
    v-if="!isPictureCard && showFileList"
    :disabled="disabled"
    :list-type="listType"
    :files="uploadFiles"
    :crossorigin="crossorigin"
    :handle-preview="onPreview"
    @remove="handleRemove"
  >
    <template v-if="$slots.file" #default="{ file }">
      <slot name="file" :file="file" />
    </template>
  </upload-list>
</template>

<script lang="ts">
import { defineComponent, shallowRef, computed, onBeforeUnmount, provide, toRef, type ExtractPropTypes } from 'vue'
import { uploadContentProps, uploadContextKey, uploadProps } from '../../utils/upload'
import { useUpload } from '../../composables/useUpload'
import UploadList from './UploadList.vue'
import UploadContent from './UploadContent.vue'

type UploadContentInstance = InstanceType<typeof UploadContent>;
type UploadContentProps = ExtractPropTypes<typeof uploadContentProps>;

export default defineComponent({
  components: { UploadList, UploadContent },
  inheritAttrs: false,
  props: uploadProps,
  setup (props, { expose }) {
    const uploadRef = shallowRef<UploadContentInstance>()
    const {
      abort,
      submit,
      clearFiles,
      uploadFiles,
      handleStart,
      handleError,
      handleRemove,
      handleSuccess,
      handleProgress,
      revokeFileObjectURL
    } = useUpload(props, uploadRef)

    const isPictureCard = computed(() => props.listType === 'picture-card')

    const uploadContentProps = computed<UploadContentProps>(() => ({
      ...props,
      fileList: uploadFiles.value,
      onStart: handleStart,
      onProgress: handleProgress,
      onSuccess: handleSuccess,
      onError: handleError,
      onRemove: handleRemove
    }))

    onBeforeUnmount(() => {
      uploadFiles.value.forEach(revokeFileObjectURL)
    })

    provide(uploadContextKey, {
      accept: toRef(props, 'accept')
    })

    expose({
      /** @description cancel upload request */
      abort,
      /** @description upload the file list manually */
      submit,
      /** @description clear the file list  */
      clearFiles,
      /** @description select the file manually */
      handleStart,
      /** @description remove the file manually */
      handleRemove
    })

    return { uploadFiles, isPictureCard, uploadContentProps, handleRemove }
  }
})
</script>

<style scoped></style>
