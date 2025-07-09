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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_BASE = "http://192.168.0.71:3030";

export default function VideoGallery() {
    const [videos, setVideos] = useState(null);
    const [toDelete, setToDelete] = useState(null); // Dateiname, der gerade gelöscht werden soll

    // Videos laden
    const loadVideos = () => {
        fetch(`${API_BASE}/videos`)
            .then((r) => r.json())
            .then(setVideos)
            .catch(console.error);
    };

    useEffect(loadVideos, []);

    // Lösch-Request
    const confirmDelete = () => {
        fetch(`${API_BASE}/videos/${toDelete}`, { method: "DELETE" })
            .then((r) => {
                if (!r.ok) throw new Error("Löschen fehlgeschlagen");
                return r.json();
            })
            .then(() => {
                setToDelete(null);
                loadVideos(); // Liste neu laden
            })
            .catch((e) => {
                console.error(e);
                setToDelete(null);
            });
    };

    if (!videos) {
        return <CircularProgress sx={{ m: 4 }} />;
    }

    return (
        <>
            <Grid container spacing={2} sx={{ p: 2 }}>
                {videos.map((v) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={v.name}>
                        <Card sx={{ position: "relative" }}>
                            {/* Lösch-Button oben rechts */}
                            <IconButton
                                size="small"
                                sx={{ position: "absolute", top: 4, right: 4, zIndex: 1 }}
                                onClick={() => setToDelete(v.name)}
                            >
                                <DeleteIcon />
                            </IconButton>

                            {/* Thumbnail + Download */}
                            <Box component="a" href={`${API_BASE}${v.url}`} download>
                                <CardMedia
                                    component="img"
                                    image={`${API_BASE}${v.thumb}`}
                                    alt={v.name}
                                    sx={{ height: 140, objectFit: "cover" }}
                                />
                                <CardContent>
                                    <Typography variant="body2" sx={{color:'#fff'}} noWrap>
                                        {v.name}
                                    </Typography>
                                </CardContent>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Bestätigungs-Dialog */}
            <Dialog open={Boolean(toDelete)} onClose={() => setToDelete(null)}>
                <DialogTitle>
                    {`Video '${toDelete}' wirklich löschen?`}
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
