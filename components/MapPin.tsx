/** An embedded Google Map pinned to a place, plus a "Get directions" link. */
export default function MapPin({ title, embed, link }: { title: string; embed: string; link: string }) {
  return (
    <div className="map-pin">
      <iframe
        title={`Map: ${title}`}
        src={embed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a className="map" href={link} target="_blank" rel="noopener noreferrer">
        📍 Get directions →
      </a>
    </div>
  );
}
