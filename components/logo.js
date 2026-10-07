export default function Logo({ size = 32, className = "" }) {
  // Uses the user-uploaded Promptora brand mark.
  // Served from /public/promptora-mark.png (RGBA transparent background).
  return (
    <img
      src="/promptora-mark.png"
      alt="Promptora"
      width={size}
      height={size}
      className={className}
      style={{ display: "inline-block", objectFit: "contain" }}
      draggable={false}
    />
  );
}
