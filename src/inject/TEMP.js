/**
 * TO DEBUG TAGS
 */
const topTags = [
  '[Rr]ecruiter',
  '[iI][tT]',
  '[rR]ecruiting',
  'HR',
  '[Dd]eveloper',
  'UX',
  'UI',
];
const topTagsRegex = new RegExp(topTags.join('|'), 'g');
profiles.filter(p => p.description.search(topTagsRegex) !== -1).map(p => p.description).join('\r\n')