
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];

const assets = {
  hero:"assets/hero.svg",
  lake:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  mountains:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",
  beach:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  bike:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",
  camp:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
  food:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  spa:"https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
  city:"https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80",
  kid:"https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  tent:"https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=900&q=80",
  jacket:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
  tech:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
  bag:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  shoes:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  chair:"https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=900&q=80",
  car:"https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80",
  house:"https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80",
  alarm:"https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=900&q=80"
};

const defaultState = {
  activeView:"home",
  start:"Marl",
  radius:1000,
  tripType:"Urlaub",
  budget:2000,
  persons:2,
  interests:["Meer","Radfahren","Camping","gutes Essen"],
  selectedSuggestions:[],
  selectedPack:{},
  customPack:[],
  houseDone:{},
  galleryNotes:[],
  alarm:{arrival:"10:00",drive:"5 h 30 min",buffer:"30 min",departure:"04:00",wake:"03:00"},
  manualTimeline:[]
};

let state = loadState();
let refreshSeed = 0;

const interestBase = [
  ["Meer","🌊",assets.beach],["Wandern","⛰️",assets.mountains],["Radfahren","🚴",assets.bike],
  ["Camping","⛺",assets.camp],["Dachzelt","🚙",assets.tent],["gutes Essen","🍴",assets.food],
  ["Natur","🌲",assets.lake],["Altstadt","🏛️",assets.city],["Kinder","🙂",assets.kid],
  ["Wellness","🪷",assets.spa],["Shopping","🛍️",assets.city],["Berge","🏔️",assets.mountains],
  ["See","〰️",assets.lake],["Tagesausflug","📷",assets.city]
];

const suggestions = [
  {
    id:"salzkammergut", title:"Österreich – Salzkammergut", km:760, price:1200, rating:4.9,
    img:assets.mountains, tags:["Wandern","Natur","See","Berge","Roadtrip","Aktivurlaub"],
    desc:"Seen, Berge, Radtouren und entspannte Abende. Ideal für eine längere Reise.",
    timeline:["Anreise & Check-in","Wanderung Feuerkogel","Radtour um den Attersee","Wellness & Sauna"],
    details:["Campingplätze am See","Panorama-Wanderungen","Restaurants am Wasser","Schlechtwetter-Alternativen"]
  },
  {
    id:"domburg", title:"Domburg – Zeeland", km:246, price:460, rating:4.7,
    img:assets.beach, tags:["Meer","Camping","Radfahren","Dachzelt","gutes Essen","Strandurlaub"],
    desc:"Strand, Dünen, Campingplätze und Radwege direkt an der Küste.",
    timeline:["Anreise zum Campingplatz","Strandtag","Radtour nach Westkapelle","Restaurant am Abend"],
    details:["Campingplatz nahe Strand","Fischrestaurant am Abend","Dünenroute mit dem Rad","Sonnenuntergang am Meer"]
  },
  {
    id:"winterberg", title:"Winterberg – Bike & Wandern", km:95, price:185, rating:4.6,
    img:assets.bike, tags:["Radfahren","Wandern","Berge","Natur","Tagesausflug","Radurlaub"],
    desc:"Bikepark, Wanderwege, Aussichtspunkte und gute Tagesausflug-Option.",
    timeline:["Anfahrt","Bikepark oder Wanderung","Einkehr","Rückfahrt"],
    details:["Bikepark Winterberg","Kahler Asten","Rothaarsteig","rustikales Restaurant"]
  },
  {
    id:"wellness", title:"Therme & Wellness Tag", km:75, price:130, rating:4.5,
    img:assets.spa, tags:["Wellness","gutes Essen","Tagesausflug","Entspannung"],
    desc:"Entspannung, Sauna und gutes Essen bei schlechtem Wetter.",
    timeline:["Anfahrt","Therme & Sauna","Restaurant","Rückfahrt"],
    details:["Thermenbesuch","Sauna-Ruhebereich","Abendessen","Schlechtwetter-Alternative"]
  },
  {
    id:"family", title:"Kletterwald Familie", km:120, price:160, rating:4.8,
    img:assets.kid, tags:["Kinder","Natur","Tagesausflug","Familienurlaub"],
    desc:"Aktiver Familienausflug mit Abenteuer, Spielpause und Natur.",
    timeline:["Anfahrt","Kletterwald","Snackpause","kleine Wanderung"],
    details:["Kletterwald","Spielplatz","familienfreundliches Restaurant","Naturpause"]
  },
  {
    id:"maastricht", title:"Maastricht Genuss & Altstadt", km:160, price:240, rating:4.8,
    img:assets.city, tags:["Altstadt","Shopping","gutes Essen","Städtetrip","Wochenendtrip"],
    desc:"Altstadt, Cafés, Restaurants und Shopping. Sehr gut für ein Wochenende.",
    timeline:["Anreise","Altstadt-Spaziergang","Restaurantabend","Shopping & Rückfahrt"],
    details:["Vrijthof","Cafés","Restaurantabend","Shopping-Gassen"]
  },
  {
    id:"see", title:"Campingplatz am See", km:110, price:210, rating:4.5,
    img:assets.camp, tags:["Camping","Dachzelt","See","Natur","Campingurlaub"],
    desc:"Camping oder Dachzelt direkt am Wasser, ruhig und flexibel.",
    timeline:["Anreise","Dachzelt aufbauen","Abend am See","Frühstück am Wasser"],
    details:["Dachzelt-Stellplatz","Seeufer","kleine Radtour","Frühstück im Freien"]
  },
  {
    id:"eifel", title:"Eifel Natur & Wandern", km:85, price:95, rating:4.7,
    img:assets.lake, tags:["Wandern","Natur","Camping","Wanderurlaub"],
    desc:"Wald, Seen, Wanderwege und Ruhe. Günstig und nah.",
    timeline:["Anfahrt","Wanderung am Rursee","Picknick","Rückfahrt"],
    details:["Rursee","Aussichtspunkt","Natur-Campingplatz","Picknick"]
  }
];

const packCatalog = [
  {id:"shirt",cat:"Kleidung",name:"T-Shirts",img:assets.jacket,tags:["all"],qty:"5 / 10"},
  {id:"shoes",cat:"Kleidung",name:"Wanderschuhe",img:assets.shoes,tags:["Wandern","Berge"],qty:"1 / 1"},
  {id:"rain",cat:"Kleidung",name:"Regenjacke",img:assets.jacket,tags:["all","Wandern","Camping"],qty:"1 / 1"},
  {id:"socks",cat:"Kleidung",name:"Socken",img:assets.jacket,tags:["all"],qty:"5 / 10"},
  {id:"chair",cat:"Camping",name:"Campingstuhl",img:assets.chair,tags:["Camping","Dachzelt"],qty:"2 / 2"},
  {id:"stove",cat:"Camping",name:"Gaskocher",img:assets.camp,tags:["Camping","Dachzelt"],qty:"1 / 1"},
  {id:"lamp",cat:"Camping",name:"Stirnlampe",img:assets.camp,tags:["Camping","Dachzelt"],qty:"2 / 2"},
  {id:"sleep",cat:"Camping",name:"Schlafsack",img:assets.camp,tags:["Camping","Dachzelt"],qty:"2 / 2"},
  {id:"cooler",cat:"Camping",name:"Kühlbox",img:assets.bag,tags:["Camping","Roadtrip"],qty:"1 / 1"},
  {id:"cream",cat:"Hygiene",name:"Sonnencreme",img:assets.spa,tags:["Meer","Strandurlaub"],qty:"1 / 1"},
  {id:"towel",cat:"Hygiene",name:"Handtücher",img:assets.spa,tags:["Meer","Wellness","Camping"],qty:"2 / 4"},
  {id:"tooth",cat:"Hygiene",name:"Kulturbeutel",img:assets.spa,tags:["all"],qty:"1 / 1"},
  {id:"power",cat:"Technik",name:"Powerbank",img:assets.tech,tags:["all"],qty:"1 / 1"},
  {id:"cable",cat:"Technik",name:"Ladekabel",img:assets.tech,tags:["all"],qty:"2 / 4"},
  {id:"tool",cat:"Radfahren",name:"Multitool",img:assets.bike,tags:["Radfahren"],qty:"1 / 1"},
  {id:"tube",cat:"Radfahren",name:"Ersatzschlauch",img:assets.bike,tags:["Radfahren"],qty:"1 / 2"},
  {id:"snacks",cat:"Sonstiges",name:"Snacks",img:assets.food,tags:["Kinder","Tagesausflug","all"],qty:"1 / 1"},
  {id:"papers",cat:"Sonstiges",name:"Ausweis & Papiere",img:assets.bag,tags:["all"],qty:"1 / 1"}
];

const houseChecks = [
  ["windows","Fenster schließen","▦"],
  ["stove","Herd ausschalten","▣"],
  ["water","Wasserhahn prüfen","♨"],
  ["trash","Müll entsorgen","♲"],
  ["pets","Haustiere versorgt","♧"],
  ["lights","Licht aus","◌"],
  ["doors","Türen abschließen","▣"],
  ["mail","Post umleiten","✉"]
];

function loadState(){
  try{return {...defaultState,...JSON.parse(localStorage.getItem("creova_full_state")||"{}")}}
  catch(e){return {...defaultState}}
}
function saveState(){
  localStorage.setItem("creova_full_state", JSON.stringify(state));
}
function money(v){return Number(v||0).toLocaleString("de-DE")+" €"}
function selectedSuggestions(){return suggestions.filter(s=>state.selectedSuggestions.includes(s.id))}
function activeInterests(){return state.interests}
function score(s){
  let hits=s.tags.filter(t=>activeInterests().includes(t)).length*18;
  if(s.tags.includes(state.tripType)) hits+=28;
  if(s.km<=Number(state.radius)) hits+=12;
  hits += ((s.title.length + refreshSeed*11)%17);
  return hits;
}
function notify(msg){
  let t=document.createElement("div");
  t.className="toast";
  t.textContent=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2200);
}
function navTo(view){
  state.activeView=view; saveState();
  $$(".nav button").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $$(".view").forEach(v=>v.classList.toggle("hidden",v.id!==`view-${view}`));
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}
function initNav(){
  $$(".nav button,[data-go]").forEach(btn=>{
    btn.addEventListener("click",()=>navTo(btn.dataset.view||btn.dataset.go));
  });
}
function renderHome(){
  $("#start").value=state.start;
  $("#radius").value=state.radius;
  $("#tripType").value=state.tripType;
  $("#budgetInput").value=state.budget;
  $("#persons").value=state.persons;
  $("#interestInput").value=state.interests.join(", ");
  $("#chips").innerHTML = interestBase.map(([name,icon])=>`
    <button class="chip ${state.interests.includes(name)?"active":""}" data-chip="${name}">
      <span>${icon}</span>${name}
    </button>`).join("");
  $("#chips").querySelectorAll("[data-chip]").forEach(ch=>{
    ch.onclick=()=>{
      const n=ch.dataset.chip;
      if(state.interests.includes(n)) state.interests=state.interests.filter(x=>x!==n);
      else state.interests.push(n);
      saveState(); render();
    };
  });
  renderBudget();
  renderResults();
}
function renderBudget(){
  const sum=selectedSuggestions().reduce((a,b)=>a+b.price,0);
  const rest=Number(state.budget)-sum;
  ["#budgetTiles","#budgetTiles2"].forEach(id=>{
    const el=$(id);
    if(!el)return;
    el.innerHTML=`
      <div class="budgetTile"><span>Budget</span><b>${money(state.budget)}</b></div>
      <div class="budgetTile"><span>Ausgewählt</span><b>${money(sum)}</b></div>
      <div class="budgetTile"><span>Rest</span><b>${money(rest)}</b></div>`;
  });
  $("#stickyCount").textContent = `${state.selectedSuggestions.length} Vorschläge ausgewählt`;
  $("#stickySum").textContent = money(sum);
  $("#rightBudget").textContent = money(state.budget);
  $("#rightSelected").textContent = money(sum);
  $("#rightRest").textContent = money(rest);
}
function renderResults(){
  let arr=[...suggestions].sort((a,b)=>score(b)-score(a));
  const sort=$("#sort").value;
  if(sort==="Preis niedrig") arr.sort((a,b)=>a.price-b.price);
  if(sort==="Entfernung") arr.sort((a,b)=>a.km-b.km);
  $("#results").innerHTML = arr.map(s=>`
    <article class="resultCard ${state.selectedSuggestions.includes(s.id)?"selected":""}" data-suggestion="${s.id}">
      <div class="cardPhoto" style="background-image:url('${s.img}')"></div>
      <div class="match">${score(s)}% Match</div>
      <div class="checkMark">✓</div>
      <div class="resultBody">
        <h3>${s.title}</h3>
        <p class="muted">${s.desc}</p>
        <div class="tags">${s.tags.slice(0,5).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        <div class="meta"><span>⭐ ${s.rating}</span><span>${s.km} km</span><b>${money(s.price)}</b></div>
        <button class="detailBtn" data-detail="${s.id}">Details anzeigen</button>
      </div>
    </article>`).join("");
  $("#results").querySelectorAll("[data-suggestion]").forEach(card=>{
    card.onclick=(e)=>{
      if(e.target.closest("[data-detail]")) return;
      toggleSuggestion(card.dataset.suggestion);
    };
  });
  $("#results").querySelectorAll("[data-detail]").forEach(btn=>{
    btn.onclick=(e)=>{e.stopPropagation(); showDetails(btn.dataset.detail);}
  });
}
function toggleSuggestion(id){
  if(state.selectedSuggestions.includes(id)) state.selectedSuggestions=state.selectedSuggestions.filter(x=>x!==id);
  else state.selectedSuggestions.push(id);
  saveState(); render(); notify("Auswahl aktualisiert");
}
function showDetails(id){
  const s=suggestions.find(x=>x.id===id);
  if(!s)return;
  $("#detailContent").innerHTML=`
    <div class="detailsView">
      <div class="detailImage" style="background-image:url('${s.img}')"></div>
      <div class="detailPanel">
        <h2>${s.title}</h2>
        <p class="muted">${s.desc}</p>
        <div class="tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        <div class="budgetMini">
          <div class="budgetTile"><span>Match</span><b>${score(s)}%</b></div>
          <div class="budgetTile"><span>Entfernung</span><b>${s.km} km</b></div>
          <div class="budgetTile"><span>Kosten</span><b>${money(s.price)}</b></div>
        </div>
        <button class="btn primary" style="margin-top:14px" onclick="toggleSuggestion('${s.id}')">
          ${state.selectedSuggestions.includes(s.id)?"Aus Planung entfernen":"Für Planung übernehmen"}
        </button>
      </div>
    </div>
    <h2 style="margin-top:22px">Details & Vorschläge</h2>
    <div class="detailsView">
      ${s.details.map(d=>`<div class="detailPanel"><h3>${d}</h3><p class="muted">Kann in Timeline, Packliste oder Budget übernommen werden.</p></div>`).join("")}
    </div>`;
  navTo("infos");
}
function renderPlan(){
  const sel=selectedSuggestions();
  $("#planList").innerHTML = sel.length ? `
    <div class="timeline">${sel.flatMap((s,idx)=>s.timeline.map((t,i)=>`
      <div class="timelineItem">
        <div><h3>Tag ${idx+i+1} – ${t}</h3><p class="muted">${s.title}</p></div>
        <img src="${s.img}">
      </div>`)).join("")}</div>` : `<p class="muted">Noch keine Vorschläge ausgewählt.</p>`;
}
function relevantPack(){
  const active=[...state.interests,state.tripType,...selectedSuggestions().flatMap(s=>s.tags)];
  return packCatalog.filter(p=>p.tags.includes("all") || p.tags.some(t=>active.includes(t))).concat(
    state.customPack.map((x,i)=>({id:"custom"+i,cat:"Eigene",name:x,img:assets.bag,tags:["all"],qty:"1 / 1"}))
  );
}
function renderPack(){
  const items=relevantPack();
  const done=items.filter(i=>state.selectedPack[i.id]).length;
  $("#packProgressText").textContent=`${done} / ${items.length}`;
  $("#packProgress").style.width=(items.length?done/items.length*100:0)+"%";
  const cats=[...new Set(items.map(i=>i.cat))];
  $("#packCats").innerHTML=cats.map(c=>{
    const list=items.filter(i=>i.cat===c);
    const d=list.filter(i=>state.selectedPack[i.id]).length;
    return `<div class="packCategory"><h3>${c}</h3><div class="progressBar"><div class="progressFill" style="width:${list.length?d/list.length*100:0}%"></div></div><p class="muted">${d} / ${list.length}</p></div>`;
  }).join("");
  $("#packProducts").innerHTML=items.map(p=>`
    <article class="productCard ${state.selectedPack[p.id]?"done":""}" data-pack="${p.id}">
      <div class="cardPhoto" style="background-image:url('${p.img}')"></div>
      <div class="checkMark">✓</div>
      <div class="resultBody"><h3>${p.name}</h3><p class="muted">${p.cat} · ${p.qty}</p></div>
    </article>`).join("");
  $("#packProducts").querySelectorAll("[data-pack]").forEach(c=>{
    c.onclick=()=>{
      state.selectedPack[c.dataset.pack]=!state.selectedPack[c.dataset.pack];
      saveState();renderPack();
    };
  });
}
function renderHouse(){
  $("#houseList").innerHTML=houseChecks.map(([id,text,ico])=>`
    <div class="checkRow ${state.houseDone[id]?"done":""}" data-house="${id}">
      <div class="checkBox">✓</div><div class="text"><b>${text}</b></div><div>${ico}</div>
    </div>`).join("");
  $("#houseList").querySelectorAll("[data-house]").forEach(r=>{
    r.onclick=()=>{state.houseDone[r.dataset.house]=!state.houseDone[r.dataset.house];saveState();renderHouse();}
  });
}
function renderDeparture(){
  $("#arrival").value=state.alarm.arrival;
  $("#drive").value=state.alarm.drive;
  $("#buffer").value=state.alarm.buffer;
  $("#departureTime").textContent=state.alarm.departure;
  $("#wakeTime").textContent=state.alarm.wake;
}
function renderGallery(){
  const imgs=[assets.lake,assets.tent,assets.mountains,assets.camp,assets.beach,assets.bike];
  $("#galleryGrid").innerHTML=imgs.map(src=>`<img src="${src}">`).join("");
}
function renderTimeline(){
  const sel=selectedSuggestions();
  $("#timelineFull").innerHTML = sel.length ? `<div class="timeline">${sel.flatMap((s,idx)=>s.timeline.map((t,i)=>`
    <div class="timelineItem"><div><h3>Tag ${idx+i+1}: ${t}</h3><p class="muted">${s.title}</p></div><img src="${s.img}"></div>`)).join("")}</div>` : `<p class="muted">Noch keine Timeline.</p>`;
}
function bindForms(){
  $("#start").oninput=e=>{state.start=e.target.value;saveState();}
  $("#radius").onchange=e=>{state.radius=Number(e.target.value);saveState();render();}
  $("#tripType").onchange=e=>{state.tripType=e.target.value;saveState();render();}
  $("#budgetInput").oninput=e=>{state.budget=Number(e.target.value||0);saveState();renderBudget();}
  $("#persons").oninput=e=>{state.persons=Number(e.target.value||1);saveState();}
  $("#addInterest").onclick=()=>{
    const v=$("#customInterest").value.trim();
    if(v && !state.interests.includes(v)){state.interests.push(v);$("#customInterest").value="";saveState();render();}
  };
  $("#btnRefresh").onclick=()=>{refreshSeed++;renderResults();notify("Neue Vorschläge sortiert");}
  $("#btnClear").onclick=()=>{
    state.selectedSuggestions=[];
    state.interests=[];
    saveState();render();notify("Auswahl geleert");
  };
  $("#btnLocation").onclick=()=>{
    if(!navigator.geolocation){notify("Standort nicht verfügbar");return;}
    navigator.geolocation.getCurrentPosition(pos=>{
      $("#locationInfo").textContent=`✅ Standort: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
    },()=>notify("Standort wurde nicht freigegeben"));
  };
  $("#sort").onchange=renderResults;
  $("#addPack").onclick=()=>{
    const v=$("#customPack").value.trim();
    if(v){state.customPack.push(v);$("#customPack").value="";saveState();renderPack();}
  };
  $("#saveAlarm").onclick=()=>{
    state.alarm.arrival=$("#arrival").value;
    state.alarm.drive=$("#drive").value;
    state.alarm.buffer=$("#buffer").value;
    saveState();
    notify("Wecker gespeichert");
  };
}
function render(){
  renderHome();
  renderBudget();
  renderPlan();
  renderPack();
  renderHouse();
  renderDeparture();
  renderGallery();
  renderTimeline();
}
function init(){
  initNav();
  bindForms();
  navTo(state.activeView||"home");
}
document.addEventListener("DOMContentLoaded",init);
