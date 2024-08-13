export default {
  wrapper: 'relative',
  spoiler: {
    base: 'absolute top-full left-1/2 -translate-x-1/2'
  },
  mask: 'absolute inset-0 bg-gradient-to-b from-background/30 to-background/100',
  content: {
    base: 'flex flex-col overflow-hidden',
    transition: 'transition-[max-height] duration-200 ease-linear'
  },
  default: {
    showIcon: 'i-heroicons-chevron-down-20-solid',
    hideIcon: 'i-heroicons-chevron-up-20-solid',
    spoilerButton: {
      size: 'sm' as const,
      color: 'primary' as const,
      variant: 'link' as const
    }
  }
}
