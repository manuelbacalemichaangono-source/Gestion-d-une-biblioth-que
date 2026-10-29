import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  Upload,
  Check,
  AlertCircle,
  FileText,
  Send,
  RotateCcw,
  X,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

type GuichetMode = 'pret' | 'retour' | 'recu';

export const ManagerGuichet: React.FC = () => {
  const {
    exemplaires,
    ouvrages,
    etudiants,
    emprunts,
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
  const [selectedLoanId, setSelectedLoanId] = useState('');
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
        setStatusMessage({ text: `Carte détectée : ${upper}` });
      } else {
        setCopyCode(upper);
        setStatusMessage({ text: `Code détecté : ${upper}` });
      }
      stopCamera();
      setCameraOpen(false);
    },
    [stopCamera]
  );

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
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
        setCameraError('Caméra non disponible.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch {
      setCameraError('Accès caméra refusé.');
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
              setStatusMessage({ text: `Fichier ${file.name} joint.` });
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setStatusMessage({ text: `Fichier ${file.name} joint.` });
    }
  };

  const activeLoans = emprunts.filter((l) => !l.date_retour_effective);
  const availableCopies = exemplaires.filter((ex) => ex.statut === 'disponible');
  const borrowedCopies = exemplaires.filter(
    (ex) => ex.statut === 'non disponible'
  );

  const handleConfirm = () => {
    if (mode === 'pret') {
      if (!copyCode.trim()) {
        setStatusMessage({
          text: 'Saisissez ou scannez le code de l’exemplaire.',
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
    } else if (mode === 'retour') {
      if (!copyCode.trim()) {
        setStatusMessage({
          text: 'Saisissez ou scannez l’exemplaire retourné.',
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
    } else {
      if (!selectedLoanId) {
        setStatusMessage({
          text: 'Sélectionnez un emprunt.',
          isError: true,
        });
        return;
      }
      const target = emprunts.find((l) => l.id === selectedLoanId);
      afficherNotification(
        `Reçu envoyé à ${target?.etudiant_nom || 'l’étudiant'}.`
      );
      setAttachedFileName(null);
      setStatusMessage(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Guichet
        </h1>

        <div className="inline-flex bg-slate-200/70 p-1 rounded-xl">
          {(
            [
              { key: 'pret', label: 'Prêt' },
              { key: 'retour', label: 'Retour' },
              { key: 'recu', label: 'Reçu' },
            ] as { key: GuichetMode; label: string }[]
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setMode(item.key);
                setStatusMessage(null);
                setCopyCode('');
              }}
              className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                mode === item.key
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
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
            className="min-h-[44px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-600" />
            <span>{cameraOpen ? 'Fermer caméra' : 'Scanner QR'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Importer fichier</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Viseur caméra (affiché uniquement à la demande) */}
        {cameraOpen && (
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${
                cameraActive ? 'block' : 'hidden'
              }`}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraActive && (
              <p className="text-xs text-slate-300 px-4 text-center">
                {cameraError || 'Ouverture de la caméra...'}
              </p>
            )}
          </div>
        )}

        {statusMessage && (
          <div
            className={`text-xs p-3 rounded-xl flex items-center gap-2 ${
              statusMessage.isError
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-50 text-slate-800'
            }`}
          >
            {statusMessage.isError ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
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
            <select
              value={studentMatricule}
              onChange={(e) => setStudentMatricule(e.target.value)}
              className="w-full min-h-[46px] px-3.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {etudiants.map((etu) => (
                <option key={etu.id} value={etu.matricule}>
                  {etu.prenom} {etu.nom} ({etu.matricule})
                </option>
              ))}
            </select>

            <input
              type="text"
              value={copyCode}
              onChange={(e) => setCopyCode(e.target.value)}
              placeholder="Code exemplaire (ex : EX-TOM-01)"
              className="w-full min-h-[46px] px-3.5 text-sm font-mono uppercase bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

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
                className="w-full min-h-[44px] px-3.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Ou sélectionner un exemplaire disponible...</option>
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
            <input
              type="text"
              value={copyCode}
              onChange={(e) => setCopyCode(e.target.value)}
              placeholder="Code exemplaire retourné"
              className="w-full min-h-[46px] px-3.5 text-sm font-mono uppercase bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

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
                className="w-full min-h-[44px] px-3.5 text-xs bg-white rounded-xl border border-slate-200 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Ou sélectionner un prêt actif...</option>
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

        {mode === 'recu' && (
          <div>
            <select
              value={selectedLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="w-full min-h-[46px] px-3.5 text-sm bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choisir l’emprunt...</option>
              {activeLoans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.etudiant_nom} — {loan.ouvrage_titre}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="button"
          onClick={handleConfirm}
          className="w-full min-h-[48px] bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {mode === 'pret' && (
            <>
              <Check className="w-4 h-4" />
              <span>Valider le prêt</span>
            </>
          )}
          {mode === 'retour' && (
            <>
              <RotateCcw className="w-4 h-4" />
              <span>Valider le retour</span>
            </>
          )}
          {mode === 'recu' && (
            <>
              <Send className="w-4 h-4" />
              <span>Envoyer le reçu</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
