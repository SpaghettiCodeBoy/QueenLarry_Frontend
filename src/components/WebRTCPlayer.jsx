import React from "react";

export default function WebRTCPlayer() {
    return (
        <iframe
            src="https://video.wizzwatts.com/"
            title="WebRTC Video Player"
            style={{
                width: "100%",
                height: "100%",
                border: "none" // Entfernt den Standard-Rahmen des Iframes
            }}
        />
    );
}