import { templates, getTemplate, defaultDraft } from './catalog.js';
import { drawInvitation } from './draw.js';

const storageKey='eventcard-draft-v1';
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const validMapUrl=value=>{try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}};
const formatDate=value=>{if(!value)return 'Date to be announced';const date=new Date(`${value}T12:00:00`);return Number.isNaN(date.getTime())?'Date to be announced':new Intl.DateTimeFormat('en',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date);};
const saveFile=(blob,name)=>{const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);};

function sample(occasion,template){return {...defaultDraft(),occasion,template,firstName:occasion==='birthday'?'Sofia':'Amira',secondName:'Daniel',age:'30th',date:'2027-06-12',time:'17:00',venue:'The Glasshouse Garden'};}
function makeThumbnail(template,occasion){const canvas=document.createElement('canvas');drawInvitation(canvas,sample(occasion,template),{scale:.38});return canvas;}

function initGallery(){
  const grid=document.querySelector('#template-grid');
  const buttons=[...document.querySelectorAll('[data-occasion]')];
  let occasion='wedding';
  const render=()=>{
    grid.replaceChildren();
    for(const template of templates){
      const card=document.createElement('a');card.className='template-card';card.href=`/editor.html?template=${encodeURIComponent(template.id)}&occasion=${occasion}`;
      const art=document.createElement('div');art.className='template-art';art.append(makeThumbnail(template.id,occasion));
      const title=document.createElement('h3');title.textContent=template.name;
      const note=document.createElement('p');note.textContent=template.note;
      card.append(art,title,note);grid.append(card);
    }
  };
  for(const button of buttons)button.addEventListener('click',()=>{occasion=button.dataset.occasion;for(const item of buttons){const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-pressed',String(active));}render();});
  document.fonts.ready.then(render);render();
}

function detailsMarkup(draft){
  const date=formatDate(draft.date),time=draft.time?` at ${escapeHtml(draft.time)}`:'';
  const venue=draft.venue?`<p>${escapeHtml(draft.venue)}</p>`:'';
  const address=draft.address?`<p>${escapeHtml(draft.address)}</p>`:'';
  const message=draft.message?`<p>${escapeHtml(draft.message).replace(/\n/g,'<br>')}</p>`:'';
  const dress=draft.dressCode?`<span class="detail-label">Dress code</span><p>${escapeHtml(draft.dressCode)}</p>`:'';
  const map=validMapUrl(draft.mapsUrl)?`<p><a href="${escapeHtml(validMapUrl(draft.mapsUrl))}" target="_blank" rel="noopener noreferrer">Open map</a></p>`:'';
  const schedule=draft.showSchedule?`<span class="detail-label">The plan</span><ol><li>${escapeHtml(draft.scheduleTime1||'17:00')} · ${escapeHtml(draft.scheduleTitle1||'Guest arrival')}</li><li>${escapeHtml(draft.scheduleTime2||'18:00')} · ${escapeHtml(draft.scheduleTitle2||'Celebration begins')}</li></ol>`:'';
  let countdown='';
  if(draft.showCountdown&&draft.date){const target=new Date(`${draft.date}T${draft.time||'00:00'}:00`);const days=Math.ceil((target.getTime()-Date.now())/86400000);if(Number.isFinite(days)&&days>=0)countdown=`<span class="detail-label">Counting down</span><p class="countdown">${days} ${days===1?'day':'days'} to go</p>`;}
  const names=draft.occasion==='birthday'?(draft.firstName||'Your celebration'):`${draft.firstName||'Your name'} & ${draft.secondName||'Their name'}`;
  return `<div class="preview-details"><h3>${escapeHtml(names)}</h3>${message}<span class="detail-label">When</span><p>${escapeHtml(date)}${time}</p>${venue||address?'<span class="detail-label">Where</span>':''}${venue}${address}${map}${dress}${schedule}${countdown}</div>`;
}

function initEditor(){
  const form=document.querySelector('#invitation-form'),canvas=document.querySelector('#invitation-canvas');
  const params=new URLSearchParams(location.search);
  let saved={};try{saved=JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{}
  let draft={...defaultDraft(),...saved};
  if(params.has('template'))draft.template=getTemplate(params.get('template')).id;
  if(['wedding','birthday'].includes(params.get('occasion')))draft.occasion=params.get('occasion');
  let photoImage=null,step='details',saveTimer;
  const fields=[...form.querySelectorAll('[name]')];
  for(const field of fields){if(field.name in draft){if(field.type==='checkbox')field.checked=Boolean(draft[field.name]);else field.value=draft[field.name]??'';}}
  const updateOccasion=()=>{const birthday=draft.occasion==='birthday';document.querySelector('#first-name-label').textContent=birthday?'Celebrant’s name':'Your name';document.querySelector('#second-name-field').hidden=birthday;document.querySelector('#age-field').hidden=!birthday;};
  const updateSchedule=()=>{document.querySelector('#schedule-fields').hidden=!draft.showSchedule;};
  const thumbs=document.querySelector('#editor-template-grid');
  const renderTemplates=()=>{thumbs.replaceChildren();for(const template of templates){const button=document.createElement('button');button.type='button';button.className='editor-template';button.setAttribute('role','radio');button.setAttribute('aria-checked',String(draft.template===template.id));button.setAttribute('aria-label',template.name);button.append(makeThumbnail(template.id,draft.occasion));const name=document.createElement('span');name.textContent=template.name;button.append(name);button.addEventListener('click',()=>{draft.template=template.id;renderTemplates();render();save();});thumbs.append(button);}};
  const render=()=>{drawInvitation(canvas,draft,{photoImage});document.querySelector('#preview-template-name').textContent=getTemplate(draft.template).name;document.querySelector('#preview-details').innerHTML=detailsMarkup(draft);};
  const save=()=>{clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(storageKey,JSON.stringify(draft));document.querySelector('#save-status').textContent='Draft saved in this browser';}catch{document.querySelector('#save-status').textContent='Browser storage is full. Download a copy when finished.';}},180);};
  const setStep=next=>{step=next;for(const tab of document.querySelectorAll('[data-step]')){const active=tab.dataset.step===step;tab.setAttribute('aria-selected',String(active));document.querySelector(`#step-${tab.dataset.step}`).hidden=!active;}document.querySelector('#next-step').textContent=step==='finish'?'All designs':'Continue';};
  for(const tab of document.querySelectorAll('[data-step]'))tab.addEventListener('click',()=>setStep(tab.dataset.step));
  for(const field of fields){const update=()=>{draft[field.name]=field.type==='checkbox'?field.checked:field.value;if(field.name==='occasion'){updateOccasion();renderTemplates();}if(field.name==='showSchedule')updateSchedule();render();save();};field.addEventListener('input',update);field.addEventListener('change',update);}
  document.querySelector('#next-step').addEventListener('click',()=>{if(step==='finish'){location.href='/';return;}const order=['details','design','extras','finish'];setStep(order[order.indexOf(step)+1]);document.querySelector('.editor-intro').scrollIntoView({behavior:'smooth',block:'start'});});
  const upload=document.querySelector('#photo-upload'),photoStatus=document.querySelector('#photo-status'),removePhoto=document.querySelector('#remove-photo');
  const loadPhoto=source=>{if(!source){photoImage=null;render();return;}const image=new Image();image.onload=()=>{photoImage=image;render();};image.onerror=()=>{photoStatus.textContent='Could not read that photo.';};image.src=source;};
  upload.addEventListener('change',()=>{const file=upload.files?.[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){photoStatus.textContent='Choose a JPG, PNG, or WebP under 5 MB.';upload.value='';return;}const reader=new FileReader();reader.onload=()=>{draft.photo=String(reader.result);loadPhoto(draft.photo);removePhoto.hidden=false;photoStatus.textContent='Photo added to your design.';save();};reader.readAsDataURL(file);});
  removePhoto.addEventListener('click',()=>{draft.photo='';upload.value='';photoImage=null;removePhoto.hidden=true;photoStatus.textContent='Photo removed.';render();save();});
  if(draft.photo){loadPhoto(draft.photo);removePhoto.hidden=false;photoStatus.textContent='Photo saved with this draft.';}
  const dialog=document.querySelector('#preview-dialog');
  document.querySelector('#full-preview').addEventListener('click',()=>{document.querySelector('#dialog-content').innerHTML=`<img src="${canvas.toDataURL('image/png')}" alt="Your invitation design">${detailsMarkup(draft)}`;dialog.showModal();});
  document.querySelector('#close-preview').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  document.querySelector('#download-png').addEventListener('click',()=>canvas.toBlob(blob=>{if(blob)saveFile(blob,'eventcard-invitation.png');},'image/png'));
  document.querySelector('#download-html').addEventListener('click',()=>{
    const image=canvas.toDataURL('image/png');
    const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(draft.firstName||'Invitation')} — EventCard</title><style>body{margin:0;padding:32px 16px;background:#eeeeee;color:#111;font-family:Arial,sans-serif}.wrap{max-width:560px;margin:auto}img{display:block;width:100%;height:auto;box-shadow:0 15px 35px #0002}.preview-details{padding:30px;background:white;line-height:1.7}.preview-details h3,.countdown{font-family:Georgia,serif;font-size:28px;font-weight:400}.detail-label{display:block;margin-top:20px;color:#bd4b4b;font-size:10px;font-weight:bold;letter-spacing:.15em;text-transform:uppercase}a{color:#bd4b4b}</style></head><body><main class="wrap"><img src="${image}" alt="Invitation design">${detailsMarkup(draft)}</main></body></html>`;
    saveFile(new Blob([page],{type:'text/html;charset=utf-8'}),'eventcard-invitation.html');
  });
  form.addEventListener('submit',event=>event.preventDefault());
  updateOccasion();updateSchedule();renderTemplates();render();document.fonts.ready.then(()=>{renderTemplates();render();});
}

if(document.body.dataset.page==='gallery')initGallery();
if(document.body.dataset.page==='editor')initEditor();
