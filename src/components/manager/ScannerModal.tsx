import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
  Send,
  RotateCcw,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export type ScannerModalMode = 'scan_ticket' | 'devolver' | 'envoyer_ticket';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: ScannerModalMode;
  preselectedLoanId?: string;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'scan_ticket',
  preselectedLoanId,
}) => {
  const {
    exemplaires,
    ouvrages,
    etudiants,
    emprunts,
    enregistrerEmprunt,
    enregistrerRetour,
    afficherNotification,
  } = useLibrary();

  const [mode, setMode] = useState<ScannerModalMode>(initialMode);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Valeurs scannées / sélectionnées
  const [scannedCopyCode, setScannedCopyCode] = useState<string>('');
  const [selectedStudentMatricule, setSelectedStudentMatricule] = useState<string>('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(preselectedLoanId || '');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Résolution exemplaire
  const foundExemplaire = exemplaires.find(
    (e) =>
      e.code_barres.toUpperCase() === scannedCopyCode.toUpperCase() ||
      e.id.toUpperCase() === scannedCopyCode.toUpperCase()
  );

  const foundOuvrage = foundExemplaire
    ? ouvrages.find((o) => o.id === foundExemplaire.ouvrage_id)
    : undefined;

  // Emprunt actif pour retour
  const activeLoanForCopy = foundExemplaire
    ? emprunts.find(
        (emp) => emp.exemplaire_id === foundExemplaire.id && !emp.date_retour_effective
      )
    : undefined;

  // Arrêt caméra
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

  // Analyse continue flux caméra
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
          const raw = code.data.trim();
          handleDetectedCode(raw);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  }, []);

  const handleDetectedCode = (raw: string) => {
    if (raw.startsWith('ETU-')) {
      setSelectedStudentMatricule(raw);
      setScanMessage(`Carte étudiante détectée : ${raw}`);
    } else {
      setScannedCopyCode(raw);
      setScanMessage(`Code détecté : ${raw}`);
    }
  };

  // Démarrage caméra
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Caméra indisponible dans ce navigateur.");
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
    } catch (err) {
      setCameraError(
        'Accès caméra non disponible. Vous pouvez importer un fichier ou photo ci-dessous.'
      );
      setCameraActive(false);
    }
  }, [scanFrame]);

  // Traitement d'un fichier importé depuis le dispositif
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
              setScanMessage(`Code détecté depuis l'image ${file.name} : ${code.data.trim()}`);
            } else {
              setScanMessage(`Fichier ${file.name} importé avec succès.`);
            }
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      setScanMessage(`Document ${file.name} sélectionné.`);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (preselectedLoanId) {
        setSelectedLoanId(preselectedLoanId);
      }
      startCamera();
      if (etudiants.length > 0 && !selectedStudentMatricule) {
        setSelectedStudentMatricule(etudiants[0].matricule);
      }
    } else {
      stopCamera();
      setScannedCopyCode('');
      setAttachedFileName(null);
      setScanMessage(null);
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, initialMode, preselectedLoanId, startCamera, stopCamera, etudiants, selectedStudentMatricule]);

  if (!isOpen) return null;

  // Confirmation selon le mode
  const handleConfirmAction = () => {
    if (mode === 'scan_ticket') {
      if (!scannedCopyCode) {
        setScanMessage('Veuillez scanner ou saisir le code de l’exemplaire.');
        return;
      }
      if (!selectedStudentMatricule) {
        setScanMessage('Veuillez scanner ou indiquer la carte étudiante.');
        return;
      }
      const res = enregistrerEmprunt(scannedCopyCode, selectedStudentMatricule);
      if (res.success) {
        afficherNotification(res.message);
        onClose();
      } else {
        setScanMessage(res.message);
      }
    } else if (mode === 'devolver') {
      if (!scannedCopyCode) {
        setScanMessage('Veuillez scanner ou saisir le code de l’exemplaire à retourner.');
        return;
      }
      const res = enregistrerRetour(scannedCopyCode);
      if (res.success) {
        afficherNotification(res.message);
        onClose();
      } else {
        setScanMessage(res.message);
      }
    } else if (mode === 'envoyer_ticket') {
      const targetLoan = emprunts.find((l) => l.id === selectedLoanId);
      const studentName = targetLoan ? targetLoan.etudiant_nom : 'l’étudiant';
      const fileNotice = attachedFileName ? ` avec pièce jointe (${attachedFileName})` : '';
      afficherNotification(`Ticket officiel envoyé par e-mail à ${studentName}${fileNotice}.`);
      onClose();
    }
  };

  // Liste des emprunts en cours pour le mode "envoyer_ticket"
  const activeLoans = emprunts.filter((l) => !l.date_retour_effective);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center p-0 sm:p-4"
    >
      <div className="bg-white w-full max-w-md mx-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900">
        {/* Sélecteur compact des 3 actions : Escanear ticket, Devolver préstamo, Enviar ticket */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-[11px] font-semibold w-full max-w-xs">
            <button
              type="button"
              onClick={() => {
                setMode('scan_ticket');
                setScanMessage(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                mode === 'scan_ticket'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Escanear ticket
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('devolver');
                setScanMessage(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                mode === 'devolver'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Devolver
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('envoyer_ticket');
                setScanMessage(null);
              }}
              className={`flex-1 py-1 px-2 rounded-lg transition-all cursor-pointer text-center truncate ${
                mode === 'envoyer_ticket'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Enviar ticket
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Corps : Caméra + Accès aux fichiers du dispositif */}
        <div className="p-3.5 space-y-3 overflow-y-auto">
          {/* Viseur caméra compact */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />

            {cameraActive && (
              <div className="absolute inset-4 border border-dashed border-emerald-400 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[10px] font-medium bg-slate-900/80 text-emerald-300 px-2 py-0.5 rounded">
                  Pointez vers le code QR ou le ticket
                </span>
              </div>
            )}

            {!cameraActive && (
              <div className="text-center p-3 text-slate-300">
                <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="text-[11px]">{cameraError || 'Activation caméra...'}</p>
                {cameraError && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-1 text-[11px] text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Réessayer
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Double accès caméra / fichiers du dispositif */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startCamera}
              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-slate-500" />
              <span>Activer caméra</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-indigo-200/50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fichiers du dispositif</span>
            </button>

            {/* Input natif d'accès aux fichiers / photos du téléphone ou ordinateur */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Message d'état */}
          {scanMessage && (
            <div className="text-xs p-2 rounded-lg bg-slate-100 text-slate-800 flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{scanMessage}</span>
            </div>
          )}

          {/* Fichier joint du dispositif */}
          {attachedFileName && (
            <div className="text-xs p-2 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Fichier : {attachedFileName}</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedFileName(null)}
                className="text-indigo-400 hover:text-indigo-700 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Mode 1 : Escanear ticket (Enregistrer un prêt) */}
          {mode === 'scan_ticket' && (
            <div className="space-y-2">
              {/* Carte étudiant */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Étudiant (sélection ou scan de carte)
                </label>
                <select
                  value={selectedStudentMatricule}
                  onChange={(e) => setSelectedStudentMatricule(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {etudiants.map((etu) => (
                    <option key={etu.id} value={etu.matricule}>
                      {etu.prenom} {etu.nom} ({etu.matricule})
                    </option>
                  ))}
                </select>
              </div>

              {/* Code exemplaire */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Code de l'exemplaire scanné
                </label>
                <input
                  type="text"
                  value={scannedCopyCode}
                  onChange={(e) => setScannedCopyCode(e.target.value)}
                  placeholder="Ex : EX-CAMUS-01"
                  className="w-full text-xs uppercase px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Fiche exemplaire détecté */}
              {foundExemplaire && foundOuvrage && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                  <span className="font-semibold">{foundOuvrage.titre}</span>
                  <span className="text-slate-500 block">
                    Exemplaire {foundExemplaire.numero} • {foundExemplaire.statut}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mode 2 : Devolver préstamo */}
          {mode === 'devolver' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Code de l'exemplaire à retourner
                </label>
                <input
                  type="text"
                  value={scannedCopyCode}
                  onChange={(e) => setScannedCopyCode(e.target.value)}
                  placeholder="Ex : EX-ORWELL-01"
                  className="w-full text-xs uppercase px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {foundExemplaire && activeLoanForCopy && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-900">
                  <div className="font-semibold">Emprunt actif identifié :</div>
                  <div>Livre : {activeLoanForCopy.ouvrage_titre}</div>
                  <div>Emprunteur : {activeLoanForCopy.etudiant_nom}</div>
                </div>
              )}
            </div>
          )}

          {/* Mode 3 : Enviar ticket */}
          {mode === 'envoyer_ticket' && (
            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Sélectionner l'emprunt concerné par le ticket
                </label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Sélectionner un emprunt...</option>
                  {activeLoans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.etudiant_nom} - {loan.ouvrage_titre} (Ex. {loan.exemplaire_numero})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 leading-relaxed">
                Le ticket numérique officiel ou le reçu de rappel sera transmis à l'adresse e-mail de l'étudiant avec les pièces jointes sélectionnées depuis le dispositif.
              </div>
            </div>
          )}
        </div>

        {/* Pied avec un seul bouton d'action principale */}
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={handleConfirmAction}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            {mode === 'scan_ticket' && (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Confirmer l'emprunt</span>
              </>
            )}
            {mode === 'devolver' && (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Valider le retour</span>
              </>
            )}
            {mode === 'envoyer_ticket' && (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer le ticket</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
