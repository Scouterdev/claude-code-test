/**
 * Barrel export for web primitives.
 * Components can import from '../components/web' to get web replacements
 * for @anthropic/ink components.
 */
export { Box } from './Box.js'
export { Text } from './Text.js'
export { WebThemeProvider, useWebTheme } from './WebThemeProvider.js'
export {
  useInput,
  useWindowSize,
  useDocumentFocus,
  useDocumentTitle,
  useTabVisibility,
  setClipboard,
  useWebNotification,
} from './hooks.js'
