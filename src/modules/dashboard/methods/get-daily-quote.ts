interface Quote {
  text: string;
  author: string;
}

const enQuotes: Quote[] = [
  {
    text: 'Practice does not make perfect. Only perfect practice makes perfect.',
    author: 'Vince Lombardi',
  },
  {
    text: 'The only way to do great work is to love what you do.',
    author: 'Steve Jobs',
  },
  {
    text: 'Music is the universal language of mankind.',
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
    text: 'The beautiful thing about learning is that no one can take it away from you.',
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
    text: "Amateurs practice until they get it right; professionals practice until they can't get it wrong.",
    author: 'Unknown',
  },
];

const heQuotes: Quote[] = [
  {
    text: 'תרגול לא עושה מושלם. רק תרגול מושלם עושה מושלם.',
    author: 'וינס לומברדי',
  },
  {
    text: 'מוזיקה היא השפה האוניברסלית של האנושות.',
    author: 'הנרי וודסוורת\' לונגפלו',
  },
  {
    text: 'בלי מוזיקה, החיים היו טעות.',
    author: 'פרידריך ניטשה',
  },
  {
    text: 'מוזיקה מבטאת את מה שאי אפשר לומר ועליו אי אפשר לשתוק.',
    author: 'ויקטור הוגו',
  },
  {
    text: 'הדבר הטוב במוזיקה — כשהיא פוגעת בך, אתה לא מרגיש כאב.',
    author: 'בוב מארלי',
  },
  {
    text: 'לא הבנתי אף תיבה במוזיקה בחיי, אבל הרגשתי אותה.',
    author: 'איגור סטרווינסקי',
  },
  {
    text: 'כשמילים נכשלות, המוזיקה מדברת.',
    author: 'הנס כריסטיאן אנדרסן',
  },
  {
    text: 'הדבר היפה בלמידה הוא שאף אחד לא יכול לקחת אותה ממך.',
    author: 'בי.בי. קינג',
  },
  {
    text: 'מוזיקה היא הצורה החזקה ביותר של קסם.',
    author: 'מרילין מנסון',
  },
  {
    text: 'לנגן תו שגוי זה חסר משמעות; לנגן בלי תשוקה זה בלתי נסלח.',
    author: 'לודוויג ואן בטהובן',
  },
  {
    text: 'זה לא כמה אתה מתרגל, אלא כמה חכם אתה מתרגל.',
    author: 'יו-יו מא',
  },
  {
    text: 'ככל שאתה מתרגל יותר, כך יש לך יותר מזל.',
    author: 'גארי פלייר',
  },
  {
    text: 'חזרה היא אם הלמידה, אבי המעשה, וארכיטקט ההישג.',
    author: 'זיג זיגלר',
  },
  {
    text: 'מוזיקה היא לא יותר מצלילים פראיים שתורבתו לתוך זמן ולחן.',
    author: 'תומאס פולר',
  },
  {
    text: 'אחרי הדממה, מה שהכי קרוב לביטוי הבלתי ניתן לביטוי — הוא מוזיקה.',
    author: 'אלדוס האקסלי',
  },
  {
    text: 'המשמעת של תרגול כל יום היא חיונית. כשאני מדלג על יום, אני מרגיש הבדל בנגינה.',
    author: 'יצחק פרלמן',
  },
  {
    text: 'מוזיקה יכולה לשנות את העולם כי היא יכולה לשנות אנשים.',
    author: 'בונו',
  },
  {
    text: 'החיים הם כמו פסנתר. מה שתקבל מהם תלוי באיך שתנגן.',
    author: 'טום לרר',
  },
  {
    text: 'אם לא הייתי פיזיקאי, כנראה הייתי מוזיקאי.',
    author: 'אלברט איינשטיין',
  },
  {
    text: 'חובבנים מתרגלים עד שהם מצליחים; מקצוענים מתרגלים עד שהם לא יכולים לטעות.',
    author: 'לא ידוע',
  },
  {
    text: 'הדרך היחידה לעשות עבודה נהדרת היא לאהוב את מה שאתה עושה.',
    author: 'סטיב ג\'ובס',
  },
];

const quotesByLocale: Record<string, Quote[]> = {
  en: enQuotes,
  he: heQuotes,
};

export function getDailyQuote(locale: string = 'en'): Quote {
  const quotes = quotesByLocale[locale] || enQuotes;
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const index = dayOfYear % quotes.length;
  return quotes[index];
}
