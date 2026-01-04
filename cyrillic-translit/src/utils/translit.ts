// Latin to Cyrillic transliteration mapping
// Multi-character sequences must be checked first (longest match)

const multiCharMap: Record<string, string> = {
  // Multi-character combinations (case-sensitive)
  'shch': 'щ',
  'Shch': 'Щ',
  'SHCH': 'Щ',
  'sh': 'ш',
  'Sh': 'Ш',
  'SH': 'Ш',
  'ch': 'ч',
  'Ch': 'Ч',
  'CH': 'Ч',
  'zh': 'ж',
  'Zh': 'Ж',
  'ZH': 'Ж',
  'ts': 'ц',
  'Ts': 'Ц',
  'TS': 'Ц',
  'yu': 'ю',
  'Yu': 'Ю',
  'YU': 'Ю',
  'ya': 'я',
  'Ya': 'Я',
  'YA': 'Я',
  'yo': 'ё',
  'Yo': 'Ё',
  'YO': 'Ё',
  'ye': 'е',
  'Ye': 'Е',
  'YE': 'Е',
  'kh': 'х',
  'Kh': 'Х',
  'KH': 'Х',
  'ja': 'я',
  'Ja': 'Я',
  'JA': 'Я',
  'ju': 'ю',
  'Ju': 'Ю',
  'JU': 'Ю'
}

const singleCharMap: Record<string, string> = {
  // Lowercase
  'a': 'а',
  'b': 'б',
  'v': 'в',
  'g': 'г',
  'd': 'д',
  'e': 'е',
  'z': 'з',
  'i': 'и',
  'j': 'й',
  'k': 'к',
  'l': 'л',
  'm': 'м',
  'n': 'н',
  'o': 'о',
  'p': 'п',
  'r': 'р',
  's': 'с',
  't': 'т',
  'u': 'у',
  'f': 'ф',
  'h': 'х',
  'c': 'ц',
  'w': 'в',
  'x': 'кс',
  'y': 'ы',
  // Uppercase
  'A': 'А',
  'B': 'Б',
  'V': 'В',
  'G': 'Г',
  'D': 'Д',
  'E': 'Е',
  'Z': 'З',
  'I': 'И',
  'J': 'Й',
  'K': 'К',
  'L': 'Л',
  'M': 'М',
  'N': 'Н',
  'O': 'О',
  'P': 'П',
  'R': 'Р',
  'S': 'С',
  'T': 'Т',
  'U': 'У',
  'F': 'Ф',
  'H': 'Х',
  'C': 'Ц',
  'W': 'В',
  'X': 'Кс',
  'Y': 'Ы',
  // Special characters
  "'": 'ь',  // soft sign
  '"': 'ъ',  // hard sign
}

// Sorted multi-char keys by length (longest first)
const sortedMultiKeys = Object.keys(multiCharMap).sort((a, b) => b.length - a.length)

// Reverse mapping: Cyrillic back to Latin (for multi-char sequences)
const reverseSingleCharMap: Record<string, string> = {}
for (const [latin, cyrillic] of Object.entries(singleCharMap)) {
  // Only add single-char results (skip 'x' -> 'кс')
  if (cyrillic.length === 1) {
    reverseSingleCharMap[cyrillic] = latin
  }
}

// Characters that can start a multi-char sequence
const multiCharStarters = new Set<string>()
// Characters that can be second in a multi-char sequence (mapped from their Cyrillic form)
const multiCharSecondChars = new Map<string, string[]>() // cyrillicFirst -> [latinSecond chars]

for (const key of Object.keys(multiCharMap)) {
  const firstLatin = key.charAt(0)
  multiCharStarters.add(firstLatin)

  // Get the Cyrillic equivalent of the first character
  const firstCyrillic = singleCharMap[firstLatin]
  if (firstCyrillic && key.length >= 2) {
    const secondLatin = key.charAt(1)
    if (!multiCharSecondChars.has(firstCyrillic)) {
      multiCharSecondChars.set(firstCyrillic, [])
    }
    const arr = multiCharSecondChars.get(firstCyrillic)
    if (arr && !arr.includes(secondLatin)) {
      arr.push(secondLatin)
    }
  }
}

/**
 * Check if a character is a Latin letter (a-z, A-Z)
 */
function isLatinChar(char: string): boolean {
  return /^[a-zA-Z]$/.test(char)
}

/**
 * Get the Latin equivalent of a Cyrillic character (if it was from single-char mapping)
 */
export function getLatinFromCyrillic(cyrillic: string): string | undefined {
  return reverseSingleCharMap[cyrillic]
}

/**
 * Check if a Cyrillic char + new Latin char could form a multi-char sequence
 */
export function canFormMultiChar(prevCyrillic: string, newLatin: string): boolean {
  const possibleSeconds = multiCharSecondChars.get(prevCyrillic)
  return possibleSeconds ? possibleSeconds.includes(newLatin) || possibleSeconds.includes(newLatin.toLowerCase()) : false
}

/**
 * Try to form a multi-char transliteration from previous Cyrillic + new Latin
 * Returns { result, charsToDelete } or null if no match
 */
export function tryMultiCharTranslit(
  prevChars: string,
  newChar: string
): { result: string; charsToDelete: number } | null {
  // Try to match up to 3 previous Cyrillic chars + new Latin char
  for (let lookback = Math.min(3, prevChars.length); lookback >= 1; lookback--) {
    const prevCyrillic = prevChars.slice(-lookback)

    // Convert previous Cyrillic back to Latin
    let latinPrefix = ''
    let validPrefix = true
    for (const c of prevCyrillic) {
      const latin = reverseSingleCharMap[c]
      if (latin) {
        latinPrefix += latin
      } else {
        validPrefix = false
        break
      }
    }

    if (!validPrefix) continue

    // Try to match latinPrefix + newChar against multi-char sequences
    const combined = latinPrefix + newChar
    for (const key of sortedMultiKeys) {
      if (combined === key || combined.toLowerCase() === key.toLowerCase()) {
        // Check for case-sensitive match first
        if (multiCharMap[combined]) {
          return { result: multiCharMap[combined], charsToDelete: lookback }
        }
        // Try with proper casing
        if (multiCharMap[key]) {
          return { result: multiCharMap[key], charsToDelete: lookback }
        }
      }
      // Check if combined starts with the key
      if (key.length <= combined.length && combined.slice(0, key.length).toLowerCase() === key.toLowerCase()) {
        const matchKey = Object.keys(multiCharMap).find(k => k.toLowerCase() === combined.slice(0, key.length).toLowerCase())
        if (matchKey) {
          const remainder = combined.slice(key.length)
          const transliteratedRemainder = remainder ? transliterate(remainder) : ''
          return { result: multiCharMap[matchKey] + transliteratedRemainder, charsToDelete: lookback }
        }
      }
    }
  }

  return null
}

/**
 * Transliterate a string from Latin to Cyrillic
 * Non-Latin characters are left unchanged
 */
export function transliterate(text: string): string {
  let result = ''
  let i = 0

  while (i < text.length) {
    let matched = false

    // Try multi-character matches first (longest match wins)
    for (const key of sortedMultiKeys) {
      const slice = text.slice(i, i + key.length)
      if (slice === key) {
        result += multiCharMap[key]
        i += key.length
        matched = true
        break
      }
    }

    if (!matched) {
      const char = text.charAt(i)
      // Try single character match for Latin letters
      if (char in singleCharMap) {
        result += singleCharMap[char]
      } else {
        // Keep non-Latin characters as-is (Cyrillic, Chinese, numbers, symbols, etc.)
        result += char
      }
      i++
    }
  }

  return result
}

/**
 * Check if a character should be transliterated
 */
export function shouldTransliterate(char: string): boolean {
  return isLatinChar(char) || char === "'" || char === '"'
}
