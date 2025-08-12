import React, { useEffect, useState } from "react";
import {
    Card,
    CardMedia,
    CardContent,
    Typography,
    Grid,
    IconButton,
    CircularProgress,
    Box,
    Dialog,
    DialogTitle,
    DialogActions,
    Button,
    DialogContent,
    Stack,
    Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const API_BASE = "https://pi.wizzwatts.com";

export default function VideoGallery() {
    const [videos, setVideos] = useState(null);
    const [toDelete, setToDelete] = useState(null);      // Dateiname zur Bestätigung
    const [active, setActive] = useState(null);          // aktives Videoobjekt für Player-Dialog

    const loadVideos = () => {
        fetch(`${API_BASE}/videos`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(setVideos)
            .catch(console.error);
    };

    useEffect(loadVideos, []);

    const confirmDelete = () => {
        fetch(`${API_BASE}/videos/${toDelete}`, { method: "DELETE" })
            .then((r) => {
                if (!r.ok) throw new Error("Löschen fehlgeschlagen");
                return r.json();
            })
            .then(() => {
                // Falls wir gerade das gelöschte Video im Player hatten → schließen
                if (active && active.name === toDelete) setActive(null);
                setToDelete(null);
                loadVideos();
            })
            .catch((e) => {
                console.error(e);
                setToDelete(null);
            });
    };

    if (!videos) {
        return <CircularProgress sx={{ m: 4 }} />;
    }

    const openPlayer = (v) => setActive(v);
    const closePlayer = () => setActive(null);

    return (
        <>
            <Grid container spacing={2} sx={{ p: 2 }}>
                {videos.length === 0 && (
                    <Grid item xs={12}>
                        <Typography sx={{ opacity: 0.8, textAlign: "center", my: 4 }}>
                            Keine Aufzeichnungen gefunden.
                        </Typography>
                    </Grid>
                )}

                {videos.map((v) => {
                    const videoUrl = `${API_BASE}${v.url}`;
                    const thumbUrl = v.thumb ? `${API_BASE}${v.thumb}` : null;

                    return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={v.name}>
                            <Card sx={{ position: "relative", bgcolor: "background.paper" }}>
                                {/* Action-Buttons oben rechts */}
                                <Stack
                                    direction="row"
                                    spacing={0.5}
                                    sx={{ position: "absolute", top: 4, right: 4, zIndex: 2 }}
                                >
                                    <Tooltip title="Download">
                                        <IconButton
                                            size="small"
                                            component="a"
                                            href={videoUrl}
                                            download
                                        >
                                            <DownloadIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Löschen">
                                        <IconButton
                                            size="small"
                                            onClick={() => setToDelete(v.name)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>

                                {/* Thumbnail oder Fallback */}
                                {thumbUrl ? (
                                    <Box onClick={() => openPlayer(v)} sx={{ cursor: "pointer" }}>
                                        <CardMedia
                                            component="img"
                                            image={thumbUrl}
                                            alt={v.name}
                                            sx={{ height: 140, objectFit: "cover" }}
                                        />
                                    </Box>
                                ) : (
                                    <Box
                                        onClick={() => openPlayer(v)}
                                        sx={{
                                            height: 140,
                                            cursor: "pointer",
                                            display: "grid",
                                            placeItems: "center",
                                            bgcolor: "grey.900",
                                        }}
                                    >
                                        <PlayArrowIcon sx={{ fontSize: 40, opacity: 0.9 }} />
                                    </Box>
                                )}

                                <CardContent sx={{ py: 1.0 }}>
                                    <Typography variant="body2" noWrap>
                                        {v.name}
                                    </Typography>
                                    {/* Optional: Größe/Zeit anzeigen */}
                                    {/* <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {(v.size / (1024 * 1024)).toFixed(1)} MB
                  </Typography> */}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Player-Dialog */}
            <Dialog open={Boolean(active)} onClose={closePlayer} maxWidth="md" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    {active?.name || "Video"}
                </DialogTitle>
                <DialogContent dividers>
                    {active && (
                        <video
                            key={active.name}     // erzwingt Reload bei Video-Wechsel
                            controls
                            style={{ width: "100%", height: "auto", borderRadius: 8 }}
                            src={`${API_BASE}${active.url}`}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePlayer}>Schließen</Button>
                    {active && (
                        <Button
                            component="a"
                            href={`${API_BASE}${active.url}`}
                            download
                            variant="contained"
                        >
                            Download
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            {/* Bestätigungs-Dialog fürs Löschen */}
            <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
                <DialogTitle>
                    {toDelete ? `Video '${toDelete}' wirklich löschen?` : "Löschen?"}
                </DialogTitle>
                <DialogActions>
                    <Button onClick={() => setToDelete(null)}>Abbrechen</Button>
                    <Button color="error" onClick={confirmDelete}>
                        Löschen
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
