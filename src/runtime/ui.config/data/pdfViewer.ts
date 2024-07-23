export default {
  rounded: 'rounded-md [&_canvas]:rounded-md',
  status: {
    base: 'flex items-center justify-center rounded-lg',
    ready: {
      base: 'bg-white',
      icon: 'text-primary w-6 h-6 animate-spin'
    },
    rendered: {
      base: 'bg-white',
      icon: ''
    },
    fail: {
      base: 'bg-red-50 dark:bg-red-800',
      icon: 'text-red-500 dark:text-red-400 w-6 h-6'
    }
  },
  spacing: {
    sm: 'space-y-1 md:space-y-2',
    md: 'space-y-2 md:space-y-4',
    lg: 'space-y-3 md:space-y-6'
  },
  default: {
    spacing: 'md',
    loadingIcon: 'i-heroicons-arrow-path-20-solid',
    documentIcon: 'i-heroicons-document'
  }
}
