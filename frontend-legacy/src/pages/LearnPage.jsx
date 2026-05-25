const principles = [
  {
    title: 'Child-centered learning',
    description:
      'Each child progresses at their own pace, choosing activities that match their interests and developmental stage rather than following a fixed curriculum.',
  },
  {
    title: 'Hands-on exploration',
    description:
      'Learning happens through physical interaction with carefully designed materials, helping children understand concepts by doing rather than memorizing.',
  },
  {
    title: 'Parents as a guide',
    description:
      'Parents observe, support, and introduce new ideas when appropriate, instead of leading rigid instruction.',
  },
  {
    title: 'Prepared environment',
    description:
      'Rooms are intentionally organized to encourage independence, allowing children to access materials, make choices, and take responsibility for their space.',
  },
  {
    title: 'Freedom within structure',
    description:
      'Children have the freedom to choose their work and move at their own pace, while still following clear expectations that promote respect and responsibility.',
  },
];

const resources = [
  {
    heading: 'What is Montessori?',
    links: [
      { label: 'American Montessori Society', url: 'https://amshq.org/about-montessori/press-kit/what-is-montessori/' },
      { label: 'Montessori Northwest', url: 'https://montessori-nw.org/about-montessori-education' },
      { label: 'Brightwheel — Montessori Method', url: 'https://mybrightwheel.com/blog/montessori-method' },
    ],
  },
  {
    heading: 'Who was Maria Montessori?',
    links: [
      { label: 'AMS — About Dr. Maria Montessori', url: 'https://amshq.org/about-us/history-of-ams/about-dr-maria-montessori/' },
    ],
  },
  {
    heading: 'Montessori Books',
    links: [
      { label: 'The Montessori Toddler, by Simone Davies' },
      { label: 'The Montessori Method, by Maria Montessori' },
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-ink mb-8">Learning & Montessori</h1>

      <section className="bg-sand-surface rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink mb-3">Montessori Methodology</h2>
        <p className="text-ink-muted leading-relaxed">
          The Montessori methodology is a teaching/learning approach developed by
          Maria Montessori that focuses on supporting a child's natural
          development. Rather than relying on one-size-fits-all instruction, it is
          designed to help each child grow intellectually, socially, emotionally,
          and physically as a whole person.
        </p>
        <p className="text-ink-muted leading-relaxed mt-4">
          At its core, Montessori is based on the belief that children are
          naturally curious and capable of directing their own learning when given
          the right environment and support.
        </p>
      </section>

      <section className="bg-sand-surface rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink mb-4">Key Principles</h2>
        <ul className="space-y-4">
          {principles.map(({ title, description }) => (
            <li key={title} className="border-l-4 border-sage pl-4">
              <h3 className="font-semibold text-ink">{title}</h3>
              <p className="text-ink-muted leading-relaxed text-sm mt-1">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-sand-surface rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink mb-3">The Goal</h2>
        <p className="text-ink-muted leading-relaxed">
          Montessori methodology aims to help children become independent,
          confident, and motivated learners. By encouraging curiosity,
          responsibility, and problem-solving, it prepares children not just for
          school, but for life.
        </p>
      </section>

      <section className="bg-sand-surface rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink mb-4">Resources</h2>
        <div className="space-y-5">
          {resources.map(({ heading, links }) => (
            <div key={heading}>
              <h3 className="font-semibold text-ink text-sm mb-2">{heading}</h3>
              <ul className="space-y-1 ml-4 list-disc">
                {links.map(({ label, url }) => (
                  <li key={label} className="text-sm">
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-terra hover:text-terra-hover underline transition-colors"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className="text-ink-muted">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
