const LOGO_URL =
  "https://res.cloudinary.com/gqwfsunp/image/upload/v1783002468/Crux_affairs_logo-removebg-preview_h6ie72.png";

interface Props {
  imgHeight?: number;
  textSize?: string;
  onDark?: boolean; // true when placed on the dark indigo brand panel
}

export default function BrandLogo({ imgHeight = 32, textSize = "1.1rem", onDark = false }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <img
        src={LOGO_URL}
        alt="CruxAffairs"
        style={{ height: imgHeight, width: "auto", objectFit: "contain" }}
      />
      <span style={{ fontWeight: 800, fontSize: textSize, letterSpacing: "-0.02em", lineHeight: 1 }}>
        <span style={{ color: onDark ? "#c7d2fe" : "#6366f1" }}>Crux</span>
        <span style={{ color: onDark ? "#fcd34d" : "#f97316" }}>Affairs</span>
      </span>
    </div>
  );
}
