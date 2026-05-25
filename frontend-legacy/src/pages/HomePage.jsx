import { Link } from 'react-router-dom';
import heroImage from '../assets/curious-toddlers-home-image.jpg';

const features = [
  {
    title: 'Activities',
    description:
      'Browse a growing collection of Montessori-inspired activities organized by age and developmental area. Each activity includes clear instructions and materials lists so you can get started right away.',
    accent: 'text-terra',
    border: 'border-terra',
    link: '/activities',
    linkText: 'Explore Activities',
  },
  {
    title: 'Calendar',
    description:
      'Plan your week with a visual calendar that helps you build a consistent rhythm of activities. Schedule tailored activities, keep track what you\'ve done, and make sure every developmental area gets attention.',
    accent: 'text-sky',
    border: 'border-sky',
    link: '/calendar',
    linkText: 'View Calendar',
  },
  {
    title: 'Learning',
    description:
      'Understand the principles behind Montessori education and how to apply them at home. Learn about preparing your home environment and how to follow your child\'s natural curiosity.',
    accent: 'text-sage',
    border: 'border-sage',
    link: '/learn',
    linkText: 'Start Learning',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-sand-surface py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-ink">
              Nurture Your{' '}
              <br className="hidden md:block" />
              <span className="text-terra">Little Explorer</span>
            </h1>
            <p className="mt-4 text-lg text-ink-muted max-w-2xl">
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
          <div className="flex-1">
            <img
              src={heroImage}
              alt="Parent and toddler exploring Montessori activities together"
              className="rounded-xl shadow-md w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Feature preview */}
      <section className="py-16 px-4">
        <h2 className="text-2xl font-bold text-ink text-center mb-10">
          What You'll Find Here
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map(({ title, description, accent, border, link, linkText }) => (
            <div
              key={title}
              className={`bg-sand-surface rounded-xl p-8 shadow-sm border-l-4 ${border} flex flex-col`}
            >
              <h3 className={`${accent} font-semibold text-xl mb-3`}>{title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed flex-1">{description}</p>
              <Link
                to={link}
                className={`${accent} font-medium text-sm mt-5 inline-flex items-center gap-1 hover:underline`}
              >
                {linkText} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
