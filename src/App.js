import React, { useState, useCallback, useEffect } from "react";
import {
    ThemeProvider,
    CssBaseline,
    Box,
    IconButton,
    useTheme,
    useMediaQuery,
    SwipeableDrawer,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import { theme } from "./components/MaritimeTheme";
import ControlBar from "./components/ControlBar";
import JoystickArea from "./components/JoystickArea";
import ThrottleSlider from "./components/ThrottleSlider";
import useControlSocket from "./hooks/useControlSocket";

import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-rotatedmarker";
import WebRTCPlayer from "./components/WebRTCPlayer"; // Plugin für Marker-Rotation

// Standard-Marker Icons fixen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl:        require("leaflet/dist/images/marker-icon.png"),
    shadowUrl:      require("leaflet/dist/images/marker-shadow.png"),
});

// Pfeil-Icon als DivIcon (dreieckiger Zeiger)
const ArrowIcon = L.divIcon({
    html: `
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Pfeilkopf -->
      <path
        d="M16 0 L32 32 L16 24 L0 32 Z"
        fill="#007aff"
        stroke="white"
        stroke-width="2"
      />
    </svg>
  `,
    className: "",          // keine extra CSS-Klasse
    iconSize: [32, 32],     // Größe des SVG
    iconAnchor: [16, 24],   // Ankerpunkt: an der unteren Mitte des Pfeils
});

// Helfer für live Re-Centering
function Recenter({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat != null && lng != null) {
            map.setView([lat, lng], map.getZoom());
        }
    }, [lat, lng, map]);
    return null;
}

export default function App() {
    // Steuer-States
    const [steer, setSteer] = useState(0);
    const [throttle, setThrottle] = useState(0);

    // NEU: status & attempt aus dem Hook (connected bleibt für Abwärtskompatibilität)
    const { send, connected, status, attempt } =
        useControlSocket("wss://pi.wizzwatts.com/input");

    // GPS-Daten inkl. Kurs
    const [gpsLocation, setGpsLocation] = useState({
        lat: 0,
        lng: 0,
        course: 0,
    });

    // Mobile vs. Desktop erkennen
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
    const [mapOpen, setMapOpen] = useState(false);

    // GPS WS mit Auto-Reconnect alle 3s
    useEffect(() => {
        let ws;
        let timer;
        let shouldReconnect = true;

        const connectGps = () => {
            ws = new WebSocket("wss://pi.wizzwatts.com/gps");
            ws.onopen = () => console.log("[DEBUG] GPS WS connected");
            ws.onmessage = (evt) => {
                try {
                    const { lat, lng, course_deg } = JSON.parse(evt.data);
                    if (lat != null && lng != null) {
                        setGpsLocation({ lat, lng, course: course_deg });
                    }
                } catch (e) {
                    console.error("GPS parse error", e);
                }
            };
            ws.onerror = () => {
                // Close triggert onclose -> Reconnect
                try { ws.close(); } catch {}
            };
            ws.onclose = () => {
                console.log("[DEBUG] GPS WS closed – retrying in 3s");
                if (shouldReconnect) timer = setTimeout(connectGps, 3000);
            };
        };

        connectGps();
        return () => {
            shouldReconnect = false;
            if (timer) clearTimeout(timer);
            if (ws) try { ws.close(); } catch {}
        };
    }, []);

    // Steuer WS
    useEffect(() => {
        const thr = throttle >= 0 ? throttle / 100 : 0;
        const brk = throttle < 0 ? -throttle / 100 : 0;
        send({ steer, thr, brk });
    }, [steer, throttle, send]);

    const handleSteer = useCallback((x) => setSteer(x), []);
    const handleThrottle = useCallback((v) => setThrottle(v), []);

    const { lat, lng, course } = gpsLocation;

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />

            {/* Kopfzeile */}
            <ControlBar
                throttle={throttle}
                wsConnected={connected}
                wsStatus={status}       // NEU: 'open' | 'connecting' | 'closed'
                wsAttempts={attempt}    // NEU: Reconnect-Zähler
                sendSound={send}
            />

            {/* Haupt-Layout */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    height: "100dvh",
                }}
            >
                {/* Video-Bereich */}
                <Box
                    sx={{
                        flex: isMobile ? "none" : 3,
                        height: isMobile ? "50dvh" : "100%",
                        p: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "background.default",
                    }}
                >
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
                        <WebRTCPlayer/>

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

                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 16,
                                right: 16,
                                pointerEvents: "auto",
                            }}
                        >
                            <ThrottleSlider
                                value={throttle}
                                onChange={handleThrottle}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Karte */}
                {isMobile ? (
                    <>
                        <IconButton
                            onClick={() => setMapOpen(true)}
                            sx={{
                                position: "fixed",
                                bottom: 16,
                                right: 16,
                                zIndex: (t) => t.zIndex.drawer + 1,
                                bgcolor: "background.paper",
                            }}
                        >
                            <MapIcon />
                        </IconButton>
                        <SwipeableDrawer
                            anchor="bottom"
                            open={mapOpen}
                            onOpen={() => {}}
                            onClose={() => setMapOpen(false)}
                            PaperProps={{
                                sx: { height: "50dvh" },
                            }}
                        >
                            <MapContainer
                                center={[lat, lng]}
                                zoom={16}
                                style={{ width: "100%", height: "100%" }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Recenter lat={lat} lng={lng} />
                                <Marker
                                    position={[lat, lng]}
                                    icon={ArrowIcon}
                                    rotationAngle={course}
                                    rotationOrigin="center bottom"
                                />
                            </MapContainer>
                        </SwipeableDrawer>
                    </>
                ) : (
                    <Box
                        sx={{
                            flex: 1,
                            height: "100%",
                        }}
                    >
                        <MapContainer
                            center={[lat, lng]}
                            zoom={16}
                            style={{ width: "100%", height: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Recenter lat={lat} lng={lng} />
                            <Marker
                                position={[lat, lng]}
                                icon={ArrowIcon}
                                rotationAngle={course}
                                rotationOrigin="center bottom"
                            />
                        </MapContainer>
                    </Box>
                )}
            </Box>
        </ThemeProvider>
    );
}
