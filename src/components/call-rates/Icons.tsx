// src/components/call-rates/Icons.tsx

import React from "react";

// Mic Icon for Voice Calls
export const MicIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 1 0 6 0V6a3 3 0 0 0-3-3Z" />
    <path d="M19 10a7 7 0 0 1-14 0" />
    <path d="M12 19v3M8 22h8" />
  </svg>
);

// Camera Icon for Video Calls
export const CamIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M15 9l6-3v12l-6-3z" />
  </svg>
);
