const browserKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface FooterMapProps {
  query?: string;
  className?: string;
  height?: string;
}

export function FooterMap({
  query = "Accra, Ghana",
  className = "h-56 w-full border-0",
  height,
}: FooterMapProps) {
  // Permanent fallback URL that never expires and requires no API key
  const permanentUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    query,
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const mapUrl = browserKey
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(
        browserKey,
      )}&q=${encodeURIComponent(query)}&zoom=13`
    : permanentUrl;

  return (
    <iframe
      title="I.A Dewealth's Enterprise location in Accra, Ghana"
      src={mapUrl}
      className={className}
      style={height ? { height } : undefined}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
