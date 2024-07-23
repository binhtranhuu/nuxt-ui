<template>
  <div ref="container" :class="ui.spacing[spacing]">
    <slot v-for="page in pages" :key="page.page" :page="page">
      <div
        v-if="page.status === status.ready"
        v-intersection-observer="[onPageRendering]"
        :style="{
          width: `${page.width}px`,
          height: `${page.height}px`
        }"
        :data-page-id="page.page"
        :class="[ui.rounded, ui.status.base, ui.status.ready.base]"
      >
        <UIcon :name="ui.default.loadingIcon" :class="ui.status.ready.icon" />
      </div>

      <div v-else-if="page.status === status.progress || page.status === status.rendered" :data-page-id="page.page">
        <VuePDF
          :pdf="pdf"
          :scale="scale"
          :width="width"
          :height="height"
          :rotation="rotation"
          :fit-parent="fitParent"
          :page="page.page"
          :class="[ui.rounded, ui.status.rendered.base]"
          v-bind="attrs"
          @loaded="onPageLoaded"
        />
      </div>

      <div
        v-else-if="page.status === status.fail"
        :style="{
          width: `${page.width}px`,
          height: `${page.height}px`
        }"
        :data-page-id="page.page"
        :class="[ui.rounded, ui.status.base, ui.status.fail.base]"
      >
        <UIcon :name="ui.default.loadingIcon" :class="ui.status.fail.icon" />
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { usePDF, VuePDF } from '@tato30/vue-pdf'
import { defineComponent, ref, watch, computed, toRef, type PropType } from 'vue'
import { isNil } from 'lodash-es'
import type { GetViewportParameters, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api'
import type { PDFPageProxy } from 'pdfjs-dist'
import '@tato30/vue-pdf/style.css'
import { useUI } from '../../composables/useUI'
import { throwError } from '../../utils/error'
import type { PdfViewerSpacing, Strategy } from '../../types'
import { mergeConfig } from '../../utils'
// @ts-expect-error
import appConfig from '#build/app.config'
import { pdfViewer } from '#ui/ui.config'

interface IPageInfo {
  page: number;
  width: number;
  height: number;
  status: string;
}

const config = mergeConfig<typeof pdfViewer>(appConfig.ui.strategy, appConfig.ui.pdf, pdfViewer)

export default defineComponent({
  components: { VuePDF },
  inheritAttrs: false,
  props: {
    /**
   * @description Source of the document to display
   */
    src: {
      type: String,
      required: true
    },
    /**
     * @description Desired page viewport scale
     */
    scale: {
      type: Number,
      default: 1
    },
    /**
     * @description Page rotation angle.
     */
    rotation: {
      type: Number,
      default: 0,
      validator (value: number) {
        if (value % 90 !== 0) {
          throwError('PdfViewer', 'Rotation must be 0 or a multiple of 90.')
        }

        return true
      }
    },
    /**
     * @description Fit the page's width with the parent width.
     */
    fitParent: {
      type: Boolean,
      default: false
    },
    /**
     * @description Scale the page using a width in px.
     */
    width: {
      type: Number,
      default: undefined
    },
    /**
     * @description Scale the page using a height in px.
     */
    height: {
      type: Number,
      default: undefined
    },
    /**
     * @description Space between pages.
     */
    spacing: {
      type: String as PropType<PdfViewerSpacing>,
      default: () => config.default.spacing,
      validator (value: string) {
        return Object.keys(config.spacing).includes(value)
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
  emits: ['loaded'],
  setup (props, { emit }) {
    const isIniting = ref(false)
    const container = ref<HTMLElement>()
    const pageRendering = ref(0)
    const pagesInfo = ref<IPageInfo[]>([])
    const { pdf, pages } = usePDF(props.src)
    const { ui, attrs } = useUI('pdf', toRef(props, 'ui'), config, toRef(props, 'class'))

    const pageStatus = computed(() => {
      return {
        ready: 'ready',
        progress: 'progress',
        rendered: 'rendered',
        fail: 'fail'
      }
    })

    function findPage (page: number) {
      if (!page) return null
      return pagesInfo.value.find((p: IPageInfo) => p.page === page)
    }

    function findIndexPage (page: number) {
      if (!page) return -1
      return pagesInfo.value.findIndex((p: IPageInfo) => p.page === page)
    }

    function onPageRendering ([{ isIntersecting, target }]: IntersectionObserverEntry[]) {
      const page = target.getAttribute('data-page-id')
      const pageIndex = findIndexPage(Number(page))
      if (pageIndex < 0) return
      const currentPage = pagesInfo.value[pageIndex]
      if (isIntersecting && currentPage.status === pageStatus.value.ready) {
        pageRendering.value = currentPage.page
        currentPage.status = pageStatus.value.progress
      }
    }

    function onPageLoaded () {
      const pageRendered = findPage(pageRendering.value)
      if (isNil(pageRendered)) return
      pageRendered.status = pageStatus.value.rendered
      emit('loaded', pageRendered)
    }

    function getRotation (rotation: number): number {
      if (!(typeof rotation === 'number' && rotation % 90 === 0)) return 0
      const factor = rotation / 90
      if (factor > 4) return getRotation(rotation - 360)
      else if (factor < 0) return getRotation(rotation + 360)
      return rotation
    }

    function getScale (page: PDFPageProxy): number {
      let fscale = props.scale
      if (props.fitParent) {
        const parentWidth: number = (container.value!.parentNode! as HTMLElement).clientWidth
        const scale1Width = page.getViewport({ scale: 1 }).width
        fscale = parentWidth / scale1Width
      } else if (props.width) {
        const scale1Width = page.getViewport({ scale: 1 }).width
        fscale = props.width / scale1Width
      } else if (props.height) {
        const scale1Height = page.getViewport({ scale: 1 }).height
        fscale = props.height / scale1Height
      }
      return fscale
    }

    function initPages (document?: PDFDocumentProxy) {
      try {
        if (isNil(document)) return
        isIniting.value = true
        const pageNums = [...Array(pages.value).keys()]
        pageNums.forEach(async p => {
          const page = await document.getPage(p + 1)
          const defaultViewport = page.getViewport()
          const viewportParams: GetViewportParameters = {
            scale: getScale(page),
            rotation: getRotation((props.rotation || 0) + defaultViewport.rotation)
          }
          const viewport = page.getViewport(viewportParams)

          pagesInfo.value.push({
            page: p + 1,
            width: Math.floor(viewport.width),
            height: Math.floor(viewport.height),
            status: pageStatus.value.ready
          })
        })
      } finally {
        isIniting.value = false
      }
    }

    watch(
      () => pdf.value,
      source => {
        source?.promise.then(document => {
          initPages(document)
        })
      },
      { immediate: true }
    )

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      pdf,
      attrs,
      container,
      pages: pagesInfo,
      status: pageStatus,
      onPageRendering,
      onPageLoaded
    }
  }
})
</script>

<style scoped></style>
