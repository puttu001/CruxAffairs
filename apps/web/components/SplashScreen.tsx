const LOGO_URL =
  "https://res.cloudinary.com/gqwfsunp/image/upload/v1783002468/Crux_affairs_logo-removebg-preview_h6ie72.png";

export default function SplashScreen() {
  return (
    <div className="splash-screen">
      <img src={LOGO_URL} alt="CruxAffairs" className="splash-logo" />
      <div className="splash-text">
        <span className="splash-crux">Crux</span>
        <span className="splash-affairs">Affairs</span>
      </div>
      <p className="splash-tagline">The Crux of Current Affairs</p>
    </div>
  );
}
