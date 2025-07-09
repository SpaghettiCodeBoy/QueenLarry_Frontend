// src/components/JoystickArea.jsx
import React, { useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import { Joystick } from 'react-joystick-component';

export default function JoystickArea({ onSteer }) {
    const label = 'STEERING';

    // Debug-Logging
    const sendMove = useCallback(
        (x) => console.debug(`[DEBUG] ${label} move → x:${x}`),
        [label]
    );
    const sendStop = useCallback(
        () => console.debug(`[DEBUG] ${label} released – back to neutral`),
        [label]
    );

    // Normierung auf -1…1
    const normalize = (v) => {
        if (v === undefined || v === null) return 0;
        const n = Math.abs(v) > 1 ? v / 100 : v;
        return +Math.max(-1, Math.min(1, n)).toFixed(2);
    };

    // Joystick-Bewegung
    const handleJoystickMove = (d) => {
        const x = normalize(d.x);
        sendMove(x);
        onSteer(x);
    };

    // Loslassen
    const handleJoystickStop = () => {
        sendStop();
        onSteer(0);
    };

    // Tastatur-Fallback (A/D oder Pfeiltasten)
    useEffect(() => {
        const down = (e) => {
            if (['a', 'ArrowLeft'].includes(e.key)) {
                sendMove(-1);
                onSteer(-1);
            }
            if (['d', 'ArrowRight'].includes(e.key)) {
                sendMove(1);
                onSteer(1);
            }
        };
        const up = (e) => {
            if (['a', 'd', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                handleJoystickStop();
            }
        };
        window.addEventListener('keydown', down);
        window.addEventListener('keyup', up);
        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('keyup', up);
        };
    }, [sendMove, handleJoystickStop, onSteer]);

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 150,     // feste Breite
                    height: 150,    // feste Höhe
                }}
            >
                <Joystick
                    size={150}
                    baseColor="rgba(255,255,255,0.15)"
                    stickColor="#00a9b7"
                    move={handleJoystickMove}
                    stop={handleJoystickStop}
                />
            </Box>
        </Box>
    );
}
