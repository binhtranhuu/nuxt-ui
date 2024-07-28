export default defineNuxtConfig({
  modules: [
    '../src/module'
  ],

  compatibilityDate: '2024-07-23',

  vite: {
    optimizeDeps: {
      esbuildOptions: {
        supported: {
          'top-level-await': true
        }
      }
    }
  }
})
