import {defaultDraft,getTemplate} from './catalog.js';
import {drawInvitation} from './draw.js';
import {detailsMarkup,escapeHtml,standaloneHtml,validMapUrl} from './preview.js';
import {setupMapPicker} from './map.js';

const storageKey='eventcard-draft-v1';
const steps=['details','photos','blocks','animations','music','link-preview'];
const scheduleIcons=['welcome','toast','dinner','music','celebrate','heart','camera','cake'];
const $=selector=>document.querySelector(selector);
const field=name=>document.querySelector(`[name="${name}"]`);
function storedDraft(){try{return JSON.parse(localStorage.getItem(storageKey)||'{}')||{};}catch{return {};}}
function imageData(file,maxWidth,maxHeight){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read image.'));
    reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('Could not open image.'));image.onload=()=>{const ratio=Math.min(1,maxWidth/image.width,maxHeight/image.height);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*ratio));canvas.height=Math.max(1,Math.round(image.height*ratio));const context=canvas.getContext('2d');context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.82));};image.src=reader.result;};reader.readAsDataURL(file);
  });
}
function fileData(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error('Could not read audio.'));reader.onload=()=>resolve(reader.result);reader.readAsDataURL(file);});}
function download(blob,name){const url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=name;document.body.append(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}

export function initEditor(){
  const params=new URLSearchParams(location.search),saved=storedDraft();
  const draft={...defaultDraft(),...saved};
  if(!Array.isArray(saved.scheduleEvents)&&'showSchedule' in saved){
    draft.schedule=Boolean(saved.showSchedule);
    draft.scheduleEvents=[1,2].map(number=>({id:'legacy-'+number,time:saved['scheduleTime'+number]||'',title:saved['scheduleTitle'+number]||'',icon:number===1?'welcome':'celebrate'})).filter(item=>item.time&&item.title);
  }
  if('showCountdown' in saved)draft.countdown=Boolean(saved.showCountdown);
  if(params.has('template'))draft.template=getTemplate(params.get('template')).id;
  if(['wedding','birthday'].includes(params.get('occasion')))draft.occasion=params.get('occasion');
  if(!Array.isArray(draft.scheduleEvents))draft.scheduleEvents=defaultDraft().scheduleEvents;
  let currentStep='details',photoImage=null,audioData='',saveTimer;
  const form=$('#invitation-form'),canvas=$('#invitation-canvas'),previewCard=$('#preview-card'),dialog=$('#preview-dialog');

  function persist(){
    clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(storageKey,JSON.stringify(draft));$('#save-status').textContent='Draft saved in this browser';}catch{$('#save-status').textContent='Browser storage is full. Download a copy of your invitation.';}},250);
  }
  function setStep(step){
    currentStep=step;
    for(const name of steps){const selected=name===step;$('#step-'+name).hidden=!selected;$('#tab-'+name).setAttribute('aria-selected',String(selected));$('#tab-'+name).tabIndex=selected?0:-1;}
    $('#next-step').textContent=step==='link-preview'?'See full preview':'Continue';
    if(window.innerWidth<850)$('#tab-'+step).scrollIntoView({block:'nearest',inline:'center'});
  }
  function updateOccasion(){const birthday=draft.occasion==='birthday';$('#first-name-label').textContent=birthday?'Your name':'Your name';$('#second-name-field').hidden=birthday;$('#age-field').hidden=!birthday;}
  function updateMusic(){const active=draft.musicMode==='upload';$('#music-upload-panel').hidden=!active;$('#music-volume-label').hidden=!active;$('#music-volume-output').textContent=draft.musicVolume+'%';$('#music-player').volume=Number(draft.musicVolume)/100;if(active&&!audioData)$('#music-status').textContent='Choose a file to include music in your download.';}
  function renderSchedule(){
    const host=$('#schedule-rows');host.replaceChildren();
    for(const item of draft.scheduleEvents){
      const row=document.createElement('div');row.className='schedule-row';row.dataset.id=item.id;
      const icon=document.createElement('select');icon.setAttribute('aria-label','Event icon');for(const name of scheduleIcons){const option=document.createElement('option');option.value=name;option.textContent=name.charAt(0).toUpperCase()+name.slice(1);icon.append(option);}icon.value=item.icon||'celebrate';
      const time=document.createElement('input');time.type='time';time.value=item.time||'';time.setAttribute('aria-label','Event time');
      const title=document.createElement('input');title.type='text';title.maxLength=100;title.placeholder='What happens?';title.value=item.title||'';title.setAttribute('aria-label','Event title');
      const remove=document.createElement('button');remove.type='button';remove.className='text-action';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+(item.title||'event'));
      icon.addEventListener('change',()=>{item.icon=icon.value;changed();});time.addEventListener('input',()=>{item.time=time.value;changed();});title.addEventListener('input',()=>{item.title=title.value;changed();});remove.addEventListener('click',()=>{draft.scheduleEvents=draft.scheduleEvents.filter(event=>event.id!==item.id);renderSchedule();changed();});
      row.append(icon,time,title,remove);host.append(row);
    }
    $('#add-schedule-event').disabled=draft.scheduleEvents.length>=100;
    host.hidden=!draft.schedule;$('#add-schedule-event').hidden=!draft.schedule;
  }
  function renderLinkPreview(){
    const photo=draft.linkPreviewMode==='photo';$('#link-photo-panel').hidden=!photo;$('#link-style-options').hidden=photo;
    const art=$('#link-card-art');art.className='link-card-art '+draft.linkPreviewStyle+(photo?' photo':'');art.style.backgroundImage=photo&&draft.linkPreviewImage?`url("${draft.linkPreviewImage}")`:'';
    if(photo)art.textContent=draft.linkPreviewImage?'':'Add a preview photo';
    else art.textContent=(draft.firstName||'Your name')+(draft.occasion==='wedding'?' & '+(draft.secondName||'their name'):'');
    $('#link-card-title').textContent=draft.linkPreviewTitle||((draft.firstName||'Your invitation')+(draft.occasion==='wedding'?' & '+(draft.secondName||'a celebration'):''));
    $('#link-card-description').textContent=draft.linkPreviewDescription||'Join us for a day to remember.';
  }
  function render(){
    drawInvitation(canvas,draft,{photoImage});
    $('#preview-template-name').textContent=getTemplate(draft.template).name;
    $('#preview-details').innerHTML=detailsMarkup(draft);
    previewCard.dataset.opening=draft.opening;
    renderLinkPreview();updateOccasion();updateMusic();
    $('#remove-photo').hidden=!draft.photo;
  }
  function changed(){render();persist();}
  function replay(){previewCard.classList.remove('is-opening');void previewCard.offsetWidth;previewCard.classList.add('is-opening');setTimeout(()=>previewCard.classList.remove('is-opening'),1500);}
  function openDialog(){const content=$('#dialog-content');content.replaceChildren();const image=document.createElement('img');image.src=canvas.toDataURL('image/png');image.alt='Full invitation design';content.append(image);const details=document.createElement('div');details.innerHTML=detailsMarkup(draft);content.append(details);dialog.showModal();}
  function validateDetails(){
    for(const name of ['firstName',...(draft.occasion==='wedding'?['secondName']:[]),'date','time']){const input=field(name);if(!String(input.value).trim()){setStep('details');input.focus();input.setCustomValidity('Please fill in this detail.');input.reportValidity();input.setCustomValidity('');return false;}}
    const map=field('mapsUrl');if(map.value&&!validMapUrl(map.value)){setStep('details');map.focus();map.reportValidity();return false;}
    return true;
  }

  for(const element of form.querySelectorAll('[name]')){
    if(element.type==='radio'){element.checked=draft[element.name]===element.value;}
    else if(element.type==='checkbox'){element.checked=Boolean(draft[element.name]);}
    else if(draft[element.name]!==undefined){element.value=draft[element.name];}
  }
  form.addEventListener('input',event=>{
    const target=event.target;if(!target.name||target.type==='radio'||target.type==='file')return;
    draft[target.name]=target.type==='checkbox'?target.checked:target.type==='range'?Number(target.value):target.value;
    if(target.name==='schedule')renderSchedule();changed();
  });
  form.addEventListener('change',event=>{
    const target=event.target;if(!target.name)return;
    if(target.type==='radio'&&target.checked||target.tagName==='SELECT'){draft[target.name]=target.value;changed();}
  });
  form.addEventListener('submit',event=>event.preventDefault());
  for(const tab of document.querySelectorAll('[data-step]'))tab.addEventListener('click',()=>setStep(tab.dataset.step));
  $('#next-step').addEventListener('click',()=>{if(currentStep==='details'&&!validateDetails())return;const next=steps.indexOf(currentStep)+1;if(next>=steps.length){if(validateDetails())openDialog();}else setStep(steps[next]);});
  $('#add-schedule-event').addEventListener('click',()=>{if(draft.scheduleEvents.length>=100)return;draft.scheduleEvents.push({id:crypto.randomUUID(),time:'',title:'',icon:'celebrate'});renderSchedule();changed();});

  async function uploadImage(input,key,statusId,maxSize,w,h){const file=input.files?.[0];if(!file)return;const status=$(statusId);if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>maxSize){status.textContent='Choose a JPG, PNG, or WebP within the size limit.';input.value='';return;}status.textContent='Preparing image…';try{draft[key]=await imageData(file,w,h);if(key==='photo')loadPhoto();status.textContent='Photo added.';changed();}catch(error){status.textContent=error.message;}input.value='';}
  $('#photo-upload').addEventListener('change',event=>uploadImage(event.target,'photo','#photo-status',10*1024*1024,1200,1200));
  $('#remove-photo').addEventListener('click',()=>{draft.photo='';photoImage=null;$('#photo-status').textContent='Photo removed.';changed();});
  $('#link-photo-upload').addEventListener('change',event=>uploadImage(event.target,'linkPreviewImage','#link-photo-status',5*1024*1024,1200,630));
  function loadPhoto(){if(!draft.photo){photoImage=null;render();return;}const image=new Image();image.onload=()=>{photoImage=image;render();};image.src=draft.photo;}

  $('#music-upload').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;const status=$('#music-status');if(!file.type.startsWith('audio/')||file.size>4*1024*1024){status.textContent='Choose an audio file up to 4 MB.';event.target.value='';return;}try{audioData=await fileData(file);const player=$('#music-player');player.src=audioData;player.hidden=false;$('#remove-music').hidden=false;status.textContent=file.name+' is ready for your download.';draft.musicMode='upload';field('musicMode').value='upload';changed();}catch{status.textContent='Could not read audio.';}event.target.value='';});
  $('#remove-music').addEventListener('click',()=>{audioData='';$('#music-player').pause();$('#music-player').removeAttribute('src');$('#music-player').hidden=true;$('#remove-music').hidden=true;draft.musicMode='off';field('musicMode').value='off';$('#music-status').textContent='Music removed.';changed();});

  $('#preview-opening').addEventListener('click',replay);$('#replay').addEventListener('click',replay);$('#expand-preview').addEventListener('click',openDialog);$('#close-preview').addEventListener('click',()=>dialog.close());
  $('#download-png').addEventListener('click',()=>canvas.toBlob(blob=>{if(blob)download(blob,'eventcard-invitation.png');},'image/png'));
  $('#download-html').addEventListener('click',()=>download(new Blob([standaloneHtml(draft,canvas.toDataURL('image/png'),audioData)],{type:'text/html;charset=utf-8'}),'eventcard-invitation.html'));
  canvas.addEventListener('click',event=>{const y=(event.clientY-canvas.getBoundingClientRect().top)/canvas.getBoundingClientRect().height;setStep('details');field(y<.55?'firstName':y<.82?'date':'venue').focus();});
  setupMapPicker({address:field('address'),mapsField:field('mapsUrl')});
  renderSchedule();loadPhoto();render();setStep('details');document.fonts.ready.then(render);
}
