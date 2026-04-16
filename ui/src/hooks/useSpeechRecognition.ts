import { useState, useCallback, useEffect, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  isInitializing: boolean;
  audioStream: MediaStream | null;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const interimTranscriptRef = useRef('');
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'es-ES'; // Spanish language

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Acumular el transcript final y actualizar con interinos
        if (finalTranscript) {
          interimTranscriptRef.current += finalTranscript + ' ';
        }

        // Actualizar el transcript con lo acumulado + interinos para feedback en tiempo real
        const currentTranscript = interimTranscriptRef.current + interimTranscript;
        setTranscript(currentTranscript.trim());

        // Reiniciar el timeout de inactividad cuando hay actividad de voz
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
        inactivityTimeoutRef.current = setTimeout(() => {
          if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 5000); // 5 segundos de inactividad
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Silently handle error without console.error
        setIsListening(false);
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
      };

      recognitionInstance.onend = () => {
        // Si el usuario detuvo manualmente, no reiniciar
        // Si se detuvo por error o timeout, mantener isListening false
        setIsListening(false);
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }
      };

      recognitionRef.current = recognitionInstance;
      setIsSupported(true);
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(async () => {
    if (recognitionRef.current && !isListening) {
      setIsInitializing(true);
      interimTranscriptRef.current = '';
      setTranscript('');

      try {
        // Obtener el stream de audio para visualizador
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);

        // Limpiar timeout anterior si existe
        if (inactivityTimeoutRef.current) {
          clearTimeout(inactivityTimeoutRef.current);
        }

        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        // Error silencioso al acceder al micrófono
        setIsInitializing(false);
      } finally {
        setIsInitializing(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      // Limpiar el transcript al detener
      setTranscript('');
      interimTranscriptRef.current = '';

      // Detener el audio stream
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      }
    }
  }, [isListening, audioStream]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    isInitializing,
    audioStream,
  };
};
