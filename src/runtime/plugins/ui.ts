import { computed } from 'vue'
import { defineNuxtPlugin, useAppConfig, useNuxtApp, useHead } from '#imports'
import { mergeConfig } from '../utils'
import { variables } from '#ui/ui.config'

export default defineNuxtPlugin(() => {
    const appConfig = useAppConfig()
    const nuxtApp = useNuxtApp()

    const root = computed(() => {
      const mergeVariables = mergeConfig<typeof variables>(appConfig.ui.strategy, appConfig.ui.variables, variables)

      return `:root {
        --header-height: ${mergeVariables?.header.height};
        --ui-background: ${mergeVariables?.light?.background};
        --ui-foreground: ${mergeVariables?.light?.foreground};

        .dark {
          --ui-background: ${mergeVariables?.dark?.background};
          --ui-foreground: ${mergeVariables?.dark?.foreground};
        }
        `
    })

    // Head
  const headData: any = {
    style: [{
      innerHTML: () => root.value,
      tagPriority: -2,
      id: 'nuxt-ui-root'
    }]
  }

    // SPA mode
  if (import.meta.client && nuxtApp.isHydrating && !nuxtApp.payload.serverRendered) {
    const style = document.createElement('style')

    style.innerHTML = root.value
    style.setAttribute('data-nuxt-ui-root', '')
    document.head.appendChild(style)

    headData.script = [{
      innerHTML: 'document.head.removeChild(document.querySelector(\'[data-nuxt-ui-root]\'))'
    }]
  }

  useHead(headData)
})
