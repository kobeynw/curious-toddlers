export function formatDuration(minutes) {
  if (!minutes) return '\u2014';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function formatAge(months) {
  if (months == null) return '\u2014';
  if (months === 0) return 'Newborn';
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} yr`;
  return `${years} yr ${rem} mo`;
}
