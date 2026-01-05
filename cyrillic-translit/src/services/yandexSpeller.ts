// Yandex Speller API service
// Documentation: https://yandex.ru/dev/speller/

export interface SpellerError {
  code: number      // Error code
  pos: number       // Position in text
  row: number       // Row number
  col: number       // Column number
  len: number       // Error length
  word: string      // Erroneous word
  s: string[]       // Suggestions
}

export interface SpellerOptions {
  lang?: 'ru' | 'en' | 'uk' | 'ru,en' | 'ru,uk' | 'en,uk' | 'ru,en,uk'
  options?: number  // Bitmask of options
  format?: 'plain' | 'html'
}

// Option flags
export const SPELLER_OPTIONS = {
  IGNORE_DIGITS: 2,           // Ignore words with digits
  IGNORE_URLS: 4,             // Ignore URLs
  FIND_REPEAT_WORDS: 8,       // Find repeated words
  IGNORE_CAPITALIZATION: 512, // Ignore capitalization errors
}

const API_URL = 'https://speller.yandex.net/services/spellservice.json/checkText'

/**
 * Check text for spelling errors using Yandex Speller API
 */
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

/**
 * Debounced spell check function
 */
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
