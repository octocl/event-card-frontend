const coordinates=value=>{const match=String(value||'').trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);if(!match)return null;const point=match.slice(1).map(Number);return Math.abs(point[0])<=90&&Math.abs(point[1])<=180?point:null;};
const coordinateLink=point=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(point.map(value=>Number(value).toFixed(6)).join(', '));
let library;
function loadLeaflet(){
  if(!library)library=new Promise((resolve,reject)=>{
    const css=document.createElement('link');css.rel='stylesheet';css.href='/vendor/leaflet/leaflet.css';document.head.append(css);
    const script=document.createElement('script');script.src='/vendor/leaflet/leaflet.js';script.onload=()=>resolve(window.L);script.onerror=()=>{library=null;reject(new Error('Map unavailable'));};document.head.append(script);
  });
  return library;
}
export function setupMapPicker({address,mapsField}){
  const panel=document.querySelector('#map-panel'),canvas=document.querySelector('#location-map'),results=document.querySelector('#map-results'),status=document.querySelector('#map-status');
  const check=document.querySelector('#check-map'),locate=document.querySelector('#use-location'),confirm=document.querySelector('#confirm-map'),close=document.querySelector('#close-map');
  let map,marker,point,queryAtOpen='',version=0;
  const cache=new Map();
  async function showPoint(next,query=address.value.trim()){
    const current=++version;panel.hidden=false;canvas.hidden=false;queryAtOpen=query;status.textContent='Loading map…';
    try{
      const L=await loadLeaflet();if(current!==version)return;
      point=next;
      if(!map){
        map=L.map(canvas,{scrollWheelZoom:false,zoomAnimation:false,fadeAnimation:false});
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
        marker=L.marker(next).addTo(map);
        map.on('move',()=>marker.setLatLng(map.getCenter()));
        map.on('moveend',()=>{const center=map.getCenter();point=[center.lat,center.lng];});
        map.on('click',event=>map.panTo(event.latlng,{animate:false}));
        new ResizeObserver(()=>{if(!panel.hidden&&canvas.clientWidth)map.invalidateSize({pan:false});}).observe(canvas);
      }
      map.invalidateSize({pan:false});map.setView(next,16,{animate:false});marker.setLatLng(next);
      status.textContent='Check the place, then confirm your selection.';
    }catch{status.textContent='Map unavailable. You can paste a Google or Yandex Maps link instead.';}
  }
  async function search(){
    const query=address.value.trim();if(!query){address.focus();status.textContent='Enter an address or coordinates first.';return;}
    const direct=coordinates(query);results.replaceChildren();if(direct){await showPoint(direct,query);return;}
    const current=++version;panel.hidden=false;canvas.hidden=true;check.disabled=true;status.textContent='Finding places…';
    try{
      let places=cache.get(query);
      if(!places){const response=await fetch('https://photon.komoot.io/api/?limit=5&q='+encodeURIComponent(query),{signal:AbortSignal.timeout(10000)});if(!response.ok)throw new Error();const data=await response.json();places=(data.features||[]).filter(item=>Array.isArray(item.geometry?.coordinates));cache.set(query,places);}
      if(current!==version)return;
      for(const place of places){const button=document.createElement('button');button.type='button';const p=place.properties||{};button.textContent=[p.name,[p.street,p.housenumber].filter(Boolean).join(' '),p.city||p.town||p.state,p.country].filter(Boolean).join(', ');button.addEventListener('click',()=>showPoint([place.geometry.coordinates[1],place.geometry.coordinates[0]],query));results.append(button);}
      status.textContent=places.length?'Choose the matching place.':'No match. Try a more specific address or use your location.';
    }catch{if(current===version)status.textContent='Search unavailable. Try again or paste a map link.';}
    finally{check.disabled=false;}
  }
  check.addEventListener('click',search);
  address.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();search();}});
  address.addEventListener('input',()=>{version++;panel.hidden=true;results.replaceChildren();});
  locate.addEventListener('click',()=>{
    if(!navigator.geolocation){status.textContent='Location is unavailable in this browser.';return;}
    status.textContent='Finding your location…';navigator.geolocation.getCurrentPosition(position=>showPoint([position.coords.latitude,position.coords.longitude]),()=>{status.textContent='Location access was declined or unavailable.';},{timeout:10000});
  });
  confirm.addEventListener('click',()=>{if(!point||queryAtOpen!==address.value.trim())return;mapsField.value=coordinateLink(point);mapsField.dispatchEvent(new Event('input',{bubbles:true}));status.textContent='Exact location saved for guests.';panel.hidden=true;});
  close.addEventListener('click',()=>{version++;panel.hidden=true;status.textContent='';});
}
