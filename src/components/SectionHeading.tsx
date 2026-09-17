interface Props {
  kicker: string;
  title: string;
  sub?: string;
  align?: 'center' | 'left';
  tone?: 'light' | 'dark';
}

export default function SectionHeading({ kicker, title, sub, align = 'center', tone = 'light' }: Props) {
  const alignCls = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const kickerCls = tone === 'dark' ? 'text-[#ccd7ff]' : 'text-brand';
  const titleCls = tone === 'dark' ? 'text-white' : 'text-ink';
  const subCls = tone === 'dark' ? 'text-[#dbe3ff]' : 'text-muted';
  return (
    <div className={`max-w-2xl ${alignCls}`}>
      <span className={`font-display text-xs font-bold uppercase tracking-[0.16em] ${kickerCls}`}>{kicker}</span>
      <h2 className={`mt-2 font-display text-2xl font-bold md:text-3xl ${titleCls}`}>{title}</h2>
      {sub ? <p className={`mt-2 ${subCls}`}>{sub}</p> : null}
    </div>
  );
}
