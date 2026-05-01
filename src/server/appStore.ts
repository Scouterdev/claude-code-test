/**
 * Server-side singleton AppState store.
 * Provides a shared store for server functions that need to read/write state.
 */
import { createStore, type Store } from '../state/store.js'
import { type AppState, getDefaultAppState } from '../state/AppStateStore.js'

let store: Store<AppState> | null = null

export function getServerAppStore(): Store<AppState> {
  if (!store) {
    store = createStore<AppState>(getDefaultAppState())
  }
  return store
}
