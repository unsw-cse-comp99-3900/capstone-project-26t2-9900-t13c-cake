"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBrowserPathname } from "@/hooks/useBrowserPathname";
import type { Language } from "@/i18n/translations";

type Labels = {
  menu: string;
  heading: string;
  textSize: string;
  textSizeHelp: string;
  defaultSize: string;
  largeSize: string;
  largerSize: string;
  largestSize: string;
  read: string;
  stop: string;
  speed: string;
  speedHelp: string;
  slow: string;
  normal: string;
  fast: string;
  faster: string;
  contrast: string;
  contrastHelp: string;
  contrastOn: string;
  contrastOff: string;
  enabled: string;
  disabled: string;
  started: string;
  stopped: string;
  finished: string;
  unavailable: string;
  noContent: string;
  error: string;
  help: string;
};

const englishLabels: Labels = {
  menu: "Accessibility",
  heading: "Accessibility settings",
  textSize: "Text size",
  textSizeHelp: "Changes text size on public and administrator pages.",
  defaultSize: "Default (100%)",
  largeSize: "Large (112%)",
  largerSize: "Larger (125%)",
  largestSize: "Largest (150%)",
  read: "Read page aloud",
  stop: "Stop reading",
  speed: "Reading speed",
  speedHelp: "A new speed takes effect from the current highlighted section.",
  slow: "Slow (0.75×)",
  normal: "Normal (1×)",
  fast: "Fast (1.25×)",
  faster: "Faster (1.5×)",
  contrast: "High contrast mode",
  contrastHelp: "Uses black, white and yellow to make text and controls easier to distinguish.",
  contrastOn: "High contrast is on",
  contrastOff: "High contrast is off",
  enabled: "On",
  disabled: "Off",
  started: "Page reading started.",
  stopped: "Page reading stopped.",
  finished: "Page reading finished.",
  unavailable: "Read aloud is not supported by this browser.",
  noContent: "There is no page content to read.",
  error: "The page could not be read aloud.",
  help: "Uses your browser and operating system voice. It does not control VoiceOver or Narrator.",
};

const labelsByLanguage: Record<Language, Labels> = {
  en: englishLabels,
  "zh-CN": {
    menu: "无障碍",
    heading: "无障碍设置",
    textSize: "文字大小",
    textSizeHelp: "更改普通用户页面和管理员页面的文字大小。",
    defaultSize: "默认（100%）",
    largeSize: "大（112%）",
    largerSize: "较大（125%）",
    largestSize: "最大（150%）",
    read: "朗读页面",
    stop: "停止朗读",
    speed: "朗读速度",
    speedHelp: "新速度会从当前高亮内容开始生效。",
    slow: "慢速（0.75×）",
    normal: "正常（1×）",
    fast: "快速（1.25×）",
    faster: "更快（1.5×）",
    contrast: "高对比度模式",
    contrastHelp: "使用黑色、白色和黄色，让文字和控件更容易分辨。",
    contrastOn: "高对比度已开启",
    contrastOff: "高对比度已关闭",
    enabled: "开启",
    disabled: "关闭",
    started: "已开始朗读页面。",
    stopped: "已停止朗读页面。",
    finished: "页面朗读完毕。",
    unavailable: "此浏览器不支持网页朗读。",
    noContent: "当前页面没有可朗读的内容。",
    error: "无法朗读当前页面。",
    help: "使用浏览器和操作系统提供的语音，不会控制 VoiceOver 或 Windows 讲述人。",
  },
  fr: { ...englishLabels, menu: "Accessibilité", heading: "Paramètres d’accessibilité", read: "Lire la page", stop: "Arrêter la lecture" },
  es: { ...englishLabels, menu: "Accesibilidad", heading: "Configuración de accesibilidad", read: "Leer página", stop: "Detener lectura" },
  it: { ...englishLabels, menu: "Accessibilità", heading: "Impostazioni di accessibilità", read: "Leggi la pagina", stop: "Interrompi lettura" },
  de: { ...englishLabels, menu: "Barrierefreiheit", heading: "Einstellungen zur Barrierefreiheit", read: "Seite vorlesen", stop: "Vorlesen stoppen" },
  ja: { ...englishLabels, menu: "アクセシビリティ", heading: "アクセシビリティ設定", read: "ページを読み上げる", stop: "読み上げを停止" },
  ko: { ...englishLabels, menu: "접근성", heading: "접근성 설정", read: "페이지 소리 내어 읽기", stop: "읽기 중지" },
  th: { ...englishLabels, menu: "การช่วยการเข้าถึง", heading: "การตั้งค่าการช่วยการเข้าถึง", read: "อ่านหน้าเว็บ", stop: "หยุดอ่าน" },
  vi: { ...englishLabels, menu: "Trợ năng", heading: "Cài đặt trợ năng", read: "Đọc trang", stop: "Dừng đọc" },
};

const speechLocales: Record<Language, string> = {
  en: "en-AU",
  "zh-CN": "zh-CN",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  de: "de-DE",
  ja: "ja-JP",
  ko: "ko-KR",
  th: "th-TH",
  vi: "vi-VN",
};

const readableSelector = "h1,h2,h3,h4,h5,h6,p,li,dt,dd,th,td,figcaption,blockquote,legend,label";
const textSizes = ["100", "112", "125", "150"] as const;
type TextSize = (typeof textSizes)[number];

type AccessibilityMenuProps = {
  variant?: "default" | "hero" | "questionnaire";
};

type SpeechItem = {
  element: HTMLElement;
  text: string;
};

type SettingOption = {
  value: string;
  label: string;
};

type SettingSelectProps = {
  label: string;
  describedBy: string;
  value: string;
  options: SettingOption[];
  onChange: (value: string) => void;
};

/** Styled listbox shared by the accessibility settings. */
function SettingSelect({ label, describedBy, value, options, onChange }: SettingSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedLabel = options.find((option) => option.value === value)?.label ?? "";

  useEffect(() => {
    if (!isOpen) return;

    function closeOnPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", closeOnPointerDown);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnPointerDown);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative" style={{ marginTop: "auto" }}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex min-h-12 w-full items-center rounded-lg border border-slate-400 bg-white py-2 pl-3 pr-12 text-left text-slate-950 transition hover:border-[#006b63] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
      >
        <span className="truncate">{selectedLabel}</span>
      </button>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -translate-y-1/2 text-sm text-[#006b63]"
        style={{ right: "20px", top: "50%" }}
      >
        ▾
      </span>

      {isOpen ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 z-60 mt-1 rounded-lg border border-slate-200 bg-white p-1 text-slate-900 shadow-lg"
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={[
                    "block w-full rounded-md px-3 py-2 text-left text-sm font-medium",
                    "hover:bg-teal-700 hover:text-white",
                    "focus:bg-teal-700 focus:text-white focus:outline-none",
                    selected ? "bg-teal-50 text-teal-950" : "bg-white text-slate-900",
                  ].join(" ")}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function isTextSize(value: string | null): value is TextSize {
  return textSizes.includes(value as TextSize);
}

function collectSpeechItems(maximumLength = 220): SpeechItem[] {
  const main = document.querySelector<HTMLElement>("#main-content")
    ?? document.querySelector<HTMLElement>("main");
  if (!main) return [];

  return Array.from(main.querySelectorAll<HTMLElement>(readableSelector))
    .filter((element) => {
      if (element.closest("[aria-hidden='true'],[data-speech-ignore]")) return false;
      if (!element.innerText.trim() || element.getClientRects().length === 0) return false;
      return !element.querySelector(readableSelector);
    })
    .flatMap((element) => splitSpeechText(element.innerText.trim(), maximumLength)
      .map((text) => ({ element, text })));
}

export function splitSpeechText(text: string, maximumLength = 220): string[] {
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";

  const addPart = (part: string) => {
    if (!part) return;
    if (!current) {
      current = part;
      return;
    }
    if (`${current} ${part}`.length <= maximumLength) {
      current = `${current} ${part}`;
      return;
    }
    chunks.push(current);
    current = part;
  };

  for (const sentenceValue of sentences) {
    let sentence = sentenceValue.trim();
    while (sentence.length > maximumLength) {
      const candidate = sentence.slice(0, maximumLength);
      const breakAt = Math.max(candidate.lastIndexOf(" "), candidate.lastIndexOf("，"));
      const end = breakAt > maximumLength / 2 ? breakAt : maximumLength;
      addPart(sentence.slice(0, end).trim());
      if (current.length >= maximumLength) {
        chunks.push(current);
        current = "";
      }
      sentence = sentence.slice(end).trim();
    }
    addPart(sentence);
  }

  if (current) chunks.push(current);
  return chunks;
}

function matchingVoice(voices: SpeechSynthesisVoice[], locale: string) {
  const normalisedLocale = locale.toLowerCase();
  const language = normalisedLocale.split("-")[0];
  return voices.find((voice) => voice.lang.toLowerCase() === normalisedLocale && voice.localService)
    ?? voices.find((voice) => voice.lang.toLowerCase() === normalisedLocale)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(`${language}-`) && voice.localService)
    ?? voices.find((voice) => voice.lang.toLowerCase().startsWith(`${language}-`));
}

/** Shared public/admin accessibility controls powered by browser-native APIs. */
export function AccessibilityMenu({ variant = "default" }: AccessibilityMenuProps) {
  const pathname = useBrowserPathname();
  const { language } = useLanguage();
  const labels = labelsByLanguage[language];
  const locale = speechLocales[language];
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("100");
  const [rate, setRate] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelHeadingRef = useRef<HTMLHeadingElement>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const speechItemsRef = useRef<SpeechItem[]>([]);
  const currentItemRef = useRef(0);
  const sessionRef = useRef(0);
  const rateRef = useRef(1);

  const clearHighlight = useCallback(() => {
    highlightedElementRef.current?.classList.remove("read-aloud-highlight");
    highlightedElementRef.current = null;
  }, []);

  const cancelSpeech = useCallback((message = "") => {
    sessionRef.current += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearHighlight();
    setIsReading(false);
    setStatusMessage(message);
  }, [clearHighlight]);

  useEffect(() => {
    const savedSize = window.localStorage.getItem("cake-accessibility-text-size");
    const savedRate = Number(window.localStorage.getItem("cake-accessibility-reading-rate"));
    const savedContrast = window.localStorage.getItem("cake-accessibility-high-contrast") === "true";
    if (isTextSize(savedSize)) {
      setTextSize(savedSize);
      document.documentElement.dataset.accessibilityTextSize = savedSize;
    }
    if ([0.75, 1, 1.25, 1.5].includes(savedRate)) {
      setRate(savedRate);
      rateRef.current = savedRate;
    }
    setIsHighContrast(savedContrast);
    if (savedContrast) document.documentElement.dataset.accessibilityContrast = "high";

    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    setIsSupported(supported);
    if (!supported) return undefined;

    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  useEffect(() => {
    cancelSpeech();
    setIsOpen(false);
  }, [cancelSpeech, language, pathname]);

  useEffect(() => () => {
    sessionRef.current += 1;
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    clearHighlight();
  }, [clearHighlight]);

  useEffect(() => {
    if (!isOpen) return undefined;
    panelHeadingRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setIsOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  const selectedVoice = useMemo(() => matchingVoice(voices, locale), [locale, voices]);

  const startReading = useCallback((startAt = 0) => {
    if (!isSupported) {
      setStatusMessage(labels.unavailable);
      return;
    }

    const items = collectSpeechItems();
    if (!items.length) {
      setStatusMessage(labels.noContent);
      return;
    }

    window.speechSynthesis.cancel();
    clearHighlight();
    speechItemsRef.current = items;
    const session = sessionRef.current + 1;
    sessionRef.current = session;
    setIsReading(true);
    setStatusMessage(labels.started);

    const speakItem = (index: number) => {
      if (sessionRef.current !== session) return;
      if (index >= speechItemsRef.current.length) {
        clearHighlight();
        setIsReading(false);
        setStatusMessage(labels.finished);
        return;
      }

      currentItemRef.current = index;
      const item = speechItemsRef.current[index];
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = locale;
      utterance.rate = rateRef.current;
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => {
        clearHighlight();
        item.element.classList.add("read-aloud-highlight");
        highlightedElementRef.current = item.element;
        item.element.scrollIntoView({ block: "center", behavior: "auto" });
      };
      utterance.onend = () => speakItem(index + 1);
      utterance.onerror = (event) => {
        if (event.error === "canceled" || event.error === "interrupted") return;
        if (sessionRef.current === session) {
          clearHighlight();
          setIsReading(false);
          setStatusMessage(labels.error);
        }
      };
      window.speechSynthesis.speak(utterance);
    };

    window.setTimeout(() => speakItem(Math.min(startAt, items.length - 1)), 50);
  }, [clearHighlight, isSupported, labels, locale, selectedVoice]);

  function changeTextSize(value: string) {
    if (!isTextSize(value)) return;
    setTextSize(value);
    document.documentElement.dataset.accessibilityTextSize = value;
    window.localStorage.setItem("cake-accessibility-text-size", value);
  }

  function changeRate(value: string) {
    const nextRate = Number(value);
    if (![0.75, 1, 1.25, 1.5].includes(nextRate)) return;
    setRate(nextRate);
    rateRef.current = nextRate;
    window.localStorage.setItem("cake-accessibility-reading-rate", String(nextRate));
    if (isReading) {
      const resumeAt = currentItemRef.current;
      cancelSpeech();
      window.setTimeout(() => startReading(resumeAt), 50);
    }
  }

  function toggleHighContrast() {
    const nextValue = !isHighContrast;
    setIsHighContrast(nextValue);
    if (nextValue) {
      document.documentElement.dataset.accessibilityContrast = "high";
    } else {
      delete document.documentElement.dataset.accessibilityContrast;
    }
    window.localStorage.setItem("cake-accessibility-high-contrast", String(nextValue));
    setStatusMessage(nextValue ? labels.contrastOn : labels.contrastOff);
  }

  const isHero = variant === "hero";
  const isQuestionnaire = variant === "questionnaire";
  const textSizeOptions = [
    { value: "100", label: labels.defaultSize },
    { value: "112", label: labels.largeSize },
    { value: "125", label: labels.largerSize },
    { value: "150", label: labels.largestSize },
  ];
  const readingSpeedOptions = [
    { value: "0.75", label: labels.slow },
    { value: "1", label: labels.normal },
    { value: "1.25", label: labels.fast },
    { value: "1.5", label: labels.faster },
  ];

  return (
    <div className="no-print relative z-40" data-speech-ignore>
      <button
        ref={menuButtonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="accessibility-settings"
        onClick={() => setIsOpen((open) => !open)}
        className={[
          "inline-flex min-h-10 items-center gap-2 border px-3 py-2 text-sm font-bold transition focus:outline-3 focus:outline-offset-2",
          isHero
            ? "border-teal-100/85 bg-transparent text-white hover:border-teal-100 hover:bg-white/10 focus:outline-white"
            : isQuestionnaire
              ? "border-white/45 bg-transparent text-white hover:border-white/80 hover:bg-white/10 focus:outline-white"
              : "rounded-lg border-slate-300 bg-white text-[#004c45] hover:border-[#006b63] hover:bg-[#edf8f5] focus:outline-teal-700",
        ].join(" ")}
      >
        <span
          aria-hidden="true"
          className="flex size-5 items-center justify-center border border-current font-[Georgia,serif] text-xs"
        >
          A
        </span>
        <span>{labels.menu}</span>
        <span aria-hidden="true" className="text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <section
          id="accessibility-settings"
          aria-labelledby="accessibility-settings-heading"
          className="absolute right-0 top-full z-50 mt-2 rounded-xl border border-[#2d7f78] text-slate-900"
          style={{
            width: "min(28rem, calc(100vw - 2rem))",
            backgroundColor: "#f3fbf8",
            boxShadow: "0 20px 55px rgba(0, 36, 33, 0.28)",
          }}
        >
          <div className="p-5 sm:p-6">
            <div className="mb-5">
              <h2
                id="accessibility-settings-heading"
                ref={panelHeadingRef}
                tabIndex={-1}
                className="font-[Georgia,serif] text-2xl font-normal text-[#003f3b] outline-none"
              >
                {labels.heading}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col self-stretch">
                <p id="accessibility-text-size-label" className="mb-1 block font-bold text-[#003f3b]">
                  {labels.textSize}
                </p>
                <p id="accessibility-text-size-help" className="mb-2 text-sm leading-5 text-slate-600">
                  {labels.textSizeHelp}
                </p>
                <SettingSelect
                  label={labels.textSize}
                  value={textSize}
                  describedBy="accessibility-text-size-help"
                  options={textSizeOptions}
                  onChange={changeTextSize}
                />
              </div>

              <div className="flex flex-col self-stretch">
                <p id="accessibility-reading-speed-label" className="mb-1 block font-bold text-[#003f3b]">
                  {labels.speed}
                </p>
                <p id="accessibility-reading-speed-help" className="mb-2 text-sm leading-5 text-slate-600">
                  {labels.speedHelp}
                </p>
                <SettingSelect
                  label={labels.speed}
                  value={String(rate)}
                  describedBy="accessibility-reading-speed-help"
                  options={readingSpeedOptions}
                  onChange={changeRate}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-[#a9d3cc] bg-white p-4">
                  <div>
                    <p id="accessibility-contrast-label" className="font-bold text-[#003f3b]">{labels.contrast}</p>
                    <p id="accessibility-contrast-help" className="mt-1 text-sm leading-5 text-slate-600">
                      {labels.contrastHelp}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isHighContrast}
                    aria-labelledby="accessibility-contrast-label"
                    aria-describedby="accessibility-contrast-help"
                    onClick={toggleHighContrast}
                    className="inline-flex min-h-10 min-w-20 shrink-0 items-center justify-center rounded-full border-2 px-3 py-2 text-sm font-bold transition"
                    style={{
                      borderColor: isHighContrast ? "#003f3b" : "#64748b",
                      backgroundColor: isHighContrast ? "#003f3b" : "#e2e8f0",
                      color: isHighContrast ? "#ffffff" : "#0f172a",
                    }}
                  >
                    {isHighContrast ? labels.enabled : labels.disabled}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  aria-pressed={isReading}
                  aria-describedby="read-aloud-help"
                  disabled={!isSupported}
                  title={!isSupported ? labels.unavailable : undefined}
                  onClick={() => isReading ? cancelSpeech(labels.stopped) : startReading()}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-[#004c45] bg-[#004c45] px-4 py-3 font-bold text-white transition hover:bg-[#006b63] disabled:cursor-not-allowed disabled:border-slate-500 disabled:bg-slate-500"
                >
                  {isReading ? (
                    <span aria-hidden="true" className="inline-block size-3 bg-current" />
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-current">
                      <path d="M3 9v6h4l5 4V5L7 9H3Zm13.5 3a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12Zm-2.5-8.5v2.06a7 7 0 0 1 0 12.88v2.06a9 9 0 0 0 0-17Z" />
                    </svg>
                  )}
                  <span>{isReading ? labels.stop : labels.read}</span>
                </button>
                <p id="read-aloud-help" className="mt-2 text-sm leading-5 text-slate-600">{labels.help}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {statusMessage}
      </p>
    </div>
  );
}
