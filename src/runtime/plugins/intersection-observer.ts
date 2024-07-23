import { useIntersectionObserver } from '@vueuse/core'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('intersection-observer', {
    mounted: (el: HTMLElement, binding: any) => {
      if (typeof binding.value === 'function') {
        useIntersectionObserver(el, binding.value)
      } else {
        // @ts-expect-error
        useIntersectionObserver(el, ...binding.value)
      }
    }
  })
})
