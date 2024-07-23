<template>
  <div tabindex="0" @click="handleClick" @keydown.self.enter.space="handleKeydown">
    <template v-if="drag">
      <upload-dragger :disabled="disabled" @file="uploadFiles">
        <slot />
      </upload-dragger>
    </template>
    <template v-else>
      <slot />
    </template>
    <input
      ref="inputRef"
      hidden
      :name="name"
      :multiple="multiple"
      :accept="accept"
      type="file"
      @change="handleChange"
      @click.stop
    >
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue'
import { cloneDeep, isEqual, isFunction, isPlainObject } from 'lodash-es'
import { genFileId, uploadContentProps, type UploadContentProps } from '../../utils/upload'
import type { UploadFile, UploadHooks, UploadRawFile, UploadRequestOptions } from '../../types'
import UploadDragger from './UploadDragger.vue'

export default defineComponent({
  components: { UploadDragger },
  inheritAttrs: false,
  props: uploadContentProps,
  setup (props) {
    const inputRef = shallowRef<HTMLInputElement>()
    const requests = shallowRef<Record<string, XMLHttpRequest | Promise<unknown>>>({})

    const uploadFiles = (files: File[]) => {
      if (files.length === 0) return

      const { autoUpload, limit, maxSizes, fileList, multiple, onStart, onExceed } = props

      if (limit && fileList.length + files.length > limit) {
        onExceed(files, fileList)
        return
      }

      if (maxSizes) {
        const totalSizes = [...fileList, ...files].reduce((a, c) => a + (c?.size || 0), 0)
        if (totalSizes > maxSizes) return
      }

      if (!multiple) {
        files = files.slice(0, 1)
      }

      for (const file of files) {
        const rawFile = file as UploadRawFile
        rawFile.uid = genFileId()
        onStart(rawFile)
        if (autoUpload) upload(rawFile)
      }
    }

    const upload = async (rawFile: UploadRawFile): Promise<void> => {
      inputRef.value!.value = ''

      if (!props.beforeUpload) {
        return doUpload(rawFile)
      }

      let hookResult: Exclude<ReturnType<UploadHooks['beforeUpload']>, Promise<any>>
      let beforeData: UploadContentProps['data'] = {}

      try {
        // origin data: Handle data changes after synchronization tasks are executed
        const originData = props.data
        const beforeUploadPromise = props.beforeUpload(rawFile)
        beforeData = isPlainObject(props.data) ? cloneDeep(props.data) : props.data
        hookResult = await beforeUploadPromise
        if (isPlainObject(props.data) && isEqual(originData, beforeData)) {
          beforeData = cloneDeep(props.data)
        }
      } catch {
        hookResult = false
      }

      if (hookResult === false) {
        props.onRemove(rawFile)
        return
      }

      let file: File = rawFile
      if (hookResult instanceof Blob) {
        if (hookResult instanceof File) {
          file = hookResult
        } else {
          file = new File([hookResult], rawFile.name, {
            type: rawFile.type
          })
        }
      }

      doUpload(
        Object.assign(file, {
          uid: rawFile.uid
        }),
        beforeData
      )
    }

    const resolveData = async (
      data: UploadContentProps['data'],
      rawFile: UploadRawFile
    ): Promise<Record<string, any>> => {
      if (isFunction(data)) {
        return await data(rawFile)
      }

      return data
    }

    const doUpload = async (rawFile: UploadRawFile, beforeData?: UploadContentProps['data']) => {
      const {
        headers,
        data,
        method,
        withCredentials,
        name: filename,
        action,
        onProgress,
        onSuccess,
        onError,
        httpRequest
      } = props

      try {
        beforeData = await resolveData(beforeData ?? data, rawFile)
      } catch {
        props.onRemove(rawFile)
        return
      }

      const { uid } = rawFile
      const options: UploadRequestOptions = {
        // @ts-expect-error
        headers: headers || {},
        withCredentials,
        file: rawFile,
        data: beforeData,
        method,
        filename,
        action,
        onProgress: evt => {
          onProgress(evt, rawFile)
        },
        onSuccess: res => {
          onSuccess(res, rawFile)
          delete requests.value[uid]
        },
        onError: err => {
          onError(err, rawFile)
          delete requests.value[uid]
        }
      }
      const request = httpRequest(options)
      requests.value[uid] = request
      if (request instanceof Promise) {
        request.then(options.onSuccess, options.onError)
      }
    }

    const handleChange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return
      uploadFiles(Array.from(files))
    }

    const handleClick = () => {
      if (!props.disabled) {
        inputRef.value!.value = ''
        inputRef.value!.click()
      }
    }

    const handleKeydown = () => {
      handleClick()
    }

    const abort = (file?: UploadFile) => {
      const _reqs = Object.entries(requests.value).filter(file ? ([uid]) => String(file.uid) === uid : () => true)
      _reqs.forEach(([uid, req]) => {
        if (req instanceof XMLHttpRequest) req.abort()
        delete requests.value[uid]
      })
    }

    return { inputRef, abort, upload, handleClick, handleKeydown, uploadFiles, handleChange }
  }
})
</script>

<style scoped></style>
