// src/components/ThrottleGauge.jsx
import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

export default function ThrottleGauge({ value = 0 }) {
    return (
        <ReactSpeedometer
            value={value}
            minValue={-100}
            maxValue={100}
            customSegmentStops={[-100, -25, 0, 25, 100]}
            segmentColors={['#b55a00', '#b55a00', '#00a9b7', '#00a9b7']}
            ringWidth={20}
            needleColor="#fff"
            needleHeightRatio={0.7}
            textColor="#fff"
            width={250}
            height={250}

        />
    );
}
