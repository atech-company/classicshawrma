import Image from "next/image";

export function HeroSlideshow({
  images,
  label,
  socialHref,
  socialLabel,
}: {
  images: { src: string; alt: string; caption?: string; category?: string }[];
  label: string;
  socialHref?: string;
  socialLabel?: string;
}) {
  const slides = images.slice(0, 8);
  const duration = `${slides.length * 6}s`;

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="hero-slideshow absolute inset-0 overflow-hidden" role="group" aria-label={label}>
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className="hero-slideshow-slide absolute inset-0"
          style={{ animationDelay: `${index * 6}s`, animationDuration: duration }}
          aria-hidden="true"
        >
          <Image
            src={slide.src}
            alt=""
            fill
            sizes="100vw"
            priority={index === 0}
            className="hero-slideshow-image object-cover"
          />
          {(slide.caption || slide.category) && <div className="hero-slideshow-caption absolute bottom-6 end-5 z-[1] flex max-w-[min(70vw,22rem)] flex-col items-end gap-1 text-end sm:bottom-8 sm:end-8">
            {slide.category && <span className="hero-slideshow-category">{slide.category}</span>}
            {slide.caption && <span className="hero-slideshow-name">{slide.caption}</span>}
          </div>}
        </div>
      ))}
      <div className="hero-slideshow-progress absolute inset-x-0 bottom-0 z-[1] h-1" aria-hidden="true">
        {slides.map((slide, index) => <span key={slide.src} style={{ animationDelay: `${index * 6}s`, animationDuration: duration }} />)}
      </div>
      {socialHref && socialLabel && <a href={socialHref} target="_blank" rel="noreferrer" className="hero-slideshow-social absolute bottom-4 start-4 z-[1] inline-flex items-center gap-2 rounded-full px-3 py-2 text-[10px] font-extrabold tracking-wide transition hover:-translate-y-0.5 sm:bottom-6 sm:start-6 sm:px-4 sm:text-xs">{socialLabel}</a>}
    </div>
  );
}
