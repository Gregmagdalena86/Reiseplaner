const $=(q,r=document)=>r.querySelector(q);
const $$=(q,r=document)=>[...r.querySelectorAll(q)];
const DATA=window.CREOVA_DATA;

const state={
  view:"ziel",
  selected:[],
  selectedPoi:[],
  packDone:{},
  pois:[],
  coords:null,
  locationName:"",
  weather:null,
  budget:0,
  carKm:0,
  carConsumption:7.2,
  fuelPrice:1.75
};
let map=null,markers=[];

function money(v){return Number(v||0).toLocaleString("de-DE")+" €";}
function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2200);}
function selectedSuggestions(){return DATA.suggestions.filter(x=>state.selected.includes(x.id));}
function selectedPois(){return state.pois.filter(x=>state.selectedPoi.includes(x.id));}
function chosen(){return [...selectedSuggestions(),...selectedPois()];}
function itemPrice(x){return x.price || ({restaurant:35,camping:45,hotel:110}[x.kind]||30);}
function fuelCost(){return Math.round(state.carKm*state.carConsumption/100*state.fuelPrice);}
function total(){return chosen().reduce((s,x)=>s+itemPrice(x),0)+fuelCost();}

function nav(v){
  state.view=v;
  $$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===v));
  $$(".view").forEach(s=>s.classList.toggle("hidden",s.id!=="view-"+v));
  render();
  if(v==="karte")setTimeout(initMap,150);
  if(v==="wetter"&&!state.weather)setTimeout(loadWeather,150);
  scrollTo({top:0,behavior:"smooth"});
}

function render(){
  renderCards();
  renderDiscover();
  renderPois();
  renderBudget();
  renderPack();
  renderHouse();
  renderPlan();
  renderTimeline();
  renderTours();
  renderWeather();
  renderExport();
  renderMapMarkers();
  $("#selectedCount").textContent=chosen().length+" Vorschläge ausgewählt";
  $("#totalPrice").textContent=money(total());
}

function card(x,type="suggestion"){
  const selected=type==="poi"?state.selectedPoi.includes(x.id):state.selected.includes(x.id);
  return `<article class="card ${selected?"selected":""}" data-${type}="${x.id}">
    <img src="${x.img}" alt="">
    <div class="tick">✓</div>
    <div class="cardBody">
      <h3>${x.title||x.name}</h3>
      <p>${x.desc||x.address||"Live-Ort"}</p>
      <div>${(x.tags||[x.kind]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
      <p><b>${money(itemPrice(x))}</b></p>
    </div>
  </article>`;
}

function renderCards(){
  const el=$("#suggestions");
  if(!el)return;
  el.innerHTML=DATA.suggestions.map(x=>card(x)).join("");
  $$("[data-suggestion]").forEach(c=>c.onclick=()=>{
    const id=c.dataset.suggestion;
    state.selected=state.selected.includes(id)?state.selected.filter(x=>x!==id):[...state.selected,id];
    render();
  });
}
function renderDiscover(){const el=$("#discover");if(el)el.innerHTML=DATA.suggestions.map(x=>card(x)).join("");}
function renderTours(){const el=$("#tourList");if(el)el.innerHTML=DATA.suggestions.filter(x=>x.tags.includes("Radfahren")||x.tags.includes("Wandern")).map(x=>card(x)).join("");}

async function geocode(q){
  const r=await fetch("https://nominatim.openstreetmap.org/search?format=json&limit=1&q="+encodeURIComponent(q));
  const j=await r.json();
  if(!j[0])throw new Error("Ort nicht gefunden");
  return{lat:+j[0].lat,lon:+j[0].lon,name:j[0].display_name};
}
async function loadLive(){
  try{
    $("#status").textContent="Live-Daten werden geladen ...";
    const q=$("#destination").value.trim()||$("#start").value.trim()||"Marl Deutschland";
    const g=await geocode(q);
    state.coords={lat:g.lat,lon:g.lon};
    state.locationName=g.name;
    await Promise.all([loadWeather(),loadPois()]);
    $("#status").textContent="Live-Daten geladen: "+g.name;
    toast("Live-Daten geladen");
    render();
  }catch(e){$("#status").textContent="Fehler: "+e.message;toast("Live-Daten nicht erreichbar");}
}
async function useGps(){
  try{
    $("#status").textContent="GPS wird abgefragt ...";
    const p=await new Promise((res,rej)=>navigator.geolocation?navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:8000}):rej(new Error("GPS nicht verfügbar")));
    state.coords={lat:p.coords.latitude,lon:p.coords.longitude};
    state.locationName="Aktueller Standort";
    await Promise.all([loadWeather(),loadPois()]);
    $("#status").textContent="GPS übernommen";
    render();
  }catch(e){
    state.coords={lat:51.647,lon:7.096};
    state.locationName="Fallback Marl";
    await Promise.all([loadWeather(),loadPois()]);
    $("#status").textContent="GPS nicht verfügbar. Fallback Marl genutzt.";
    render();
  }
}
async function loadWeather(){
  if(!state.coords){state.coords={lat:51.647,lon:7.096};state.locationName="Fallback Marl";}
  const {lat,lon}=state.coords;
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
  const r=await fetch(url,{cache:"no-store"});
  state.weather=await r.json();
  renderWeather();
}
function renderWeather(){
  const top=$("#weatherBadge");
  if(state.weather?.current){
    top.innerHTML=`📍 ${state.locationName||"Standort"}<br><b>${Math.round(state.weather.current.temperature_2m)} °C</b>`;
  }
  const el=$("#weatherBox");
  if(!el)return;
  if(!state.weather){el.innerHTML="<p>Wetter wird nach GPS oder Live-Daten angezeigt.</p>";return;}
  const c=state.weather.current,d=state.weather.daily;
  el.innerHTML=`<div class="weatherDay"><h3>${state.locationName||"Standort"}</h3><b>${Math.round(c.temperature_2m)}°</b><p>Wind ${Math.round(c.wind_speed_10m||0)} km/h</p></div>`+
  d.time.map((day,i)=>`<div class="weatherDay"><h3>${new Date(day).toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit"})}</h3><b>${Math.round(d.temperature_2m_max[i])}°</b><p>min ${Math.round(d.temperature_2m_min[i])}° · Regen ${d.precipitation_probability_max[i]||0}%</p></div>`).join("");
}
async function loadPois(){
  if(!state.coords)return;
  const {lat,lon}=state.coords;
  let radius=Number($("#radius").value||50000);
  if(radius>100000)radius=50000;
  const query=`[out:json][timeout:20];(node["amenity"="restaurant"](around:${radius},${lat},${lon});node["tourism"="camp_site"](around:${radius},${lat},${lon});node["tourism"="caravan_site"](around:${radius},${lat},${lon});node["tourism"="hotel"](around:${radius},${lat},${lon});node["tourism"="guest_house"](around:${radius},${lat},${lon}););out 45;`;
  const r=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body:query});
  const j=await r.json();
  state.pois=(j.elements||[]).map(e=>{
    const t=e.tags||{};
    const kind=t.amenity==="restaurant"?"restaurant":(t.tourism==="camp_site"||t.tourism==="caravan_site")?"camping":"hotel";
    return{id:"poi-"+e.id,name:t.name||kind,kind,lat:e.lat,lon:e.lon,img:kind==="restaurant"?DATA.images.food:kind==="camping"?DATA.images.camp:DATA.images.city,address:[t["addr:street"],t["addr:postcode"],t["addr:city"]].filter(Boolean).join(", "),tags:[kind]};
  });
}
function renderPois(){
  const el=$("#poiList");if(!el)return;
  const filter=$("#poiFilter").value;
  const arr=state.pois.filter(p=>filter==="Alle"||p.kind.toLowerCase()===filter.toLowerCase());
  el.innerHTML=arr.length?arr.map(x=>card(x,"poi")).join(""):"<p>Noch keine Orte geladen. Nutze Live-Daten laden.</p>";
  $$("[data-poi]").forEach(c=>c.onclick=()=>{
    const id=c.dataset.poi;
    state.selectedPoi=state.selectedPoi.includes(id)?state.selectedPoi.filter(x=>x!==id):[...state.selectedPoi,id];
    render();
  });
}
function initMap(){
  if(!window.L)return;
  if(!map){
    const s=state.coords||{lat:51.647,lon:7.096};
    map=L.map("map").setView([s.lat,s.lon],10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);
  }
  renderMapMarkers();
  setTimeout(()=>map.invalidateSize(),100);
}
function renderMapMarkers(){
  if(!map)return;
  markers.forEach(m=>m.remove());markers=[];
  [...DATA.suggestions,...state.pois].forEach(x=>{
    if(!x.lat||!x.lon)return;
    markers.push(L.marker([x.lat,x.lon]).addTo(map).bindPopup(`<b>${x.title||x.name}</b><br>${money(itemPrice(x))}`));
  });
  if(markers.length){try{map.fitBounds(L.featureGroup(markers).getBounds().pad(.2));}catch{}}
}

function renderBudget(){
  $("#budgetTotal").textContent=money(state.budget);
  $("#budgetUsed").textContent=money(chosen().reduce((s,x)=>s+itemPrice(x),0));
  $("#budgetCar").textContent=money(fuelCost());
  $("#budgetRest").textContent=money(state.budget-total());
  const el=$("#budgetList");
  if(el)el.innerHTML=chosen().map(x=>`<div class="listRow"><b>${x.title||x.name}</b><br>${money(itemPrice(x))}</div>`).join("")||"<p>Noch keine Auswahl.</p>";
}
function renderPack(){
  const cats=[...new Set(DATA.pack.map(x=>x.category))];
  let filter=$("#packFilter")?.value||"Alle Kategorien";
  let search=($("#packSearch")?.value||"").toLowerCase();
  if($("#packFilter")){
    $("#packFilter").innerHTML="<option>Alle Kategorien</option>"+cats.map(c=>`<option>${c}</option>`).join("");
    $("#packFilter").value=cats.includes(filter)?filter:"Alle Kategorien";
  }
  let items=DATA.pack;
  if(filter!=="Alle Kategorien")items=items.filter(x=>x.category===filter);
  if(search)items=items.filter(x=>(x.name+" "+x.category).toLowerCase().includes(search));
  const done=DATA.pack.filter(x=>state.packDone[x.id]).length;
  $("#packCount").textContent=`${done} / ${DATA.pack.length}`;
  $("#packProgress").style.width=(done/DATA.pack.length*100)+"%";
  $("#packCats").innerHTML=cats.map(c=>{const list=DATA.pack.filter(x=>x.category===c),d=list.filter(x=>state.packDone[x.id]).length;return`<div class="packCat" data-cat="${c}"><b>${c}</b><br><span>${d} / ${list.length}</span></div>`;}).join("");
  $("#packItems").innerHTML=items.map(x=>`<div class="packItem ${state.packDone[x.id]?"done":""}" data-pack="${x.id}"><img src="${x.icon}" alt=""><div><h3>${x.name}</h3><p>${x.category} · Menge 1 / 1</p></div><div class="check"></div></div>`).join("");
  $$("[data-pack]").forEach(r=>r.onclick=()=>{state.packDone[r.dataset.pack]=!state.packDone[r.dataset.pack];renderPack();});
  $$("[data-cat]").forEach(c=>c.onclick=()=>{$("#packFilter").value=c.dataset.cat;renderPack();});
}
function renderHouse(){
  const items=["Fenster schließen","Herd ausschalten","Wasserhahn prüfen","Müll entsorgen","Licht aus","Türen abschließen","Post prüfen","Haustiere versorgt"];
  $("#houseList").innerHTML=items.map(x=>`<label class="houseItem"><input type="checkbox"><span>${x}</span></label>`).join("");
}
function renderPlan(){
  $("#planList").innerHTML=chosen().map((x,i)=>`<div class="listRow"><b>Tag ${i+1}: ${x.title||x.name}</b><p>${x.desc||x.kind||""}</p></div>`).join("")||"<p>Noch nichts ausgewählt.</p>";
}
function renderTimeline(){
  $("#timeline").innerHTML=chosen().map((x,i)=>`<div class="listRow"><b>Tag ${i+1}</b><br>${x.title||x.name}</div>`).join("")||"<p>Noch keine Timeline.</p>";
}
function exportText(){
  return["CREOVA Reiseplan","Budget: "+money(state.budget),"Kosten: "+money(total()),"Standort: "+(state.locationName||"nicht gesetzt"),"","Auswahl:",...chosen().map(x=>"- "+(x.title||x.name)+" · "+money(itemPrice(x))),"","Offene Packliste:",...DATA.pack.filter(x=>!state.packDone[x.id]).map(x=>"- "+x.name)].join("\n");
}
function renderExport(){if($("#exportText"))$("#exportText").value=exportText();}
function download(name,content,type){const b=new Blob([content],{type});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;a.click();URL.revokeObjectURL(a.href);}

function bind(){
  $$("[data-view]").forEach(b=>b.onclick=()=>nav(b.dataset.view));
  $("#budgetInput").oninput=e=>{state.budget=Number(e.target.value||0);render();};
  $("#gpsBtn").onclick=useGps;
  $("#liveBtn").onclick=loadLive;
  $("#loadAll").onclick=loadLive;
  $("#weatherReload").onclick=loadWeather;
  $("#refreshBtn").onclick=()=>{DATA.suggestions.reverse();render();toast("Vorschläge neu sortiert");};
  $("#clearBtn").onclick=()=>{state.selected=[];state.selectedPoi=[];state.budget=0;$("#budgetInput").value="";render();toast("Auswahl geleert");};
  $("#poiFilter").onchange=renderPois;
  $("#fitMap").onclick=renderMapMarkers;
  $("#packSearch").oninput=renderPack;
  $("#packFilter").onchange=renderPack;
  $("#addPack").onclick=()=>{const v=$("#customPack").value.trim();if(!v)return;DATA.pack.push({id:"custom-"+Date.now(),name:v,category:"Eigene",icon:DATA.pack[0].icon});$("#customPack").value="";renderPack();};
  $("#newTrip").onclick=()=>{location.href=location.pathname+"?v=x1&reset="+Date.now();};
  $("#printTop").onclick=()=>print();
  $("#printBtn").onclick=()=>print();
  $("#txtBtn").onclick=()=>download("creova-reiseplan.txt",exportText(),"text/plain");
  $("#jsonBtn").onclick=()=>download("creova-reiseplan.json",JSON.stringify({state,selected:chosen()},null,2),"application/json");
}
document.addEventListener("DOMContentLoaded",()=>{
  try{localStorage.clear();sessionStorage.clear();}catch{}
  bind();
  render();
  nav("ziel");
  if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js?v=x1").then(r=>r.update()).catch(()=>{});}
});
