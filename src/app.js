import {templates,defaultDraft} from './catalog.js';
import {drawInvitation} from './draw.js';
import {initEditor} from './editor.js';

function sample(occasion,template){return {...defaultDraft(),occasion,template,firstName:occasion==='birthday'?'Sofia':'Amira',secondName:'Daniel',age:'30th',date:'2027-06-12',time:'17:00',venue:'The Glasshouse Garden'};}
function makeThumbnail(template,occasion){const canvas=document.createElement('canvas');drawInvitation(canvas,sample(occasion,template),{scale:.38});return canvas;}
function initGallery(){
  const grid=document.querySelector('#template-grid'),buttons=[...document.querySelectorAll('[data-occasion]')];
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
  render();document.fonts.ready.then(render);
}
if(document.body.dataset.page==='gallery')initGallery();
if(document.body.dataset.page==='editor')initEditor();
