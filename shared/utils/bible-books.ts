// Canonical book names and the abbreviations we accept in [Book C:V] tokens.
// Lookup keys are lowercase with spaces and dots removed, e.g. "1jn", "songofsongs".

const BOOKS: [canonical: string, ...aliases: string[]][] = [
  ['Genesis', 'Gen', 'Ge', 'Gn'],
  ['Exodus', 'Exod', 'Ex', 'Exo'],
  ['Leviticus', 'Lev', 'Le', 'Lv'],
  ['Numbers', 'Num', 'Nu', 'Nm', 'Nb'],
  ['Deuteronomy', 'Deut', 'De', 'Dt'],
  ['Joshua', 'Josh', 'Jos', 'Jsh'],
  ['Judges', 'Judg', 'Jdg', 'Jg', 'Jdgs'],
  ['Ruth', 'Rth', 'Ru'],
  ['1 Samuel', '1 Sam', '1 Sa', '1Sam', '1Sa', '1 S', 'I Samuel', 'I Sam'],
  ['2 Samuel', '2 Sam', '2 Sa', '2Sam', '2Sa', '2 S', 'II Samuel', 'II Sam'],
  ['1 Kings', '1 Kgs', '1 Ki', '1Kgs', '1Ki', 'I Kings', 'I Kgs'],
  ['2 Kings', '2 Kgs', '2 Ki', '2Kgs', '2Ki', 'II Kings', 'II Kgs'],
  ['1 Chronicles', '1 Chron', '1 Chr', '1 Ch', '1Chr', 'I Chronicles', 'I Chron'],
  ['2 Chronicles', '2 Chron', '2 Chr', '2 Ch', '2Chr', 'II Chronicles', 'II Chron'],
  ['Ezra', 'Ezr', 'Ez'],
  ['Nehemiah', 'Neh', 'Ne'],
  ['Esther', 'Est', 'Esth', 'Es'],
  ['Job', 'Jb'],
  ['Psalm', 'Psalms', 'Ps', 'Psa', 'Pss', 'Psm', 'Pslm'],
  ['Proverbs', 'Prov', 'Pr', 'Prv', 'Pro'],
  ['Ecclesiastes', 'Eccl', 'Eccles', 'Ecc', 'Ec', 'Qoh'],
  ['Song of Solomon', 'Song of Songs', 'Song', 'SOS', 'So', 'Canticles', 'Cant'],
  ['Isaiah', 'Isa', 'Is'],
  ['Jeremiah', 'Jer', 'Je', 'Jr'],
  ['Lamentations', 'Lam', 'La'],
  ['Ezekiel', 'Ezek', 'Eze', 'Ezk'],
  ['Daniel', 'Dan', 'Da', 'Dn'],
  ['Hosea', 'Hos', 'Ho'],
  ['Joel', 'Jl'],
  ['Amos', 'Am'],
  ['Obadiah', 'Obad', 'Ob'],
  ['Jonah', 'Jon', 'Jnh'],
  ['Micah', 'Mic', 'Mc'],
  ['Nahum', 'Nah', 'Na'],
  ['Habakkuk', 'Hab', 'Hb'],
  ['Zephaniah', 'Zeph', 'Zep', 'Zp'],
  ['Haggai', 'Hag', 'Hg'],
  ['Zechariah', 'Zech', 'Zec', 'Zc'],
  ['Malachi', 'Mal', 'Ml'],
  ['Matthew', 'Matt', 'Mt'],
  ['Mark', 'Mrk', 'Mk', 'Mr'],
  ['Luke', 'Luk', 'Lk'],
  ['John', 'Jn', 'Jhn', 'Joh'],
  ['Acts', 'Act', 'Ac'],
  ['Romans', 'Rom', 'Ro', 'Rm'],
  ['1 Corinthians', '1 Cor', '1 Co', '1Cor', '1Co', 'I Corinthians', 'I Cor'],
  ['2 Corinthians', '2 Cor', '2 Co', '2Cor', '2Co', 'II Corinthians', 'II Cor'],
  ['Galatians', 'Gal', 'Ga'],
  ['Ephesians', 'Eph', 'Ephes'],
  ['Philippians', 'Phil', 'Php', 'Pp'],
  ['Colossians', 'Col', 'Co'],
  ['1 Thessalonians', '1 Thess', '1 Thes', '1 Th', '1Thess', '1Th', 'I Thessalonians', 'I Thess'],
  ['2 Thessalonians', '2 Thess', '2 Thes', '2 Th', '2Thess', '2Th', 'II Thessalonians', 'II Thess'],
  ['1 Timothy', '1 Tim', '1 Ti', '1Tim', '1Ti', 'I Timothy', 'I Tim'],
  ['2 Timothy', '2 Tim', '2 Ti', '2Tim', '2Ti', 'II Timothy', 'II Tim'],
  ['Titus', 'Tit', 'Ti'],
  ['Philemon', 'Philem', 'Phm', 'Pm'],
  ['Hebrews', 'Heb'],
  ['James', 'Jas', 'Jm'],
  ['1 Peter', '1 Pet', '1 Pe', '1Pet', '1Pe', '1 Pt', 'I Peter', 'I Pet'],
  ['2 Peter', '2 Pet', '2 Pe', '2Pet', '2Pe', '2 Pt', 'II Peter', 'II Pet'],
  ['1 John', '1 Jn', '1Jn', '1 Jhn', 'I John', 'I Jn'],
  ['2 John', '2 Jn', '2Jn', '2 Jhn', 'II John', 'II Jn'],
  ['3 John', '3 Jn', '3Jn', '3 Jhn', 'III John', 'III Jn'],
  ['Jude', 'Jud', 'Jd'],
  ['Revelation', 'Revelations', 'Rev', 'Re', 'Rv', 'Apocalypse'],
]

const key = (s: string) => s.toLowerCase().replace(/[\s.]/g, '')

const LOOKUP = new Map<string, string>()
for (const [canonical, ...aliases] of BOOKS) {
  LOOKUP.set(key(canonical), canonical)
  for (const a of aliases) LOOKUP.set(key(a), canonical)
}

/** Canonical book name for a typed name or abbreviation, or null if it isn't a Bible book. */
export const canonicalBook = (name: string): string | null => LOOKUP.get(key(name)) ?? null
