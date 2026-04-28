"use client";

import { useEffect, useState } from "react";
import { setCookie, getCookie } from 'cookies-next';
import Image from "next/image";
declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}
export const Lang = ({ lang }: { lang: string }) => {
  const languages = ['pt', 'en', 'es', 'fr', 'de', 'zh-CN'];
  // Garante que o idioma padrão seja 'pt' ao carregar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookieLang = getCookie('TSB_LOCALE');
      const storageLang = window.localStorage.getItem('TSB_SELECTED_LANG');
      if (!cookieLang) setCookie('TSB_LOCALE', 'pt', { path: '/' });
      if (!storageLang) window.localStorage.setItem('TSB_SELECTED_LANG', 'pt');
    }
  }, []);

  const handleMenuClick = (lang: string) => {
    setCookie('TSB_LOCALE', lang, { path: '/' });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('TSB_SELECTED_LANG', lang);
    }
    // Atualiza o select do Google Translate se já estiver carregado
    if (typeof window !== 'undefined') {
      const el = document.getElementById('google_translate_element');
      if (el) {
        const selectElements = el.querySelectorAll('select');
        if (selectElements.length) {
          const select = Array.from(selectElements) as HTMLSelectElement[];
          select.forEach((el) => {
            el.value = lang;
            el.dispatchEvent(new Event("change"));
          });
        }
      }
    }
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  useEffect(() => {
    // Use cookie value for active language
    const activeLang = typeof window !== 'undefined' ? (getCookie('TSB_LOCALE') as string) || lang || 'pt' : lang || 'pt';
    if (activeLang === "pt") return;

    // Prevent duplicate script loads
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement("script");
      script.id = 'google-translate-script';
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = function () {
        try {
          if (window.google?.translate) {
            window.google.translate.TranslateElement(
              {
                pageLanguage: 'pt',
                includedLanguages: languages.join(','),
                layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              },
              "google_translate_element"
            );
            setTimeout(() => {
              const el = document.getElementById('google_translate_element');
              if (!el || el.style.display === 'none') {
                return;
              }
              const selectElements = el.querySelectorAll('select');
              if (!selectElements.length) return;
              const select = Array.from(selectElements) as HTMLSelectElement[];
              const forcedLang = window.localStorage.getItem('TSB_SELECTED_LANG') || activeLang;
              select.forEach((el) => {
                el.value = forcedLang;
                el.dispatchEvent(new Event("change"));
              });
            }, 1000);
          }
        } catch (err) {
          console.error('Google Translate init error:', err);
        }
      };

      return () => {
        if (script.parentNode) script.parentNode.removeChild(script);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Injeta CSS para esconder overlays do Google Translate só no client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = 'div[id^=":"] > div > div[style*="position: fixed"], div[class*="VIpgJd"] { display: none !important; }';
      document.body.appendChild(style);
      return () => { if (style.parentNode) style.parentNode.removeChild(style); };
    }
  }, []);

  return (
    <>
      <div
        id="google_translate_element"
        className="boxTradutor"
        style={{ position: 'absolute', left: '-1000px', height: 0, visibility: 'hidden' }}
      ></div>

      <div className="flex items-center gap-2">
        {languages.map((langCode) => {
          return (
            <button
              key={langCode}
              className={`px-1 rounded-sm border-0 border-transparent flex items-center justify-center`}
              title={langCode === 'pt' ? 'Português' : langCode === 'en' ? 'English' : langCode === 'es' ? 'Español' : langCode === 'fr' ? 'Français' : langCode === 'de' ? 'Deutsch' : langCode === 'zh-CN' ? '中文 (Mandarim)' : langCode}
              onClick={() => handleMenuClick(langCode)}
              aria-label={`mudar idioma para ${langCode}`}
              style={{ background: 'none', borderWidth: 2, padding: 0 }}
            >
              {langCode === 'zh-CN' ? (
                <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="24" rx="3" fill="#DE2910" />
                  <g>
                    <polygon points="5,5 6,9 2,6.5 8,6.5 4,9" fill="#FFDE00" />
                    <polygon points="10,3 10.6,4.4 12,4.4 11,5.3 11.6,6.7 10,5.8 8.4,6.7 9,5.3 8,4.4 9.4,4.4" fill="#FFDE00" />
                    <polygon points="10,11 10.6,12.4 12,12.4 11,13.3 11.6,14.7 10,13.8 8.4,14.7 9,13.3 8,12.4 9.4,12.4" fill="#FFDE00" />
                    <polygon points="13,7 13.6,8.4 15,8.4 14,9.3 14.6,10.7 13,9.8 11.4,10.7 12,9.3 11,8.4 12.4,8.4" fill="#FFDE00" />
                    <polygon points="7,7 7.6,8.4 9,8.4 8,9.3 8.6,10.7 7,9.8 5.4,10.7 6,9.3 5,8.4 6.4,8.4" fill="#FFDE00" />
                  </g>
                </svg>
              ) : (
                <Image
                  src={`/${langCode}.svg`}
                  width={32}
                  height={32}
                  alt={`mudar idioma para ${langCode}`}
                  className={`rounded-sm`}
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};
