// src/components/ThrottleSlider.jsx
import React from 'react';
import { Box, IconButton, Tooltip, Slider } from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ThrottleGauge from './ThrottleGauge';

/* Styled Slider („Gashebel“) bleibt unverändert */
const Lever = styled(Slider)(({ theme }) => ({
    color: theme.palette.secondary.main,
    height: 10,
    padding: '20px 0',
    '& .MuiSlider-track': {
        background: 'linear-gradient(0deg,#b55a00 0%,#00a9b7 100%)',
        border: 0,
    },
    '& .MuiSlider-rail': {
        opacity: 0.25,
        background: '#ffffff',
    },
    '& .MuiSlider-thumb': {
        height: 54,
        width: 40,
        borderRadius: 6,
        backgroundColor: theme.palette.secondary.main,
        border: '3px solid #fff',
        transition: 'transform .2s',
        '&:active': { transform: 'scale(1.05)' },
        '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 4,
            height: 32,
            transform: 'translate(-50%, -50%)',
            background: '#062a4d',
            borderRadius: 1,
        },
    },
    '& .MuiSlider-markLabel': {
        fontSize: 12,
        color: '#fff',
    },
}));

export default function ThrottleSlider({ value, onChange }) {
    // value: -100…+100, onChange: (newVal) => void

    const handleSlider = (_, newVal) => {
        onChange(newVal);
    };

    const setNeutral = () => onChange(0);

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: 320 },
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: { xs: 'center', md: 'flex-end' },
                gap: 2,
                touchAction: 'none',
            }}
        >
            {/* Gashebel */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Lever
                    orientation="vertical"
                    value={value}
                    min={-100}
                    max={100}
                    step={1}
                    onChange={handleSlider}
                    onDoubleClick={setNeutral}
                    marks={[
                        { value:  100, label: 'FWD' },
                        { value:    0, label: 'N'   },
                        { value: -100, label: 'REV' },
                    ]}
                    sx={{ height: 260 }}
                />

                <Tooltip title="Auf 0 setzen">
                    <IconButton color="secondary" size="large" onClick={setNeutral}>
                        <RestartAltIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Drehzahl-/Gas-Gauge */}

        </Box>
    );
}
