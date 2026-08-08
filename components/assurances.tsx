import Image from "next/image";
import { plates } from "@/lib/media";
import { Truck, ShieldCheck, PackageCheck, Wallet } from "lucide-react";

const points = [
  {
    icon: PackageCheck,
    title: "علبة مغلّفة",
    body: "كل علبة كما وصلات من المورّد — ما كنفتحوها وما كنعبّيوها من جديد.",
  },
  {
    icon: Wallet,
    title: "ثمن المحل",
    body: "نفس الثمن اللي غادي تلقى فالمحل، بلا هامش زائد على التوصيل.",
  },
  {
    icon: Truck,
    title: "لجميع المدن",
    body: "كنوصلو لجميع المدن المغربية، والطلب كيتأكد معك عبر واتساب.",
  },
  {
    icon: ShieldCheck,
    title: "الخلاص عند التوصيل",
    body: "ما كتخلّص والو قبل ما توصلك العلبة ليدك.",
  },
];

/**
 * The four objections a first-time Moroccan online buyer actually has, answered
 * next to a photograph rather than as a row of naked icons on empty ground.
 */
export function Assurances() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-stretch gap-10 lg:grid-cols-[1.05fr_1fr]">
          {/* The caption sits on the photograph, so it keeps the dark palette. */}
          <figure
            data-theme="dark"
            className="relative min-h-70 overflow-hidden rounded-2xl border brass-hairline"
          >
            <Image
              src={plates.delivery}
              alt="صبّ الأتاي فصينية ديال الكيسان للضيوف"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 p-7">
              <p className="font-display text-2xl font-bold leading-snug text-balance">
                من عندنا للبراد ديالك —
                <span className="brass-text"> بلا مفاجآت</span>
              </p>
            </figcaption>
          </figure>

          <ul className="grid gap-4 sm:grid-cols-2">
            {points.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="group flex flex-col gap-3 rounded-2xl border brass-hairline bg-surface p-6 transition-colors duration-300 hover:border-brass/45"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border brass-hairline bg-surface-raised text-brass transition-colors group-hover:text-brass-light">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
