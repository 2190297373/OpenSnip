import { useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { invoke } from "@tauri-apps/api/core";

interface OcrResult {
  full_text: string;
  blocks: OcrBlock[];
  detected_language: string | null;
  image_width: number;
  image_height: number;
  processing_time_ms: number;
}

interface OcrBlock {
  text: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface OcrPanelProps {
  image?: string; // Base64 image
  width?: number;
  height?: number;
  onTextExtracted?: (text: string) => void;
}

export function OcrPanel({ image, width = 0, height = 0, onTextExtracted }: OcrPanelProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("auto");

  const languages = [
    { code: "auto", name: t('ocrPanel.language.auto', { defaultValue: '自动检测' }) },
    { code: "zh-CN", name: t('ocrPanel.language.zh_CN', { defaultValue: '中文' }) },
    { code: "en", name: t('ocrPanel.language.en', { defaultValue: '英语' }) },
    { code: "ja", name: t('ocrPanel.language.ja', { defaultValue: '日语' }) },
    { code: "ko", name: t('ocrPanel.language.ko', { defaultValue: '韩语' }) },
  ];

  const performOcr = useCallback(async () => {
  if (!image) {
      setError(t('ocrPanel.placeholderImage', { defaultValue: '请先截取图片' }));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await invoke<OcrResult>("perform_ocr", {
        imageData: image.replace(/^data:image\/\w+;base64,/, ""),
        width,
        height,
      });

      setResult(response);
      if (onTextExtracted) {
        onTextExtracted(response.full_text);
      }
    } catch (e) {
      setError(`${t('ocrPanel.error', { defaultValue: 'OCR 失败' })}: ${e}`);
    } finally {
      setIsLoading(false);
    }
  }, [image, width, height, language, onTextExtracted]);

  const copyToClipboard = useCallback(() => {
    if (result?.full_text) {
      navigator.clipboard.writeText(result.full_text);
    }
  }, [result]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium">{t('ocrPanel.title', { defaultValue: 'OCR 文字识别' })}</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
        <div className="flex-1 overflow-auto p-3">
        {error && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded">
            {error}
          </div>
        )}

        {!result && !isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p>{t('ocrPanel.placeholderStart', { defaultValue: '点击"识别文字"按钮开始 OCR' })}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <div className="animate-spin text-4xl mb-2">⏳</div>
            <p>{t('ocrPanel.processing', { defaultValue: '正在识别文字...' })}</p>
          </div>
        )}

        {result && !isLoading && (
            <div className="space-y-3">
            {/* Stats */}
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{t('ocrPanel.stats.wordCount', { defaultValue: '字数' })}: {result.full_text.length}</span>
              <span>{t('ocrPanel.stats.language', { defaultValue: '语言' })}: {result.detected_language || t('ocrPanel.unknown', { defaultValue: '未知' })}</span>
              <span>{t('ocrPanel.stats.time', { defaultValue: '耗时' })}: {result.processing_time_ms}ms</span>
            </div>

            {/* Text blocks */}
            {result.blocks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  识别结果 ({result.blocks.length} 个文本块)
                </h4>
                <div className="space-y-2">
                  {result.blocks.map((block, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
                      title={`置信度: ${(block.confidence * 100).toFixed(1)}%`}
                    >
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                        置信度: {(block.confidence * 100).toFixed(1)}% | 位置: {block.bounding_box.x},{block.bounding_box.y}
                      </div>
                      <div className="text-gray-800 dark:text-gray-200">{block.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Full text */}
            <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('ocrPanel.fullText', { defaultValue: '完整文本' })}
              </h4>
              <textarea
                readOnly
                value={result.full_text}
                className="w-full h-32 p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={performOcr}
          disabled={!image || isLoading}
          className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded transition-colors"
        >
          {isLoading ? t('ocrPanel.processing', { defaultValue: '正在识别文字' }) : t('ocrPanel.recognize', { defaultValue: '识别文字' })}
        </button>
        <button
          onClick={copyToClipboard}
          disabled={!result?.full_text}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 rounded transition-colors"
        >
          {t('ocrPanel.copy', { defaultValue: '复制' })}
        </button>
      </div>
    </div>
  );
}

export default OcrPanel;
