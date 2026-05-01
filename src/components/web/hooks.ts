/**
 * Web replacements for terminal-specific hooks from @anthropic/ink.
 */
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useInput — replaces @anthropic/ink useInput.
 * Listens for keyboard events on the document.
 */
type InputHandler = (
  input: string,
  key: {
    upArrow: boolean
    downArrow: boolean
    leftArrow: boolean
    rightArrow: boolean
    return: boolean
    escape: boolean
    ctrl: boolean
    shift: boolean
    tab: boolean
    backspace: boolean
    delete: boolean
    meta: boolean
    pageDown: boolean
    pageUp: boolean
  },
) => void

export function useInput(
  handler: InputHandler,
  options?: { isActive?: boolean },
): void {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    if (options?.isActive === false) return

    const onKeyDown = (e: KeyboardEvent) => {
      const key = {
        upArrow: e.key === 'ArrowUp',
        downArrow: e.key === 'ArrowDown',
        leftArrow: e.key === 'ArrowLeft',
        rightArrow: e.key === 'ArrowRight',
        return: e.key === 'Enter',
        escape: e.key === 'Escape',
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        tab: e.key === 'Tab',
        backspace: e.key === 'Backspace',
        delete: e.key === 'Delete',
        meta: e.metaKey,
        pageDown: e.key === 'PageDown',
        pageUp: e.key === 'PageUp',
      }

      // Map the key to a simple string input
      let input = ''
      if (e.key.length === 1) {
        input = e.key
      }

      handlerRef.current(input, key)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [options?.isActive])
}

/**
 * useWindowSize — replaces useTerminalSize.
 * Returns the current window dimensions.
 */
export function useWindowSize(): {
  width: number
  height: number
  columns: number
  rows: number
} {
  const [size, setSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }))

  useEffect(() => {
    const onResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return {
    ...size,
    // Approximate terminal columns/rows for backward compat
    columns: Math.floor(size.width / 8),
    rows: Math.floor(size.height / 20),
  }
}

/**
 * useDocumentFocus — replaces useTerminalFocus.
 * Tracks whether the browser window/tab has focus.
 */
export function useDocumentFocus(): boolean {
  const [hasFocus, setHasFocus] = useState(() =>
    typeof document !== 'undefined' ? document.hasFocus() : true,
  )

  useEffect(() => {
    const onFocus = () => setHasFocus(true)
    const onBlur = () => setHasFocus(false)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return hasFocus
}

/**
 * useDocumentTitle — replaces useTerminalTitle.
 * Sets document.title when title changes.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title
  }, [title])
}

/**
 * useTabVisibility — replaces useTabStatus.
 * Returns the current tab visibility state using Page Visibility API.
 */
export function useTabVisibility(): 'visible' | 'hidden' {
  const [visibility, setVisibility] = useState<'visible' | 'hidden'>(() =>
    typeof document !== 'undefined' ? document.visibilityState : 'visible',
  )

  useEffect(() => {
    const onChange = () => setVisibility(document.visibilityState)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visibility
}

/**
 * setClipboard — replaces @anthropic/ink setClipboard.
 * Uses the Clipboard API.
 */
export async function setClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback for older browsers or insecure contexts
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

/**
 * useWebNotification — replaces useTerminalNotification.
 * Uses the Web Notifications API.
 */
export function useWebNotification(): (title: string, body?: string) => void {
  return useCallback((title: string, body?: string) => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if (Notification.permission !== 'denied') {
      void Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body })
        }
      })
    }
  }, [])
}
