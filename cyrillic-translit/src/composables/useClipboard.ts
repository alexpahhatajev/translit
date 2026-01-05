let quillInstance: any = null

export function setQuillInstance(instance: any) {
  quillInstance = instance
}

export function useClipboard() {
  const copyText = async (): Promise<boolean> => {
    if (!quillInstance) return false

    const plainText = quillInstance.getText().trim()
    if (!plainText) return false

    try {
      await navigator.clipboard.writeText(plainText)
      return true
    } catch {
      return false
    }
  }

  return {
    copyText,
  }
}
