import React, { useState, useRef } from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextOutput from "../Text/useTextOutput";
import OutputDuration from "../_Common/components/OutputDuration";
import Rating from "../Classification/Rating";
import AIExplainAction from "../../InteractiveExplanation/AIExplainAction";
import { useInteractiveExplanation } from "../../InteractiveExplanation/InteractiveExplanationContext";
import SpectrogramModal from "./SpectrogramModal";
import "./AudioDiarization.scss";

// Predefined colors for speakers
const SPEAKER_COLORS = [
    "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
    "#edc948", "#b07aa1", "#ff9da7", "#9c755f", "#bab0ac"
];

function getSpeakerColor(speakerName, speakerList) {
    const idx = speakerList.indexOf(speakerName);
    if (idx === -1) return SPEAKER_COLORS[0];
    return SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
}

const normalizeSegment = (segment, id) => {
    const start = Number(segment?.start);
    const end = Number(segment?.end);
    const confidence = segment?.confidence !== undefined ? Number(segment.confidence) : null;
    const confidenceType = segment?.confidence_type || segment?.confidenceType || null;
    const spectrogram = segment?.spectrogram || null;

    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
        return null;
    }

    return {
        id,
        start,
        end,
        speaker: segment?.speaker || `SPEAKER_${id}`,
        confidence: confidence !== null && !Number.isNaN(confidence) ? confidence : null,
        confidenceType,
        spectrogram
    };
};

export default function AudioDiarizationOutput(props) {
    const { getBlock, getElement } = useBEMNaming("audio-diarization-output");
    const { output, inferenceDuration, input } = useTextOutput(props.trial);
    const { selectArtifact } = useInteractiveExplanation();
    const audioRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [selectedSegment, setSelectedSegment] = useState(null);

    // Extract segments from the diarisation output
    const segments = React.useMemo(() => {
        if (!output) return [];

        let outputStr = "";
        if (typeof output === "string") {
            outputStr = output;
        } else if (typeof output === "object") {
            if (Array.isArray(output)) {
                return output.map((seg, idx) => normalizeSegment(seg, idx)).filter(Boolean);
            }
            if (output.text) {
                outputStr = output.text;
            } else {
                try {
                    outputStr = JSON.stringify(output);
                } catch (e) {
                    return [];
                }
            }
        }

        // Parse JSON output if present
        try {
            const parsed = JSON.parse(outputStr);
            if (Array.isArray(parsed)) {
                return parsed.map((seg, idx) => normalizeSegment(seg, idx)).filter(Boolean);
            }
        } catch (e) {
            // Fall through to text line parsing
        }

        const lines = outputStr.split("\n");
        const parsedSegments = [];
        let idCounter = 0;

        const timeRegex = /\[\s*(\d+(?:\.\d+)?s?|\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*-->\s*(\d+(?:\.\d+)?s?|\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*\]\s*([^\(]+)(?:\((?:conf|confidence|prob|probability|score)?:?\s*(\d+(?:\.\d+)?%?)\))?/i;

        function convertToSeconds(timeStr) {
            timeStr = timeStr.trim().replace("s", "");
            if (timeStr.includes(":")) {
                const parts = timeStr.split(":");
                const secs = parseFloat(parts[parts.length - 1]);
                const mins = parts.length > 1 ? parseInt(parts[parts.length - 2], 10) : 0;
                const hrs = parts.length > 2 ? parseInt(parts[parts.length - 3], 10) : 0;
                return hrs * 3600 + mins * 60 + secs;
            }
            return parseFloat(timeStr);
        }

        for (const line of lines) {
            const match = line.match(timeRegex);
            if (match) {
                const startSecs = convertToSeconds(match[1]);
                const endSecs = convertToSeconds(match[2]);
                const speaker = match[3].trim();
                let confidence = undefined;
                if (match[4]) {
                    const rawConf = match[4].trim();
                    if (rawConf.endsWith("%")) {
                        confidence = parseFloat(rawConf) / 100;
                    } else {
                        confidence = parseFloat(rawConf);
                    }
                }
                const segment = normalizeSegment(
                    { start: startSecs, end: endSecs, speaker, confidence },
                    idCounter++
                );
                if (segment) parsedSegments.push(segment);
            }
        }
        return parsedSegments;
    }, [output]);

    // Unique speakers list to map stable colors
    const uniqueSpeakers = React.useMemo(() => {
        const speakers = segments.map(s => s.speaker);
        return [...new Set(speakers)];
    }, [segments]);

    // Find the currently active segment (if any)
    const activeSegment = segments.find(
        seg => currentTime >= seg.start && currentTime <= seg.end
    );

    // Audio lifecycle event handlers
    const onTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    // Seek to specific timeline spot when segment clicked
    const handleSegmentClick = (start) => {
        if (audioRef.current) {
            audioRef.current.currentTime = start;
            audioRef.current.play().catch(() => {});
        }
    };

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        const ms = Math.floor((secs % 1) * 100);
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
    };

    const isInteractivePyannoteResult = props.trial?.model?.name === "pyannote_diarization";
    const makeSegmentSelection = (segment) => compactObject({
        segmentId: segment.id,
        speaker: segment.speaker,
        startTime: segment.start,
        endTime: segment.end,
        duration: segment.end - segment.start,
        confidence: segment.confidence === null ? undefined : segment.confidence,
        confidenceType: segment.confidenceType || undefined
    });
    const modelContext = compactObject({
        name: props.trial?.model?.name,
        task: props.trial?.model?.output?.type,
        framework: props.trial?.model?.framework?.name,
        frameworkVersion: props.trial?.model?.framework?.version,
        trainingDataset: props.trial?.model?.attributes?.training_dataset
    });

    const explainSegment = (event, segment) => {
        event.stopPropagation();
        selectArtifact({
            id: `diarization-segment-${segment.id}`,
            label: "Speaker diarization segment",
            kind: "diarization_segment",
            transient: true,
            selection: makeSegmentSelection(segment),
            model: modelContext
        }, "What does this segment mean?");
    };

    const explainSpectrogram = (segment, renderedSpectrogram) => {
        selectArtifact({
            id: `spectrogram-segment-${segment.id}`,
            label: "Segment spectrogram",
            kind: "spectrogram_segment",
            transient: true,
            selection: makeSegmentSelection(segment),
            structuredData: {
                numBands: segment.spectrogram.length,
                numFrames: segment.spectrogram[0].length,
                visualization: {
                    horizontalAxis: "time-frame progression across the selected segment",
                    verticalAxis: "frequency-band index, with higher bands rendered toward the top",
                    colorScale: "values normalized to the minimum and maximum within this segment"
                }
            },
            model: modelContext,
            attachments: [{
                role: "spectrogram",
                mimeType: "image/png",
                description: `Rendered spectrogram for ${segment.speaker} from ${segment.start} to ${segment.end} seconds`,
                data: renderedSpectrogram
            }]
        }, "What am I looking at?");
    };

    return (
        <div className={getBlock()}>
            {/* Left Column: Player & Timeline visualizer */}
            <div className={getElement("input")}>
                {/* Input & Player Section */}
                <div className={getElement("player-section")}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h3 className={getElement("timeline-title")} style={{ margin: 0 }}>Input Audio</h3>
                        {props.onBackClicked && (
                            <button
                                onClick={props.onBackClicked}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "var(--primary, #0d6efd)",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}
                            >
                                ← Back to Inputs
                            </button>
                        )}
                    </div>
                    <audio
                        ref={audioRef}
                        controls
                        src={input?.src}
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                    />

                    {/* Speaker Legend */}
                    {uniqueSpeakers.length > 0 && (
                        <div className={getElement("legend")}>
                            {uniqueSpeakers.map(speaker => (
                                <div key={speaker} className={getElement("legend-item")}>
                                    <div
                                        className={getElement("legend-color")}
                                        style={{ backgroundColor: getSpeakerColor(speaker, uniqueSpeakers) }}
                                    />
                                    <span className={
                                        getElement("legend-name") +
                                        (activeSegment?.speaker === speaker ? ` ${getElement("legend-name")}--active` : "")
                                    }>
                                        {speaker}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Visual Timeline Track */}
                {duration > 0 && segments.length > 0 && (
                    <div className={getElement("visualizer")}>
                        <h3 className={getElement("timeline-title")}>Visual Timeline</h3>
                        <div className={getElement("timeline-track")}>
                            {/* Playback Playhead Line */}
                            <div
                                className={getElement("timeline-progress")}
                                style={{ left: `${(currentTime / duration) * 100}%` }}
                            />

                            {/* Visual Speaker Blocks */}
                            {segments.map((seg) => {
                                const leftPct = (seg.start / duration) * 100;
                                const widthPct = ((seg.end - seg.start) / duration) * 100;
                                const isSegmentActive = activeSegment?.id === seg.id;
                                const color = getSpeakerColor(seg.speaker, uniqueSpeakers);
                                const scoreName = seg.confidenceType === "mean_speaker_activity" ? "Mean activity" : "Confidence";
                                const confStr = seg.confidence !== null ? ` (${scoreName}: ${Math.round(seg.confidence * 100)}%)` : "";

                                return (
                                    <div
                                        key={seg.id}
                                        className={
                                            getElement("timeline-segment") +
                                            (isSegmentActive ? ` ${getElement("timeline-segment")}--active` : "")
                                        }
                                        style={{
                                            left: `${leftPct}%`,
                                            width: `${widthPct}%`,
                                            backgroundColor: color
                                        }}
                                        onClick={() => handleSegmentClick(seg.start)}
                                        title={`${seg.speaker}${confStr} (${formatTime(seg.start)} - ${formatTime(seg.end)})`}
                                    >
                                        {widthPct > 5 ? `${seg.speaker}${widthPct > 15 ? confStr : ""}` : ""}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Structured Segment Output List */}
            <div className={getElement("results")}>
                <div className={getElement("list-header")}>
                    <h3 className={getElement("list-title")}>Diarization Segments</h3>
                    <OutputDuration duration={inferenceDuration} />
                </div>

                <div className={getElement("segments-list")}>
                    {segments.length > 0 ? (
                        segments.map((seg) => {
                            const isSegmentActive = activeSegment?.id === seg.id;
                            const color = getSpeakerColor(seg.speaker, uniqueSpeakers);

                            return (
                                <div
                                    key={seg.id}
                                    className={
                                        getElement("segment-row") +
                                        (isSegmentActive ? ` ${getElement("segment-row")}--active` : "")
                                    }
                                    onClick={() => setSelectedSegment(seg)}
                                    title="Click to view spectrogram"
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className={getElement("segment-time")}>
                                        <span>{formatTime(seg.start)}</span>
                                        <span style={{ margin: "0 8px" }}>→</span>
                                        <span>{formatTime(seg.end)}</span>
                                    </div>
                                    <div className={getElement("segment-content")}>
                                        <div className={getElement("segment-summary")}>
                                            <span
                                                className={getElement("segment-speaker-badge")}
                                                style={{ backgroundColor: color }}
                                            >
                                                {seg.speaker}
                                            </span>
                                            {seg.confidence !== null && (
                                                <span style={{ fontSize: "12px", color: "var(--text-muted, #6c757d)", fontWeight: "500" }}>
                                                    {seg.confidenceType === "mean_speaker_activity" ? "Mean activity" : "Confidence"}: {Math.round(seg.confidence * 100)}%
                                                </span>
                                            )}
                                        </div>
                                        <div className={getElement("segment-actions")}>
                                            {isInteractivePyannoteResult && (
                                                <AIExplainAction
                                                    onClick={(event) => explainSegment(event, seg)}
                                                    ariaLabel={`Explain the ${seg.speaker} segment from ${formatTime(seg.start)} to ${formatTime(seg.end)} with AI`}
                                                />
                                            )}
                                            <span
                                                className={getElement("spectrogram-indicator")}
                                                title="View spectrogram"
                                                aria-hidden="true"
                                            >
                                                📊
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ color: "var(--text-muted, #6c757d)", fontStyle: "italic" }}>
                            {typeof output === "string"
                                ? output
                                : output
                                    ? JSON.stringify(output)
                                    : "No segments extracted yet."}
                        </div>
                    )}
                </div>
            </div>

            <Rating />

            {selectedSegment && (
                <SpectrogramModal
                    segment={selectedSegment}
                    onClose={() => setSelectedSegment(null)}
                    onExplain={isInteractivePyannoteResult ? explainSpectrogram : undefined}
                />
            )}
        </div>
    );
}

function compactObject(value) {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
