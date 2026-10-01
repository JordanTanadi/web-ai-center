interface Props {
  kicker: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
  /**
   * Level heading: 'h1' untuk judul utama halaman, 'h2' untuk section
   * (default) agar hierarki heading tetap benar (SEO & screen reader).
   */
  level?: 'h1' | 'h2';
}

export default function SectionHeading({
  kicker,
  title,
  sub,
  align = 'center',
  tone = 'light',
  level = 'h2',
}: Props) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const kickerCls = tone === 'dark' ? 'text-[#dbe3ff]' : 'text-brand';
  const titleCls = tone === 'dark' ? 'text-white' : 'text-ink';
  const subCls = tone === 'dark' ? 'text-[#dbe3ff]' : 'text-muted';
  // Eyebrow ala situs patokan: label mono uppercase + dot aksen.
  const dotCls =
    tone === 'dark'
      ? 'bg-yellow shadow-[0_0_0_4px_rgba(255,255,255,0.2)]'
      : 'bg-brand-bright shadow-[0_0_0_4px_rgba(6,116,253,0.18)]';
  const Heading = level;
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      <span
        className={`inline-flex items-center gap-2.5 font-mono text-xs font-bold uppercase tracking-[0.22em] ${kickerCls}`}
      >
        <span aria-hidden="true" className={`h-[7px] w-[7px] shrink-0 rounded-full ${dotCls}`} />
        {kicker}
      </span>
      <Heading className={`mt-2 font-display text-2xl font-bold md:text-3xl ${titleCls}`}>{title}</Heading>
      {sub ? <p className={`mt-2 ${subCls}`}>{sub}</p> : null}
    </div>
  );
}
