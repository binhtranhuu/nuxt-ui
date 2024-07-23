export default {
  wrapper: 'grid grid-cols-8 gap-3 mt-3',
  container: 'col-span-1',
  status: {
    ready: {
      wrapper: 'space-y-2',
      card: {
        base: 'flex items-center justify-center bg-gray-100 dark:bg-gray-800 aspect-[3/4] rounded-lg',
        image: 'object-cover rounded-lg w-full h-full',
        icon: 'w-6 h-6 text-gray-500'
      },
      body: {
        base: 'flex items-center justify-between gap-1',
        title: 'text-sm truncate',
        action: 'flex-shrink-0'
      }
    },
    uploading: {
      wrapper: 'space-y-2',
      card: {
        base: 'flex items-center justify-center bg-gray-100 dark:bg-gray-800 aspect-[3/4] rounded-lg',
        progress: 'w-3/4'
      },
      body: {
        base: 'flex items-center justify-between gap-1',
        title: 'text-sm truncate',
        action: 'flex-shrink-0'
      }
    },
    success: {
      wrapper: 'space-y-2',
      card: {
        base: 'flex items-center justify-center bg-gray-100 dark:bg-gray-800 aspect-[3/4] rounded-lg',
        image: 'object-cover rounded-lg w-full h-full',
        icon: 'w-6 h-6 text-gray-500'
      },
      body: {
        base: 'flex items-center justify-between gap-1',
        title: 'text-sm truncate',
        action: 'flex-shrink-0'
      }
    },
    fail: {
      wrapper: 'space-y-2',
      card: {
        base: 'flex items-center justify-center bg-red-50 dark:bg-red-800 aspect-[3/4] rounded-lg',
        icon: 'w-6 h-6 text-red-500'
      },
      body: {
        base: 'flex items-center justify-between gap-1',
        title: 'text-sm truncate',
        action: 'flex-shrink-0'
      }
    }
  },
  default: {
    documentIcon: 'i-heroicons-document',
    trashIcon: 'i-heroicons-trash'
  }
}
