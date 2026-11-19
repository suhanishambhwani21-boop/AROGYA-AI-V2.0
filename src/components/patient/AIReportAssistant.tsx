import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Send,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Languages,
  Info,
  ChevronRight,
  RefreshCw,
  Headphones,
  Maximize2,
  X,
} from 'lucide-react';
import {
  MedicalReportAnalysis,
  SampleReportTemplate,
  ChatMessage,
  AbnormalReportValue,
} from '../../types';
import { SAMPLE_REPORTS } from '../../data/sampleReports';
import { ArogyaRobot } from '../common/ArogyaRobot';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface AIReportAssistantProps {
  onEmergencyClick: () => void;
  onNavigateTab: (tab: string) => void;
  patientName?: string;
}

export const AIReportAssistant: React.FC<AIReportAssistantProps> = ({
  onNavigateTab,
  patientName = 'Suhani Shambwani',
}) => {
  const [, setSelectedSample] = useState<SampleReportTemplate | null>(null);
  const [analysis, setAnalysis] = useState<MedicalReportAnalysis | null>(SAMPLE_REPORTS[0].mockAnalysis);
  const [activeViewMode, setActiveViewMode] = useState<'EASY_READ' | 'LISTEN' | 'ASK_AI'>('EASY_READ');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(SAMPLE_REPORTS[0].mockAnalysis.imageUrl || null);
  const [fullImageModal, setFullImageModal] = useState<boolean>(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);

  // Audio / Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Chat State
  const [currentlySpeakingChatMsgId, setCurrentlySpeakingChatMsgId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'rep-init-1',
      sender: 'assistant',
      text: `Hello! I have analyzed your **${SAMPLE_REPORTS[0].mockAnalysis.reportType}**.
You can ask me **any health-related question** about your test values, medical terms, doctor consultation prep, nutrition advice, or overall health guidance.`,
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatThinking, setIsChatThinking] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (activeViewMode === 'ASK_AI') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatThinking, activeViewMode]);

  const getSpokenScript = (lang: 'en' | 'hi' | 'mr', currentAnalysis: MedicalReportAnalysis) => {
    if (lang === 'hi' && currentAnalysis.spokenSummaryHi) {
      return currentAnalysis.spokenSummaryHi;
    }
    if (lang === 'mr' && currentAnalysis.spokenSummaryMr) {
      return currentAnalysis.spokenSummaryMr;
    }
    return currentAnalysis.spokenSummary;
  };

  const cleanScriptForSpeech = (rawText: string) => {
    return rawText
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .replace(/[\n\r]+/g, '. ')
      .trim();
  };

  const startVoiceNarration = (overrideScript?: string, customLang?: 'en' | 'hi' | 'mr', msgId?: string) => {
    if (!analysis && !overrideScript) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechNotice('Speech synthesis is not supported on this browser.');
      return;
    }

    setSpeechNotice(null);
    const langToUse = customLang || selectedLanguage;
    const rawText = overrideScript || (analysis ? getSpokenScript(langToUse, analysis) : '');
    if (!rawText) return;
    const textToSpeak = cleanScriptForSpeech(rawText);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    if (langToUse === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (langToUse === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      setAudioProgress(0);
      if (msgId) setCurrentlySpeakingChatMsgId(msgId);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setAudioProgress(100);
      setCurrentlySpeakingChatMsgId(null);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setCurrentlySpeakingChatMsgId(null);
    };

    let progress = 0;
    const estDurationSec = (textToSpeak.split(' ').length / (2.5 * playbackSpeed)) * 1000;
    const intervalTime = 200;
    const progressStep = (intervalTime / estDurationSec) * 100;

    const progInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        clearInterval(progInterval);
        return;
      }
      progress = Math.min(99, progress + progressStep);
      setAudioProgress(progress);
    }, intervalTime);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePauseAudio = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingAudio && !isPausedAudio) {
      window.speechSynthesis.pause();
      setIsPausedAudio(true);
    } else if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPausedAudio(false);
    } else {
      startVoiceNarration();
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setAudioProgress(0);
    setCurrentlySpeakingChatMsgId(null);
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setSelectedLanguage(lang);
    if (isPlayingAudio) {
      stopAudio();
      if (analysis) {
        setTimeout(() => startVoiceNarration(undefined, lang), 200);
      }
    }
  };

  const handleFloatingAssistantTrigger = () => {
    setActiveViewMode('LISTEN');
    startVoiceNarration();
  };

  const handleSelectSample = (sample: SampleReportTemplate) => {
    setSelectedSample(sample);
    setAnalysis(sample.mockAnalysis);
    setUploadedPreview(sample.mockAnalysis.imageUrl || sample.sampleImageUrl);
    stopAudio();

    setChatMessages([
      {
        id: `rep-init-${Date.now()}`,
        sender: 'assistant',
        text: `I have analyzed **${sample.title}**. You can ask me follow-up questions, listen to the voice summary, or read simple explanations.`,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    stopAudio();

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setUploadedPreview(base64Data);

      try {
        const response = await fetch('/api/reports/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
          }),
        });

        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setChatMessages([
            {
              id: `rep-init-${Date.now()}`,
              sender: 'assistant',
              text: `Your report **${data.analysis.reportType || file.name}** has been processed with AI Vision. What would you like to understand first?`,
              timestamp: 'Just now',
            },
          ]);
        } else {
          const fallback = {
            ...SAMPLE_REPORTS[0].mockAnalysis,
            fileName: file.name,
            imageUrl: base64Data,
          };
          setAnalysis(fallback);
        }
      } catch (err) {
        console.error('Report upload analysis error:', err);
        const fallback = {
          ...SAMPLE_REPORTS[0].mockAnalysis,
          fileName: file.name,
          imageUrl: base64Data,
        };
        setAnalysis(fallback);
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechNotice('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    setSpeechNotice(null);
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';

    recognition.onstart = () => setIsListeningMic(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListeningMic(false);
      handleSendChatMessage(transcript);
    };
    recognition.onerror = () => setIsListeningMic(false);
    recognition.onend = () => setIsListeningMic(false);

    recognition.start();
  };

  const handleSendChatMessage = async (overridePrompt?: string) => {
    const text = (overridePrompt || chatInput).trim();
    if (!text || isChatThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatThinking(true);

    try {
      const res = await fetch('/api/reports/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          reportContext: analysis,
          history: chatMessages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I am here to help you understand every value on your report.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'Based on your report: Key values are explained above. Please consult your physician for clinical diagnosis.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  const getStatusBadge = (status: AbnormalReportValue['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-[#D9534F]/22 text-[#F08582] border-[#D9534F]/55 animate-pulse';
      case 'HIGH':
        return 'bg-[#4682B4]/18 text-[#B0E0E6] border-[#4682B4]/45';
      case 'LOW':
        return 'bg-[#4682B4]/14 text-[#B0E0E6] border-[#4682B4]/35';
      case 'BORDERLINE':
        return 'bg-[#B0E0E6]/14 text-[#B0E0E6] border-[#B0E0E6]/35';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative pb-16 text-[#FFFFFF]">
      {/* Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#4682B4]/8 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="kintsugi-section-label text-[10px] text-[#B0E0E6] mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multimodal Report Studio · OCR &amp; Voice Synthesis</span>
            </div>

            <h2 className="kintsugi-serif text-3xl sm:text-4xl font-semibold uppercase tracking-tight text-[#B0E0E6]">
              Report Assistant &amp; <span className="kintsugi-gold-word">Voice Reader</span>
            </h2>
            <p className="text-[#B0E0E6]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Upload medical reports, laboratory tests, or discharge papers. Vision OCR extracts clinical values, highlights abnormal markers, translates jargon into simple language, and narrates in English, Hindi, or Marathi.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-[#B0E0E6] bg-[#4682B4]/10 px-3 py-1.5 rounded-xl border border-[#4682B4]/30">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>AI-generated explanation for patient understanding. Not a clinical diagnosis.</span>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {speechNotice && (
        <div className="p-3 bg-[#D9534F]/15 border border-[#D9534F]/40 text-[#F08582] rounded-2xl text-xs flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{speechNotice}</span>
          </span>
          <button
            type="button"
            onClick={() => setSpeechNotice(null)}
            className="p-1 hover:text-[#FFFFFF] cursor-pointer"
            aria-label="Dismiss speech notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Animated Moving Robot "Arogya" */}
      <ArogyaRobot
        patientName={patientName}
        onActionClick={(actionType) => {
          if (actionType === 'REPORT_SUMMARY') {
            setActiveViewMode('LISTEN');
            startVoiceNarration();
          } else if (actionType === 'QUEUE_STATUS') {
            onNavigateTab('my-bookings');
          } else if (actionType === 'DOCTOR_QUESTIONS') {
            setActiveViewMode('EASY_READ');
          }
        }}
      />

      {/* Quick Sample Selector Bar */}
      <div className="kintsugi-card rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]/80 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#B0E0E6]" />
            <span>Try Pre-Loaded Sample Reports</span>
          </div>
          <span className="text-[11px] text-[#B0E0E6]/60">Or upload your custom document below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_REPORTS.map(sample => {
            const isActive = analysis?.reportType === sample.mockAnalysis.reportType;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`kintsugi-focus p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isActive
                    ? 'bg-[#2C3E55] border-[#4682B4]/65 ring-1 ring-[#4682B4]/35'
                    : 'bg-[#151F2C]/80 hover:bg-[#243346] border-[#B0E0E6]/20 text-[#B0E0E6]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#243346] border border-[#B0E0E6]/20 text-[#B0E0E6]">
                      {sample.category.split('/')[0]}
                    </span>
                    <span className="text-[10px] font-bold text-[#B0E0E6] bg-[#4682B4]/12 border border-[#4682B4]/25 px-1.5 py-0.5 rounded-md">
                      {sample.badge}
                    </span>
                  </div>
                  <div className="font-semibold text-[#FFFFFF] text-xs mt-1">{sample.title}</div>
                  <p className="text-[11px] text-[#B0E0E6]/65 mt-1 line-clamp-2">{sample.description}</p>
                </div>
                <div className="mt-2.5 text-[10px] font-semibold text-[#B0E0E6] flex items-center gap-1">
                  <span>Load Sample Report</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="kintsugi-card rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#B0E0E6]/15">
          <div>
            <h3 className="text-base font-semibold text-[#FFFFFF] flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-[#B0E0E6]" />
              <span>Upload Medical Document / Lab Test Image</span>
            </h3>
            <p className="text-xs text-[#B0E0E6]/70 mt-0.5">
              Supports JPEG, PNG, or PDF images of blood tests, lipid panels, ECGs, X-Rays, or prescriptions.
            </p>
          </div>

          <label className="kintsugi-btn-gold kintsugi-focus px-5 py-2.5 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2 shrink-0">
            <UploadCloud className="w-4 h-4" />
            <span>{isAnalyzing ? 'Scanning Document...' : 'Upload Report File'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isAnalyzing}
            />
          </label>
        </div>

        {isAnalyzing && (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#B0E0E6] animate-spin mx-auto" />
            <div className="text-sm font-semibold text-[#FFFFFF]">
              Running OCR Vision &amp; Clinical Entity Extraction...
            </div>
            <p className="text-xs text-[#B0E0E6]/70 max-w-md mx-auto">
              Reading laboratory test markers, identifying reference thresholds, and synthesizing plain-language summary...
            </p>
          </div>
        )}
      </div>

      {/* Main Results Viewport */}
      {analysis && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Report Document Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="kintsugi-card rounded-3xl p-5 space-y-4 lg:sticky lg:top-36">
              <div className="flex items-center justify-between border-b border-[#B0E0E6]/15 pb-3">
                <span className="kintsugi-section-label text-[10px] text-[#B0E0E6]/80 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#B0E0E6]" />
                  <span>Document Preview</span>
                </span>
                <button
                  type="button"
                  onClick={() => setFullImageModal(true)}
                  className="kintsugi-btn-celadon kintsugi-focus px-2 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  title="Expand preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </button>
              </div>

              <div
                onClick={() => setFullImageModal(true)}
                className="relative rounded-2xl overflow-hidden border border-[#B0E0E6]/20 bg-[#151F2C] cursor-pointer group max-h-72 flex items-center justify-center"
              >
                {uploadedPreview ? (
                  <img
                    src={uploadedPreview}
                    alt="Uploaded medical report"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="p-12 text-center text-[#B0E0E6]/50 text-xs">
                    No image preview available
                  </div>
                )}
                <div className="absolute inset-0 bg-[#151F2C]/35 group-hover:bg-[#151F2C]/60 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-3 py-1.5 rounded-xl bg-[#243346] border border-[#4682B4]/50 text-[#B0E0E6] font-semibold text-xs">
                    Click to Enlarge
                  </span>
                </div>
              </div>

              {/* Extracted Metadata Card */}
              <div className="p-3.5 bg-[#151F2C]/85 rounded-2xl border border-[#B0E0E6]/15 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-[#B0E0E6]/65">Report Type</span>
                  <strong className="text-[#FFFFFF] text-right truncate max-w-[170px]">
                    {analysis.reportType}
                  </strong>
                </div>
                {analysis.patientName && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[#B0E0E6]/65">Patient</span>
                    <strong className="text-[#FFFFFF]">{analysis.patientName}</strong>
                  </div>
                )}
                {analysis.reportDate && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[#B0E0E6]/65">Test Date</span>
                    <strong className="kintsugi-num text-[#FFFFFF]">{analysis.reportDate}</strong>
                  </div>
                )}
                {analysis.labOrHospital && (
                  <div className="flex justify-between gap-2">
                    <span className="text-[#B0E0E6]/65">Laboratory</span>
                    <strong className="text-[#FFFFFF] text-right truncate max-w-[170px]">
                      {analysis.labOrHospital}
                    </strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveViewMode('LISTEN');
                  startVoiceNarration();
                }}
                className="kintsugi-btn-gold kintsugi-focus w-full py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Headphones className="w-4 h-4" />
                <span>Listen to AI Voice Explanation</span>
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-8 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="kintsugi-card rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveViewMode('EASY_READ')}
                  className={`kintsugi-focus px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeViewMode === 'EASY_READ'
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF] hover:bg-[#2C3E55]/70'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Easy Read Summary</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveViewMode('LISTEN');
                    if (!isPlayingAudio) startVoiceNarration();
                  }}
                  className={`kintsugi-focus px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeViewMode === 'LISTEN'
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF] hover:bg-[#2C3E55]/70'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Listen to Report</span>
                  {isPlayingAudio && (
                    <span className="w-2 h-2 rounded-full bg-[#1E2A3A] animate-ping" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveViewMode('ASK_AI')}
                  className={`kintsugi-focus px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    activeViewMode === 'ASK_AI'
                      ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                      : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF] hover:bg-[#2C3E55]/70'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              <div className="flex items-center gap-1 bg-[#151F2C] p-1 rounded-xl border border-[#B0E0E6]/20 text-xs font-semibold">
                <Languages className="w-3.5 h-3.5 text-[#B0E0E6] ml-1.5" />
                {(['en', 'hi', 'mr'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleLanguageChange(lang)}
                    className={`kintsugi-focus px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      selectedLanguage === lang
                        ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                        : 'text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                    }`}
                  >
                    {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: EASY READ SUMMARY */}
            {activeViewMode === 'EASY_READ' && (
              <div className="space-y-5">
                <div className="kintsugi-card rounded-3xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="kintsugi-section-label text-[10px] text-[#B0E0E6] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Plain Language Summary</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveViewMode('LISTEN');
                        startVoiceNarration();
                      }}
                      className="kintsugi-focus text-xs font-semibold text-[#B0E0E6] hover:text-[#B0E0E6] flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen to Audio</span>
                    </button>
                  </div>

                  <h3 className="kintsugi-serif text-2xl font-semibold text-[#B0E0E6]">
                    What This Report <span className="kintsugi-gold-word">Means</span>
                  </h3>

                  <p className="text-xs sm:text-sm text-[#FFFFFF]/90 leading-relaxed">
                    {analysis.overallSummary}
                  </p>
                </div>

                {/* Important Findings */}
                <div className="kintsugi-card rounded-3xl p-6 space-y-3">
                  <h4 className="text-base font-semibold text-[#FFFFFF] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#B0E0E6]" />
                    <span>Important Findings &amp; Key Observations</span>
                  </h4>

                  <ul className="space-y-2 text-xs text-[#FFFFFF]">
                    {analysis.keyObservations.map((obs, i) => (
                      <li key={i} className="flex items-start gap-2.5 bg-[#151F2C]/85 p-3 rounded-xl border border-[#B0E0E6]/15">
                        <span className="kintsugi-num w-5 h-5 rounded-lg bg-[#4682B4]/15 border border-[#4682B4]/35 text-[#B0E0E6] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed text-[#B0E0E6]/90">{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Abnormal or Concerning Values */}
                {analysis.abnormalValues.length > 0 && (
                  <div className="kintsugi-card kintsugi-card-critical rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-semibold text-[#F08582] flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Values Requiring Attention ({analysis.abnormalValues.length})</span>
                      </h4>
                      <span className="text-[10px] font-semibold text-[#F08582] bg-[#D9534F]/15 px-2.5 py-0.5 rounded-md border border-[#D9534F]/35">
                        Discuss with Doctor
                      </span>
                    </div>

                    <div className="space-y-3">
                      {analysis.abnormalValues.map((val, i) => (
                        <div
                          key={i}
                          className="bg-[#151F2C]/85 rounded-2xl p-4 border border-[#D9534F]/30 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-semibold text-[#FFFFFF] text-sm">{val.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className="kintsugi-num font-bold text-base text-[#F08582]">
                                {val.value} {val.unit}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getStatusBadge(val.status)}`}>
                                {val.status}
                              </span>
                            </div>
                          </div>

                          <div className="kintsugi-num text-[11px] text-[#B0E0E6]/65">
                            Normal Range: <strong className="text-[#FFFFFF]">{val.referenceRange} {val.unit}</strong>
                          </div>

                          <p className="text-xs text-[#B0E0E6]/90 leading-relaxed bg-[#243346]/80 p-2.5 rounded-xl border border-[#B0E0E6]/15">
                            <strong className="text-[#B0E0E6]">What it means:</strong> {val.simpleExplanation}
                          </p>

                          {val.recommendation && (
                            <div className="text-[11px] text-[#B0E0E6] font-medium flex items-center gap-1">
                              <span>Next Step:</span> {val.recommendation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Normal Values */}
                {analysis.normalValues.length > 0 && (
                  <div className="kintsugi-card rounded-3xl p-6 space-y-4">
                    <h4 className="text-base font-semibold text-[#B0E0E6] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Normal &amp; Healthy Findings ({analysis.normalValues.length})</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.normalValues.map((val, i) => (
                        <div
                          key={i}
                          className="bg-[#151F2C]/85 rounded-2xl p-3.5 border border-[#B0E0E6]/20 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#FFFFFF]">{val.testName}</span>
                            <span className="kintsugi-num font-semibold text-[#B0E0E6] bg-[#B0E0E6]/12 border border-[#B0E0E6]/25 px-2 py-0.5 rounded-md text-[11px]">
                              {val.value} {val.unit}
                            </span>
                          </div>
                          <div className="kintsugi-num text-[10px] text-[#B0E0E6]/55">
                            Normal: {val.referenceRange} {val.unit}
                          </div>
                          <p className="text-[11px] text-[#B0E0E6]/80 leading-snug">
                            {val.simpleExplanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Terminology */}
                {analysis.termExplanations.length > 0 && (
                  <div className="kintsugi-card rounded-3xl p-6 space-y-4">
                    <div>
                      <span className="kintsugi-section-label text-[10px] text-[#B0E0E6]">
                        Medical Jargon Simplified
                      </span>
                      <h4 className="text-base font-semibold text-[#FFFFFF] mt-0.5">
                        Clinical Terms Explained Simply
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.termExplanations.map((t, i) => (
                        <div
                          key={i}
                          className="bg-[#151F2C]/85 rounded-2xl p-4 border border-[#B0E0E6]/20 space-y-1.5 text-xs"
                        >
                          <div className="font-semibold text-[#B0E0E6] text-sm">
                            {t.term}
                          </div>
                          <p className="text-[#FFFFFF]/90 leading-relaxed">
                            {t.simpleMeaning}
                          </p>
                          <div className="text-[11px] text-[#B0E0E6]/70 italic pt-1 border-t border-[#B0E0E6]/12">
                            <strong>Why it matters:</strong> {t.whyItMatters}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Discussion Questions */}
                {analysis.doctorDiscussionQuestions.length > 0 && (
                  <div className="kintsugi-card rounded-3xl p-6 space-y-3 border border-[#4682B4]/25">
                    <h4 className="text-base font-semibold text-[#B0E0E6] flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      <span>Questions to Ask Your Doctor During Consultation</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      {analysis.doctorDiscussionQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="bg-[#151F2C]/85 p-3.5 rounded-2xl border border-[#B0E0E6]/15 font-medium text-[#FFFFFF] flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-lg bg-[#4682B4]/15 text-[#B0E0E6] border border-[#4682B4]/35 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            ?
                          </span>
                          <span className="leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LISTEN TO REPORT */}
            {activeViewMode === 'LISTEN' && (
              <div className="kintsugi-card rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-[#4682B4]/15 border border-[#4682B4]/40 text-[#B0E0E6] flex items-center justify-center mx-auto">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <h3 className="kintsugi-serif text-3xl font-semibold text-[#B0E0E6]">
                    AI Voice <span className="kintsugi-gold-word">Narration</span>
                  </h3>
                  <p className="text-xs text-[#B0E0E6]/75">
                    Listen to a spoken explanation of your report in English, Hindi, or Marathi.
                  </p>
                </div>

                <div className="max-w-xl mx-auto bg-[#151F2C] text-[#FFFFFF] rounded-3xl p-6 sm:p-7 border border-[#4682B4]/25 space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B0E0E6]/15 pb-3 text-xs">
                    <span className="text-[#B0E0E6]/75 font-medium flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-[#B0E0E6]" />
                      <span>Narration Language:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['en', 'hi', 'mr'] as const).map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => handleLanguageChange(lang)}
                          className={`kintsugi-focus px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            selectedLanguage === lang
                              ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                              : 'bg-[#243346] text-[#B0E0E6]/75 hover:text-[#FFFFFF]'
                          }`}
                        >
                          {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#243346]/90 p-4 rounded-2xl border border-[#B0E0E6]/20 text-xs sm:text-sm text-[#FFFFFF] leading-relaxed">
                    &ldquo;{getSpokenScript(selectedLanguage, analysis)}&rdquo;
                  </div>

                  <div className="space-y-1.5">
                    <div className="w-full bg-[#243346] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#B0E0E6]/15">
                      <div
                        className="bg-linear-to-r from-[#B0E0E6] to-[#4682B4] h-full rounded-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="kintsugi-num flex justify-between text-[10px] text-[#B0E0E6]/65">
                      <span>{isPlayingAudio ? 'Speaking...' : 'Ready'}</span>
                      <span>{Math.round(audioProgress)}%</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={togglePauseAudio}
                        className="kintsugi-btn-gold kintsugi-focus w-14 h-14 rounded-2xl flex items-center justify-center cursor-pointer"
                        title={isPlayingAudio && !isPausedAudio ? 'Pause' : 'Play'}
                      >
                        {isPlayingAudio && !isPausedAudio ? (
                          <Pause className="w-6 h-6 fill-current" />
                        ) : (
                          <Play className="w-6 h-6 fill-current ml-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => startVoiceNarration()}
                        className="kintsugi-btn-celadon kintsugi-focus p-3 rounded-2xl cursor-pointer"
                        title="Replay from start"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        onClick={stopAudio}
                        className="kintsugi-btn-celadon kintsugi-focus p-3 rounded-2xl cursor-pointer"
                        title="Stop audio"
                      >
                        <VolumeX className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#243346] border border-[#B0E0E6]/20 p-1.5 rounded-2xl text-xs kintsugi-num">
                      <span className="text-[10px] text-[#B0E0E6]/65 px-1 font-sans">Speed:</span>
                      {[0.75, 1.0, 1.25, 1.5].map(speed => (
                        <button
                          key={speed}
                          type="button"
                          onClick={() => {
                            setPlaybackSpeed(speed);
                            if (isPlayingAudio) {
                              stopAudio();
                              setTimeout(() => startVoiceNarration(), 100);
                            }
                          }}
                          className={`kintsugi-focus px-2 py-1 rounded-lg transition font-semibold cursor-pointer ${
                            playbackSpeed === speed
                              ? 'bg-[#B0E0E6] text-[#1E2A3A]'
                              : 'text-[#B0E0E6]/70 hover:text-[#FFFFFF]'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ASK AI ASSISTANT */}
            {activeViewMode === 'ASK_AI' && (
              <div className="kintsugi-card rounded-3xl flex flex-col h-[560px] overflow-hidden">
                <div className="p-4 border-b border-[#B0E0E6]/15 bg-[#151F2C]/85 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#4682B4]/15 border border-[#4682B4]/35 text-[#B0E0E6] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#FFFFFF] text-xs">
                        Report Q&amp;A Assistant • {analysis.reportType}
                      </div>
                      <div className="text-[10px] text-[#B0E0E6]/65">
                        Answers tailored to your uploaded report values
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-[#B0E0E6] bg-[#B0E0E6]/12 border border-[#B0E0E6]/25 px-2.5 py-0.5 rounded-md">
                    Report Context Active
                  </span>
                </div>

                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
                  {chatMessages.map(msg => {
                    const isBot = msg.sender === 'assistant';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 text-xs sm:text-sm ${isBot ? 'items-start' : 'items-end justify-end'}`}
                      >
                        {isBot && (
                          <div className="w-7 h-7 rounded-lg bg-[#4682B4]/15 border border-[#4682B4]/40 text-[#B0E0E6] flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className={`max-w-lg space-y-1.5 ${isBot ? 'text-left' : 'text-right'}`}>
                          <div
                            className={`p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                              isBot
                                ? 'bg-[#151F2C]/90 text-[#FFFFFF] border border-[#B0E0E6]/20'
                                : 'bg-[#B0E0E6] text-[#1E2A3A] rounded-br-xs font-medium'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {isBot && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentlySpeakingChatMsgId === msg.id && isPlayingAudio) {
                                    stopAudio();
                                  } else {
                                    startVoiceNarration(msg.text, selectedLanguage, msg.id);
                                  }
                                }}
                                className={`kintsugi-focus inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold transition cursor-pointer ${
                                  currentlySpeakingChatMsgId === msg.id && isPlayingAudio
                                    ? 'bg-[#D9534F]/18 text-[#F08582] border border-[#D9534F]/40'
                                    : 'bg-[#243346] text-[#B0E0E6] border border-[#B0E0E6]/25 hover:border-[#4682B4]/45 hover:text-[#B0E0E6]'
                                }`}
                              >
                                {currentlySpeakingChatMsgId === msg.id && isPlayingAudio ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#F08582] animate-ping" />
                                    <VolumeX className="w-3 h-3" />
                                    <span>Stop Voice</span>
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-3 h-3 text-[#B0E0E6]" />
                                    <span>Read Aloud (Voice)</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}

                          <span className="kintsugi-num text-[9px] text-[#B0E0E6]/50 block px-1">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}

                  {isChatThinking && (
                    <div className="flex items-center gap-2 text-xs text-[#B0E0E6]/75 p-2">
                      <div className="w-2 h-2 rounded-full bg-[#4682B4] animate-ping" />
                      <span>Reading report values and preparing answer...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Suggested Prompt Buttons */}
                <div className="px-4 py-2 border-t border-[#B0E0E6]/15 bg-[#151F2C]/70 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    'What does this value mean?',
                    'Is this result normal?',
                    'Explain this in simple words.',
                    'Which diet & foods improve these numbers?',
                    'What questions should I ask my doctor?',
                    'Summarize the whole report in 30 seconds.',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendChatMessage(prompt)}
                      className="kintsugi-btn-celadon kintsugi-focus px-2.5 py-1 rounded-xl text-[11px] shrink-0 cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 sm:p-4 border-t border-[#B0E0E6]/15 bg-[#151F2C] flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask ANY question about this report or related health & diet advice..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    className="kintsugi-input flex-1 px-4 py-2 rounded-xl text-xs"
                  />

                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`kintsugi-focus p-2.5 rounded-xl border transition cursor-pointer ${
                      isListeningMic
                        ? 'bg-[#D9534F] text-[#1E2A3A] border-[#F08582] animate-pulse'
                        : 'kintsugi-btn-celadon'
                    }`}
                    title={isListeningMic ? 'Listening... Speak now' : 'Ask question by voice'}
                  >
                    {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendChatMessage()}
                    disabled={!chatInput.trim() || isChatThinking}
                    className="kintsugi-btn-gold kintsugi-focus p-2.5 rounded-xl disabled:opacity-40 transition shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Voice Assistant Trigger */}
      {analysis && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={handleFloatingAssistantTrigger}
            className="kintsugi-btn-gold kintsugi-focus px-4 py-3 rounded-full text-xs shadow-2xl transition flex items-center gap-2 cursor-pointer"
            title="Listen to AI Explanation"
          >
            <Headphones className="w-4 h-4" />
            <span>AI Voice Assistant</span>
          </button>
        </div>
      )}

      {/* Full Image Zoom Modal */}
      {fullImageModal && uploadedPreview && (
        <div className="fixed inset-0 z-50 bg-[#151F2C]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="kintsugi-card rounded-3xl max-w-3xl w-full p-5 border border-[#4682B4]/35 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#B0E0E6]/15">
              <h3 className="font-semibold text-[#FFFFFF] text-sm">
                Document Preview: {analysis?.reportType || 'Medical Report'}
              </h3>
              <button
                type="button"
                onClick={() => setFullImageModal(false)}
                className="kintsugi-focus p-1 rounded-lg text-[#B0E0E6]/70 hover:text-[#B0E0E6] cursor-pointer"
                aria-label="Close zoom modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-[#151F2C]/75 rounded-2xl mt-3">
              <img
                src={uploadedPreview}
                alt="Enlarged medical document"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
