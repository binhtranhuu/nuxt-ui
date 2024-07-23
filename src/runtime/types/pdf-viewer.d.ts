import type { AppConfig } from 'nuxt/schema'
import type { ExtractDeepKey } from '.'
import type { pdfViewer } from '../ui.config'

export type PdfViewerSpacing = keyof typeof pdfViewer.spacing | ExtractDeepKey<AppConfig, ['ui', 'pdfViewer', 'spacing']>;
