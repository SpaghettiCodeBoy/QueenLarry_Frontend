import React, { useRef, useEffect } from "react";
import Hls from "hls.js";

export default function VideoPlayer() {
    const videoRef = useRef(null);
    const hlsRef   = useRef(null);          // 1️⃣ persistente Instanz

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const url = "https://pi.wizzwatts.com/hls/stream.m3u8";

        // nur neu anlegen, wenn noch keiner existiert
        if (Hls.isSupported() && !hlsRef.current) {
            const hls = new Hls({ debug: true, lowLatencyMode: true });
            hlsRef.current = hls;

            // 1️⃣ Listener VOR attachMedia registrieren
            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
                hls.loadSource(url);
            });

            hls.on(Hls.Events.ERROR, (_, data) => console.error("[HLS]", data));

            hls.attachMedia(video);        // 2️⃣ jetzt anhängen
        }
        else if (!Hls.isSupported()) {
            video.src = url;   // Fallback für Safari
        }

        // ---------- Cleanup bei Unmount ----------
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();         // SourceBuffer sauber freigeben
                hlsRef.current = null;
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",   // füllt 16 : 9-Box sauber aus
            }}
            autoPlay
            muted
            playsInline
        />
    );
}
