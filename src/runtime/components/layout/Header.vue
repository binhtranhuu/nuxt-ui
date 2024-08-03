<template>
  <header :class="headerClass" v-bind="attrs">
    <div :class="ui.container">
      <div :class="ui.left">
        <slot name="left" />
      </div>

      <div :class="ui.center">
        <slot />
      </div>

      <div :class="ui.right">
        <slot name="right" />
        <slot name="panel-button" v-bind="{ isOpen }">
          <UButton
            color="gray"
            variant="ghost"
            :class="ui.button.base"
            :aria-label="isOpen ? 'Open Menu' : 'Close Menu'"
            :icon="isOpen ? ui.button.icon.close : ui.button.icon.open"
            @click="onToggleMenu"
          />
        </slot>
      </div>
    </div>


    <USlideover v-model="isOpen" :ui="{ wrapper: ui.panel.wrapper }">
      <slot name="panel">
        <div :class="headerClass" v-bind="attrs">
          <div :class="ui.panel.header">
            <div :class="ui.container">
              <div :class="ui.left">
                <slot name="left" />
              </div>

              <div :class="ui.center">
                <slot />
              </div>

              <div :class="ui.right">
                <slot name="right" />
                <slot name="panel-button" v-bind="{ isOpen }">
                  <UButton
                    color="gray"
                    variant="ghost"
                    :class="ui.button.base"
                    :aria-label="isOpen ? 'Open Menu' : 'Close Menu'"
                    :icon="isOpen ? ui.button.icon.close : ui.button.icon.open"
                    @click="onToggleMenu"
                  />
                </slot>
              </div>
            </div>
          </div>
        </div>
        <div :class="ui.panel.body">
          <slot />
        </div>
      </slot>
    </USlideover>
  </header>
</template>

<script lang="ts">
import { computed, toRef, ref, defineComponent } from 'vue'
import type { PropType } from 'vue'
import { twMerge, twJoin } from 'tailwind-merge'
import { useUI } from '../../composables/useUI'
import { mergeConfig } from '../../utils'
import type { Strategy } from '../../types'
// @ts-expect-error
import appConfig from '#build/app.config'
import { header } from '#ui/ui.config'

const config = mergeConfig<typeof header>(appConfig.ui.strategy, appConfig.ui.card, header)

export default defineComponent({
  inheritAttrs: false,
  props: {
    class: {
      type: [String, Object, Array] as PropType<any>,
      default: () => ''
    },
    ui: {
      type: Object as PropType<Partial<typeof config> & { strategy?: Strategy }>,
      default: () => ({})
    }
  },
  setup (props) {
    const isOpen = ref(false)
    const { ui, attrs } = useUI('header', toRef(props, 'ui'), config)

    const headerClass = computed(() => {
      return twMerge(twJoin(
        ui.value.wrapper
      ), props.class)
    })

    function onToggleMenu () {
      isOpen.value = !isOpen.value
    }

    return {
      // eslint-disable-next-line vue/no-dupe-keys
      ui,
      attrs,
      headerClass,
      isOpen,
      onToggleMenu
    }
  }
})
</script>

<style scoped>

</style>
