let quillInstance: any = null

export function setQuillInstance(instance: any) {
  quillInstance = instance
}

export function getQuillInstance() {
  return quillInstance
}

export function insertTextAtCursor(text: string) {
  if (!quillInstance) return false

  const selection = quillInstance.getSelection()
  const index = selection ? selection.index : quillInstance.getLength() - 1

  quillInstance.insertText(index, text, 'user')
  quillInstance.setSelection(index + text.length, 0)
  quillInstance.focus()

  return true
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
    insertTextAtCursor,
  }
}
