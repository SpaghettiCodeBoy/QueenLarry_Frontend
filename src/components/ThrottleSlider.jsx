// src/components/ThrottleSlider.jsx
import React from 'react';
import { Box, IconButton, Tooltip, Slider, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const Lever = styled(Slider)(({ theme }) => ({
    color: theme.palette.secondary.main,
    height: 10,
    padding: '20px 0',
    '& .MuiSlider-track': {
        background: 'linear-gradient(0deg,#b55a00 0%,#00a9b7 100%)',
        border: 0
    },
    '& .MuiSlider-rail': {
        opacity: 0.25,
        background: '#fff'
    },
    '& .MuiSlider-thumb': {
        height: 54,
        width: 40,
        borderRadius: 6,
        backgroundColor: theme.palette.secondary.main,
        border: '3px solid #fff',
        transition: 'transform .2s',
        '&:active': {
            transform: 'scale(1.05)'
        },
        '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 4,
            height: 32,
            transform: 'translate(-50%, -50%)',
            background: '#062a4d',
            borderRadius: 1
        }
    },
    '& .MuiSlider-markLabel': {
        fontSize: 12,
        color: '#fff'
    }
}));

export default function ThrottleSlider({ value, onChange }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleSlider = (_, newVal) => onChange(newVal);
    const setNeutral = () => onChange(0);

    return (
        <Box
            sx={{





            }}
        >
            <Lever
                orientation="vertical"
                value={value}
                min={-100}
                max={100}
                step={1}
                onChange={handleSlider}
                marks={[
                    { value: 100, label: 'FWD' },
                    { value:   0, label: 'N'   },
                    { value:-100, label: 'REV' },
                ]}
                sx={{ height: isMobile ? 180 : 260 }}
            />

            <Tooltip title="Auf 0 setzen">
                <IconButton
                    color="secondary"
                    onClick={setNeutral}
                    size={isMobile ? 'large' : 'medium'}
                    sx={{
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                    }}
                >
                    <RestartAltIcon fontSize={isMobile ? 'large' : 'inherit'} />
                </IconButton>
            </Tooltip>
        </Box>
    );
}
