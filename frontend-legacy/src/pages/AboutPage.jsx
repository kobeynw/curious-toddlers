export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-ink mb-8">About Curious Toddlers</h1>

      <section className="bg-sand-surface rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink mb-3">About Me</h2>
        <p className="text-ink-muted leading-relaxed">
          Hi, I'm Kobey! I grew up in rural Nevada in a town called Dayton, where
          I lived until I graduated high school. After serving a two year
          proselyting mission to Ecuador and Virginia, I began studying at BYU,
          where I earned a Bachelor's Degree in Computer Science. I now work
          full-time as a Software Engineer at nCino, a cloud banking solutions
          company.
        </p>
        <p className="text-ink-muted leading-relaxed mt-4">
          While studying at BYU, I met my wife, Kelsie. We had two sons while I
          was still in school, which was quite the adventure to say the least! My
          older son, Oliver, is now approaching two years old and loves exploring
          outside (especially when we go to his favorite place, the park), eating
          dino nuggets, and reading <em>There's a Wocket in My Pocket</em> at
          least 20 times a day. My younger son, Emmett, is loving infant life and
          keeping us on our toes.
        </p>
      </section>

      <section className="bg-sand-surface rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink mb-3">Why Curious Toddlers?</h2>
        <p className="text-ink-muted leading-relaxed">
          The genesis of Curious Toddlers came from a few different sources.
          First, while studying at BYU, I took a child development class that
          sparked my interest in this field. I also read the book{' '}
          <em>The Montessori Toddler</em> by Simone Davies for that class, and
          was intrigued by how much the principles and ideas behind the Montessori
          methodology coincided with and expanded on my own ideas for helping
          children develop.
        </p>
        <p className="text-ink-muted leading-relaxed mt-4">
          I'm a big proponent of supporting strong families and parenthood in our
          modern society, and I hope that this site can help parents have direction
          and confidence in what they do. With my background in software
          engineering, I have enjoyed creating this website with full control over
          the content and features. I hope it can help you nurture your curious
          little explorers!
        </p>
      </section>

      <section className="bg-terra-light/20 border border-terra/20 rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-terra-dark mb-3">How to Support</h2>
        <p className="text-ink-muted leading-relaxed">
          Curious Toddlers is an ad-free, free-to-use website, and I'd love to
          keep it that way. If you found the website helpful and would like to
          support the maintenance of it and additional future features, please
          consider donating!
        </p>
      </section>
    </div>
  );
}
