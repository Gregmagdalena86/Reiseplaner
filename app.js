const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const img={lake:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",mount:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=900&q=80",beach:"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",bike:"https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=900&q=80",camp:"https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",food:"https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",spa:"https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",city:"https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=900&q=80",kid:"https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",tent:"https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=900&q=80",jacket:"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",tech:"https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",bag:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",shoes:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"};
const defaults={view:"ziel",start:"Marl",radius:1000,tripType:"Urlaub",budget:2000,persons:2,interests:["Meer","Radfahren","Camping","gutes Essen"],selected:[],packDone:{},customPack:[],houseDone:{},alarm:{arrival:"10:00",drive:"5 h 30 min",buffer:"30 min",departure:"04:00",wake:"03:00"}};
let state=load(),seed=0;
function load(){try{return {...defaults,...JSON.parse(localStorage.creova_final||"{}")}}catch(e){return {...defaults}}}
function save(){localStorage.creova_final=JSON.stringify(state)}
function money(n){return Number(n||0).toLocaleString("de-DE")+" €"}
function toast(m){let t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),1800)}
const interests=[["Meer","🌊"],["Wandern","⛰️"],["Radfahren","🚴"],["Camping","⛺"],["Dachzelt","🚙"],["gutes Essen","🍴"],["Natur","🌲"],["Altstadt","🏛️"],["Kinder","🙂"],["Wellness","🪷"],["Shopping","🛍️"],["Berge","🏔️"],["See","〰️"],["Tagesausflug","📷"]];
const suggestions=[
{id:"salz",title:"Österreich – Salzkammergut",km:760,price:1200,rating:4.9,img:img.mount,tags:["Wandern","Natur","See","Berge","Roadtrip","Aktivurlaub"],desc:"Seen, Berge, Radtouren und entspannte Abende. Ideal für eine längere Reise.",timeline:["Anreise & Check-in","Wanderung Feuerkogel","Radtour um den Attersee","Wellness & Sauna"],details:["Campingplätze am See","Panorama-Wanderungen","Restaurants am Wasser","Schlechtwetter-Alternativen"]},
{id:"domburg",title:"Domburg – Zeeland",km:246,price:460,rating:4.7,img:img.beach,tags:["Meer","Camping","Radfahren","Dachzelt","gutes Essen","Strandurlaub"],desc:"Strand, Dünen, Campingplätze und Radwege direkt an der Küste.",timeline:["Anreise zum Campingplatz","Strandtag","Radtour nach Westkapelle","Restaurant am Abend"],details:["Campingplatz nahe Strand","Fischrestaurant am Abend","Dünenroute mit dem Rad","Sonnenuntergang am Meer"]},
{id:"winter",title:"Winterberg – Bike & Wandern",km:95,price:185,rating:4.6,img:img.bike,tags:["Radfahren","Wandern","Berge","Natur","Tagesausflug","Radurlaub"],desc:"Bikepark, Wanderwege, Aussichtspunkte und gute Tagesausflug-Option.",timeline:["Anfahrt","Bikepark oder Wanderung","Einkehr","Rückfahrt"],details:["Bikepark Winterberg","Kahler Asten","Rothaarsteig","rustikales Restaurant"]},
{id:"therme",title:"Therme & Wellness Tag",km:75,price:130,rating:4.5,img:img.spa,tags:["Wellness","gutes Essen","Tagesausflug"],desc:"Entspannung, Sauna und gutes Essen bei schlechtem Wetter.",timeline:["Anfahrt","Therme & Sauna","Restaurant","Rückfahrt"],details:["Thermenbesuch","Sauna-Ruhebereich","Abendessen","Schlechtwetter-Alternative"]},
{id:"kinder",title:"Kletterwald Familie",km:120,price:160,rating:4.8,img:img.kid,tags:["Kinder","Natur","Tagesausflug","Familienurlaub"],desc:"Aktiver Familienausflug mit Abenteuer, Spielpause und Natur.",timeline:["Anfahrt","Kletterwald","Snackpause","kleine Wanderung"],details:["Kletterwald","Spielplatz","familienfreundliches Restaurant","Naturpause"]},
{id:"maastricht",title:"Maastricht Genuss & Altstadt",km:160,price:240,rating:4.8,img:img.city,tags:["Altstadt","Shopping","gutes Essen","Städtetrip","Wochenendtrip"],desc:"Altstadt, Cafés, Restaurants und Shopping. Sehr gut für ein Wochenende.",timeline:["Anreise","Altstadt-Spaziergang","Restaurantabend","Shopping & Rückfahrt"],details:["Vrijthof","Cafés","Restaurantabend","Shopping-Gassen"]},
{id:"see",title:"Campingplatz am See",km:110,price:210,rating:4.5,img:img.camp,tags:["Camping","Dachzelt","See","Natur","Campingurlaub"],desc:"Camping oder Dachzelt direkt am Wasser, ruhig und flexibel.",timeline:["Anreise","Dachzelt aufbauen","Abend am See","Frühstück am Wasser"],details:["Dachzelt-Stellplatz","Seeufer","kleine Radtour","Frühstück im Freien"]},
{id:"eifel",title:"Eifel Natur & Wandern",km:85,price:95,rating:4.7,img:img.lake,tags:["Wandern","Natur","Camping","Wanderurlaub"],desc:"Wald, Seen, Wanderwege und Ruhe. Günstig und nah.",timeline:["Anfahrt","Wanderung am Rursee","Picknick","Rückfahrt"],details:["Rursee","Aussichtspunkt","Natur-Campingplatz","Picknick"]}
];
const pack=[
{id:"tshirt",cat:"Kleidung",name:"T-Shirts",img:img.jacket,tags:["all"],qty:"5 / 10"},
{id:"pullover",cat:"Kleidung",name:"Pullover",img:img.jacket,tags:["all","Berge","Camping"],qty:"1 / 3"},
{id:"jacke",cat:"Kleidung",name:"Jacke",img:img.jacket,tags:["all","Berge","Wandern"],qty:"1 / 1"},
{id:"regenjacke",cat:"Kleidung",name:"Regenjacke",img:img.jacket,tags:["all","Wandern","Camping","Radfahren"],qty:"1 / 1"},
{id:"hose",cat:"Kleidung",name:"Lange Hose",img:img.jacket,tags:["all"],qty:"1 / 3"},
{id:"shorts",cat:"Kleidung",name:"Shorts",img:img.jacket,tags:["Meer","Sommer","Tagesausflug"],qty:"1 / 3"},
{id:"unterwaesche",cat:"Kleidung",name:"Unterwäsche",img:img.jacket,tags:["all"],qty:"5 / 10"},
{id:"socken",cat:"Kleidung",name:"Socken",img:img.jacket,tags:["all"],qty:"5 / 10"},
{id:"schlafanzug",cat:"Kleidung",name:"Schlafanzug",img:img.jacket,tags:["all","Camping"],qty:"1 / 2"},
{id:"wanderschuhe",cat:"Kleidung",name:"Wanderschuhe",img:img.shoes,tags:["Wandern","Berge","Natur"],qty:"1 / 1"},
{id:"sneaker",cat:"Kleidung",name:"Sneaker",img:img.shoes,tags:["all","Städtetrip"],qty:"1 / 1"},
{id:"badeschuhe",cat:"Kleidung",name:"Badeschuhe",img:img.shoes,tags:["Meer","Wellness","See"],qty:"1 / 1"},
{id:"muetze",cat:"Kleidung",name:"Mütze",img:img.jacket,tags:["Berge","Winterurlaub","Camping"],qty:"1 / 1"},
{id:"sonnenhut",cat:"Kleidung",name:"Sonnenhut",img:img.jacket,tags:["Meer","Strandurlaub","Kinder"],qty:"1 / 1"},

{id:"zahnbuerste",cat:"Hygiene",name:"Zahnbürste",img:img.spa,tags:["all"],qty:"1 / 1"},
{id:"zahnpasta",cat:"Hygiene",name:"Zahnpasta",img:img.spa,tags:["all"],qty:"1 / 1"},
{id:"shampoo",cat:"Hygiene",name:"Shampoo",img:img.spa,tags:["all","Camping","Wellness"],qty:"1 / 1"},
{id:"duschgel",cat:"Hygiene",name:"Duschgel",img:img.spa,tags:["all","Camping","Wellness"],qty:"1 / 1"},
{id:"seife",cat:"Hygiene",name:"Seife",img:img.spa,tags:["all","Camping"],qty:"1 / 1"},
{id:"buerste",cat:"Hygiene",name:"Haarbürste",img:img.spa,tags:["all"],qty:"1 / 1"},
{id:"kamm",cat:"Hygiene",name:"Kamm",img:img.spa,tags:["all"],qty:"1 / 1"},
{id:"rasierer",cat:"Hygiene",name:"Rasierer",img:img.spa,tags:["all"],qty:"1 / 1"},
{id:"deo",cat:"Hygiene",name:"Deo",img:img.spa,tags:["all"],qty:"1 / 1"},
{id:"handcreme",cat:"Hygiene",name:"Handcreme",img:img.spa,tags:["all","Winterurlaub"],qty:"1 / 1"},
{id:"lippenpflege",cat:"Hygiene",name:"Lippenpflege",img:img.spa,tags:["all","Berge","Meer"],qty:"1 / 1"},
{id:"taschentuecher",cat:"Hygiene",name:"Taschentücher",img:img.spa,tags:["all","Kinder"],qty:"1 / 3"},
{id:"toilettenpapier",cat:"Hygiene",name:"Toilettenpapier",img:img.spa,tags:["Camping","Dachzelt"],qty:"1 / 2"},
{id:"feuchttuecher",cat:"Hygiene",name:"Feuchttücher",img:img.spa,tags:["Camping","Kinder","Dachzelt"],qty:"1 / 2"},
{id:"handtuch",cat:"Hygiene",name:"Handtuch",img:img.spa,tags:["all","Camping","Wellness"],qty:"2 / 4"},
{id:"badetuch",cat:"Hygiene",name:"Badetuch",img:img.spa,tags:["Meer","Wellness","See"],qty:"1 / 2"},

{id:"sonnencreme",cat:"Gesundheit",name:"Sonnencreme",img:img.spa,tags:["Meer","Strandurlaub","Kinder","Wandern","See"],qty:"1 / 1"},
{id:"aftersun",cat:"Gesundheit",name:"After-Sun",img:img.spa,tags:["Meer","Strandurlaub","Sommer"],qty:"1 / 1"},
{id:"pflaster",cat:"Gesundheit",name:"Pflaster",img:img.bag,tags:["all","Kinder","Wandern"],qty:"1 / 1"},
{id:"verbandsset",cat:"Gesundheit",name:"Verbandsset",img:img.bag,tags:["all","Wandern","Radfahren"],qty:"1 / 1"},
{id:"schmerzmittel",cat:"Gesundheit",name:"Schmerzmittel",img:img.bag,tags:["all"],qty:"1 / 1"},
{id:"medikamente",cat:"Gesundheit",name:"Persönliche Medikamente",img:img.bag,tags:["all"],qty:"1 / 1"},
{id:"zeckenzange",cat:"Gesundheit",name:"Zeckenzange",img:img.bag,tags:["Wandern","Natur","Camping"],qty:"1 / 1"},
{id:"mueckenspray",cat:"Gesundheit",name:"Mückenspray",img:img.bag,tags:["Camping","See","Natur"],qty:"1 / 1"},
{id:"desinfektion",cat:"Gesundheit",name:"Desinfektionsmittel",img:img.bag,tags:["all"],qty:"1 / 1"},

{id:"smartphone",cat:"Technik",name:"Smartphone",img:img.tech,tags:["all"],qty:"1 / 1"},
{id:"ladekabel",cat:"Technik",name:"Ladekabel",img:img.tech,tags:["all"],qty:"2 / 4"},
{id:"powerbank",cat:"Technik",name:"Powerbank",img:img.tech,tags:["all","Camping","Wandern"],qty:"1 / 1"},
{id:"tablet",cat:"Technik",name:"Tablet",img:img.tech,tags:["Familienurlaub","Kinder","all"],qty:"0 / 1"},
{id:"kamera",cat:"Technik",name:"Kamera",img:img.tech,tags:["Natur","Berge","Meer","Galerie"],qty:"0 / 1"},
{id:"kopfhoerer",cat:"Technik",name:"Kopfhörer",img:img.tech,tags:["all"],qty:"1 / 1"},
{id:"usb_adapter",cat:"Technik",name:"USB-Adapter",img:img.tech,tags:["all"],qty:"1 / 2"},
{id:"stirnlampe",cat:"Technik",name:"Stirnlampe",img:img.tech,tags:["Camping","Dachzelt","Wandern"],qty:"1 / 2"},

{id:"dachzelt",cat:"Camping",name:"Dachzelt",img:img.tent,tags:["Dachzelt","Camping"],qty:"1 / 1"},
{id:"schlafsack",cat:"Camping",name:"Schlafsack",img:img.tent,tags:["Camping","Dachzelt"],qty:"2 / 2"},
{id:"kissen",cat:"Camping",name:"Kissen",img:img.tent,tags:["Camping","Dachzelt"],qty:"2 / 2"},
{id:"campingstuhl",cat:"Camping",name:"Campingstuhl",img:img.camp,tags:["Camping","Dachzelt"],qty:"2 / 2"},
{id:"campingtisch",cat:"Camping",name:"Campingtisch",img:img.camp,tags:["Camping","Dachzelt"],qty:"1 / 1"},
{id:"gaskocher",cat:"Camping",name:"Gaskocher",img:img.camp,tags:["Camping","Dachzelt"],qty:"1 / 1"},
{id:"gasflasche",cat:"Camping",name:"Gasflasche",img:img.camp,tags:["Camping","Dachzelt"],qty:"1 / 1"},
{id:"feuerzeug",cat:"Camping",name:"Feuerzeug",img:img.camp,tags:["Camping","Dachzelt"],qty:"1 / 2"},
{id:"kuehlbox",cat:"Camping",name:"Kühlbox",img:img.camp,tags:["Camping","Dachzelt","Roadtrip"],qty:"1 / 1"},
{id:"wasserkanister",cat:"Camping",name:"Wasserkanister",img:img.camp,tags:["Camping","Dachzelt"],qty:"1 / 1"},
{id:"geschirr",cat:"Camping",name:"Geschirr",img:img.camp,tags:["Camping","Dachzelt"],qty:"2 / 4"},
{id:"besteck",cat:"Camping",name:"Besteck",img:img.camp,tags:["Camping","Dachzelt"],qty:"2 / 4"},
{id:"grill",cat:"Camping",name:"Grill",img:img.camp,tags:["Camping","Dachzelt","gutes Essen"],qty:"0 / 1"},

{id:"fahrradhelm",cat:"Fahrrad",name:"Fahrradhelm",img:img.bike,tags:["Radfahren","Radurlaub"],qty:"1 / 2"},
{id:"radhandschuhe",cat:"Fahrrad",name:"Fahrradhandschuhe",img:img.bike,tags:["Radfahren","Radurlaub"],qty:"1 / 2"},
{id:"trinkflasche",cat:"Fahrrad",name:"Trinkflasche",img:img.bike,tags:["Radfahren","Wandern"],qty:"1 / 2"},
{id:"ersatzschlauch",cat:"Fahrrad",name:"Ersatzschlauch",img:img.bike,tags:["Radfahren"],qty:"1 / 2"},
{id:"luftpumpe",cat:"Fahrrad",name:"Luftpumpe",img:img.bike,tags:["Radfahren"],qty:"1 / 1"},
{id:"multitool",cat:"Fahrrad",name:"Multitool",img:img.bike,tags:["Radfahren","Camping"],qty:"1 / 1"},
{id:"fahrradschloss",cat:"Fahrrad",name:"Fahrradschloss",img:img.bike,tags:["Radfahren","Städtetrip"],qty:"1 / 1"},

{id:"badehose",cat:"Strand",name:"Badehose / Bikini",img:img.beach,tags:["Meer","Strandurlaub","See","Wellness"],qty:"1 / 2"},
{id:"strandtuch",cat:"Strand",name:"Strandtuch",img:img.beach,tags:["Meer","Strandurlaub","See"],qty:"1 / 2"},
{id:"sonnenschirm",cat:"Strand",name:"Sonnenschirm",img:img.beach,tags:["Meer","Strandurlaub","Kinder"],qty:"0 / 1"},
{id:"schnorchel",cat:"Strand",name:"Schnorchel",img:img.beach,tags:["Meer","Strandurlaub"],qty:"0 / 1"},
{id:"strandtasche",cat:"Strand",name:"Strandtasche",img:img.beach,tags:["Meer","Strandurlaub"],qty:"1 / 1"},

{id:"windeln",cat:"Kinder",name:"Windeln",img:img.kid,tags:["Kinder","Familienurlaub"],qty:"0 / 1"},
{id:"kuscheltier",cat:"Kinder",name:"Kuscheltier",img:img.kid,tags:["Kinder","Familienurlaub"],qty:"1 / 1"},
{id:"spielzeug",cat:"Kinder",name:"Spielzeug",img:img.kid,tags:["Kinder","Familienurlaub"],qty:"1 / 3"},
{id:"reisespiele",cat:"Kinder",name:"Reisespiele",img:img.kid,tags:["Kinder","Familienurlaub"],qty:"1 / 2"},
{id:"kinder_sonnencreme",cat:"Kinder",name:"Kinder-Sonnencreme",img:img.kid,tags:["Kinder","Meer","Strandurlaub"],qty:"1 / 1"}
];
const house=[["windows","Fenster schließen","▦"],["stove","Herd ausschalten","▣"],["water","Wasserhahn prüfen","♨"],["trash","Müll entsorgen","♲"],["pets","Haustiere versorgt","♧"],["lights","Licht aus","◌"],["doors","Türen abschließen","▣"],["mail","Post umleiten","✉"]];
function selected(){return suggestions.filter(s=>state.selected.includes(s.id))}
function score(s){let v=s.tags.filter(t=>state.interests.includes(t)).length*18;if(s.tags.includes(state.tripType))v+=28;if(s.km<=state.radius)v+=12;v+=(s.title.length+seed*11)%17;return v}
function nav(view){state.view=view;save();$$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$$(".view").forEach(v=>v.classList.toggle("hidden",v.id!==`view-${view}`));render();scrollTo({top:0,behavior:"smooth"})}
function render(){renderHome();renderBudget();renderResults();renderPlan();renderPack();renderHouse();renderDepart();renderGallery();renderTimeline();renderTours();}
function renderHome(){if(!$("#start"))return;$("#start").value=state.start;$("#radius").value=state.radius;$("#tripType").value=state.tripType;$("#budgetInput").value=state.budget;$("#persons").value=state.persons;$("#interestInput").value=state.interests.join(", ");$("#chips").innerHTML=interests.map(([n,i])=>`<button class="chip ${state.interests.includes(n)?"active":""}" data-chip="${n}"><span>${i}</span>${n}</button>`).join("");$$("[data-chip]").forEach(c=>c.onclick=()=>{let n=c.dataset.chip;state.interests=state.interests.includes(n)?state.interests.filter(x=>x!==n):[...state.interests,n];save();render();});}
function renderBudget(){
let sum=selected().reduce((a,b)=>a+b.price,0),rest=state.budget-sum;
["budgetInput","budgetInput2"].forEach(id=>{let e=$("#"+id);if(e && document.activeElement!==e)e.value=state.budget});
["persons","persons2"].forEach(id=>{let e=$("#"+id);if(e && document.activeElement!==e)e.value=state.persons});
["budgetTiles","budgetTiles2"].forEach(id=>{let e=$("#"+id);if(e)e.innerHTML=`<div class="tile"><span>Budget</span><b>${money(state.budget)}</b></div><div class="tile"><span>Ausgewählt</span><b>${money(sum)}</b></div><div class="tile"><span>Rest</span><b>${money(rest)}</b></div>`});
$("#stickyCount").textContent=state.selected.length+" Vorschläge ausgewählt";
$("#stickySum").textContent=money(sum);
if($("#budgetList"))$("#budgetList").innerHTML=selected().map(s=>`<div class="row"><div>💶</div><div><b>${s.title}</b><br><span class="muted">${s.km} km</span></div><b>${money(s.price)}</b></div>`).join("")||'<p class="muted">Noch keine Kosten ausgewählt.</p>';
}
function renderResults(){let arr=[...suggestions].sort((a,b)=>score(b)-score(a));let sort=$("#sort")?.value;if(sort==="Preis niedrig")arr.sort((a,b)=>a.price-b.price);if(sort==="Entfernung")arr.sort((a,b)=>a.km-b.km);$("#results").innerHTML=arr.map(s=>`<article class="suggest ${state.selected.includes(s.id)?"selected":""}" data-sug="${s.id}"><div class="photo" style="background-image:url('${s.img}')"></div><div class="match">${score(s)}% Match</div><div class="check">✓</div><div class="body"><h3>${s.title}</h3><p class="muted">${s.desc}</p><div class="tags">${s.tags.slice(0,5).map(t=>`<span class="tag">${t}</span>`).join("")}</div><div class="meta"><span>⭐ ${s.rating}</span><span>${s.km} km</span><b>${money(s.price)}</b></div><button class="detailBtn" data-detail="${s.id}">Details anzeigen</button></div></article>`).join("");$$("[data-sug]").forEach(c=>c.onclick=e=>{if(e.target.closest("[data-detail]"))return;toggleSug(c.dataset.sug)});$$("[data-detail]").forEach(b=>b.onclick=e=>{e.stopPropagation();showDetail(b.dataset.detail)})}
function toggleSug(id){state.selected=state.selected.includes(id)?state.selected.filter(x=>x!==id):[...state.selected,id];save();render();toast("Auswahl aktualisiert")}
function showDetail(id){let s=suggestions.find(x=>x.id===id);$("#detailContent").innerHTML=`<div class="detailView"><div class="detailImg" style="background-image:url('${s.img}')"></div><div class="detailPanel"><h2>${s.title}</h2><p class="muted">${s.desc}</p><div class="tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div><div class="budgetGrid"><div class="tile"><span>Match</span><b>${score(s)}%</b></div><div class="tile"><span>Entfernung</span><b>${s.km} km</b></div><div class="tile"><span>Kosten</span><b>${money(s.price)}</b></div></div><button class="btn primary" style="margin-top:14px" onclick="toggleSug('${s.id}')">${state.selected.includes(s.id)?"Entfernen":"Übernehmen"}</button></div></div><h2 style="margin-top:22px">Details & Vorschläge</h2><div class="detailView">${s.details.map(d=>`<div class="detailPanel"><h3>${d}</h3><p class="muted">Kann in Planung, Budget und Timeline übernommen werden.</p></div>`).join("")}</div>`;nav("infos")}
function renderPlan(){let sel=selected();$("#planList").innerHTML=sel.length?`<div class="timeline">${sel.flatMap((s,idx)=>s.timeline.map((t,i)=>`<div class="tl"><div><h3>Tag ${idx+i+1} – ${t}</h3><p class="muted">${s.title}</p></div><img src="${s.img}"></div>`)).join("")}</div>`:`<p class="muted">Noch keine Vorschläge ausgewählt.</p>`}
function relevantPack(){let active=[...state.interests,state.tripType,...selected().flatMap(s=>s.tags)];return pack.filter(p=>p.tags.includes("all")||p.tags.some(t=>active.includes(t))).concat(state.customPack.map((x,i)=>({id:"custom"+i,cat:"Eigene",name:x,img:img.bag,tags:["all"],qty:"1 / 1"})))}
function renderPack(){let items=relevantPack(),done=items.filter(i=>state.packDone[i.id]).length;if($("#packText"))$("#packText").textContent=`${done} / ${items.length}`;if($("#packFill"))$("#packFill").style.width=(items.length?done/items.length*100:0)+"%";let cats=[...new Set(items.map(i=>i.cat))];$("#packCats").innerHTML=cats.map(c=>{let l=items.filter(i=>i.cat===c),d=l.filter(i=>state.packDone[i.id]).length;return `<div class="packCat"><h3>${c}</h3><div class="bar"><div class="fill" style="width:${l.length?d/l.length*100:0}%"></div></div><p class="muted">${d} / ${l.length}</p></div>`}).join("");$("#products").innerHTML=items.map(p=>`<article class="product ${state.packDone[p.id]?"done":""}" data-pack="${p.id}"><div class="photo" style="background-image:url('${p.img}')"></div><div class="check">✓</div><div class="body"><h3>${p.name}</h3><p class="muted">${p.cat} · ${p.qty}</p></div></article>`).join("");$$("[data-pack]").forEach(p=>p.onclick=()=>{state.packDone[p.dataset.pack]=!state.packDone[p.dataset.pack];save();renderPack()})}
function renderHouse(){$("#houseList").innerHTML=house.map(([id,t,i])=>`<div class="row ${state.houseDone[id]?"done":""}" data-house="${id}"><div class="box">✓</div><div class="text"><b>${t}</b></div><div>${i}</div></div>`).join("");$$("[data-house]").forEach(r=>r.onclick=()=>{state.houseDone[r.dataset.house]=!state.houseDone[r.dataset.house];save();renderHouse()})}
function renderDepart(){["arrival","drive","buffer"].forEach(id=>{$("#"+id).value=state.alarm[id]});$("#depTime").textContent=state.alarm.departure;$("#wakeTime").textContent=state.alarm.wake}
function renderGallery(){let ar=[img.lake,img.tent,img.mount,img.camp,img.beach,img.bike,img.spa,img.city,img.kid];$("#gallery").innerHTML=ar.map(x=>`<img src="${x}">`).join("")}
function renderTimeline(){let sel=selected();$("#timelineFull").innerHTML=sel.length?`<div class="timeline">${sel.flatMap((s,idx)=>s.timeline.map((t,i)=>`<div class="tl"><div><h3>Tag ${idx+i+1}: ${t}</h3><p class="muted">${s.title}</p></div><img src="${s.img}"></div>`)).join("")}</div>`:`<p class="muted">Noch keine Timeline.</p>`}
function renderTours(){if(!$("#tourCards"))return;let tours=[{t:"Panorama-Radtour",d:"Leichte Tour mit Aussicht.",i:img.bike},{t:"Wanderroute Natur",d:"Ruhige Strecke mit Picknick.",i:img.mount},{t:"See-Runde",d:"Ideal für Tagesausflug und Familie.",i:img.lake}];$("#tourCards").innerHTML=tours.map(x=>`<article class="suggest"><div class="photo" style="background-image:url('${x.i}')"></div><div class="body"><h3>${x.t}</h3><p class="muted">${x.d}</p></div></article>`).join("")}
function bind(){$$("[data-view]").forEach(b=>b.onclick=()=>nav(b.dataset.view));$("#start").oninput=e=>{state.start=e.target.value;save()};$("#radius").onchange=e=>{state.radius=+e.target.value;save();render()};$("#tripType").onchange=e=>{state.tripType=e.target.value;save();render()};$("#budgetInput").oninput=e=>{state.budget=+e.target.value||0;save();renderBudget()};
if($("#budgetInput2"))$("#budgetInput2").oninput=e=>{state.budget=+e.target.value||0;save();renderBudget()};
$("#persons").oninput=e=>{state.persons=+e.target.value||1;save();renderBudget()};
if($("#persons2"))$("#persons2").oninput=e=>{state.persons=+e.target.value||1;save();renderBudget()};$("#sort").onchange=renderResults;$("#btnRefresh").onclick=()=>{seed++;renderResults();toast("Vorschläge neu sortiert")};$("#btnClear").onclick=()=>{state.selected=[];state.interests=[];save();render();toast("Auswahl geleert")};$("#addInterest").onclick=()=>{let v=$("#customInterest").value.trim();if(v&&!state.interests.includes(v)){state.interests.push(v);$("#customInterest").value="";save();render()}};$("#addPack").onclick=()=>{let v=$("#customPack").value.trim();if(v){state.customPack.push(v);$("#customPack").value="";save();renderPack()}};$("#btnLocation").onclick=()=>{if(!navigator.geolocation){toast("Standort nicht verfügbar");return}navigator.geolocation.getCurrentPosition(p=>$("#loc").textContent=`✅ Standort: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`,()=>toast("Standort nicht freigegeben"))};$("#saveAlarm").onclick=()=>{state.alarm.arrival=$("#arrival").value;state.alarm.drive=$("#drive").value;state.alarm.buffer=$("#buffer").value;save();toast("Wecker gespeichert")}}
document.addEventListener("DOMContentLoaded",()=>{bind();nav(state.view||"ziel")});
