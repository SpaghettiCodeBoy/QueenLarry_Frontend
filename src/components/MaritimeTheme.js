import { createTheme } from '@mui/material/styles';

const maritimeBlue   = '#062a4d';   // dunkel   – Meer
const maritimeCyan   = '#00a9b7';   // akzent   – Wellen/Neon
const maritimeOrange = '#ffb356';   // highlight – Licht/Horn

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary:   { main: maritimeCyan },
        secondary: { main: maritimeOrange },
        background: {
            default: maritimeBlue,
            paper:   '#093865',
        },
    },
    shape:  { borderRadius: 8 },
    typography: {
        fontFamily: ['"Roboto"', 'Gill Sans', 'sans-serif'].join(','),
    },
});
