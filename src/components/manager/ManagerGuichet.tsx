import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  Check,
  AlertCircle,
  FileText,
  RotateCcw,
  X,
  Scan,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

type GuichetMode = 'pret' | 'retour';

export const ManagerGuichet: React.FC = () => {
  const {
    exemplaires,
    ouvrages,
    etudiants,
    enregistrerEmprunt,
    enregistrerRetour,
    afficherNotification,
  } = useLibrary();

  const [mode, setMode] = useState<GuichetMode>('pret');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [copyCode, setCopyCode] = useState('');
  const [studentMatricule, setStudentMatricule] = useState(
    etudiants[0]?.matricule || ''
  );
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const handleDetectedCode = useCallback(
    (raw: string) => {
      const upper = raw.toUpperCase();
      if (upper.startsWith('ETU-')) {
        setStudentMatricule(upper);
        setStatusMessage({ text: `Carte étudiant scannée : ${upper}` });
      } else {
        setCopyCode(upper);
        setStatusMessage({ text: `Exemplaire scanné : ${upper}` });
      }
      stopCamera();
      setCameraOpen(false);
    },
    [stopCamera]
  );

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState >= 2) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          handleDetectedCode(code.data.trim());
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, [handleDetectedCode]);

  const startCamera = async () => {
    setCameraOpen(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Accès à la caméra non supporté par ce navigateur.');
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        // Fallback générique si facingMode environment échoue
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      setCameraError('Impossible d’accéder à la caméra. Vérifiez les autorisations.');
      setCameraActive(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFileName(file.name);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imgData.data, imgData.width, imgData.height);
            if (code && code.data) {
              handleDetectedCode(code.data.trim());
            } else {
              setStatusMessage({ text: `Code lu depuis l’image : ${file.name}` });
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const availableCopies = exemplaires.filter((ex) => ex.statut === 'disponible');
  const borrowedCopies = exemplaires.filter(
    (ex) => ex.statut === 'non disponible'
  );

  const handleConfirm = () => {
    if (mode === 'pret') {
      if (!copyCode.trim()) {
        setStatusMessage({
          text: 'Veuillez saisir ou scanner le code de l’exemplaire.',
          isError: true,
        });
        return;
      }
      const res = enregistrerEmprunt(copyCode, studentMatricule);
      if (res.success) {
        afficherNotification(res.message);
        setCopyCode('');
        setStatusMessage(null);
      } else {
        setStatusMessage({ text: res.message, isError: true });
      }
    } else {
      if (!copyCode.trim()) {
        setStatusMessage({
          text: 'Veuillez saisir ou scanner l’exemplaire retourné.',
          isError: true,
        });
        return;
      }
      const res = enregistrerRetour(copyCode);
      if (res.success) {
        afficherNotification(res.message);
        setCopyCode('');
        setStatusMessage(null);
      } else {
        setStatusMessage({ text: res.message, isError: true });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Guichet
        </h1>

        <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('pret');
              setStatusMessage(null);
              setCopyCode('');
            }}
            className={`min-h-[36px] px-4 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'pret'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prêt
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('retour');
              setStatusMessage(null);
              setCopyCode('');
            }}
            className={`min-h-[36px] px-4 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'retour'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Retour
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-4 shadow-2xs">
        {/* Boutons Caméra & Fichiers */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (cameraOpen) {
                stopCamera();
                setCameraOpen(false);
              } else {
                startCamera();
              }
            }}
            className={`min-h-[44px] px-3 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              cameraOpen
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{cameraOpen ? 'Arrêter la caméra' : 'Scanner caméra'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importer code/image</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Viseur caméra actif */}
        {cameraOpen && (
          <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden flex flex-col items-center justify-center border border-slate-800 shadow-inner">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${
                cameraActive ? 'block' : 'hidden'
              }`}
              playsInline
              muted
              autoPlay
            />
            <canvas ref={canvasRef} className="hidden" />

            {cameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-indigo-400 rounded-2xl relative animate-pulse">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-rose-500 shadow-sm" />
                </div>
              </div>
            )}

            {!cameraActive && (
              <div className="text-center p-4 space-y-2">
                <Scan className="w-8 h-8 text-indigo-400 mx-auto animate-spin" />
                <p className="text-xs text-slate-300">
                  {cameraError || 'Connexion au capteur caméra en cours...'}
                </p>
              </div>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            className={`text-xs p-3 rounded-2xl flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            ) : (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {attachedFileName && (
          <div className="text-xs p-2.5 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{attachedFileName}</span>
            </div>
            <button
              type="button"
              onClick={() => setAttachedFileName(null)}
              className="p-1 text-indigo-500 hover:text-indigo-800 cursor-pointer"
              aria-label="Retirer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {mode === 'pret' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Étudiant emprunteur
              </label>
              <select
                value={studentMatricule}
                onChange={(e) => setStudentMatricule(e.target.value)}
                className="w-full min-h-[46px] px-3.5 text-sm bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {etudiants.map((etu) => (
                  <option key={etu.id} value={etu.matricule}>
                    {etu.prenom} {etu.nom} ({etu.matricule})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Code exemplaire
              </label>
              <input
                type="text"
                value={copyCode}
                onChange={(e) => setCopyCode(e.target.value)}
                placeholder="Exemple : EX-CAMUS-02"
                className="w-full min-h-[46px] px-3.5 text-sm font-mono uppercase bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {availableCopies.length > 0 && (
              <select
                value={
                  availableCopies.some(
                    (c) =>
                      c.code_barres.toUpperCase() ===
                      copyCode.trim().toUpperCase()
                  )
                    ? copyCode.trim().toUpperCase()
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) setCopyCode(e.target.value);
                }}
                className="w-full min-h-[44px] px-3.5 text-xs bg-white rounded-2xl border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner un exemplaire disponible...</option>
                {availableCopies.map((c) => {
                  const b = ouvrages.find((o) => o.id === c.ouvrage_id);
                  return (
                    <option key={c.id} value={c.code_barres}>
                      {c.code_barres} — {b?.titre} (Ex. {c.numero})
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        )}

        {mode === 'retour' && (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Code exemplaire retourné
              </label>
              <input
                type="text"
                value={copyCode}
                onChange={(e) => setCopyCode(e.target.value)}
                placeholder="Exemple : EX-CAMUS-01"
                className="w-full min-h-[46px] px-3.5 text-sm font-mono uppercase bg-slate-50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {borrowedCopies.length > 0 && (
              <select
                value={
                  borrowedCopies.some(
                    (c) =>
                      c.code_barres.toUpperCase() ===
                      copyCode.trim().toUpperCase()
                  )
                    ? copyCode.trim().toUpperCase()
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) setCopyCode(e.target.value);
                }}
                className="w-full min-h-[44px] px-3.5 text-xs bg-white rounded-2xl border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sélectionner un prêt actif à restituer...</option>
                {borrowedCopies.map((c) => {
                  const b = ouvrages.find((o) => o.id === c.ouvrage_id);
                  return (
                    <option key={c.id} value={c.code_barres}>
                      {c.code_barres} — {b?.titre} (Ex. {c.numero})
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {mode === 'pret' ? (
            <>
              <Check className="w-4 h-4" />
              <span>Valider le prêt</span>
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Valider le retour</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
