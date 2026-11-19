import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  AlertTriangle,
  Info,
  UploadCloud,
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Languages,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileUp,
  Mic,
  MicOff,
  Check,
} from 'lucide-react';
import { ChatMessage, MedicalReportAnalysis, SampleReportTemplate } from '../../types';
import { SAMPLE_REPORTS } from '../../data/sampleReports';
import { ArogyaRobot } from '../common/ArogyaRobot';
import { KintsugiReveal } from '../common/KintsugiPrimitives';

interface AIAssistantProps {
  onEmergencyClick: () => void;
  onNavigateTab: (tab: string) => void;
  patientName?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onEmergencyClick,
  onNavigateTab,
  patientName = 'Suhani Shambwani',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${patientName}! I am **Arogya AI Assistant**, your comprehensive clinical healthcare and wellness AI companion.

I am equipped to answer **all health-related questions**, including:
• **Symptoms & Conditions:** Understand causes, patterns, and what your symptoms might mean (fever, headaches, acidity, blood pressure, diabetes, thyroid, joint pain, etc.).
• **Diet, Nutrition & Lifestyle:** Heart-healthy foods, blood sugar management, hydration, vitamin requirements, and daily wellness habits.
• **Diagnostic Tests & Lab Vitals:** Understand your blood test results (CBC, Hemoglobin, Lipid Profile, HbA1c, Platelets) and clinical reference ranges.
• **Medications & Treatment Concepts:** Learn how medications work, important precautions, and questions to ask your pharmacist.
• **Doctor Visit Preparation:** Prepare chronological symptoms and high-priority questions to ask during your OPD appointments.
• **Medical Reports & Voice Narration:** Upload your lab documents or scan reports anytime for a concise plain-language summary and audio narration!

*Safety Notice: Arogya AI provides clinical information and care navigation. Always consult a qualified physician for individualized medical diagnoses, prescriptions, and treatment plans.*`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'What foods help lower high blood pressure naturally?',
        'What are the common symptoms of diabetes & normal sugar ranges?',
        'What causes frequent headaches & what are home remedies?',
        'Home relief steps for acidity and acid reflux',
        'How to improve deep restorative sleep at night?',
        'What questions should I ask my doctor during OPD consultation?',
      ],
    },
  ]);

  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [voiceStatusMessage, setVoiceStatusMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Health Report Upload & Analysis State
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState<boolean>(true);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState<boolean>(false);
  const [uploadedReport, setUploadedReport] = useState<MedicalReportAnalysis | null>(null);
  const [, setUploadedImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio / Voice State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [spokenProgress, setSpokenProgress] = useState<number>(0);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, uploadedReport]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getSpokenText = (analysis: MedicalReportAnalysis, lang: 'en' | 'hi' | 'mr') => {
    if (lang === 'hi' && analysis.spokenSummaryHi) {
      return analysis.spokenSummaryHi;
    }
    if (lang === 'mr' && analysis.spokenSummaryMr) {
      return analysis.spokenSummaryMr;
    }
    return analysis.spokenSummary || analysis.overallSummary;
  };

  const cleanTextForSpeech = (rawText: string) => {
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

  const handleStartVoice = (overrideText?: string, langOverride?: 'en' | 'hi' | 'mr', msgId?: string) => {
    if (!uploadedReport && !overrideText) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceStatusMessage('Speech synthesis is not supported on this device/browser.');
      return;
    }

    setVoiceStatusMessage(null);
    const currentLang = langOverride || selectedLanguage;
    const rawTextToSpeak =
      overrideText ||
      (uploadedReport ? getSpokenText(uploadedReport, currentLang) : '');

    if (!rawTextToSpeak) return;
    const textToSpeak = cleanTextForSpeech(rawTextToSpeak);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (currentLang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else if (currentLang === 'mr') {
      utterance.lang = 'mr-IN';
      const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.lang.startsWith('hi'));
      if (mrVoice) utterance.voice = mrVoice;
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      setSpokenProgress(5);
      if (msgId) setCurrentlySpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setSpokenProgress(100);
      setCurrentlySpeakingMsgId(null);
      setTimeout(() => setSpokenProgress(0), 1000);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setSpokenProgress(0);
      setCurrentlySpeakingMsgId(null);
    };

    const timer = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        setSpokenProgress(prev => Math.min(prev + 4, 95));
      } else {
        clearInterval(timer);
      }
    }, 500);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio && !isPausedAudio) {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
      } else if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
      }
    }
  };

  const handleStopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setSpokenProgress(0);
      setCurrentlySpeakingMsgId(null);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlayingAudio) {
      handleStartVoice();
    }
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setSelectedLanguage(lang);
    if (isPlayingAudio && uploadedReport) {
      handleStartVoice(undefined, lang);
    }
  };

  const processReportAnalysis = async (
    imageBase64: string,
    fileName: string,
    sampleFallback?: SampleReportTemplate
  ) => {
    setIsAnalyzingReport(true);
    handleStopVoice();

    try {
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          fileName,
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setUploadedReport(data.analysis);
        setUploadedImagePreview(data.analysis.imageUrl || imageBase64);
        addReportToChat(data.analysis);
        setTimeout(() => {
          handleStartVoice(getSpokenText(data.analysis, selectedLanguage));
        }, 600);
      } else if (sampleFallback) {
        setUploadedReport(sampleFallback.mockAnalysis);
        setUploadedImagePreview(sampleFallback.mockAnalysis.imageUrl || null);
        addReportToChat(sampleFallback.mockAnalysis);
        setTimeout(() => {
          handleStartVoice(getSpokenText(sampleFallback.mockAnalysis, selectedLanguage));
        }, 600);
      }
    } catch (err) {
      console.error('Error analyzing report:', err);
      if (sampleFallback) {
        setUploadedReport(sampleFallback.mockAnalysis);
        setUploadedImagePreview(sampleFallback.mockAnalysis.imageUrl || null);
        addReportToChat(sampleFallback.mockAnalysis);
        setTimeout(() => {
          handleStartVoice(getSpokenText(sampleFallback.mockAnalysis, selectedLanguage));
        }, 600);
      }
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const addReportToChat = (rep: MedicalReportAnalysis) => {
    const summaryMsg: ChatMessage = {
      id: `rep-chat-${Date.now()}`,
      sender: 'assistant',
      text: `Report Analyzed: **${rep.reportType}**\n\n**Short Summary:**\n${rep.overallSummary}\n\n${
        rep.abnormalValues && rep.abnormalValues.length > 0
          ? `**Values to Note:** ${rep.abnormalValues.map(v => `${v.testName} (${v.value} ${v.unit || ''} - ${v.status})`).join(', ')}`
          : 'All tested parameters appear within reference ranges.'
      }\n\n*You can tap the **Listen** button above to hear the full spoken explanation, or ask me any follow-up question below.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'What does this value mean?',
        'Is this result normal?',
        'Explain this in simple words',
        'Which values are important?',
        'Summarize the whole report in 30 seconds',
      ],
    };

    setMessages(prev => [...prev, summaryMsg]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImagePreview(base64);
      processReportAnalysis(base64, file.name, SAMPLE_REPORTS[0]);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleReportTemplate) => {
    setUploadedImagePreview(sample.mockAnalysis.imageUrl || null);
    processReportAnalysis(
      sample.mockAnalysis.imageUrl || sample.sampleImageUrl,
      sample.mockAnalysis.fileName,
      sample
    );
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      if (uploadedReport) {
        const res = await fetch('/api/reports/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text.trim(),
            reportContext: uploadedReport,
            language: selectedLanguage,
          }),
        });

        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'I have analyzed your question regarding your medical report.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, botMsg]);
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          }),
        });

        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'I am here to guide your healthcare navigation.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergencyAlert: data.isEmergencyAlert,
        };

        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'I can assist you with understanding hospital departments, questions for your doctor, and OPD booking guidance. What can I help you prepare today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatusMessage('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    setVoiceStatusMessage(null);
    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition: any = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningMic(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setTimeout(() => handleSendMessage(transcript), 300);
        }
      };
      recognition.onerror = () => setIsListeningMic(false);
      recognition.onend = () => setIsListeningMic(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningMic(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#FFFFFF]">
      {/* Editorial Header Banner */}
      <KintsugiReveal>
        <div className="kintsugi-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#4682B4]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="kintsugi-section-label text-[10px] text-[#B0E0E6] mb-2 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voice &amp; Report Companion · Multilingual Guidance</span>
            </div>

            <h2 className="kintsugi-serif text-3xl sm:text-4xl font-semibold uppercase tracking-tight text-[#B0E0E6]">
              Arogya AI <span className="kintsugi-gold-word">Assistant</span>
            </h2>
            <p className="text-[#B0E0E6]/80 text-xs sm:text-sm mt-2 leading-relaxed">
              Upload your health reports to receive an instant, simple <strong className="text-[#FFFFFF]">short summary</strong> and listen in <strong className="text-[#FFFFFF]">voice narration</strong> in English, Hindi, or Marathi.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="kintsugi-btn-gold kintsugi-focus px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Health Report</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigateTab('report-assistant')}
                className="kintsugi-btn-celadon kintsugi-focus px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#B0E0E6]" />
                <span>Open Full Report Studio</span>
              </button>
            </div>
          </div>
        </div>
      </KintsugiReveal>

      {/* Safety Notice */}
      <div className="p-3.5 bg-[#4682B4]/10 rounded-2xl border border-[#4682B4]/30 text-xs text-[#FFFFFF] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#B0E0E6] shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[#B0E0E6]/85">
          <strong className="text-[#B0E0E6]">Medical Notice:</strong> Arogya AI provides plain-language explanations of medical documents and healthcare navigation. It is not a clinical diagnosis. In case of severe symptoms, call <strong className="text-[#FFFFFF]">108 / 112</strong> or launch Emergency SOS immediately.
        </div>
      </div>

      {voiceStatusMessage && (
        <div className="p-3 bg-[#D9534F]/15 border border-[#D9534F]/40 text-[#F08582] rounded-2xl text-xs flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{voiceStatusMessage}</span>
          </span>
          <button
            type="button"
            onClick={() => setVoiceStatusMessage(null)}
            className="p-1 hover:text-[#FFFFFF] cursor-pointer"
            aria-label="Dismiss notice"
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
            setIsUploadPanelOpen(true);
            handleStartVoice();
          } else if (actionType === 'QUEUE_STATUS') {
            onNavigateTab('my-bookings');
          } else if (actionType === 'DOCTOR_QUESTIONS') {
            setInputText('What questions should I ask my doctor during my upcoming OPD visit?');
          }
        }}
      />

      {/* 1. HEALTH REPORT UPLOAD & SAMPLE SELECTOR PANEL */}
      <div className="kintsugi-card rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#4682B4]/15 border border-[#4682B4]/30 text-[#B0E0E6] flex items-center justify-center">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#FFFFFF]">
                Upload Health / Medical Report
              </h3>
              <p className="text-[11px] text-[#B0E0E6]/65">
                Upload a blood test, prescription, or radiology document (JPG, PNG, PDF)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadPanelOpen(!isUploadPanelOpen)}
            className="kintsugi-focus text-xs font-semibold text-[#B0E0E6] hover:text-[#B0E0E6] cursor-pointer"
          >
            {isUploadPanelOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {isUploadPanelOpen && (
          <div className="space-y-4 pt-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#B0E0E6]/30 hover:border-[#4682B4]/60 bg-[#151F2C]/75 hover:bg-[#243346]/90 rounded-2xl p-5 text-center cursor-pointer transition group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2C3E55] border border-[#4682B4]/30 mx-auto flex items-center justify-center text-[#B0E0E6] group-hover:scale-105 transition-transform mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs font-semibold text-[#FFFFFF]">
                Click to browse or drop your medical report
              </div>
              <div className="text-[11px] text-[#B0E0E6]/65 mt-0.5">
                Supports Blood Test, Lipid Profile, Thyroid, X-Ray, and ECG documents
              </div>
            </div>

            <div>
              <div className="kintsugi-section-label text-[10px] text-[#B0E0E6]/65 mb-2">
                Or Test with Pre-Loaded Medical Reports
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_REPORTS.map(sample => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectSample(sample)}
                    className="kintsugi-focus p-2.5 rounded-xl border border-[#B0E0E6]/20 hover:border-[#4682B4]/50 bg-[#151F2C]/80 hover:bg-[#2C3E55]/80 text-left transition text-xs group cursor-pointer"
                  >
                    <div className="font-semibold text-[11px] text-[#FFFFFF] group-hover:text-[#B0E0E6] truncate">
                      {sample.title.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-[#B0E0E6]/60 line-clamp-1 mt-0.5">
                      {sample.category}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-[#B0E0E6] bg-[#4682B4]/12 border border-[#4682B4]/25 px-1.5 py-0.5 rounded">
                      <span>Analyze</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isAnalyzingReport && (
          <div className="p-4 rounded-2xl bg-[#4682B4]/10 border border-[#4682B4]/35 text-center space-y-2 animate-pulse">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B0E0E6]">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Vision AI &amp; OCR Reading Medical Report...</span>
            </div>
            <p className="text-[11px] text-[#B0E0E6]/80">
              Extracting clinical numbers, abnormal flags, and generating plain-language short summary.
            </p>
          </div>
        )}
      </div>

      {/* 2. SHORT SUMMARY & VOICE NARRATION CARD */}
      {uploadedReport && (
        <div className="kintsugi-card rounded-3xl overflow-hidden border border-[#4682B4]/30">
          <div className="bg-[#151F2C] text-[#FFFFFF] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#B0E0E6]/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4682B4]/15 border border-[#4682B4]/35 flex items-center justify-center text-[#B0E0E6]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-semibold text-[#FFFFFF]">
                    {uploadedReport.reportType}
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-[#B0E0E6]/15 text-[#B0E0E6] text-[10px] font-semibold border border-[#B0E0E6]/30">
                    Analyzed
                  </span>
                </div>
                <div className="text-[11px] text-[#B0E0E6]/65">
                  {uploadedReport.labOrHospital || 'Diagnostic Lab'} • {uploadedReport.reportDate || 'Recent'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#243346] p-1 rounded-xl border border-[#B0E0E6]/20 text-xs">
              <Languages className="w-3.5 h-3.5 text-[#B0E0E6] ml-1.5" />
              {(['en', 'hi', 'mr'] as const).map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageChange(lang)}
                  className={`kintsugi-focus px-2.5 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
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

          {/* Interactive Voice Player Bar */}
          <div className="bg-[#243346]/80 border-b border-[#B0E0E6]/15 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (isPlayingAudio && !isPausedAudio) {
                    handlePauseVoice();
                  } else if (isPausedAudio) {
                    handlePauseVoice();
                  } else {
                    handleStartVoice();
                  }
                }}
                className="kintsugi-btn-gold kintsugi-focus w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer"
                title={isPlayingAudio && !isPausedAudio ? 'Pause Narration' : 'Listen to Report Summary'}
              >
                {isPlayingAudio && !isPausedAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div>
                <div className="text-xs font-semibold text-[#FFFFFF] flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#B0E0E6]" />
                  <span>AI Voice Narration</span>
                  {isPlayingAudio && !isPausedAudio && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-[#4682B4] rounded-full animate-bounce" />
                      <span className="w-1 h-4 bg-[#B0E0E6] rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-[#4682B4] rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#B0E0E6]/70">
                  {isPlayingAudio
                    ? isPausedAudio
                      ? 'Narration Paused'
                      : 'Reading summary in simple language...'
                    : 'Tap play to listen to summarized findings'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStartVoice()}
                className="kintsugi-btn-celadon kintsugi-focus p-2 rounded-xl cursor-pointer"
                title="Replay from start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={handleStopVoice}
                disabled={!isPlayingAudio && !isPausedAudio}
                className="kintsugi-btn-celadon kintsugi-focus p-2 rounded-xl disabled:opacity-40 cursor-pointer"
                title="Stop audio"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 bg-[#151F2C] border border-[#B0E0E6]/20 rounded-xl p-0.5 text-[10px] font-semibold">
                {[0.8, 1.0, 1.2].map(speed => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => handleSpeedChange(speed)}
                    className={`kintsugi-focus kintsugi-num px-2 py-1 rounded-lg transition cursor-pointer ${
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

            {isPlayingAudio && (
              <div className="w-full bg-[#151F2C] h-1.5 rounded-full overflow-hidden mt-1 border border-[#B0E0E6]/15">
                <div
                  className="bg-linear-to-r from-[#B0E0E6] to-[#4682B4] h-full transition-all duration-300"
                  style={{ width: `${spokenProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Short Summary Text Body */}
          <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-[#151F2C]/85 border border-[#B0E0E6]/15 space-y-2">
              <div className="kintsugi-section-label text-[10px] text-[#B0E0E6] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Short Summary (Easy Read)</span>
              </div>
              <p className="text-[#FFFFFF] text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {uploadedReport.overallSummary}
              </p>
            </div>

            {uploadedReport.abnormalValues && uploadedReport.abnormalValues.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-[#F08582] mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Values Requiring Attention</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uploadedReport.abnormalValues.map((abn, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#D9534F]/12 border border-[#D9534F]/35 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#FFFFFF]">
                        <span>{abn.testName}</span>
                        <span className="kintsugi-num px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D9534F]/25 text-[#F08582] border border-[#D9534F]/40">
                          {abn.status}: {abn.value} {abn.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#B0E0E6]/80 leading-snug">
                        {abn.simpleExplanation}
                      </div>
                      {abn.referenceRange && (
                        <div className="kintsugi-num text-[10px] text-[#B0E0E6]/55">
                          Normal range: {abn.referenceRange}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadedReport.normalValues && uploadedReport.normalValues.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-[#B0E0E6] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Normal Findings</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {uploadedReport.normalValues.map((norm, i) => (
                    <span
                      key={i}
                      className="kintsugi-num inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#B0E0E6]/10 text-[#B0E0E6] border border-[#B0E0E6]/25 text-xs font-medium"
                    >
                      <Check className="w-3 h-3" />
                      <span>{norm.testName}: {norm.value} {norm.unit || ''} (Normal)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {uploadedReport.doctorDiscussionQuestions && uploadedReport.doctorDiscussionQuestions.length > 0 && (
              <div className="p-3.5 bg-[#243346]/80 rounded-xl border border-[#B0E0E6]/20 text-xs space-y-1">
                <span className="font-semibold block text-[#B0E0E6]">
                  Questions to ask your doctor during your OPD consultation:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[#B0E0E6]/85 text-[11px]">
                  {uploadedReport.doctorDiscussionQuestions.slice(0, 3).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between text-xs text-[#B0E0E6]/65">
              <span>{uploadedReport.disclaimer}</span>
              <button
                type="button"
                onClick={() => onNavigateTab('report-assistant')}
                className="kintsugi-focus text-[#B0E0E6] hover:text-[#B0E0E6] font-semibold underline flex items-center gap-1 shrink-0 ml-2 cursor-pointer"
              >
                <span>Full Studio View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ASSISTANT CHAT THREAD */}
      <div className="kintsugi-card rounded-3xl flex flex-col h-[520px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#B0E0E6]/15 bg-[#151F2C]/85 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B0E0E6]" />
            <span className="font-semibold text-[#FFFFFF]">
              {uploadedReport ? `Chatting about: ${uploadedReport.reportType}` : 'Arogya AI Health Assistant'}
            </span>
          </div>
          {uploadedReport && (
            <button
              type="button"
              onClick={() => {
                setUploadedReport(null);
                setUploadedImagePreview(null);
                handleStopVoice();
              }}
              className="kintsugi-focus text-[#B0E0E6]/70 hover:text-[#F08582] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Clear Report Context</span>
            </button>
          )}
        </div>

        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  isBot ? 'items-start' : 'items-end justify-end'
                }`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-[#4682B4]/15 border border-[#4682B4]/40 text-[#B0E0E6] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${isBot ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      isBot
                        ? 'bg-[#151F2C]/90 text-[#FFFFFF] border border-[#B0E0E6]/20'
                        : 'bg-[#B0E0E6] text-[#1E2A3A] font-medium rounded-br-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {isBot && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (currentlySpeakingMsgId === msg.id && isPlayingAudio) {
                            handleStopVoice();
                          } else {
                            handleStartVoice(msg.text, selectedLanguage, msg.id);
                          }
                        }}
                        className={`kintsugi-focus inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          currentlySpeakingMsgId === msg.id && isPlayingAudio
                            ? 'bg-[#D9534F]/18 text-[#F08582] border border-[#D9534F]/40'
                            : 'bg-[#243346] text-[#B0E0E6] border border-[#B0E0E6]/25 hover:border-[#4682B4]/45 hover:text-[#B0E0E6]'
                        }`}
                      >
                        {currentlySpeakingMsgId === msg.id && isPlayingAudio ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#F08582] animate-ping" />
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

                  {msg.isEmergencyAlert && (
                    <div className="p-3 bg-[#D9534F]/15 border border-[#D9534F]/45 rounded-xl text-xs text-[#FFFFFF] flex items-center justify-between gap-3">
                      <span className="font-semibold flex items-center gap-1.5 text-[#F08582]">
                        <AlertTriangle className="w-4 h-4" />
                        Possible Emergency Symptoms Detected
                      </span>
                      <button
                        type="button"
                        onClick={onEmergencyClick}
                        className="kintsugi-focus px-3 py-1.5 rounded-lg bg-[#D9534F] text-[#1E2A3A] font-bold text-xs cursor-pointer"
                      >
                        Launch Emergency SOS
                      </button>
                    </div>
                  )}

                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSendMessage(prompt)}
                          className="kintsugi-btn-celadon kintsugi-focus px-2.5 py-1.5 rounded-xl text-xs text-left cursor-pointer"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="kintsugi-num text-[10px] text-[#B0E0E6]/50 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-[#B0E0E6]/15 border border-[#B0E0E6]/30 text-[#B0E0E6] flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#B0E0E6]/75 p-2">
              <div className="w-2 h-2 rounded-full bg-[#4682B4] animate-ping" />
              <span>Arogya AI is synthesizing care guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Health Topic Categories */}
        <div className="px-3.5 py-2 border-t border-[#B0E0E6]/15 bg-[#151F2C]/75 overflow-x-auto flex items-center gap-1.5 text-xs no-scrollbar">
          <span className="kintsugi-section-label text-[10px] text-[#B0E0E6]/65 shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B0E0E6]" />
            Topics:
          </span>
          {[
            { id: 'bp', label: 'Blood Pressure & Heart', query: 'What causes high blood pressure and how to control it naturally?' },
            { id: 'diabetes', label: 'Sugar & Diabetes', query: 'What are normal blood sugar ranges and diabetic diet tips?' },
            { id: 'diet', label: 'Nutrition & Hemoglobin', query: 'What foods help boost hemoglobin and energy levels?' },
            { id: 'acidity', label: 'Acidity & Heartburn', query: 'Home remedies and diet changes to stop acid reflux' },
            { id: 'sleep', label: 'Sleep & Rest', query: 'How to fall asleep faster and improve deep sleep quality?' },
            { id: 'headache', label: 'Headaches & Migraine', query: 'Common causes of headaches and when to consult a doctor?' },
            { id: 'fever', label: 'Fever & Home Care', query: 'Safe home care and temperature monitoring for fever' },
            { id: 'doctor', label: 'Consultation Prep', query: 'What questions should I ask my doctor during OPD consultation?' },
          ].map(topic => (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSendMessage(topic.query)}
              className="kintsugi-btn-celadon kintsugi-focus px-2.5 py-1 rounded-lg text-[11px] shrink-0 cursor-pointer"
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#B0E0E6]/15 bg-[#151F2C] flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="kintsugi-btn-celadon kintsugi-focus p-2.5 rounded-xl shrink-0 cursor-pointer"
            title="Upload health report document"
          >
            <UploadCloud className="w-4 h-4 text-[#B0E0E6]" />
          </button>

          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`kintsugi-focus p-2.5 rounded-xl border transition shrink-0 cursor-pointer ${
              isListeningMic
                ? 'bg-[#D9534F] text-[#1E2A3A] border-[#F08582] animate-pulse'
                : 'kintsugi-btn-celadon'
            }`}
            title={isListeningMic ? 'Listening... click to stop' : 'Speak your question'}
          >
            {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={
              uploadedReport
                ? `Ask follow-up on ${uploadedReport.reportType} (e.g., 'What does this value mean?')...`
                : 'Ask ANY health question (e.g., causes of headache, diet for BP, sugar ranges, medications)...'
            }
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="kintsugi-input flex-1 px-4 py-2.5 rounded-xl text-xs"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="kintsugi-btn-gold kintsugi-focus p-2.5 rounded-xl disabled:opacity-40 transition shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
