
const multiCharMap: Record<string, string> = {
  'shch': 'щ',
  'Shch': 'Щ',
  'SHCH': 'Щ',
  'shh': 'щ',
  'Shh': 'Щ',
  'SHh': 'Щ',
  'SHH': 'Щ',
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

const reverseMultiCharMap: Record<string, string> = {}
for (const [latin, cyrillic] of Object.entries(multiCharMap)) {
  if (latin === latin.toLowerCase()) {
    if (!reverseMultiCharMap[cyrillic] || latin.length < reverseMultiCharMap[cyrillic].length) {
      reverseMultiCharMap[cyrillic] = latin
    }
  }
}

const cyrillicToLatinMap: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd',
  'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z', 'и': 'i',
  'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n',
  'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't',
  'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch',
  'ш': 'sh', 'щ': 'shch', 'ъ': '"', 'ы': 'y', 'ь': "'",
  'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D',
  'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z', 'И': 'I',
  'Й': 'J', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N',
  'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T',
  'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch',
  'Ш': 'Sh', 'Щ': 'Shch', 'Ъ': '"', 'Ы': 'Y', 'Ь': "'",
  'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
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

    const latinPrefixes: string[] = []

    let singleLatinPrefix = ''
    let validSinglePrefix = true
    for (const c of prevCyrillic) {
      const latin = reverseSingleCharMap[c]
      if (latin) {
        singleLatinPrefix += latin
      } else {
        validSinglePrefix = false
        break
      }
    }
    if (validSinglePrefix) {
      latinPrefixes.push(singleLatinPrefix)
    }

    let multiLatinPrefix = ''
    let validMultiPrefix = true
    for (const c of prevCyrillic) {
      const multiLatin = reverseMultiCharMap[c]
      if (multiLatin) {
        multiLatinPrefix += multiLatin
      } else {
        const latin = reverseSingleCharMap[c]
        if (latin) {
          multiLatinPrefix += latin
        } else {
          validMultiPrefix = false
          break
        }
      }
    }
    if (validMultiPrefix && multiLatinPrefix !== singleLatinPrefix) {
      latinPrefixes.push(multiLatinPrefix)
    }

    for (const latinPrefix of latinPrefixes) {
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

function isCyrillicChar(char: string): boolean {
  return /^[а-яёА-ЯЁ]$/.test(char)
}

export function shouldReverseTransliterate(char: string): boolean {
  return isCyrillicChar(char)
}

export function reverseTransliterate(text: string): string {
  let result = ''

  for (const char of text) {
    if (char in cyrillicToLatinMap) {
      result += cyrillicToLatinMap[char]
    } else {
      result += char
    }
  }

  return result
}
