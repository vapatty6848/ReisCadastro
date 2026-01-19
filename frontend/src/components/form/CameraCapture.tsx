"use client";

import React, { useRef, useState, useCallback } from "react";
import { Camera, X, Check, RefreshCw } from "lucide-react";
import Image from "next/image";

interface CameraCaptureProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      console.error("Erro ao acessar a câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Converter base64 para File
      fetch(capturedImage)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `captura_${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
          onClose();
        });
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    startCamera();
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="relative w-full max-w-2xl overflow-hidden bg-white shadow-2xl rounded-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <Camera className="text-blue-600" /> Tirar Foto do Integrante
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 transition-colors rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="relative flex items-center justify-center bg-black aspect-video">
          {error ? (
            <div className="p-4 text-center text-white">
              <p>{error}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 mt-4 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {!capturedImage ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="object-cover w-full h-full"
                />
              ) : (
                <Image
                  src={capturedImage}
                  alt="Capturado"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="flex justify-center gap-4 p-6 bg-gray-50">
          {!capturedImage ? (
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!isStreamActive}
              className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-all transform bg-blue-600 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50 hover:scale-105"
            >
              <Camera size={20} /> Capturar
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 font-bold text-gray-700 transition-all bg-white border border-gray-300 rounded-full shadow-md hover:bg-gray-100"
              >
                <RefreshCw size={20} /> Repetir
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex items-center gap-2 px-8 py-3 font-bold text-white transition-all transform bg-green-600 rounded-full shadow-lg hover:bg-green-700 hover:scale-105"
              >
                <Check size={20} /> Usar Foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
