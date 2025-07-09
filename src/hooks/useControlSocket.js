// src/hooks/useControlSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Öffnet die übergebene WebSocket-URL.
 * Example:
 *   const { send, connected } =
 *       useControlSocket("ws://192.168.0.71:3030/input");
 */
export default function useControlSocket(url) {
    const wsRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (!url) return;                     // Schutz, falls leer
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen  = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);

        return () => ws.close();
    }, [url]);

    const send = useCallback((frame) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(frame));
        }
    }, []);

    return { send, connected };
}
