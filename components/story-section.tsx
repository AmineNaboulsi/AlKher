import Image from "next/image";
import { ZelligeDivider } from "@/components/zellige-divider";

export function StorySection() {
  return (
    <section id="story" className="py-16 sm:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-start">
            <p className="text-sm font-medium uppercase tracking-widest text-brass">
              من المحل إلى البراد
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-balance">
              نبيع الشاي الذي يعرفه المغاربة — لا أكثر ولا أقل
            </h2>
            <div className="space-y-4 text-ink-muted leading-relaxed">
              <p>
                الأتاي المغربي يقوم على الشاي الأخضر الصيني: أوراق ملفوفة
                تتحمّل الغلي المتكرر في البراد، وتُعطي رغوة عند الصبّ من علوّ.
                لذلك نختار العلب التي أثبتت نفسها في البيوت المغربية بدل أن
                نبيع أسماء لا يعرفها أحد.
              </p>
              <p>
                عندنا أربعة أنواع فقط: لاس بالماس وشاي الساقية الحمراء من درجة
                شنمي 41022، سمارة من الدرجة الفاخرة، وبيت الفخامة للاستعمال
                اليومي. أسعار المحل، وكل علبة مغلَّفة كما وصلت من المورّد.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border brass-hairline shadow-card">
            <Image
              src="/video/moroccan-tea-poster.jpg"
              alt="براد أتاي على الفحم وأوراق الشاي الأخضر تغلي داخله"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
      <ZelligeDivider variant="compact" className="mt-16" />
    </section>
  );
}
