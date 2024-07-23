export default defineNuxtConfig({
  modules: [
    '../src/module'
  ],

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
