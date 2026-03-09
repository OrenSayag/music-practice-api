interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: 'Practice does not make perfect. Only perfect practice makes perfect.',
    author: 'Vince Lombardi',
  },
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: "Music is the universal language of mankind.",
    author: 'Henry Wadsworth Longfellow',
  },
  {
    text: 'Without music, life would be a mistake.',
    author: 'Friedrich Nietzsche',
  },
  {
    text: 'Music expresses that which cannot be said and on which it is impossible to be silent.',
    author: 'Victor Hugo',
  },
  {
    text: 'One good thing about music, when it hits you, you feel no pain.',
    author: 'Bob Marley',
  },
  {
    text: "I haven't understood a bar of music in my life, but I have felt it.",
    author: 'Igor Stravinsky',
  },
  {
    text: 'Where words fail, music speaks.',
    author: 'Hans Christian Andersen',
  },
  {
    text: "The beautiful thing about learning is that no one can take it away from you.",
    author: 'B.B. King',
  },
  {
    text: 'Music is the strongest form of magic.',
    author: 'Marilyn Manson',
  },
  {
    text: 'To play a wrong note is insignificant; to play without passion is inexcusable.',
    author: 'Ludwig van Beethoven',
  },
  {
    text: "It's not about how much you practice, it's about how smart you practice.",
    author: 'Yo-Yo Ma',
  },
  {
    text: 'The more you practice, the luckier you get.',
    author: 'Gary Player',
  },
  {
    text: 'Repetition is the mother of learning, the father of action, which makes it the architect of accomplishment.',
    author: 'Zig Ziglar',
  },
  {
    text: 'Music is nothing else but wild sounds civilized into time and tune.',
    author: 'Thomas Fuller',
  },
  {
    text: 'After silence, that which comes nearest to expressing the inexpressible is music.',
    author: 'Aldous Huxley',
  },
  {
    text: 'The discipline of practice every day is essential. When I skip a day, I notice a difference in my playing.',
    author: 'Itzhak Perlman',
  },
  {
    text: 'Music can change the world because it can change people.',
    author: 'Bono',
  },
  {
    text: 'Life is like a piano. What you get out of it depends on how you play it.',
    author: 'Tom Lehrer',
  },
  {
    text: 'If I were not a physicist, I would probably be a musician.',
    author: 'Albert Einstein',
  },
  {
    text: 'Amateurs practice until they get it right; professionals practice until they can\'t get it wrong.',
    author: 'Unknown',
  },
];

export function getDailyQuote(): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % quotes.length;
  return quotes[index];
}
