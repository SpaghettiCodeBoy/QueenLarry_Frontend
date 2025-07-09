import React, { useState, useCallback, useEffect } from "react";
import {
    ThemeProvider,
    CssBaseline,
    Box,
    Drawer,
    IconButton,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { theme } from "./components/MaritimeTheme";
import ControlBar from "./components/ControlBar";
import VideoPlayer from "./components/VideoPlayer";
import JoystickArea from "./components/JoystickArea";
import ThrottleGauge from "./components/ThrottleGauge";
import ThrottleSlider from "./components/ThrottleSlider";
import useControlSocket from "./hooks/useControlSocket";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Leaflet-Icon-Fix für Standard-Marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl:        require("leaflet/dist/images/marker-icon.png"),
    shadowUrl:      require("leaflet/dist/images/marker-shadow.png"),
});

export default function App() {
    // Steuer-States
    const [steer, setSteer] = useState(0);
    const [throttle, setThrottle] = useState(0);
    const { send, connected } = useControlSocket("wss://pi.wizzwatts.com/input");

    // Map-Drawer & GPS-Location
    const [mapOpen, setMapOpen] = useState(false);
    const [gpsLocation, setGpsLocation] = useState({ lat: 0, lng: 0 });

    // Debug: log App render and location
    console.log("[DEBUG] App render - gpsLocation:", gpsLocation);

    // GPS-WebSocket-Stream starten
    useEffect(() => {
        const ws = new WebSocket("wss://pi.wizzwatts.com/gps");
        ws.onopen = () => console.log("[DEBUG] GPS WS connected");
        ws.onmessage = (evt) => {
            console.log("[DEBUG] GPS raw data:", evt.data);
            try {
                const data = JSON.parse(evt.data);
                console.log("[DEBUG] GPS parsed data:", data);
                if (data.lat && data.lng) {
                    setGpsLocation({ lat: data.lat, lng: data.lng });
                    console.log("[DEBUG] GPS state updated to:", { lat: data.lat, lng: data.lng });
                }
            } catch (e) {
                console.error("[DEBUG] Failed to parse GPS JSON:", e);
            }
        };
        ws.onerror = (err) => console.error("[DEBUG] GPS WS error:", err);
        ws.onclose = () => console.log("[DEBUG] GPS WS closed");
        return () => ws.close();
    }, []);

    // Steuerdaten regelmäßig senden
    useEffect(() => {
        const thr = throttle >= 0 ? throttle / 100 : 0;
        const brk = throttle < 0 ? -throttle / 100 : 0;
        const payload = { steer, thr, brk };
        console.log("[DEBUG] Sending control payload:", payload);
        send(payload);
    }, [steer, throttle, send]);

    const handleSteer = useCallback((x) => setSteer(x), []);
    const handleThrottle = useCallback((v) => setThrottle(v), []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* Kopfzeile mit ControlBar */}
            <ControlBar throttle={throttle} wsConnected={connected} sendSound={send} />

            {/* Button zum Öffnen der Karte */}
            <IconButton
                onClick={() => {
                    console.log("[DEBUG] Map drawer open");
                    setMapOpen(true);
                }}
                sx={{
                    position: "fixed",
                    top: { xs: 72, sm: 80 },
                    right: 16,
                    zIndex: (t) => t.zIndex.drawer + 1,
                    bgcolor: "background.paper",
                }}
            >
                <MapIcon />
            </IconButton>

            {/* Drawer mit OpenStreetMap */}
            <Drawer
                anchor="right"
                open={mapOpen}
                onClose={() => {
                    console.log("[DEBUG] Map drawer close");
                    setMapOpen(false);
                }}
                PaperProps={{ sx: { width: { xs: "100%", sm: 400 }, height: "100%" } }}
            >
                <MapContainer
                    center={[gpsLocation.lat, gpsLocation.lng]}
                    zoom={16}
                    style={{ width: "100%", height: "100%" }}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[gpsLocation.lat, gpsLocation.lng]} />
                </MapContainer>
            </Drawer>

            {/* ---------- Hauptbereich ---------- */}
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
                {/* Video-Container (relativ) */}
                <Box
                    sx={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 1280,
                        aspectRatio: "16/9",
                        borderRadius: 2,
                        overflow: "hidden",
                        boxShadow: 3,
                        bgcolor: "black",
                    }}
                >
                    {/* 1) Video */}
                    <VideoPlayer />

                    {/* 2) Joystick unten links */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 16,
                            left: 16,
                            pointerEvents: "auto",
                        }}
                    >
                        <JoystickArea onSteer={handleSteer} />
                    </Box>

                    {/* 3) Throttle rechts zentriert */}
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 16,
                            right: 16,
                            pointerEvents: "auto",
                        }}
                    >

                        <ThrottleSlider value={throttle} onChange={handleThrottle} />
                    </Box>
                </Box>
            </Box>

        </ThemeProvider>
    );
}
