import { ref } from '@vue/reactivity'

let showOverlayTimeout: number

export const showOverlay = ref(false)

export const handleOverlayAppearance = () => {
  clearTimeout(showOverlayTimeout)
  showOverlay.value = true
  showOverlayTimeout = window.setTimeout(() => showOverlay.value = false, 2000)
}