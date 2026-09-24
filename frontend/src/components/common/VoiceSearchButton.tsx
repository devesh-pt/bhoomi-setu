import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  lang?: string; // 'hi-IN' or 'en-IN'
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onResult,
  lang = 'hi-IN'
}) => {
  const [isListening, setIsListening] = useState(false);

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <button
      type="button"
      onClick={startVoiceRecognition}
      className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
        isListening
          ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
          : 'bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-700'
      }`}
      title="Hindi Voice Search for Khasra or Owner (बोलकर खसरा खोजें)"
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
      <span className="hidden sm:inline">{isListening ? 'Listening...' : 'बोलें (Hindi)'}</span>
    </button>
  );
};
