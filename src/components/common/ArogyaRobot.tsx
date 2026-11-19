import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  Languages,
  AlertCircle,
} from 'lucide-react';

interface ArogyaRobotProps {
  patientName?: string;
  onActionClick?: (actionType: string) => void;
  className?: string;
  showExtendedControls?: boolean;
}

export const ArogyaRobot: React.FC<ArogyaRobotProps> = ({
  patientName = 'Suhani Shambwani',
  onActionClick,
  className = '',
  showExtendedControls = true,
}) => {
  // Speech & Voice State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [activeMood, setActiveMood] = useState<'greeting' | 'speaking' | 'happy' | 'listening'>('greeting');
  const [soundEnabled] = useState<boolean>(true);
  const [interactiveName, setInteractiveName] = useState<string>(patientName);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (patientName) {
      setInteractiveName(patientName);
    }
  }, [patientName]);

  const displayName = interactiveName.replace(/\s*\(.*?\)/g, '').trim() || 'Suhani Shambwani';

  const greetingScripts = {
    en: {
      title: `Welcome to Arogya AI, ${displayName}`,
      speechText: `Welcome to Arogya AI, ${displayName}! I am Arogya, your dedicated AI healthcare companion. I am here to help you understand your medical reports, track your live OPD queues, and assist your hospital care today. Feel free to upload your lab test or ask me any health questions!`,
      tagline: 'AI Healthcare Companion • Ready to Assist',
    },
    hi: {
      title: `आरोग्य एआई में आपका स्वागत है, ${displayName}`,
      speechText: `आरोग्य एआई में आपका हार्दिक स्वागत है, ${displayName} जी! मैं हूँ आरोग्य, आपका पर्सनल एआई स्वास्थ्य साथी। मैं आपकी मेडिकल रिपोर्ट्स को सरल भाषा में समझाने और अस्पताल की ओपीडी कतार में सहायता करने के लिए तैयार हूँ।`,
      tagline: 'एआई स्वास्थ्य साथी • सेवेसाठी तत्पर',
    },
    mr: {
      title: `आरोग्य एआय मध्ये आपले स्वागत आहे, ${displayName}`,
      speechText: `आरोग्य एआय मध्ये आपले मनःपूर्वक स्वागत आहे, ${displayName}! मी आहे आरोग्य, आपला डिजिटल एआय आरोग्य साथी. आपले लॅब रिपोर्ट समजून घेण्यासाठी आणि ओपीडी रांगेची माहिती मिळवण्यासाठी मी सदैव तत्पर आहे.`,
      tagline: 'एआय आरोग्य मार्गदर्शक • सेवेत कार्यरत',
    },
  };

  const currentScript = greetingScripts[selectedLanguage];

  const playRobotChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const notes = [587.33, 880, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.24);
      });
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  const speakGreeting = (forceNewLang?: 'en' | 'hi' | 'mr') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceNotice('Voice synthesis is not supported on this browser.');
      return;
    }

    setVoiceNotice(null);
    const lang = forceNewLang || selectedLanguage;
    const textToSpeak = greetingScripts[lang].speechText;

    window.speechSynthesis.cancel();
    playRobotChime();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      utterance.rate = speechRate;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
        const hiVoice = voices.find(v => v.lang.startsWith('hi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else if (lang === 'mr') {
        utterance.lang = 'mr-IN';
        const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.lang.startsWith('hi'));
        if (mrVoice) utterance.voice = mrVoice;
      } else {
        utterance.lang = 'en-US';
        const naturalVoice = voices.find(
          v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Karen'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setActiveMood('speaking');
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMood('happy');
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMood('greeting');
      };

      window.speechSynthesis.speak(utterance);
    }, 180);
  };

  const handlePauseResume = () => {
    if (!('speechSynthesis' in window)) {
      setVoiceNotice('Voice synthesis is not supported on this browser.');
      return;
    }
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      setActiveMood('speaking');
    } else if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      setActiveMood('listening');
    } else {
      speakGreeting();
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveMood('greeting');
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setSelectedLanguage(lang);
    if (isPlaying) {
      speakGreeting(lang);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={`kintsugi-card relative overflow-hidden rounded-3xl text-[#FFFFFF] p-5 sm:p-7 transition-all duration-300 ${className}`}
    >
      {/* Subtle Kintsugi Gold & Celadon Atmosphere */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#B0E0E6]/8 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#4682B4]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        {/* LEFT: ANIMATED MOVING ROBOT "AROGYA" */}
        <div className="flex flex-col items-center shrink-0 group select-none">
          <div className="mb-2 flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#B0E0E6]/10 border border-[#B0E0E6]/30 text-[11px] font-semibold text-[#B0E0E6]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4682B4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4682B4]" />
            </span>
            <span>Arogya • Voice Companion</span>
            {isPlaying && (
              <span className="ml-1 text-[10px] text-[#1E2A3A] bg-[#B0E0E6] px-1.5 py-0.5 rounded font-bold">
                Speaking
              </span>
            )}
          </div>

          <div className="relative w-44 h-48 sm:w-48 sm:h-52 flex items-center justify-center">
            <div
              className={`absolute inset-4 rounded-full transition-all duration-700 blur-2xl ${
                isPlaying ? 'bg-[#4682B4]/25 scale-110' : 'bg-[#B0E0E6]/12 scale-95'
              }`}
            />

            <div
              onClick={() => {
                if (!isPlaying) speakGreeting();
              }}
              title="Click Arogya to hear the Welcome Voice greeting"
              className="cursor-pointer relative z-10 animate-arogya-float transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <svg
                width="170"
                height="180"
                viewBox="0 0 170 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_12px_24px_rgba(7,13,26,0.7)]"
              >
                <defs>
                  {/* Porcelain-Celadon Body Shell */}
                  <linearGradient id="arogyaBody" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="60%" stopColor="#DCEBF5" />
                    <stop offset="100%" stopColor="#B0E0E6" />
                  </linearGradient>

                  {/* Deep Indigo Metallic Joints */}
                  <linearGradient id="arogyaMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2C3E55" />
                    <stop offset="100%" stopColor="#151F2C" />
                  </linearGradient>

                  {/* Gold Kintsugi Accent */}
                  <linearGradient id="arogyaGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#B0E0E6" />
                    <stop offset="100%" stopColor="#4682B4" />
                  </linearGradient>

                  {/* Indigo Visor Screen */}
                  <linearGradient id="arogyaVisor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E2A3A" />
                    <stop offset="100%" stopColor="#151F2C" />
                  </linearGradient>

                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 1. TOP ANTENNA & BEACON */}
                <rect x="83" y="14" width="4" height="18" rx="2" fill="url(#arogyaMetal)" />
                <circle
                  cx="85"
                  cy="12"
                  r="6"
                  fill="#4682B4"
                  filter="url(#goldGlow)"
                  className="animate-pulse"
                />
                <circle cx="85" cy="12" r="2.8" fill="#FFFFFF" />
                <path
                  d="M75 9 C79 5, 91 5, 95 9"
                  stroke="#4682B4"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={isPlaying ? 'animate-ping' : 'opacity-65'}
                />

                {/* 2. SIDE SENSORS */}
                <rect x="36" y="48" width="8" height="20" rx="4" fill="url(#arogyaMetal)" />
                <circle cx="40" cy="58" r="2.5" fill="#4682B4" className="animate-pulse" />
                <rect x="126" y="48" width="8" height="20" rx="4" fill="url(#arogyaMetal)" />
                <circle cx="130" cy="58" r="2.5" fill="#4682B4" className="animate-pulse" />

                {/* 3. ROBOT HEAD */}
                <rect
                  x="42"
                  y="28"
                  width="86"
                  height="62"
                  rx="24"
                  fill="url(#arogyaBody)"
                  stroke="#4682B4"
                  strokeWidth="2"
                />
                <path
                  d="M52 35 C65 31, 105 31, 118 35"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.7"
                />

                {/* OLED Visor */}
                <rect
                  x="49"
                  y="40"
                  width="72"
                  height="40"
                  rx="14"
                  fill="url(#arogyaVisor)"
                  stroke="#B0E0E6"
                  strokeWidth="1.5"
                />
                <path
                  d="M54 44 Q85 41 116 44"
                  stroke="#B0E0E6"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.35"
                />

                {/* 4. EYES (CELADON & GOLD) */}
                {activeMood === 'happy' ? (
                  <path
                    d="M62 58 Q70 50 78 58"
                    stroke="#4682B4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#goldGlow)"
                  />
                ) : (
                  <g filter="url(#goldGlow)">
                    <rect x="62" y="50" width="15" height="15" rx="5" fill="#B0E0E6" />
                    <circle cx="67" cy="55" r="2" fill="#FFFFFF" />
                    <circle cx="73" cy="61" r="1.5" fill="#4682B4" />
                  </g>
                )}

                {activeMood === 'happy' ? (
                  <path
                    d="M92 58 Q100 50 108 58"
                    stroke="#4682B4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#goldGlow)"
                  />
                ) : (
                  <g filter="url(#goldGlow)">
                    <rect x="93" y="50" width="15" height="15" rx="5" fill="#B0E0E6" />
                    <circle cx="98" cy="55" r="2" fill="#FFFFFF" />
                    <circle cx="104" cy="61" r="1.5" fill="#4682B4" />
                  </g>
                )}

                {/* 5. VOICE EQUALIZER */}
                {isPlaying ? (
                  <g filter="url(#goldGlow)">
                    <rect x="73" y="69" width="3" height="7" rx="1.5" fill="#4682B4" className="animate-pulse" />
                    <rect x="79" y="66" width="3" height="11" rx="1.5" fill="#B0E0E6" />
                    <rect x="85" y="64" width="3" height="13" rx="1.5" fill="#FFFFFF" />
                    <rect x="91" y="67" width="3" height="9" rx="1.5" fill="#B0E0E6" />
                    <rect x="97" y="70" width="3" height="6" rx="1.5" fill="#4682B4" className="animate-pulse" />
                  </g>
                ) : (
                  <path
                    d="M80 72 Q85 76 90 72"
                    stroke="#4682B4"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    filter="url(#goldGlow)"
                  />
                )}

                {/* 6. NECK */}
                <rect x="78" y="90" width="14" height="6" rx="2" fill="url(#arogyaMetal)" />

                {/* 7. TORSO */}
                <rect
                  x="46"
                  y="96"
                  width="78"
                  height="60"
                  rx="20"
                  fill="url(#arogyaBody)"
                  stroke="#4682B4"
                  strokeWidth="2"
                />

                <rect
                  x="56"
                  y="105"
                  width="58"
                  height="34"
                  rx="10"
                  fill="url(#arogyaMetal)"
                  stroke="#B0E0E6"
                  strokeOpacity="0.45"
                  strokeWidth="1.2"
                />

                <text
                  x="85"
                  y="114"
                  textAnchor="middle"
                  fill="#4682B4"
                  fontSize="7.5"
                  fontWeight="800"
                  letterSpacing="1.4"
                  fontFamily="system-ui, sans-serif"
                >
                  AROGYA
                </text>

                <path
                  d="M60 125 L68 125 L72 119 L76 131 L80 121 L84 127 L88 125 L110 125"
                  stroke="#B0E0E6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  filter="url(#goldGlow)"
                  className="animate-arogya-ecg"
                />

                <circle cx="112" cy="103" r="5" fill="#D9534F" />
                <path d="M110 103 H114 M112 101 V105" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />

                {/* 8. ARMS */}
                <path
                  d="M46 104 C35 110, 32 125, 38 135 C41 140, 47 138, 48 134 C43 124, 44 114, 48 108"
                  fill="url(#arogyaBody)"
                  stroke="#B0E0E6"
                  strokeWidth="1.8"
                />

                <g className="animate-arogya-wave">
                  <path
                    d="M124 104 C138 100, 148 90, 150 78 C152 72, 144 70, 140 76 C136 86, 128 96, 122 104"
                    fill="url(#arogyaBody)"
                    stroke="#B0E0E6"
                    strokeWidth="1.8"
                  />
                  <circle cx="147" cy="74" r="5.5" fill="url(#arogyaGold)" />
                  <circle cx="147" cy="74" r="2.2" fill="#1E2A3A" />
                </g>

                {/* 9. LEVITATION THRUSTER */}
                <ellipse cx="85" cy="156" rx="16" ry="4" fill="url(#arogyaMetal)" />
                <path
                  d="M73 158 Q85 174 97 158 Z"
                  fill="#4682B4"
                  opacity="0.7"
                  filter="url(#goldGlow)"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <div className="absolute -bottom-2 w-28 h-4 rounded-full bg-[#151F2C]/85 blur-md animate-arogya-shadow pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => speakGreeting()}
            className="kintsugi-btn-gold kintsugi-focus mt-1 px-4 py-1.5 rounded-xl text-[11px] flex items-center gap-1.5 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Speaking Now...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Say Welcome</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT: WELCOME SPEECH BUBBLE & CONTROLS */}
        <div className="flex-1 space-y-4 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#B0E0E6]/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#4682B4]/15 text-[#B0E0E6] border border-[#4682B4]/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <Bot className="w-3 h-3" />
                <span>Arogya Voice Feature</span>
              </span>
              <span className="text-[#B0E0E6]/40 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-[#B0E0E6]/80 font-medium hidden sm:inline">
                Patient: <strong className="text-[#FFFFFF] underline decoration-[#B0E0E6]/60 underline-offset-2">{displayName}</strong>
              </span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-[#151F2C]/90 p-1 rounded-xl border border-[#B0E0E6]/20 text-xs">
              <Languages className="w-3.5 h-3.5 text-[#B0E0E6] ml-1.5 mr-0.5" />
              {(['en', 'hi', 'mr'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`kintsugi-focus px-2.5 py-1 rounded-lg font-semibold transition text-xs cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          {voiceNotice && (
            <div className="p-2.5 rounded-xl bg-[#D9534F]/15 border border-[#D9534F]/40 text-[#F08582] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{voiceNotice}</span>
            </div>
          )}

          {/* Speech Bubble */}
          <div className="relative bg-[#151F2C]/85 rounded-2xl p-4 sm:p-5 border border-[#B0E0E6]/20 space-y-3">
            <div className="hidden lg:block absolute -left-2 top-8 w-4 h-4 bg-[#151F2C] border-l border-b border-[#B0E0E6]/20 transform rotate-45" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="kintsugi-serif text-xl sm:text-2xl font-semibold text-[#FFFFFF]">
                  {currentScript.title}
                </h3>
                <p className="text-xs text-[#B0E0E6]/80 font-medium mt-0.5">
                  {currentScript.tagline}
                </p>
              </div>

              {/* Equalizer Graphic */}
              <div className="flex items-end gap-1 h-6 px-2 py-1 rounded-lg bg-[#243346] border border-[#B0E0E6]/20">
                {[40, 75, 100, 60, 90, 45, 80].map((height, i) => (
                  <span
                    key={i}
                    style={{
                      height: isPlaying ? `${Math.max(20, (height * (1 + Math.sin(i * 1.5))) % 100)}%` : '30%',
                      transition: 'height 0.15s ease',
                    }}
                    className={`w-1 rounded-full ${
                      isPlaying ? 'bg-[#4682B4] animate-pulse' : 'bg-[#B0E0E6]/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed ${
                isPlaying
                  ? 'bg-[#243346] border-[#4682B4]/45 text-[#FFFFFF]'
                  : 'bg-[#1E2A3A]/80 border-[#B0E0E6]/12 text-[#B0E0E6]/85'
              }`}
            >
              <div className="kintsugi-section-label text-[10px] text-[#B0E0E6] mb-1 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>Arogya Voice Transcript</span>
              </div>
              <p className="font-normal">
                &ldquo;{currentScript.speechText}&rdquo;
              </p>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePauseResume}
                  className="kintsugi-btn-gold kintsugi-focus px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Voice</span>
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Play Welcome Voice Greeting</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => speakGreeting()}
                  title="Replay Welcome from beginning"
                  className="kintsugi-btn-celadon kintsugi-focus p-2 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Replay</span>
                </button>

                {(isPlaying || isPaused) && (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="kintsugi-focus px-3 py-2 rounded-xl bg-[#D9534F]/15 hover:bg-[#D9534F]/25 text-[#F08582] border border-[#D9534F]/40 text-xs font-semibold transition cursor-pointer"
                  >
                    Stop
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#B0E0E6]/70">
                <span className="hidden sm:inline text-[11px]">Speed</span>
                {[0.9, 1.0, 1.2].map(rate => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setSpeechRate(rate);
                      if (isPlaying) {
                        speakGreeting();
                      }
                    }}
                    className={`kintsugi-focus kintsugi-num px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                      speechRate === rate
                        ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                        : 'bg-[#243346] text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {showExtendedControls && (
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="kintsugi-section-label text-[10px] text-[#B0E0E6]/65 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#B0E0E6]" />
                <span>Ask Arogya</span>
              </span>

              <button
                type="button"
                onClick={() => onActionClick?.('REPORT_SUMMARY')}
                className="kintsugi-btn-celadon kintsugi-focus px-3 py-1.5 rounded-xl text-xs cursor-pointer"
              >
                Explain {displayName}&apos;s Lab Report
              </button>

              <button
                type="button"
                onClick={() => onActionClick?.('QUEUE_STATUS')}
                className="kintsugi-btn-celadon kintsugi-focus px-3 py-1.5 rounded-xl text-xs cursor-pointer"
              >
                Live Token A-402 Wait Time
              </button>

              <button
                type="button"
                onClick={() => onActionClick?.('DOCTOR_QUESTIONS')}
                className="kintsugi-btn-celadon kintsugi-focus px-3 py-1.5 rounded-xl text-xs cursor-pointer"
              >
                Questions for Dr. Malhotra
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
