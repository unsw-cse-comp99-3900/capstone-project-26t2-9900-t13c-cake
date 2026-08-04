"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBrowserPathname } from "@/hooks/useBrowserPathname";
import type { Language } from "@/i18n/translations";

const routeNames: Record<string, string> = {
  "/": "Home",
  "/questionnaire": "Questionnaire",
  "/privacy": "Privacy notice",
  "/feedback": "Anonymous feedback",
  "/admin": "Administrator account centre",
  "/admin/records": "Evidence records",
  "/admin/account": "Administrator account settings",
  "/admin/analytics": "Administrator analytics",
  "/admin/forgot-password": "Administrator account recovery",
  "/admin/import-export": "Administrator import and export",
  "/admin/password": "Administrator password settings",
  "/admin/surveys": "Anonymous survey data",
  "/admin/username": "Administrator username settings",
};

const keyboardHintStorageKey = "cake-keyboard-shortcuts-hint-dismissed-language";
const languageStorageKey = "cake-language";
const keyboardHintLabels: Record<Language, {
  heading: string;
  navigate: string;
  activate: string;
  dismiss: string;
  skipMain: string;
  pageLoaded: string;
}> = {
  en: {
    heading: "Keyboard shortcuts available.",
    navigate: "Use Tab to navigate between controls.",
    activate: "Press Enter or Space to activate buttons.",
    dismiss: "Got it",
    skipMain: "Skip to main content",
    pageLoaded: "Page loaded",
  },
  "zh-CN": {
    heading: "可使用键盘快捷操作",
    navigate: "使用 Tab 键在控件之间移动。",
    activate: "按 Enter 或 Space 键使用按钮。",
    dismiss: "知道了",
    skipMain: "跳至主要内容",
    pageLoaded: "页面已加载",
  },
  fr: {
    heading: "Raccourcis clavier disponibles.",
    navigate: "Utilisez Tab pour naviguer entre les commandes.",
    activate: "Appuyez sur Entrée ou Espace pour activer les boutons.",
    dismiss: "Compris",
    skipMain: "Aller au contenu principal",
    pageLoaded: "Page chargée",
  },
  es: {
    heading: "Atajos de teclado disponibles.",
    navigate: "Use Tab para desplazarse entre los controles.",
    activate: "Pulse Intro o Espacio para activar los botones.",
    dismiss: "Entendido",
    skipMain: "Saltar al contenido principal",
    pageLoaded: "Página cargada",
  },
  it: {
    heading: "Scorciatoie da tastiera disponibili.",
    navigate: "Usa Tab per spostarti tra i controlli.",
    activate: "Premi Invio o Spazio per attivare i pulsanti.",
    dismiss: "Ho capito",
    skipMain: "Vai al contenuto principale",
    pageLoaded: "Pagina caricata",
  },
  de: {
    heading: "Tastaturkürzel verfügbar.",
    navigate: "Verwenden Sie Tab, um zwischen Steuerelementen zu wechseln.",
    activate: "Drücken Sie Eingabe oder Leertaste, um Schaltflächen zu aktivieren.",
    dismiss: "Verstanden",
    skipMain: "Zum Hauptinhalt springen",
    pageLoaded: "Seite geladen",
  },
  ja: {
    heading: "キーボードショートカットを利用できます。",
    navigate: "Tabキーでコントロール間を移動します。",
    activate: "EnterキーまたはSpaceキーでボタンを操作します。",
    dismiss: "わかりました",
    skipMain: "メインコンテンツへ移動",
    pageLoaded: "ページを読み込みました",
  },
  ko: {
    heading: "키보드 단축키를 사용할 수 있습니다.",
    navigate: "Tab 키를 사용해 컨트롤 사이를 이동하세요.",
    activate: "Enter 또는 Space 키를 눌러 버튼을 실행하세요.",
    dismiss: "확인",
    skipMain: "본문으로 건너뛰기",
    pageLoaded: "페이지가 로드되었습니다",
  },
  th: {
    heading: "มีแป้นพิมพ์ลัด",
    navigate: "ใช้ปุ่ม Tab เพื่อเลื่อนไประหว่างตัวควบคุม",
    activate: "กด Enter หรือ Space เพื่อใช้งานปุ่ม",
    dismiss: "เข้าใจแล้ว",
    skipMain: "ข้ามไปยังเนื้อหาหลัก",
    pageLoaded: "โหลดหน้าแล้ว",
  },
  vi: {
    heading: "Có thể sử dụng phím tắt.",
    navigate: "Dùng phím Tab để di chuyển giữa các điều khiển.",
    activate: "Nhấn Enter hoặc Space để kích hoạt nút.",
    dismiss: "Đã hiểu",
    skipMain: "Chuyển đến nội dung chính",
    pageLoaded: "Đã tải trang",
  },
};

const keyboardKeyNames = new Set([
  "Tab",
  "Enter",
  "Space",
  "Entrée",
  "Espace",
  "Intro",
  "Espacio",
  "Invio",
  "Spazio",
  "Eingabe",
  "Leertaste",
]);
const keyboardKeyPattern = /(Tab|Enter|Space|Entrée|Espace|Intro|Espacio|Invio|Spazio|Eingabe|Leertaste)/g;

function renderKeyboardHintText(text: string) {
  return text.split(keyboardKeyPattern).map((part, index) => (
    keyboardKeyNames.has(part) ? (
      <strong key={`${part}-${index}`} className="font-extrabold text-[#003f3b]">{part}</strong>
    ) : part
  ));
}

/** CAKE-8: shared keyboard and screen-reader support on public and admin routes. */
export function AccessibilityShell() {
  const pathname = useBrowserPathname();
  const { language, t } = useLanguage();
  const keyboardHint = keyboardHintLabels[language];
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const previousLanguageRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const savedLanguage = window.localStorage.getItem(languageStorageKey);

      // LanguageProvider starts in English before restoring a saved language.
      // Wait for that restoration so the wrong-language hint does not flash.
      if (savedLanguage && savedLanguage !== language && previousLanguageRef.current === null) {
        setShowKeyboardHint(false);
        return;
      }

      if (previousLanguageRef.current !== null && previousLanguageRef.current !== language) {
        setShowKeyboardHint(true);
      } else {
        const dismissedLanguage = window.localStorage.getItem(keyboardHintStorageKey);
        const legacyDismissed = window.localStorage.getItem(
          `cake-keyboard-shortcuts-hint-dismissed-${language}`,
        ) === "true";
        setShowKeyboardHint(dismissedLanguage !== language && !legacyDismissed);
      }
      previousLanguageRef.current = language;
    } catch {
      setShowKeyboardHint(true);
      previousLanguageRef.current = language;
    }
  }, [language]);

  useEffect(() => {
    const routeName = pathname === "/questionnaire"
      ? t("questionnaireLabel")
      : pathname === "/"
        ? t("toolTitle")
        : routeNames[pathname] ?? keyboardHint.pageLoaded;
    document.title = `${routeName} | ${t("toolTitle")}`;
  }, [keyboardHint.pageLoaded, pathname, t]);

  function dismissKeyboardHint() {
    setShowKeyboardHint(false);
    try {
      window.localStorage.setItem(keyboardHintStorageKey, language);
    } catch {
      // The hint can still be dismissed for the current page if storage is unavailable.
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {keyboardHint.skipMain}
      </a>
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {pathname === "/questionnaire"
          ? t("questionnaireLabel")
          : pathname === "/"
            ? t("toolTitle")
            : keyboardHint.pageLoaded}
      </p>
      {showKeyboardHint ? (
        <aside
          aria-labelledby="keyboard-shortcuts-hint-heading"
          aria-live="polite"
          className="keyboard-hint-pop no-print fixed w-[min(22rem,calc(100vw-2rem))] rounded-lg border border-[#2d7f78] p-5 text-slate-900 shadow-[0_18px_45px_rgba(0,36,33,0.26)]"
          data-speech-ignore
          style={{
            backgroundColor: "#f3fbf8",
            borderTopColor: "#006b63",
            borderTopWidth: "4px",
            bottom: "12px",
            opacity: 1,
            right: "12px",
            zIndex: 70,
          }}
        >
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-md border border-[#7eb8b1] bg-white text-[#005f58]"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="6" width="18" height="12" rx="2" />
                <path d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M7 13h.01M10 13h.01M13 13h4M7 16h10" />
              </svg>
            </span>
            <div className="min-w-0">
              <h2 id="keyboard-shortcuts-hint-heading" className="text-base font-bold leading-6 text-[#003f3b]">
                {keyboardHint.heading}
              </h2>
              <p className="mt-2 text-sm leading-5 text-slate-700">
                {renderKeyboardHintText(keyboardHint.navigate)}
              </p>
              <p className="mt-1 text-sm leading-5 text-slate-700">
                {renderKeyboardHintText(keyboardHint.activate)}
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-center border-t border-[#b8d8d3] pt-4">
            <button
              type="button"
              onClick={dismissKeyboardHint}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                dismissKeyboardHint();
              }}
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-[#004c45] bg-[#004c45] px-6 py-2 text-sm font-bold text-white transition hover:bg-[#006b63] focus:outline-3 focus:outline-offset-2 focus:outline-teal-700"
            >
              {keyboardHint.dismiss}
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
