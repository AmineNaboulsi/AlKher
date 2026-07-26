"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * Hero background clip. Playback is driven from an effect rather than the
 * `autoPlay` attribute so `prefers-reduced-motion` keeps it on the poster frame.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    video
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, []);

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
    <figure className="relative w-full">
      <div className="relative overflow-hidden rounded-2xl border brass-hairline bg-surface-raised shadow-card">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="metadata"
          poster="/video/moroccan-tea-poster.jpg"
          className="aspect-[4/3] w-full object-cover"
          aria-label="تحضير الأتاي على الفحم في الصحراء المغربية"
        >
          <source src="/video/moroccan-tea.webm" type="video/webm" />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>

        {/* Warm edge so the clip settles into the white page. */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-brass/15" />

        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "إيقاف الفيديو" : "تشغيل الفيديو"}
          className="absolute bottom-3 end-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 text-ink backdrop-blur-sm border brass-hairline transition-colors hover:bg-background"
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </button>
      </div>

      <figcaption className="mt-3 text-xs text-ink-muted">
        فيديو: تحضير الأتاي على الفحم — مصطفى ملو، ويكيميديا كومنز،{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0"
          className="underline decoration-brass/40 hover:text-ink transition-colors"
          rel="license noopener noreferrer"
          target="_blank"
          dir="ltr"
        >
          CC BY-SA 4.0
        </a>
      </figcaption>
    </figure>
  );
}
