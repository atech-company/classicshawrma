import Image from "next/image";

export function HeroSlideshow({
  images,
  label,
}: {
  images: { src: string; alt: string }[];
  label: string;
}) {
  const slides = images.slice(0, 6);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="hero-slideshow absolute inset-0 overflow-hidden" role="img" aria-label={label}>
      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className="hero-slideshow-slide absolute inset-0"
          style={{ animationDelay: `${index * 6}s` }}
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
        </div>
      ))}
      <div className="hero-slideshow-progress absolute inset-x-0 bottom-0 z-[1] h-1" aria-hidden="true">
        {slides.map((slide, index) => <span key={slide.src} style={{ animationDelay: `${index * 6}s` }} />)}
      </div>
    </div>
  );
}
