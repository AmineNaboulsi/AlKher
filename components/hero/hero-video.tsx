"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { clips, plates } from "@/lib/media";
import { cn } from "@/lib/utils";

type Cut = "wide" | "tall";

/**
 * The hero's ambient clip, rendered by the Remotion studio (`Alkhayr-HeroLoop`)
 * and cut two ways — 16:9 and 9:16. Which one loads is decided on the client
 * *after* mount, so a phone never downloads the desktop cut and vice versa;
 * until then, and whenever motion is reduced, the poster plate stands in.
 *
 * The clip is decoration: it is `aria-hidden`, silent, and everything it says
 * is also said in the copy over it.
 */
export function HeroVideo({ className }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cut, setCut] = useState<Cut | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const wide = window.matchMedia("(min-width: 768px)");
    const apply = () => setCut(wide.matches ? "wide" : "tall");
    apply();
    wide.addEventListener("change", apply);
    return () => wide.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !cut) return;

    video
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [cut]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Always painted: the poster is the LCP element, and it is what stays
          on screen for reduced-motion visitors. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cut === "tall" ? plates.heroTall : plates.heroWide}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />

      {cut && (
        <video
          key={cut}
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          poster={cut === "tall" ? clips.heroTall.poster : clips.hero.poster}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-1000",
            playing ? "opacity-100" : "opacity-0"
          )}
        >
          {cut === "wide" && (
            <source src={clips.hero.webm} type="video/webm" />
          )}
          <source
            src={cut === "tall" ? clips.heroTall.mp4 : clips.hero.mp4}
            type="video/mp4"
          />
        </video>
      )}

      {/* Legibility ramps. The plate already carries a soft one; these two
          guarantee the headline holds up over any frame of the loop. */}
      <div className="pointer-events-none absolute inset-0 scrim-bottom" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-night/70 via-night/25 to-transparent" />

      {cut && (
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "إيقاف الفيديو" : "تشغيل الفيديو"}
          className="absolute bottom-6 end-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border brass-hairline glass text-ink/80 transition-colors hover:text-brass-light"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
