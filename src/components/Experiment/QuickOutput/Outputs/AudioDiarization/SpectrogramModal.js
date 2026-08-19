import React, { useEffect, useRef } from "react";
import "./SpectrogramModal.scss";

/**
 * Props:
 * segment  – { start, end, speaker, confidence, spectrogram }
 * onClose  – callback to close the modal
 */
export default function SpectrogramModal({ segment, onClose }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!segment?.spectrogram || !canvasRef.current) return;

        const spectrogram = segment.spectrogram; // Array of shape [num_mels, num_frames]
        const numMels = spectrogram.length;
        if (numMels === 0) return;
        const numFrames = spectrogram[0].length;
        if (numFrames === 0) return;

        const canvas = canvasRef.current;
        canvas.width = numFrames;
        canvas.height = numMels;
        const ctx = canvas.getContext("2d");

        // Find min and max values for dB scale normalization
        let minVal = Infinity;
        let maxVal = -Infinity;
        for (let r = 0; r < numMels; r++) {
            for (let c = 0; c < numFrames; c++) {
                const val = spectrogram[r][c];
                if (val < minVal) minVal = val;
                if (val > maxVal) maxVal = val;
            }
        }

        const range = maxVal - minVal || 1;
        const imgData = ctx.createImageData(numFrames, numMels);

        // Draw frequency bins upside down so high frequencies are on top
        for (let r = 0; r < numMels; r++) {
            const targetRow = numMels - 1 - r;
            for (let c = 0; c < numFrames; c++) {
                const norm = (spectrogram[r][c] - minVal) / range;
                const pixelIndex = (targetRow * numFrames + c) * 4;

                // Color map: Viridis/Magma approximation
                const rgb = getHeatmapColor(norm);
                imgData.data[pixelIndex] = rgb.r;
                imgData.data[pixelIndex + 1] = rgb.g;
                imgData.data[pixelIndex + 2] = rgb.b;
                imgData.data[pixelIndex + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }, [segment]);

    if (!segment) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="spectrogram-modal__backdrop" onClick={handleBackdropClick}>
            <div className="spectrogram-modal">
                <div className="spectrogram-modal__header">
                    <div className="spectrogram-modal__title">
                        <span className="spectrogram-modal__speaker-chip">{segment.speaker}</span>
                        <span className="spectrogram-modal__time-label">
                            {formatTime(segment.start)} → {formatTime(segment.end)}
                        </span>
                        {segment.confidence !== null && (
                            <span className="spectrogram-modal__conf-label">
                                Confidence: {Math.round(segment.confidence * 100)}%
                            </span>
                        )}
                    </div>
                    <button className="spectrogram-modal__close" onClick={onClose} aria-label="Close">
                        ✕
                    </button>
                </div>

                <div className="spectrogram-modal__body">
                    {segment.spectrogram && segment.spectrogram.length > 0 ? (
                        <div style={{ width: "100%", textAlign: "center" }}>
                            <canvas
                                ref={canvasRef}
                                className="spectrogram-modal__image"
                                style={{ width: "100%", height: "240px", imageRendering: "pixelated" }}
                            />
                        </div>
                    ) : (
                        <div className="spectrogram-modal__error">
                            <p>No spectrogram data available for this segment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getHeatmapColor(val) {
    // Standard Viridis-style color map function
    const r = Math.round(255 * Math.sin(val * Math.PI * 0.5));
    const g = Math.round(255 * Math.sin(val * Math.PI));
    const b = Math.round(255 * Math.cos(val * Math.PI * 0.5));
    return { r, g, b };
}

function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
}