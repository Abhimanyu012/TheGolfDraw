const MIN_SCORE = 1;
const MAX_SCORE = 45;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const uniqueRandomNumbers = (count) => {
  const set = new Set();

  while (set.size < count) {
    set.add(randomInt(MIN_SCORE, MAX_SCORE));
  }

  return Array.from(set).sort((a, b) => a - b);
};

const pickFromFrequency = (frequencyMap, preferHigh) => {
  const entries = Object.entries(frequencyMap)
    .map(([score, count]) => ({ score: Number(score), count }))
    .sort((a, b) => {
      if (a.count === b.count) {
        return a.score - b.score;
      }

      return preferHigh ? b.count - a.count : a.count - b.count;
    });

  return entries.map((item) => item.score);
};

export const buildDrawNumbers = ({ logic, allScores }) => {
  if (logic === "RANDOM" || allScores.length === 0) {
    return uniqueRandomNumbers(5);
  }

  const freq = {};

  for (const score of allScores) {
    freq[score] = (freq[score] || 0) + 1;
  }

  const ordered = pickFromFrequency(freq, logic === "MOST_FREQUENT");
  const selected = [];

  for (const score of ordered) {
    if (selected.length === 5) {
      break;
    }

    if (score >= MIN_SCORE && score <= MAX_SCORE && !selected.includes(score)) {
      selected.push(score);
    }
  }

  while (selected.length < 5) {
    const candidate = randomInt(MIN_SCORE, MAX_SCORE);

    if (!selected.includes(candidate)) {
      selected.push(candidate);
    }
  }

  return selected.sort((a, b) => a - b);
};

export const countMatches = (userNumbers, drawNumbers) => {
  const drawSet = new Set(drawNumbers);
  return userNumbers.reduce((acc, n) => (drawSet.has(n) ? acc + 1 : acc), 0);
};

export const getTierFromMatches = (matchCount) => {
  if (matchCount === 5) return "FIVE";
  if (matchCount === 4) return "FOUR";
  if (matchCount === 3) return "THREE";
  return null;
};
