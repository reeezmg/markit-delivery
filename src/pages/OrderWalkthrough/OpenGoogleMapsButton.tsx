import React from "react";

interface OpenGoogleMapsButtonProps {
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  label?: string;
}

const buildGoogleMapsUrl = (address?: string | null, lat?: number | null, lng?: number | null) => {
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
  if (hasCoords) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const query = String(address || "").trim();
  if (!query) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

const OpenGoogleMapsButton: React.FC<OpenGoogleMapsButtonProps> = ({
  address,
  lat,
  lng,
  label = "Go",
}) => {
  const mapsUrl = buildGoogleMapsUrl(address, lat, lng);

  return (
    <button
      type="button"
      className="wt-go-maps-btn"
      disabled={!mapsUrl}
      aria-label="Open in Google Maps"
      onClick={() => {
        if (mapsUrl) window.location.href = mapsUrl;
      }}
    >
      {label}
    </button>
  );
};

export default OpenGoogleMapsButton;
