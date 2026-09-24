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
  const kickerCls = tone === 'dark' ? 'text-[#ccd7ff]' : 'text-brand';
  const titleCls = tone === 'dark' ? 'text-white' : 'text-ink';
  const subCls = tone === 'dark' ? 'text-[#dbe3ff]' : 'text-muted';
  const Heading = level;
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      <span className={`font-mono text-xs font-bold uppercase tracking-[0.16em] ${kickerCls}`}>{kicker}</span>
      <Heading className={`mt-2 font-display text-2xl font-bold md:text-3xl ${titleCls}`}>{title}</Heading>
      {sub ? <p className={`mt-2 ${subCls}`}>{sub}</p> : null}
    </div>
  );
}
