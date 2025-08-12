import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Öffnet die übergebene WebSocket-URL und versucht bei Abbruch alle 3s neu zu verbinden.
 * Rückgabe enthält: send(), connected (bool), status: 'open'|'connecting'|'closed', attempt (Reconnect-Zähler)
 */
export default function useControlSocket(
    url,
    { reconnectInterval = 3000 } = {}
) {
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const shouldReconnectRef = useRef(true);

    const [status, setStatus] = useState("connecting");
    const [attempt, setAttempt] = useState(0);

    const connect = useCallback(() => {
        // Doppelte Verbindungen vermeiden
        if (!url) return;
        const cur = wsRef.current;
        if (cur && (cur.readyState === WebSocket.OPEN || cur.readyState === WebSocket.CONNECTING)) return;

        setStatus("connecting");
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setStatus("open");
            setAttempt(0);
            if (reconnectTimerRef.current) {
                clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }
        };

        ws.onclose = () => {
            setStatus("closed");
            if (shouldReconnectRef.current) {
                setAttempt(a => a + 1);
                reconnectTimerRef.current = setTimeout(connect, reconnectInterval);
            }
        };

        // onerror schließt aktiv, damit onclose den Reconnect triggert
        ws.onerror = () => {
            try { ws.close(); } catch {}
        };
    }, [url, reconnectInterval]);

    useEffect(() => {
        shouldReconnectRef.current = true;
        connect();
        return () => {
            shouldReconnectRef.current = false;
            if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) try { wsRef.current.close(); } catch {}
        };
    }, [connect]);

    const send = useCallback((frame) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(frame));
            return true;
        }
        return false;
    }, []);

    return {
        send,
        connected: status === "open",
        status,           // 'open' | 'connecting' | 'closed'
        attempt,          // Reconnect-Versuche
    };
}
