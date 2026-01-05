export interface SpellerError {
  code: number
  pos: number
  row: number
  col: number
  len: number
  word: string
  s: string[]
}

export interface SpellerOptions {
  lang?: 'ru' | 'en' | 'uk' | 'ru,en' | 'ru,uk' | 'en,uk' | 'ru,en,uk'
  options?: number
  format?: 'plain' | 'html'
}

export const SPELLER_OPTIONS = {
  IGNORE_DIGITS: 2,
  IGNORE_URLS: 4,
  FIND_REPEAT_WORDS: 8,
  IGNORE_CAPITALIZATION: 512,
}

const API_URL = 'https://speller.yandex.net/services/spellservice.json/checkText'

export async function checkSpelling(
  text: string,
  options: SpellerOptions = {}
): Promise<SpellerError[]> {
  const {
    lang = 'ru',
    options: optionFlags = SPELLER_OPTIONS.IGNORE_URLS | SPELLER_OPTIONS.IGNORE_DIGITS,
    format = 'plain'
  } = options

  const params = new URLSearchParams({
    text,
    lang,
    options: String(optionFlags),
    format,
  })

  try {
    const response = await fetch(`${API_URL}?${params}`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Speller API error: ${response.status}`)
    }

    const errors: SpellerError[] = await response.json()
    return errors
  } catch (error) {
    console.error('Spell check failed:', error)
    return []
  }
}

export function createDebouncedSpellCheck(delay: number = 500) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return (text: string, callback: (errors: SpellerError[]) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(async () => {
      const errors = await checkSpelling(text)
      callback(errors)
    }, delay)
  }
}
