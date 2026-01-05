import { ref } from 'vue'
import { insertTextAtCursor } from './useClipboard'

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

const SpeechRecognitionAPI =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null

const isSupported = ref(!!SpeechRecognitionAPI)
const isListening = ref(false)
const transcript = ref('')
const error = ref<string | null>(null)

let recognition: SpeechRecognition | null = null

export function useSpeechRecognition() {
  const startListening = () => {
    if (!isSupported.value) {
      error.value = 'Speech recognition not supported in this browser'
      return
    }

    if (isListening.value) {
      stopListening()
      return
    }

    error.value = null
    transcript.value = ''

    recognition = new SpeechRecognitionAPI!()
    recognition.lang = 'ru-RU'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        insertTextAtCursor(finalTranscript)
      }

      transcript.value = interimTranscript
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        error.value = 'Microphone access denied. Please allow microphone access.'
      } else if (event.error === 'no-speech') {
        error.value = 'No speech detected. Try again.'
      } else {
        error.value = `Error: ${event.error}`
      }
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
      transcript.value = ''
    }

    try {
      recognition.start()
    } catch (e) {
      console.error('Failed to start recognition:', e)
      error.value = 'Failed to start speech recognition'
    }
  }

  const stopListening = () => {
    if (recognition) {
      recognition.stop()
      recognition = null
    }
    isListening.value = false
    transcript.value = ''
  }

  const toggleListening = () => {
    if (isListening.value) {
      stopListening()
    } else {
      startListening()
    }
  }

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening,
  }
}
