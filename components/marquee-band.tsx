import { Khatem } from "@/components/khatem";

const phrases = [
  "الكأس الأول لطيف كالحياة",
  "الثاني قوي كالحب",
  "الثالث مرّ كالموت",
  "من المحل إلى البراد",
  "الدفع عند التوصيل",
];

/**
 * A slow brass band of Moroccan tea proverbs between the hero and the shelf.
 *
 * It exists to change the page's rhythm — hero, then a thin moving line, then
 * product — rather than to be read closely, so the list is duplicated once and
 * translated by exactly -50%: the seam lands where the copy repeats and is
 * invisible. `aria-hidden` on the second copy keeps it out of the a11y tree.
 */
export function MarqueeBand() {
  const row = (
    <ul className="flex shrink-0 items-center gap-10 px-5">
      {phrases.map((phrase) => (
        <li
          key={phrase}
          className="flex items-center gap-10 whitespace-nowrap font-display text-sm tracking-wide text-brass/85 sm:text-base"
        >
          {phrase}
          <Khatem className="h-3 w-3 text-brass/45" strokeWidth={8} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative overflow-hidden border-y brass-hairline bg-surface py-3.5">
      {/* Fade the ends so phrases arrive and leave rather than being clipped. */}
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-20 bg-gradient-to-l from-transparent to-surface" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-20 bg-gradient-to-r from-transparent to-surface" />

      <div className="flex w-max animate-marquee">
        {row}
        <div aria-hidden="true" className="flex">
          {row}
        </div>
      </div>
    </div>
  );
}
