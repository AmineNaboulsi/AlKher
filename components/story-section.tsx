import Image from "next/image";
import { plates } from "@/lib/media";
import { SectionKicker } from "@/components/khatem";

const proof = [
  { value: "4", label: "أنواع مختارة" },
  { value: "20 د.م.", label: "أرخص عبوة", ltr: true },
  { value: "500g", label: "أكبر عبوة", ltr: true },
];

export function StorySection() {
  return (
    <section id="story" className="page-wash py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="space-y-7 text-start">
            <SectionKicker>من المحل إلى البراد</SectionKicker>

            <h2 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
              كنبيعو الشاي اللي كيعرفوه المغاربة —
              <span className="brass-text"> لا أكثر ولا أقل</span>
            </h2>

            <div className="space-y-4 leading-relaxed text-ink-muted text-pretty">
              <p>
                الأتاي المغربي كيقوم على الشاي الأخضر الصيني: أوراق ملفوفة
                كتتحمّل الغليان المتكرر فالبراد، وكتعطي رغوة ملي كتصبّ من علوّ.
                لهذا كنختارو العلب اللي بانت فالبيوت المغربية، بدل ما نبيعو
                أسماء ما كيعرفها حتى واحد.
              </p>
              <p>
                عندنا غير أربعة أنواع: لاس بالماس والساقية الحمراء من درجة شنمي
                41022، سمارة من الدرجة الفاخرة، وبيت الفخامة للاستعمال اليومي.
                أثمنة المحل، وكل علبة مغلَّفة كما وصلات من المورّد.
              </p>
            </div>

            <dl className="flex flex-wrap gap-x-10 gap-y-5 border-t brass-hairline pt-7">
              {proof.map((item) => (
                <div key={item.label} className="space-y-1">
                  <dt className="text-xs uppercase tracking-widest text-ink-faint">
                    {item.label}
                  </dt>
                  <dd
                    className="font-display text-2xl font-bold text-brass-light"
                    dir={item.ltr ? "ltr" : undefined}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* The doorway. A riad arch is the one shape that says "Morocco"
              without a single decorative flourish on top of the photograph. */}
          <figure className="relative">
            <div className="arch relative aspect-[4/5] overflow-hidden bg-surface-raised">
              <Image
                src={plates.aboutPortrait}
                alt="شاب كيصبّ الأتاي من علوّ فصالون مغربي"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* A brass outline offset behind the arch — the tray under the
                glass, not a border on the photo. */}
            <div
              aria-hidden="true"
              className="arch pointer-events-none absolute -bottom-4 -start-4 -z-10 aspect-[4/5] w-full border-2 border-brass/25"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
