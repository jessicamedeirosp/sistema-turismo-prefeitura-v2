"use client";
import { useEffect, useState } from "react";
import { setCookie, getCookie } from "cookies-next";

export default function LGPDCookiePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Só mostra se ainda não aceitou
    const consent = getCookie("LGPD_CONSENT");
    setShow(!consent);
  }, []);

  const handleAccept = () => {
    setCookie("LGPD_CONSENT", "true", { path: "/", maxAge: 60 * 60 * 24 * 365 });
    setShow(false);
    // Aqui você pode disparar qualquer lógica extra, como liberar o mapa
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="bg-white border border-gray-300 shadow-lg rounded-lg px-6 py-4 max-w-md w-full flex flex-col md:flex-row items-center gap-4 pointer-events-auto animate-fade-in">
        <span className="text-gray-700 text-sm flex-1">
          Utilizamos cookies para melhorar sua experiência e para fins estatísticos, conforme a <a href="https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Lei Geral de Proteção de Dados (LGPD)</a>.
        </span>
        <button
          onClick={handleAccept}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
        >
          OK
        </button>
      </div>
    </div>
  );
}
