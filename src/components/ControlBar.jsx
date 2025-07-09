import React, { useState, useEffect, useRef } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    Typography,
    Dialog,
    Slide,
    Box,
    Snackbar,
    Popover,
    Slider,
} from "@mui/material";

import LightModeIcon from "@mui/icons-material/LightMode";
import HighlightIcon from "@mui/icons-material/Highlight";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import StopIcon from "@mui/icons-material/Stop";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CloseIcon from "@mui/icons-material/Close";

import VideoGallery from "./VideoGallery";  // ggf. Pfad anpassen

// feste API-Basis des Pi
const API_BASE = "https://pi.wizzwatts.com";

// Slide-Transition für den Dialog
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ControlBar({ throttle, wsConnected, sendSound }) {
    // Slider-Werte
    const [deckValue, setDeckValue] = useState(0);
    const [navValue, setNavValue] = useState(0);

    // Popovers
    const [deckAnchorEl, setDeckAnchorEl] = useState(null);
    const [navAnchorEl, setNavAnchorEl] = useState(null);

    // Sound & Gallery
    const [anchorEl, setAnchorEl] = useState(null);
    const [galleryOpen, setGalleryOpen] = useState(false);

    // Recording
    const [isRecording, setIsRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [processing, setProcessing] = useState(false);
    const elapsedRef = useRef(null);

    // Snackbar
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");

    // ---- Deck slider handlers ----
    const openDeckPopover = (e) => setDeckAnchorEl(e.currentTarget);
    const closeDeckPopover = () => setDeckAnchorEl(null);
    const handleDeckChange = (e, v) => {
        setDeckValue(v);
        fetch(`${API_BASE}/light/deck`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intensity: v }),
        }).catch(console.error);
    };

    // ---- Nav slider handlers ----
    const openNavPopover = (e) => setNavAnchorEl(e.currentTarget);
    const closeNavPopover = () => setNavAnchorEl(null);
    const handleNavChange = (e, v) => {
        setNavValue(v);
        fetch(`${API_BASE}/light/nav`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intensity: v }),
        }).catch(console.error);
    };

    // ---- Pin3 mode trigger ----
    const triggerPin3Mode = () => {
        fetch(`${API_BASE}/light/mode`, { method: "POST" })
            .then(() => console.debug("[DEBUG] Pin3 Mode switched"))
            .catch(console.error);
    };

    // ---- Sound menu ----
    const openSoundMenu = (e) => setAnchorEl(e.currentTarget);
    const closeSoundMenu = () => setAnchorEl(null);
    const handleSoundSelect = (soundKey) => {
        sendSound({ sound: soundKey });
        closeSoundMenu();
    };

    // ---- Recording ----
    const startRec = () => {
        if (isRecording || processing) return;
        fetch(`${API_BASE}/record/start`, { method: "POST" })
            .then(() => {
                setIsRecording(true);
                setElapsed(0);
                setSnackbarMsg("Aufnahme gestartet");
                setSnackbarOpen(true);
            })
            .catch(console.error);
    };
    const stopRec = () => {
        if (!isRecording) return;
        clearInterval(elapsedRef.current);
        setIsRecording(false);
        setProcessing(true);
        setSnackbarMsg("Video wird verarbeitet...");
        setSnackbarOpen(true);
        fetch(`${API_BASE}/record/stop`, { method: "POST" })
            .then(() => window.location.reload())
            .catch(() => {
                setProcessing(false);
                setSnackbarMsg("Fehler beim Verarbeiten");
                setSnackbarOpen(true);
            });
    };
    useEffect(() => {
        if (isRecording) {
            elapsedRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
        }
        return () => clearInterval(elapsedRef.current);
    }, [isRecording]);

    // ---- Helpers ----
    const toggleGallery = () => setGalleryOpen((o) => !o);
    const handleSnackbarClose = () => setSnackbarOpen(false);
    const formatTime = (s) => {
        const m = String(Math.floor(s / 60)).padStart(2, "0");
        const sec = String(s % 60).padStart(2, "0");
        return `${m}:${sec}`;
    };

    return (
        <>
            <AppBar position="fixed" color="primary" elevation={6} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
                <Toolbar sx={{ justifyContent: "center", gap: 2 }}>
                    {/* Deck icon + popover */}
                    <Tooltip title="Deck-Beleuchtung">
                        <IconButton onClick={openDeckPopover}>
                            <LightModeIcon />
                        </IconButton>
                    </Tooltip>
                    <Popover
                        open={Boolean(deckAnchorEl)}
                        anchorEl={deckAnchorEl}
                        onClose={closeDeckPopover}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        transformOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Box p={1}>
                            <Slider
                                orientation="vertical"
                                value={deckValue}
                                onChange={handleDeckChange}
                                min={0}
                                max={255}
                                size="small"
                                sx={{ height: 150 }}
                            />
                        </Box>
                    </Popover>

                    {/* Nav icon + popover */}
                    <Tooltip title="Navigation Lights">
                        <IconButton onClick={openNavPopover}>
                            <HighlightIcon />
                        </IconButton>
                    </Tooltip>
                    <Popover
                        open={Boolean(navAnchorEl)}
                        anchorEl={navAnchorEl}
                        onClose={closeNavPopover}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        transformOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <Box p={1}>
                            <Slider
                                orientation="vertical"
                                value={navValue}
                                onChange={handleNavChange}
                                min={0}
                                max={255}
                                size="small"
                                sx={{ height: 150 }}
                            />
                        </Box>
                    </Popover>

                    {/* Pin 3: Mode-Switch */}
                    <Tooltip title="Licht 3: Modus wechseln">
                        <IconButton onClick={triggerPin3Mode}>
                            <FlashOnIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Sound menu */}
                    <Tooltip title="Sounds">
                        <IconButton color={wsConnected ? "inherit" : "disabled"} onClick={openSoundMenu}>
                            <VolumeUpIcon />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeSoundMenu}
                        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                        transformOrigin={{ vertical: "top", horizontal: "center" }}
                    >
                        <MenuItem onClick={() => handleSoundSelect("horn.wav")}>
                            <Typography>Schiffshorn</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => handleSoundSelect("alarm.wav")}>
                            <Typography>Alarm</Typography>
                        </MenuItem>
                    </Menu>

                    {/* Recording status & buttons */}
                    {isRecording && <Typography sx={{ ml: 2 }}>Aufnahme: {formatTime(elapsed)}</Typography>}
                    {processing && <Typography sx={{ ml: 2 }}>Video wird verarbeitet...</Typography>}

                    <Tooltip title={isRecording ? `Stopp (${formatTime(elapsed)})` : "Aufnahme Start"}>
            <span>
              <IconButton color="error" onClick={startRec} disabled={isRecording || processing}>
                <RadioButtonCheckedIcon />
              </IconButton>
            </span>
                    </Tooltip>
                    <Tooltip title={isRecording ? "Aufnahme stoppen" : "—"}>
            <span>
              <IconButton color={isRecording ? "warning" : "disabled"} onClick={stopRec} disabled={!isRecording}>
                <StopIcon />
              </IconButton>
            </span>
                    </Tooltip>

                    {/* Video gallery */}
                    <Tooltip title="Aufzeichnungen">
                        <IconButton onClick={toggleGallery}>
                            <VideoLibraryIcon />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* Video Gallery Dialog */}
            <Dialog fullScreen open={galleryOpen} onClose={toggleGallery} TransitionComponent={Transition}>
                <AppBar sx={{ position: "relative" }}>
                    <Toolbar>
                        <IconButton edge="start" color="inherit" onClick={toggleGallery}>
                            <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
                            Aufzeichnungen
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Box sx={{ flex: 1, overflow: "auto" }}>
                    <VideoGallery />
                </Box>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbarOpen} message={snackbarMsg} autoHideDuration={3000} onClose={handleSnackbarClose} />
        </>
    );
}
