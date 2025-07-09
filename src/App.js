import React, { useState, useCallback, useEffect } from "react";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { theme } from "./components/MaritimeTheme";
import ControlBar      from "./components/ControlBar";
import VideoPlayer     from "./components/VideoPlayer";
import JoystickArea    from "./components/JoystickArea";
import ThrottleGauge   from "./components/ThrottleGauge";
import ThrottleSlider  from "./components/ThrottleSlider";
import useControlSocket from "./hooks/useControlSocket";

export default function App() {
    const [steer, setSteer]       = useState(0);
    const [throttle, setThrottle] = useState(0);

    const { send, connected } =
        useControlSocket("wss://pi.wizzwatts.com/input");

    /* ----------- Steuerdaten über WebSocket senden ------------ */
    useEffect(() => {
        const thr = throttle >= 0 ? throttle / 100 : 0;
        const brk = throttle <  0 ? -throttle / 100 : 0;
        send({ steer, thr, brk });
    }, [steer, throttle, send]);

    const handleSteer    = useCallback((x) => setSteer(x), []);
    const handleThrottle = useCallback((v) => setThrottle(v), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* Kopfzeile */}
            <ControlBar
                throttle={throttle}
                wsConnected={connected}
                sendSound={send}
            />

            {/* ---------- Hauptbereich ---------- */}
            <Box
                sx={{
                    height: { xs: "calc(100dvh - 56px)", sm: "calc(100dvh - 64px)" },
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    bgcolor: "background.default",
                    p: 2,
                }}
            >
                {/* ---------- Videobühne ---------- */}
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 1280,                          // kannst du anpassen
                        aspectRatio: "16/9",                     // hält 16 : 9
                        overflow: "hidden",
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    {/* Video liegt ganz hinten */}
                    <VideoPlayer />

                    {/* -------- linker Overlay-Block: Joystick -------- */}
                    <Box
                        sx={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            pointerEvents: "none",                 // Video bleibt klickbar
                        }}
                    >
                        <Box sx={{ pointerEvents: "auto" }}>
                            <JoystickArea onSteer={handleSteer} />
                        </Box>
                    </Box>

                    {/* -------- rechter Overlay-Block: Throttle -------- */}
                    <Box
                        sx={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 2,
                            p: 2,
                            pointerEvents: "none",
                        }}
                    >
                        <Box sx={{ pointerEvents: "auto" }}>
                            <ThrottleGauge  value={throttle} />
                        </Box>
                        <Box sx={{ pointerEvents: "auto" }}>
                            <ThrottleSlider value={throttle} onChange={handleThrottle} />
                        </Box>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
