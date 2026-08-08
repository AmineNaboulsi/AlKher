"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The product's rendered ad clip, click-to-play.
 *
 * Deliberately *not* autoplaying: on a product page the visitor came to read a
 * price, and a second moving thing next to the buy box competes with it. It
 * loads nothing but the poster until the play button is pressed
 * (`preload="none"`), so it costs a single image until someone wants it.
 */
export function ProductClipCard({
  src,
  poster,
  label,
  className,
}: {
  src: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(
        () => setPlaying(true),
        () => setPlaying(false)
      );
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  return (
    <figure
      // The play control sits on the clip's own dark poster, so it keeps the
      // dark palette regardless of the page theme.
      data-theme="dark"
      className={cn(
        "group relative overflow-hidden rounded-2xl border brass-hairline bg-surface",
        className
      )}
    >
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        preload="none"
        poster={poster}
        aria-label={label}
        onEnded={() => setPlaying(false)}
        className="aspect-square w-full object-cover"
      >
        <source src={src} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "إيقاف الفيديو" : "تشغيل الفيديو"}
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-colors",
          playing ? "bg-transparent" : "bg-night/35 hover:bg-night/20"
        )}
      >
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full border brass-hairline glass text-brass-light transition-all duration-300",
            playing
              ? "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
              : "scale-100 opacity-100"
          )}
        >
          {playing ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 translate-x-px" />
          )}
        </span>
      </button>
    </figure>
  );
}
