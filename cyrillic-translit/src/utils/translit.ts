
const multiCharMap: Record<string, string> = {
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
  'JU': 'Ю',
  'je': 'э',
  'Je': 'Э',
  'JE': 'Э'
}

const singleCharMap: Record<string, string> = {
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
  "'": 'ь',
  '"': 'ъ',
}

const sortedMultiKeys = Object.keys(multiCharMap).sort((a, b) => b.length - a.length)

const reverseSingleCharMap: Record<string, string> = {}
for (const [latin, cyrillic] of Object.entries(singleCharMap)) {
  if (cyrillic.length === 1) {
    reverseSingleCharMap[cyrillic] = latin
  }
}

const multiCharStarters = new Set<string>()
const multiCharSecondChars = new Map<string, string[]>()

for (const key of Object.keys(multiCharMap)) {
  const firstLatin = key.charAt(0)
  multiCharStarters.add(firstLatin)

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

function isLatinChar(char: string): boolean {
  return /^[a-zA-Z]$/.test(char)
}

export function getLatinFromCyrillic(cyrillic: string): string | undefined {
  return reverseSingleCharMap[cyrillic]
}

export function canFormMultiChar(prevCyrillic: string, newLatin: string): boolean {
  const possibleSeconds = multiCharSecondChars.get(prevCyrillic)
  return possibleSeconds ? possibleSeconds.includes(newLatin) || possibleSeconds.includes(newLatin.toLowerCase()) : false
}

export function tryMultiCharTranslit(
  prevChars: string,
  newChar: string
): { result: string; charsToDelete: number } | null {
  for (let lookback = Math.min(3, prevChars.length); lookback >= 1; lookback--) {
    const prevCyrillic = prevChars.slice(-lookback)

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

    const combined = latinPrefix + newChar
    for (const key of sortedMultiKeys) {
      if (combined === key || combined.toLowerCase() === key.toLowerCase()) {
        if (multiCharMap[combined]) {
          return { result: multiCharMap[combined], charsToDelete: lookback }
        }
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

export function transliterate(text: string): string {
  let result = ''
  let i = 0

  while (i < text.length) {
    let matched = false

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
      if (char in singleCharMap) {
        result += singleCharMap[char]
      } else {
        result += char
      }
      i++
    }
  }

  return result
}

export function shouldTransliterate(char: string): boolean {
  return isLatinChar(char) || char === "'" || char === '"'
}
