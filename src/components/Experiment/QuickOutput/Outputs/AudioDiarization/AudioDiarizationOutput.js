import React, { useState, useRef } from "react";
import useBEMNaming from "../../../../../common/useBEMNaming";
import useTextOutput from "../Text/useTextOutput";
import OutputDuration from "../_Common/components/OutputDuration";
import Rating from "../Classification/Rating";
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

    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
        return null;
    }

    return {
        id,
        start,
        end,
        speaker: segment?.speaker || `SPEAKER_${id}`
    };
};

export default function AudioDiarizationOutput(props) {
    const { getBlock, getElement } = useBEMNaming("audio-diarization-output");
    const { output, inferenceDuration, input } = useTextOutput(props.trial);
    const audioRef = useRef(null);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Extract segments from the diarisation output (either JSON list, object, or custom line format)
    const segments = React.useMemo(() => {
        if (!output) return [];

        let outputStr = "";
        if (typeof output === "string") {
            outputStr = output;
        } else if (typeof output === "object") {
            // If useTextOutput returned an object, check if it's already an array of segments or a structured feature object
            if (Array.isArray(output)) {
                return output.map(normalizeSegment).filter(Boolean);
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

        // 1. Try parsing JSON
        try {
            const parsed = JSON.parse(outputStr);
            if (Array.isArray(parsed)) {
                return parsed.map(normalizeSegment).filter(Boolean);
            }
        } catch (e) {
            // Fall through to plain text parsing
        }

        // 2. Parse text lines: e.g. "[1.20s --> 5.45s] SPEAKER_01" or "[00:00:01.200 --> 00:00:05.450] SPEAKER_01"
        const lines = outputStr.split("\n");
        const parsedSegments = [];
        let idCounter = 0;

        const timeRegex = /\[\s*(\d+(?:\.\d+)?s?|\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*-->\s*(\d+(?:\.\d+)?s?|\d{2}:\d{2}:\d{2}(?:\.\d+)?)\s*\]\s*(.*)/;

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
                const segment = normalizeSegment(
                    { start: startSecs, end: endSecs, speaker },
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

    return (
        <div className={getBlock()}>
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
                                    title={`${seg.speaker} (${formatTime(seg.start)} - ${formatTime(seg.end)})`}
                                >
                                    {widthPct > 5 ? seg.speaker : ""}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Structured Segment Output List */}
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
                                    onClick={() => handleSegmentClick(seg.start)}
                                >
                                    <div className={getElement("segment-time")}>
                                        <span>{formatTime(seg.start)}</span>
                                        <span style={{ margin: "0 8px" }}>→</span>
                                        <span>{formatTime(seg.end)}</span>
                                    </div>
                                    <div className={getElement("segment-content")}>
                                        <div>
                                            <span
                                                className={getElement("segment-speaker-badge")}
                                                style={{ backgroundColor: color }}
                                            >
                                                {seg.speaker}
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
        </div>
    );
}
