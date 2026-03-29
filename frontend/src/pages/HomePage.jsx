import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Activities',
    description:
      'Discover Montessori-inspired activities tailored to your child\'s developmental stage.',
    accent: 'text-terra',
  },
  {
    title: 'Calendar',
    description:
      'Plan and schedule activities to build a consistent rhythm for your family.',
    accent: 'text-sky',
  },
  {
    title: 'Learning',
    description:
      'Explore the principles behind Montessori education and how to apply them at home.',
    accent: 'text-sage',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sand-surface py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-ink">
            Nurture Your <span className="text-terra">Little Explorer</span>
          </h1>
          <p className="mt-4 text-lg text-ink-muted max-w-2xl mx-auto">
            Thoughtful, Montessori-inspired tools to support your child's
            growth through purposeful play and learning.
          </p>
          <Link
            to="/activities"
            className="mt-8 inline-block bg-terra text-sand px-6 py-3 rounded-lg hover:bg-terra-hover transition-colors font-medium"
          >
            Browse Activities
          </Link>
        </div>
      </section>

      {/* Feature preview */}
      <section className="py-16 px-4">
        <h2 className="text-2xl font-bold text-ink text-center mb-10">
          What You'll Find Here
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map(({ title, description, accent }) => (
            <div key={title} className="bg-sand-surface rounded-xl p-6 shadow-sm">
              <h3 className={`${accent} font-semibold text-lg mb-2`}>{title}</h3>
              <p className="text-ink-muted text-sm">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
