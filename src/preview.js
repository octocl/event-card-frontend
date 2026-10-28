export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const validMapUrl=value=>{try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}};
const words={
  en:{when:'When',where:'Where',map:'Open map',dress:'Dress code',schedule:'The plan',countdown:'Counting down',days:'days to go',day:'day to go',guest:'For our guest',table:'Table',rsvp:'Reply by email',wishes:'A note for our guests',calendar:'Add to calendar',venue:'Venue to be announced',date:'Date to be announced'},
  ru:{when:'Когда',where:'Где',map:'Открыть карту',dress:'Дресс-код',schedule:'Программа',countdown:'До праздника',days:'дней',day:'день',guest:'Для нашего гостя',table:'Стол',rsvp:'Ответить по почте',wishes:'Пожелания гостям',calendar:'Добавить в календарь',venue:'Место уточняется',date:'Дата уточняется'},
  uz:{when:'Qachon',where:'Qayerda',map:'Xaritani ochish',dress:'Kiyim uslubi',schedule:'Dastur',countdown:'Bayramgacha',days:'kun qoldi',day:'kun qoldi',guest:'Mehmonimiz uchun',table:'Stol',rsvp:'Email orqali javob berish',wishes:'Mehmonlarga tilak',calendar:'Taqvimga qo‘shish',venue:'Manzil keyinroq',date:'Sana keyinroq'},
};
export function formatDate(value,language='en'){
  if(!value)return words[language]?.date||words.en.date;
  const date=new Date(value+'T12:00:00');
  if(Number.isNaN(date.getTime()))return words[language]?.date||words.en.date;
  return new Intl.DateTimeFormat(language==='uz'?'uz-UZ':language==='ru'?'ru-RU':'en-US',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date);
}
function icsUrl(draft){
  if(!draft.date)return '';
  const date=draft.date.replace(/-/g,''),time=(draft.time||'12:00').replace(':','')+'00';
  const endMinutes=Number((draft.time||'12:00').slice(0,2))*60+Number((draft.time||'12:00').slice(3))+180;
  const end=String(Math.floor(endMinutes/60)%24).padStart(2,'0')+String(endMinutes%60).padStart(2,'0')+'00';
  const endDate=new Date(draft.date+'T12:00:00Z');if(endMinutes>=1440)endDate.setUTCDate(endDate.getUTCDate()+1);
  const endDay=endDate.toISOString().slice(0,10).replace(/-/g,'');
  const title=(draft.occasion==='birthday'?'Birthday celebration: ':'Wedding: ')+(draft.firstName||'EventCard')+(draft.occasion==='wedding'&&draft.secondName?' & '+draft.secondName:'');
  const clean=value=>String(value||'').replace(/[\r\n,;]/g,' ').slice(0,180);
  const calendar=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//EventCard//Invitation//EN','BEGIN:VEVENT','UID:'+crypto.randomUUID()+'@eventcard.cc','DTSTART;TZID=Asia/Tashkent:'+date+'T'+time,'DTEND;TZID=Asia/Tashkent:'+endDay+'T'+end,'SUMMARY:'+clean(title),'LOCATION:'+clean([draft.venue,draft.address].filter(Boolean).join(', ')),'DESCRIPTION:'+clean(draft.message),'END:VEVENT','END:VCALENDAR'].join('\r\n');
  return 'data:text/calendar;charset=utf-8,'+encodeURIComponent(calendar);
}
export function detailsMarkup(draft){
  const t=words[draft.language]||words.en;
  const birthday=draft.occasion==='birthday';
  const names=birthday?(draft.firstName||'Your celebration'):`${draft.firstName||'Your name'} & ${draft.secondName||'Their name'}`;
  const safe=value=>escapeHtml(value).replace(/\n/g,'<br>');
  const line=(label,body)=>`<span class="detail-label">${escapeHtml(label)}</span><p>${body}</p>`;
  const date=draft.date?line(t.when,escapeHtml(formatDate(draft.date,draft.language))+(draft.time?` · ${escapeHtml(draft.time)}`:'')):'';
  const venue=draft.location&&(draft.venue||draft.address)?line(t.where,[draft.venue,draft.address].filter(Boolean).map(safe).join('<br>')):'';
  const map=draft.location&&validMapUrl(draft.mapsUrl)?`<p><a href="${escapeHtml(validMapUrl(draft.mapsUrl))}" target="_blank" rel="noopener noreferrer">${t.map}</a></p>`:'';
  const calendar=draft.calendar&&draft.date?`<p><a href="${icsUrl(draft)}" download="eventcard.ics">${t.calendar}</a></p>`:'';
  const scheduleSymbols={welcome:'✦',toast:'◇',dinner:'◈',music:'♫',celebrate:'✳',heart:'♥',camera:'◉',cake:'✧'};
  const events=(draft.scheduleEvents||[]).filter(item=>item.time&&item.title?.trim());
  const schedule=draft.schedule&&events.length?`<span class="detail-label">${t.schedule}</span><ol>${events.map(item=>`<li>${scheduleSymbols[item.icon]||'✦'} ${escapeHtml(item.time)} · ${safe(item.title)}</li>`).join('')}</ol>`:'';
  let countdown='';
  if(draft.countdown&&draft.date){const target=new Date(`${draft.date}T${draft.time||'00:00'}:00+05:00`);const days=Math.ceil((target.getTime()-Date.now())/86400000);if(Number.isFinite(days)&&days>=0)countdown=`<span class="detail-label">${t.countdown}</span><p class="countdown">${days} ${days===1?t.day:t.days}</p>`;}
  const rsvp=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.rsvpEmail||'')&&draft.rsvp?`<p><a href="mailto:${encodeURIComponent(draft.rsvpEmail)}?subject=${encodeURIComponent('RSVP: '+names)}">${t.rsvp}</a></p>`:'';
  return `<div class="preview-details"><h3>${escapeHtml(names)}</h3>${draft.guestName?line(t.guest,safe(draft.guestName)):''}${draft.tableNumber?line(t.table,safe(draft.tableNumber)):''}${draft.message?`<p>${safe(draft.message)}</p>`:''}${date}${calendar}${venue}${map}${draft.dressCode?line(t.dress,safe(draft.dressCode)):''}${draft.wishes?line(t.wishes,safe(draft.wishes)):''}${schedule}${countdown}${rsvp}</div>`;
}
export function standaloneHtml(draft,image,audioData){
  const title=draft.linkPreviewTitle||`${draft.firstName||'An invitation'}${draft.occasion==='wedding'?' & '+(draft.secondName||'a celebration'):''} — EventCard`;
  const description=draft.linkPreviewDescription||'An invitation made with EventCard.';
  const audio=audioData&&draft.musicMode==='upload'?`<audio id="invitation-music" controls src="${audioData}" style="display:block;width:100%;margin:20px auto"></audio>`:'';
  const opening=draft.opening||'none';
  const cover=opening==='none'?'':`<button id="open-invitation" class="opening opening-${escapeHtml(opening)}" aria-label="Open invitation"><span>${escapeHtml(draft.firstName||'EventCard')}${draft.occasion==='wedding'?' & '+escapeHtml(draft.secondName||'your day'):''}<small>OPEN INVITATION</small></span></button>`;
  return `<!doctype html><html lang="${escapeHtml(draft.language||'en')}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><style>body{margin:0;padding:30px 16px;background:#eeeeee;color:#111;font-family:Arial,sans-serif}.wrap{max-width:560px;margin:auto;position:relative}.invitation-art{display:block;width:100%;height:auto;box-shadow:0 15px 35px #0002}.preview-details{padding:30px;background:white;line-height:1.7}.preview-details h3,.countdown{font-family:Georgia,serif;font-size:28px;font-weight:400}.detail-label{display:block;margin-top:20px;color:#bd4b4b;font-size:10px;font-weight:bold;letter-spacing:.15em;text-transform:uppercase}a{color:#bd4b4b}.opening{position:absolute;inset:0 0 auto;width:100%;height:min(142vw,790px);border:0;background:#f7e8e5;color:#542331;display:grid;place-items:center;cursor:pointer;box-shadow:0 10px 30px #0003}.opening span{font:italic 42px Georgia,serif}.opening small{display:block;margin-top:28px;font:700 11px Arial,sans-serif;letter-spacing:.2em}.opening-curtain{background:linear-gradient(90deg,#6f2839,#a24658 48%,#6f2839);color:#fff}.opening-bloom{background:radial-gradient(circle,#efb7b7 0 32%,#fff1ef 33%)}.opening-fade{background:#eee}.opening.is-open{animation:reveal .85s ease forwards;pointer-events:none}@keyframes reveal{to{opacity:0;transform:translateY(-30px)}}@media(max-width:600px){body{padding:0}.opening{height:142vw}}</style></head><body><main class="wrap"><img class="invitation-art" src="${image}" alt="Invitation design">${detailsMarkup(draft)}${audio}${cover}</main><script>const button=document.getElementById('open-invitation');button?.addEventListener('click',()=>{button.classList.add('is-open');document.getElementById('invitation-music')?.play().catch(()=>{});});</script></body></html>`;
}
