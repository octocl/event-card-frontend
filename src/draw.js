import { getTemplate } from './catalog.js';

const W = 720;
const H = 1020;
const serif = '"Playfair Display", Georgia, serif';
const sans = 'Manrope, Arial, sans-serif';

function line(ctx, x1, y1, x2, y2, color, width = 2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function ellipse(ctx, x, y, rx, ry, color, stroke = false, width = 2) {
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (stroke) { ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); }
  else { ctx.fillStyle = color; ctx.fill(); }
}
function diamond(ctx, x, y, size, color) {
  ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x + size * .58, y);
  ctx.lineTo(x, y + size); ctx.lineTo(x - size * .58, y);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
function text(ctx, value, x, y, size, color, { family = serif, weight = 400, align = 'center', italic = false, max = 580 } = {}) {
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  let actual = size;
  do { ctx.font = `${italic ? 'italic ' : ''}${weight} ${actual}px ${family}`; actual -= 2; }
  while (ctx.measureText(String(value)).width > max && actual > 16);
  ctx.fillText(String(value), x, y);
}
function caps(ctx, value, x, y, color, { size = 13, spacing = 4, max = 570 } = {}) {
  ctx.font = `700 ${size}px ${sans}`; ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const label = String(value).toUpperCase();
  const width = ctx.measureText(label).width + Math.max(0, label.length - 1) * spacing;
  const fit = Math.min(1, max / width);
  ctx.save(); ctx.translate(x, y); ctx.scale(fit, fit);
  let position = -width / 2;
  for (const letter of label) { ctx.fillText(letter, position, 0); position += ctx.measureText(letter).width + spacing; }
  ctx.restore();
}
function roundedRect(ctx, x, y, w, h, radius) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, radius);
}
function leaf(ctx, x, y, angle, scale, color) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(15, -42, 65, -65, 89, -58);
  ctx.bezierCurveTo(75, -18, 39, 6, 0, 0); ctx.fillStyle = color; ctx.fill();
  line(ctx, 0, 0, 73, -44, color === '#fff' ? '#ddd' : 'rgba(0,0,0,.12)', 2);
  ctx.restore();
}
function flower(ctx, x, y, radius, petal, center) {
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    ellipse(ctx, x + Math.cos(a) * radius * .65, y + Math.sin(a) * radius * .65, radius * .38, radius * .56, petal);
  }
  ellipse(ctx, x, y, radius * .31, radius * .31, center);
}
function motif(ctx, t) {
  const { accent, soft, ink } = t;
  switch (t.motif) {
    case 'garden':
      ctx.strokeStyle = accent; ctx.lineWidth = 2; ctx.strokeRect(37, 37, W - 74, H - 74);
      ctx.strokeStyle = soft; ctx.strokeRect(48, 48, W - 96, H - 96);
      flower(ctx, 82, 94, 35, soft, accent); flower(ctx, 638, 926, 35, soft, accent);
      leaf(ctx, 72, 145, .4, .6, soft); leaf(ctx, 645, 875, 3.4, .6, soft);
      break;
    case 'botanical':
      line(ctx, 55, 50, 55, 970, soft, 2); line(ctx, 665, 50, 665, 970, soft, 2);
      for (let i = 0; i < 5; i++) { leaf(ctx, 55, 190 + i * 130, -.7, .72, soft); leaf(ctx, 665, 145 + i * 130, 2.4, .72, soft); }
      ellipse(ctx, 360, 505, 300, 390, accent, true, 2);
      break;
    case 'midnight':
      ellipse(ctx, 360, 508, 315, 405, soft, true, 4);
      ellipse(ctx, 360, 508, 295, 385, accent, true, 1);
      for (const [x, y, s] of [[92,135,12],[610,168,16],[110,855,9],[619,887,11],[360,93,7]]) diamond(ctx,x,y,s,accent);
      break;
    case 'curtain':
      ctx.fillStyle = '#6e263a'; ctx.fillRect(0,0,84,H); ctx.fillRect(W-84,0,84,H);
      for (let i=0;i<5;i++) { line(ctx,20+i*13,0,20+i*13,H,'rgba(255,255,255,.09)',5); line(ctx,W-20-i*13,0,W-20-i*13,H,'rgba(255,255,255,.09)',5); }
      ctx.beginPath(); ctx.moveTo(75,0); ctx.quadraticCurveTo(360,120,645,0); ctx.lineTo(75,0); ctx.fillStyle='#6e263a'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(75,0); ctx.quadraticCurveTo(360,165,645,0); ctx.strokeStyle=accent; ctx.lineWidth=3; ctx.stroke();
      break;
    case 'arch':
      ctx.fillStyle = soft; ctx.fillRect(46,326,628,648);
      ctx.beginPath(); ctx.moveTo(100,966); ctx.lineTo(100,372); ctx.arc(360,372,260,Math.PI,0); ctx.lineTo(620,966); ctx.closePath(); ctx.fillStyle='#fffaf8'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(100,966); ctx.lineTo(100,372); ctx.arc(360,372,260,Math.PI,0); ctx.lineTo(620,966); ctx.strokeStyle=accent; ctx.lineWidth=3; ctx.stroke();
      line(ctx,76,966,644,966,accent,3);
      break;
    case 'bloom':
      ellipse(ctx,80,145,135,135,soft); ellipse(ctx,650,805,160,160,soft);
      flower(ctx,64,162,83,'#f7dddd',accent); flower(ctx,656,827,95,'#f7dddd',accent);
      flower(ctx,632,152,23,'#fff3f3',accent); flower(ctx,105,862,20,'#fff3f3',accent);
      break;
    case 'letter':
      ctx.strokeStyle=soft; ctx.lineWidth=2; ctx.strokeRect(55,55,610,910);
      line(ctx,205,165,515,165,accent,1); line(ctx,205,854,515,854,accent,1);
      diamond(ctx,360,165,10,accent); diamond(ctx,360,854,10,accent);
      break;
    case 'stars':
      ellipse(ctx,360,502,245,325,accent,true,2);
      for (const [x,y,s] of [[88,160,16],[587,107,11],[623,797,18],[104,853,12],[360,75,8],[360,932,8],[603,383,8]]) diamond(ctx,x,y,s,accent);
      for (const [x,y] of [[150,302],[570,252],[145,680],[550,684],[236,908],[472,910]]) ellipse(ctx,x,y,3,3,'#f9e4d9');
      break;
    case 'modern':
      ctx.fillStyle=soft; ctx.fillRect(0,0,W,176); ctx.fillRect(0,846,W,174);
      ctx.fillStyle=accent; ctx.fillRect(0,0,22,H);
      line(ctx,75,207,645,207,accent,3); line(ctx,75,816,645,816,accent,3);
      break;
    case 'confetti':
      for (let i=0;i<35;i++) {
        const x=70+(i*137)%595, y=62+(i*233)%875;
        if (x>190 && x<540 && y>240 && y<780) continue;
        ctx.save();ctx.translate(x,y);ctx.rotate(i*.73);ctx.fillStyle=i%3===0?accent:soft;ctx.fillRect(-4,-10,8,20);ctx.restore();
      }
      ellipse(ctx,360,508,285,360,'#fff',false); ellipse(ctx,360,508,285,360,soft,true,2);
      break;
  }
}
function coverPhoto(ctx, image, t) {
  if (!image?.complete || !image.naturalWidth) return false;
  const x=244,y=510,w=232,h=232;
  ctx.save();ctx.beginPath();ctx.ellipse(360,626,116,116,0,0,Math.PI*2);ctx.clip();
  const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight);
  const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
  ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);ctx.restore();
  ellipse(ctx,360,626,120,120,t.accent,true,3);
  return true;
}
function displayDate(value, language='en') {
  const unknown={en:'A DATE TO REMEMBER',ru:'ДАТА БУДЕТ ОБЪЯВЛЕНА',uz:'SANA TEZ ORADA'};
  if (!value) return unknown[language]||unknown.en;
  const date=new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime())?(unknown[language]||unknown.en):new Intl.DateTimeFormat(language==='ru'?'ru-RU':language==='uz'?'uz-UZ':'en-US',{day:'numeric',month:'long',year:'numeric'}).format(date).toUpperCase();
}
export function drawInvitation(canvas,draft,{photoImage=null,scale=1}={}) {
  const t=getTemplate(draft.template);
  canvas.width=W*scale; canvas.height=H*scale;
  const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
  ctx.fillStyle=t.bg;ctx.fillRect(0,0,W,H);motif(ctx,t);
  const birthday=draft.occasion==='birthday';
  const first=(draft.firstName|| (birthday?'Your name':'Your name')).trim();
  const second=(draft.secondName||'Their name').trim();
  const copy={en:{birthday:'YOU ARE INVITED TO CELEBRATE',wedding:'TOGETHER WITH THEIR FAMILIES',celebrate:'Celebrate',birthdayLabel:'BIRTHDAY',venue:'VENUE TO BE ANNOUNCED'},ru:{birthday:'ПРИГЛАШАЕМ НА ПРАЗДНИК',wedding:'ВМЕСТЕ СО СВОИМИ СЕМЬЯМИ',celebrate:'Празднуем',birthdayLabel:'ДЕНЬ РОЖДЕНИЯ',venue:'МЕСТО УТОЧНЯЕТСЯ'},uz:{birthday:'BAYRAMGA TAKLIF QILAMIZ',wedding:'OILALARI BILAN BIRGA',celebrate:'Bayram',birthdayLabel:'TUG‘ILGAN KUN',venue:'MANZIL TEZ ORADA'}}[draft.language]||{birthday:'YOU ARE INVITED TO CELEBRATE',wedding:'TOGETHER WITH THEIR FAMILIES',celebrate:'Celebrate',birthdayLabel:'BIRTHDAY',venue:'VENUE TO BE ANNOUNCED'};
  const heading=birthday?copy.birthday:copy.wedding;
  caps(ctx,heading,360,230,t.accent,{size:12});
  if(birthday) {
    text(ctx,copy.celebrate,360,315,55,t.ink,{italic:true});
    text(ctx,first,360,402,82,t.ink);
    if(draft.age) caps(ctx,`${draft.age} ${copy.birthdayLabel}`,360,468,t.accent,{size:14});
  } else {
    text(ctx,first,360,332,83,t.ink);
    text(ctx,'&',360,401,52,t.accent,{italic:true});
    text(ctx,second,360,470,83,t.ink);
  }
  const hasPhoto=coverPhoto(ctx,photoImage,t);
  if(!hasPhoto) {
    line(ctx,304,594,416,594,t.accent,2);
    diamond(ctx,360,642,16,t.accent);
    line(ctx,304,690,416,690,t.accent,2);
  }
  caps(ctx,displayDate(draft.date,draft.language),360,793,t.accent,{size:16,spacing:3});
  const venue=(draft.venue||copy.venue).trim();
  text(ctx,venue,360,835,26,t.ink,{family:sans,weight:600,max:500});
  if(draft.time) caps(ctx,draft.time,360,871,t.ink,{size:12});
  caps(ctx,'EVENTCARD',360,946,t.accent,{size:12,spacing:5});
}
