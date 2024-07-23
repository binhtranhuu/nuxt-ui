import { NOOP } from '@vue/shared'
import type { PropType, InjectionKey, ExtractPropTypes } from 'vue'
import type { Awaitable, UploadContext, UploadData, UploadFile, UploadHooks, UploadProgressEvent, UploadRawFile, UploadRequestHandler, UploadUserFile } from '../types'
import { mutable } from './typescript'
import { ajaxUpload, UploadAjaxError } from './ajax'
import UploadContent from '../components/forms/UploadContent.vue'

let fileId = 1
export const genFileId = () => Date.now() + fileId++

export const uploadListTypes = ['card'] as const

export const uploadContextKey: InjectionKey<UploadContext> = Symbol('uploadContextKey')

export type UploadProps = ExtractPropTypes<typeof uploadProps>;
export type UploadContentInstance = InstanceType<typeof UploadContent>;
export type UploadContentProps = ExtractPropTypes<typeof uploadContentProps>;

export const uploadBaseProps = {
  /**
   * @description request URL
   */
  action: {
    type: String,
    default: '#'
  },
  /**
   * @description request headers
   */
  headers: {
    type: Object as PropType<Headers | Record<string, any>>
  },
  /**
   * @description set upload request method
   */
  method: {
    type: String,
    default: 'post'
  },
  /**
   * @description additions options of request
   */
  data: {
    type: [
      Object,
      Function,
      Promise
    ] as PropType<Awaitable<UploadData> | ((rawFile: UploadRawFile) => Awaitable<UploadData>)>,
    default: () => mutable({} as const)
  },
  /**
   * @description whether uploading multiple files is permitted
   */
  multiple: {
    type: Boolean,
    default: false
  },
  /**
   * @description key name for uploaded file
   */
  name: {
    type: String,
    default: 'file'
  },
  /**
   * @description whether to activate drag and drop mode
   */
  drag: {
    type: Boolean,
    default: false
  },
  /**
   * @description whether cookies are sent
   */
  withCredentials: Boolean,
  /**
   * @description whether to show the uploaded file list
   */
  showFileList: {
    type: Boolean,
    default: true
  },
  /**
   * @description accepted [file types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept), will not work when `thumbnail-mode === true`
   */
  accept: {
    type: String,
    default: ''
  },
  /**
   * @description default uploaded files
   */
  fileList: {
    type: Array as PropType<UploadUserFile[]>,
    default: () => mutable([] as const)
  },
  /**
   * @description whether to auto upload file
   */
  autoUpload: {
    type: Boolean,
    default: true
  },
  /**
   * @description type of file list
   */
  listType: {
    type: String,
    values: uploadListTypes,
    default: () => uploadListTypes[0]
  },
  /**
   * @description override default xhr behavior, allowing you to implement your own upload-file's request
   */
  httpRequest: {
    type: Function as PropType<UploadRequestHandler>,
    default: ajaxUpload
  },
  /**
   * @description whether to disable upload
   */
  disabled: Boolean,
  /**
   * @description maximum number of uploads allowed
   */
  limit: Number,
  /**
   * @description maximum total max sizes of uploads allowed
   */
  maxSizes: Number
} as const

export const uploadProps = {
  ...uploadBaseProps,
  /**
   * @description hook function before uploading with the file to be uploaded as its parameter. If `false` is returned or a `Promise` is returned and then is rejected, uploading will be aborted
   */
  beforeUpload: {
    type: Function as PropType<UploadHooks['beforeUpload']>,
    default: NOOP
  },
  /**
   * @description hook function before removing a file with the file and file list as its parameters. If `false` is returned or a `Promise` is returned and then is rejected, removing will be aborted
   */
  beforeRemove: {
    type: Function as PropType<UploadHooks['beforeRemove']>,
    default: NOOP
  },
  /**
   * @description hook function when files are removed
   */
  onRemove: {
    type: Function as PropType<UploadHooks['onRemove']>,
    default: NOOP
  },
  /**
   * @description hook function when select file or upload file success or upload file fail
   */
  onChange: {
    type: Function as PropType<UploadHooks['onChange']>,
    default: NOOP
  },
  /**
   * @description hook function when clicking the uploaded files
   */
  onPreview: {
    type: Function as PropType<UploadHooks['onPreview']>,
    default: NOOP
  },
  /**
   * @description hook function when uploaded successfully
   */
  onSuccess: {
    type: Function as PropType<UploadHooks['onSuccess']>,
    default: NOOP
  },
  /**
   * @description hook function when some progress occurs
   */
  onProgress: {
    type: Function as PropType<UploadHooks['onProgress']>,
    default: NOOP
  },
  /**
   * @description hook function when some errors occurs
   */
  onError: {
    type: Function as PropType<UploadHooks['onError']>,
    default: NOOP
  },
  /**
   * @description hook function when limit is exceeded
   */
  onExceed: {
    type: Function as PropType<UploadHooks['onExceed']>,
    default: NOOP
  },
  /**
   * @description set HTML attribute: crossorigin.
   */
  crossorigin: {
    type: String as PropType<'anonymous' | 'use-credentials' | ''>
  }
} as const

export const uploadContentProps = {
  ...uploadBaseProps,

  beforeUpload: {
    type: Function as PropType<UploadHooks['beforeUpload']>,
    default: NOOP
  },
  onRemove: {
    type: Function as PropType<(file: UploadFile | UploadRawFile, rawFile?: UploadRawFile) => void>,
    default: NOOP
  },
  onStart: {
    type: Function as PropType<(rawFile: UploadRawFile) => void>,
    default: NOOP
  },
  onSuccess: {
    type: Function as PropType<(response: any, rawFile: UploadRawFile) => unknown>,
    default: NOOP
  },
  onProgress: {
    type: Function as PropType<(evt: UploadProgressEvent, rawFile: UploadRawFile) => void>,
    default: NOOP
  },
  onError: {
    type: Function as PropType<(err: UploadAjaxError, rawFile: UploadRawFile) => void>,
    default: NOOP
  },
  onExceed: {
    type: Function as PropType<UploadHooks['onExceed']>,
    default: NOOP
  }
} as const
