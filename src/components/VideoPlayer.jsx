import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

export default function VideoPlayer() {
    const videoRef = useRef(null);
    const hlsRef   = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const url = "https://pi.wizzwatts.com/hls/stream.m3u8";

        if (Hls.isSupported() && !hlsRef.current) {
            /* 1️⃣ Low-Latency/Echtzeit-Einstellungen  */
            const hls = new Hls({
                lowLatencyMode: true,           // wichtig bei <1-s-Segments
                backBufferLength: 15,           // Sekunden, die „hinten“ gehalten werden
                maxBufferLength: 2,             // nur 2 s vorpuffern
                liveSyncDurationCount: 1.5,     // 1,5 × Segmentlänge ⇒ ≈0,75 s
                maxLiveSyncPlaybackRate: 1.2,   // beschleunigt kurz, wenn wir hinterherhinken
                enableWorker: true,             // Threads (Default) lassen wir an
                debug: false,
            });
            hlsRef.current = hls;

            /* 2️⃣ Fehler sanft behandeln (ohne Abbruch) */
            hls.on(Hls.Events.ERROR, (_evt, data) => {
                if (
                    data.type === Hls.ErrorTypes.MEDIA_ERROR &&
                    data.details === Hls.ErrorDetails.BUFFER_APPEND_ERROR &&
                    data.sourceBufferName === "video"
                ) {
                    /* Audio-Only-Segment überspringen */
                    console.warn("[HLS] Audio-Segment übersprungen");
                    return;
                }
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.warn("[HLS] Netzfehler ➜ reload()");
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.warn("[HLS] MediaError ➜ recover()");
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

            hls.on(Hls.Events.MEDIA_ATTACHED, () => hls.loadSource(url));
            hls.attachMedia(video);
        } else if (!Hls.isSupported()) {
            /* Safari / iOS */
            video.src = url;
        }

        /* Cleanup */
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            autoPlay
            muted
            playsInline
            controls
        />
    );
}