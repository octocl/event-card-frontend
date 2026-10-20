// Ten fresh EventCard designs. The source editor was inspected for its range of
// invitation styles; no client artwork or default photos are copied here.
export const templates = Object.freeze([
  { id: 'rose-garden', name: 'Rose Garden', note: 'Soft borders and a romantic frame', motif: 'garden', bg: '#fffaf8', ink: '#532d38', accent: '#bd4b4b', soft: '#efb7b7' },
  { id: 'botanical-note', name: 'Botanical Note', note: 'A quiet floral silhouette', motif: 'botanical', bg: '#f5f1ef', ink: '#242323', accent: '#bd4b4b', soft: '#dbc6c6' },
  { id: 'midnight-rose', name: 'Midnight Rose', note: 'Dark, warm, and full of contrast', motif: 'midnight', bg: '#1b1719', ink: '#fff8f5', accent: '#efb7b7', soft: '#6f2b3b' },
  { id: 'velvet-curtain', name: 'Velvet Curtain', note: 'A little theatre for the big day', motif: 'curtain', bg: '#8e3445', ink: '#fff9f7', accent: '#efb7b7', soft: '#a74958' },
  { id: 'grand-hall', name: 'Grand Hall', note: 'An architectural entrance', motif: 'arch', bg: '#f2e9e7', ink: '#35232b', accent: '#bd4b4b', soft: '#e4c9ca' },
  { id: 'blush-bloom', name: 'Blush Bloom', note: 'Playful shapes and gentle color', motif: 'bloom', bg: '#efb7b7', ink: '#43202a', accent: '#bd4b4b', soft: '#f7dddd' },
  { id: 'ivory-letter', name: 'Ivory Letter', note: 'An intimate handwritten feel', motif: 'letter', bg: '#fffefa', ink: '#30282a', accent: '#bd4b4b', soft: '#eeeeee' },
  { id: 'starlit', name: 'Starlit', note: 'A bold evening invitation', motif: 'stars', bg: '#101012', ink: '#fffaf7', accent: '#efb7b7', soft: '#492430' },
  { id: 'modern-ink', name: 'Modern Ink', note: 'Clean type and confident lines', motif: 'modern', bg: '#eeeeee', ink: '#000000', accent: '#bd4b4b', soft: '#ffffff' },
  { id: 'confetti-day', name: 'Confetti Day', note: 'A bright note for any celebration', motif: 'confetti', bg: '#fff7f7', ink: '#42252e', accent: '#bd4b4b', soft: '#efb7b7' },
]);

export const getTemplate = id => templates.find(template => template.id === id) || templates[0];

export const defaultDraft = () => ({
  occasion: 'wedding', template: templates[0].id,
  firstName: '', secondName: '', age: '', date: '', time: '',
  venue: '', address: '', message: '', dressCode: '', mapsUrl: '',
  showCountdown: true, showSchedule: true,
  scheduleTime1: '17:00', scheduleTitle1: 'Guest arrival',
  scheduleTime2: '18:00', scheduleTitle2: 'Celebration begins',
  photo: '',
});
