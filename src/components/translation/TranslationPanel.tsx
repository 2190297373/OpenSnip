import { useState, useCallback, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { invoke } from "@tauri-apps/api/core";

interface LanguageInfo {
  code: string;
  name: string;
}

interface TranslationPanelProps {
  initialText?: string;
  onTranslationComplete?: (text: string) => void;
}


export function TranslationPanel({ initialText = "", onTranslationComplete }: TranslationPanelProps) {
  const [sourceText, setSourceText] = useState(initialText);
  const [translatedText, setTranslatedText] = useState("");
  const { t } = useTranslation();
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("zh-CN");
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);

  // Load languages on mount
  useEffect(() => {
    invoke<LanguageInfo[]>("get_supported_languages")
      .then(setLanguages)
      .catch(console.error);
  }, []);

  // Update source text when initialText changes
  useEffect(() => {
    if (initialText) {
      setSourceText(initialText);
    }
  }, [initialText]);

  const translate = useCallback(async () => {
    if (!sourceText.trim()) {
      setError(t('translationPanel.placeholderInput', { defaultValue: '请输入要翻译的文本' }));
      return;
    }

    if (sourceLang !== "auto" && sourceLang === targetLang) {
      setError(t('translationPanel.languageConflict', { defaultValue: '源语言和目标语言不能相同' }));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const translated = await invoke<string>("translate_text", {
        text: sourceText,
        sourceLang,
        targetLang,
      });

      setTranslatedText(translated);
      setDetectedLang(sourceLang === "auto" ? targetLang : sourceLang);
      
      if (onTranslationComplete) {
        onTranslationComplete(translated);
      }
    } catch (e) {
      setError(t('translationPanel.translateError', { defaultValue: `翻译失败: ${e}` }));
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, onTranslationComplete]);

  const swapLanguages = useCallback(() => {
    if (sourceLang === "auto") return;
    
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  }, [sourceLang, targetLang, sourceText, translatedText]);

  const copyTranslatedText = useCallback(() => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
    }
  }, [translatedText]);

  const clearAll = useCallback(() => {
    setSourceText("");
    setTranslatedText("");
      setDetectedLang(null);
    setError(null);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium">{t('translationPanel.title', { defaultValue: '翻译' })}</h3>
        <button
          onClick={clearAll}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {t('translationPanel.clear', { defaultValue: '清空' })}
        </button>
      </div>

      {/* Language selector */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={swapLanguages}
          disabled={sourceLang === "auto"}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 rounded transition-colors"
          title="交换语言"
        >
          ⇄
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        >
          {languages.filter((lang) => lang.code !== "auto").map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="mx-3 mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {/* Source text */}
        <div className="flex-1 flex flex-col p-3 min-h-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('translationPanel.sourceLabel', { defaultValue: '源文本' })} {detectedLang && `(${t('translationPanel.detected', { defaultValue: '检测到' })}: ${detectedLang})`}
            </span>
            <span className="text-xs text-gray-400">{sourceText.length} 字符</span>
          </div>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          placeholder={t('translationPanel.placeholderInput', { defaultValue: '输入或粘贴要翻译的文本...' })}
          className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 resize-none"
        />
        </div>

        {/* Translate button */}
        <div className="px-3 pb-3">
          <button
            onClick={translate}
            disabled={!sourceText.trim() || isLoading}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded transition-colors"
          >
            {isLoading ? t('translationPanel.translating', { defaultValue: '翻译中...' }) : t('translationPanel.translate', { defaultValue: '翻译' })}
          </button>
        </div>

        {/* Translated text */}
        {translatedText && (
          <div className="flex-1 flex flex-col p-3 border-t border-gray-200 dark:border-gray-700 min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('translationPanel.resultTitle', { defaultValue: '翻译结果' })}</span>
              <button
                onClick={copyTranslatedText}
                className="text-xs text-blue-500 hover:text-blue-600"
              >
                {t('translationPanel.copy', { defaultValue: '复制' })}
              </button>
            </div>
            <textarea
              readOnly
              value={translatedText}
              className="flex-1 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-800 resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default TranslationPanel;
