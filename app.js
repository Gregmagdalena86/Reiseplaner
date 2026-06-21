
const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
const D=window.CREOVA_DATA, img=D.img;
const defaults={view:"ziel",start:"Marl",destination:"",radius:25000,tripType:"Urlaub",weatherPref:"Sonnig",budget:2000,persons:2,dateStart:"",dateEnd:"",interests:["Meer","Radfahren","Camping","gutes Essen"],selected:[],selectedPoi:[],packDone:{},customPack:[],houseDone:{},coords:{lat:51.647,lon:7.096},pois:[],weather:null,alarm:{arrival:"10:00",drive:"5 h 30 min",buffer:"30 min",wakeLead:"60 min",departure:"04:00",wake:"03:00"}};
let state=load(),seed=0,map,markers=[];
const suggestions=D.suggestions.map(s=>({...s,img:img[s.img]||s.img}));creovaLoadWeather(place);
const pack=D.packBase.trim().split("\n").map((x,i)=>{let [name,cat,tags,key]=x.split("|");return{id:"p"+i,name,cat,tags:tags.split(","),img:img[key]||img.bag,qty:"1 / 1"}});
const house=[["windows","Fenster schließen","▦"],["stove","Herd ausschalten","▣"],["water","Wasserhahn prüfen","♨"],["trash","Müll entsorgen","♲"],["pets","Haustiere versorgt","♧"],["lights","Licht aus","◌"],["doors","Türen abschließen","▣"],["mail","Post umleiten","✉"],["heater","Heizung prüfen","♨"],["plants","Pflanzen gießen","☘"],["fridge","Kühlschrank prüfen","▤"],["alarm","Alarmanlage aktivieren","⚑"]];
function load(){try{return {...defaults,...JSON.parse(localStorage.creova_ultimate_v5||"{}")}}catch(e){return {...defaults}}}
function save(){localStorage.creova_ultimate_v5=JSON.stringify(state)}
function money(n){return Number(n||0).toLocaleString("de-DE")+" €"}
function toast(m){let t=document.createElement("div");t.className="toast";t.textContent=m;document.body.appendChild(t);setTimeout(()=>t.remove(),2200)}
function selected(){return suggestions.filter(s=>state.selected.includes(s.id))}
function selectedPois(){return state.pois.filter(p=>state.selectedPoi.includes(p.id))}
function allChosen(){return [...selected(),...selectedPois()]}
function priceOf(o){return o.price||({restaurant:35,camping:45,hotel:110,activity:25}[o.kind]||50)}
function score(s){let v=s.tags.filter(t=>state.interests.includes(t)).length*18;if(s.tags.includes(state.tripType))v+=28;if(s.km<=state.radius/1000)v+=12;if(s.weather===state.weatherPref||state.weatherPref==="Egal")v+=15;v+=(s.title.length+seed*11)%17;return v}
function nav(view){state.view=view;save();$$("[data-view]").forEach(b=>b.classList.toggle("active",b.dataset.view===view));$$(".view").forEach(v=>v.classList.toggle("hidden",v.id!==`view-${view}`));render();if(view==="karte")setTimeout(initMap,100);scrollTo({top:0,behavior:"smooth"})}
function render(){renderHome();renderBudget();renderResults();renderPlan();renderPack();renderHouse();renderDepart();renderWeather();renderPois();renderMap();renderTimeline();renderTours();renderExport();}
function renderHome(){if(!$("#start"))return;$("#tripType").innerHTML=D.tripTypes.map(x=>`<option>${x}</option>`).join("");$("#start").value=state.start;$("#destination").value=state.destination;$("#radius").value=state.radius;$("#tripType").value=state.tripType;$("#weatherPref").value=state.weatherPref;$("#budgetInput").value=state.budget;$("#persons").value=state.persons;$("#dateStart").value=state.dateStart;$("#dateEnd").value=state.dateEnd;$("#chips").innerHTML=D.interests.map(([n,i])=>`<button class="chip ${state.interests.includes(n)?"active":""}" data-chip="${n}"><span>${i}</span>${n}</button>`).join("");$$("[data-chip]").forEach(c=>c.onclick=()=>{let n=c.dataset.chip;state.interests=state.interests.includes(n)?state.interests.filter(x=>x!==n):[...state.interests,n];save();render();});$("#weatherMini").innerHTML=state.weather?`<b>${state.weather.current.temperature_2m} °C</b><p class="muted">Live-Wetter am Ziel/Standort</p>`:`<b>Wetter bereit</b><p class="muted">Live-Daten laden für echte Wetterdaten.</p>`;$("#poiCount").textContent=state.pois.length;$("#offlineState").textContent=navigator.onLine?"online":"offline"}
function total(){return allChosen().reduce((a,b)=>a+priceOf(b),0)}
function renderBudget(){let sum=total(),rest=state.budget-sum,pp=state.persons?sum/state.persons:sum;["budgetInput","budgetInput2"].forEach(id=>{let e=$("#"+id);if(e&&document.activeElement!==e)e.value=state.budget});["persons","persons2"].forEach(id=>{let e=$("#"+id);if(e&&document.activeElement!==e)e.value=state.persons});["budgetTiles","budgetTiles2"].forEach(id=>{let e=$("#"+id);if(e)e.innerHTML=`<div class="tile"><span>Budget</span><b>${money(state.budget)}</b></div><div class="tile"><span>Ausgewählt</span><b>${money(sum)}</b></div><div class="tile"><span>Rest</span><b>${money(rest)}</b></div><div class="tile"><span>pro Person</span><b>${money(pp)}</b></div>`});$("#stickyCount").textContent=allChosen().length+" Vorschläge ausgewählt";$("#stickySum").textContent=money(sum);if($("#budgetList"))$("#budgetList").innerHTML=allChosen().map(s=>`<div class="row"><div>💶</div><div><b>${s.title||s.name}</b><br><span class="muted">${s.kind||s.cat||"Ziel"} ${s.km?("· "+s.km+" km"):""}</span></div><b>${money(priceOf(s))}</b></div>`).join("")||'<p class="muted">Noch keine Kosten ausgewählt.</p>';if($("#budgetBars")){let cats={Ziele:selected().reduce((a,b)=>a+priceOf(b),0),Restaurants:selectedPois().filter(p=>p.kind==="restaurant").reduce((a,b)=>a+priceOf(b),0),Camping:selectedPois().filter(p=>p.kind==="camping").reduce((a,b)=>a+priceOf(b),0),Hotels:selectedPois().filter(p=>p.kind==="hotel").reduce((a,b)=>a+priceOf(b),0)};$("#budgetBars").innerHTML=Object.entries(cats).map(([k,v])=>`<div class="budgetBar"><b>${k}: ${money(v)}</b><div class="bar"><div class="fill" style="width:${Math.min(100,state.budget?v/state.budget*100:0)}%"></div></div></div>`).join("")}}
function sortedSuggestions(){let arr=[...suggestions].sort((a,b)=>score(b)-score(a));let sort=$("#sort")?.value;if(sort==="Preis niedrig")arr.sort((a,b)=>a.price-b.price);if(sort==="Entfernung")arr.sort((a,b)=>a.km-b.km);if(sort==="Wetter passend")arr.sort((a,b)=>(b.weather===state.weatherPref)-(a.weather===state.weatherPref));return arr}
function renderResults(){let e=$("#results");if(!e)return;let cards=sortedSuggestions().map(s=>cardHtml(s,"suggest")).join("");let poiCards=state.pois.slice(0,12).map(p=>cardHtml(p,"poi")).join("");e.innerHTML=cards+poiCards;bindCards()}
function cardHtml(s,type){let id=type==="poi"?s.id:s.id;let selectedCls=(type==="poi"?state.selectedPoi.includes(id):state.selected.includes(id))?"selected":"";let photo=s.img||({restaurant:img.food,camping:img.camp,hotel:img.tent}[s.kind]||img.lake);let meta=s.kind?`${s.kind} · ${money(priceOf(s))}`:`⭐ ${s.rating} · ${s.km} km · ${money(s.price)}`;return `<article class="suggest ${selectedCls}" data-${type}="${id}"><div class="photo" style="background-image:url('${photo}')"></div><div class="match">${type==="poi"?"LIVE":score(s)+"% Match"}</div><div class="check">✓</div><div class="body"><h3>${s.title||s.name}</h3><p class="muted">${s.desc||s.address||"Echter Ort aus OpenStreetMap."}</p><div class="tags">${(s.tags||[s.kind||"Ort"]).slice(0,5).map(t=>`<span class="tag">${t}</span>`).join("")}</div><div class="meta"><span>${meta}</span></div><button class="detailBtn" data-detail="${type}:${id}">Details anzeigen</button></div></article>`}
function bindCards(){$$("[data-suggest]").forEach(c=>c.onclick=e=>{if(e.target.closest("[data-detail]"))return;toggleSug(c.dataset.suggest)});$$("[data-poi]").forEach(c=>c.onclick=e=>{if(e.target.closest("[data-detail]"))return;togglePoi(c.dataset.poi)});$$("[data-detail]").forEach(b=>b.onclick=e=>{e.stopPropagation();let [type,id]=b.dataset.detail.split(":"); type==="poi"?showPoi(id):showDetail(id)})}
function toggleSug(id){state.selected=state.selected.includes(id)?state.selected.filter(x=>x!==id):[...state.selected,id];save();render();toast("Auswahl aktualisiert")}
function togglePoi(id){state.selectedPoi=state.selectedPoi.includes(id)?state.selectedPoi.filter(x=>x!==id):[...state.selectedPoi,id];save();render();toast("Live-Ort aktualisiert")}
function showDetail(id){let s=suggestions.find(x=>x.id===id);let mini=[["Restaurant",img.food,"Passende Restaurants in der Nähe"],["Camping",img.camp,"Camping- und Dachzeltplätze"],["Aktivität",s.img,"Aktivitäten passend zum Ziel"],["Unterkunft",img.tent,"Hotels und Alternativen"]];$("#detailContent").innerHTML=`<div class="detailView"><div class="detailImg" style="background-image:url('${s.img}')"></div><div class="detailPanel"><h2>${s.title}</h2><p class="muted">${s.desc}</p><div class="tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join("")}</div><div class="budgetGrid"><div class="tile"><span>Match</span><b>${score(s)}%</b></div><div class="tile"><span>Entfernung</span><b>${s.km} km</b></div><div class="tile"><span>Kosten</span><b>${money(s.price)}</b></div><div class="tile"><span>Wetter</span><b>${s.weather}</b></div></div><button class="btn primary" style="margin-top:14px" onclick="toggleSug('${s.id}')">${state.selected.includes(s.id)?"Entfernen":"Übernehmen"}</button><button class="btn" style="margin-top:8px" onclick="openMaps('${encodeURIComponent(s.loc)}')">Karte öffnen</button></div></div><h2 style="margin-top:22px">Details & Vorschläge</h2><div class="miniGrid">${mini.map(m=>`<div class="infoMini"><img src="${m[1]}"><div><h3>${m[0]}</h3><p class="muted">${m[2]}</p><button class="btn" onclick="toggleSug('${s.id}')">Übernehmen</button></div></div>`).join("")}</div>`;nav("infos")}
function showPoi(id){let p=state.pois.find(x=>x.id===id);$("#detailContent").innerHTML=`<div class="detailView"><div class="detailImg" style="background-image:url('${p.img}')"></div><div class="detailPanel"><h2>${p.name}</h2><p class="muted">${p.address||"Echter Ort aus OpenStreetMap."}</p><div class="budgetGrid"><div class="tile"><span>Typ</span><b>${p.kind}</b></div><div class="tile"><span>Kosten</span><b>${money(priceOf(p))}</b></div><div class="tile"><span>Quelle</span><b>OSM</b></div><div class="tile"><span>Status</span><b>Live</b></div></div><button class="btn primary" style="margin-top:14px" onclick="togglePoi('${p.id}')">${state.selectedPoi.includes(p.id)?"Entfernen":"Übernehmen"}</button><button class="btn" style="margin-top:8px" onclick="openMaps('${p.lat},${p.lon}')">Karte öffnen</button></div></div>`;nav("infos")}
function openMaps(q){window.open("https://www.google.com/maps/search/?api=1&query="+q,"_blank")}
async function geocode(q){let res=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);let j=await res.json();if(j&&j[0])return{lat:+j[0].lat,lon:+j[0].lon,name:j[0].display_name};throw new Error("Ort nicht gefunden")}
async function loadLive(){try{let q=state.destination||state.start||"Marl";toast("Live-Daten werden geladen...");let g=await geocode(q);state.coords={lat:g.lat,lon:g.lon};$("#loc").textContent=`✅ Ziel/Standort: ${g.name}`;await Promise.all([loadWeatherData(),loadOverpass()]);save();render();toast("Live-Daten geladen")}catch(e){toast("Live-Daten nicht verfügbar, Fallback aktiv")}}
async function loadWeatherData(){let {lat,lon}=state.coords;let u=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;let r=await fetch(u);state.weather=await r.json()}
async function loadOverpass(){let {lat,lon}=state.coords,rad=+state.radius||25000;let query=`[out:json][timeout:20];(node["amenity"="restaurant"](around:${rad},${lat},${lon});node["tourism"="camp_site"](around:${rad},${lat},${lon});node["tourism"="hotel"](around:${rad},${lat},${lon});node["tourism"="guest_house"](around:${rad},${lat},${lon}););out 40;`;let r=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",body:query});let j=await r.json();state.pois=(j.elements||[]).map((e,i)=>{let tags=e.tags||{},kind=tags.amenity==="restaurant"?"restaurant":tags.tourism==="camp_site"?"camping":"hotel";return{id:"poi"+e.id,name:tags.name||({restaurant:"Restaurant",camping:"Campingplatz",hotel:"Unterkunft"}[kind]+" "+(i+1)),kind,lat:e.lat,lon:e.lon,address:[tags["addr:street"],tags["addr:housenumber"],tags["addr:city"]].filter(Boolean).join(" "),img:{restaurant:img.food,camping:img.camp,hotel:img.tent}[kind],tags:[kind==="restaurant"?"Restaurant":kind==="camping"?"Camping":"Hotel"],price:priceOf({kind})}})}
function initMap(){if(!window.L||!$("#map"))return;if(!map){map=L.map("map").setView([state.coords.lat,state.coords.lon],10);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map)}renderMapMarkers();setTimeout(()=>map.invalidateSize(),100)}
function renderMap(){if(state.view==="karte")setTimeout(initMap,100)}
function renderMapMarkers(){if(!map)return;markers.forEach(m=>m.remove());markers=[];let items=[...suggestions,...state.pois];items.forEach(o=>{if(o.lat&&o.lon){let m=L.marker([o.lat,o.lon]).addTo(map).bindPopup(`<b>${o.title||o.name}</b><br>${o.kind||o.cat||"Ziel"}<br>${money(priceOf(o))}`);markers.push(m)}});if(markers.length){let group=L.featureGroup(markers);try{map.fitBounds(group.getBounds().pad(.2))}catch(e){}}}
function renderWeather(){let p=$("#weatherPanel");if(!p)return;if(!state.weather){p.innerHTML='<p class="muted">Noch keine Wetterdaten geladen. Klicke auf „Wetter neu laden“.</p>';return}let d=state.weather.daily;p.innerHTML=d.time.map((day,i)=>`<div class="weatherDay"><h3>${new Date(day).toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit"})}</h3><b>${Math.round(d.temperature_2m_max[i])}°</b><span>min ${Math.round(d.temperature_2m_min[i])}°</span><span>Regen ${d.precipitation_probability_max[i]||0}%</span></div>`).join("")}
function renderPois(){let e=$("#poiList");if(!e)return;let f=$("#poiFilter").value;let arr=state.pois.filter(p=>f==="Alle"||p.kind==={"Restaurants":"restaurant","Camping":"camping","Hotels":"hotel"}[f]);e.innerHTML=arr.map(p=>cardHtml(p,"poi")).join("")||'<p class="muted">Noch keine Live-Orte geladen.</p>';bindCards()}
function renderPlan(){let sel=allChosen();$("#planList").innerHTML=sel.length?`<div class="timeline">${sel.flatMap((s,idx)=>[s.timeline? s.timeline[0] : "Besuch / Check-in"]).map((t,i)=>`<div class="tl"><div><h3>Tag ${i+1} – ${t}</h3><p class="muted">${sel[i].title||sel[i].name}</p></div><img src="${sel[i].img||img.lake}"></div>`).join("")}</div>`:`<p class="muted">Noch keine Vorschläge ausgewählt.</p>`}
function relevantPack(){let active=[...state.interests,state.tripType,...selected().flatMap(s=>s.tags),...selectedPois().map(p=>p.kind)];return pack.filter(p=>p.tags.includes("all")||p.tags.some(t=>active.includes(t))).concat(state.customPack.map((x,i)=>({id:"custom"+i,cat:"Eigene",name:x,img:img.bag,tags:["all"],qty:"1 / 1"})))}
function renderPack(){let items=relevantPack();let cats=[...new Set(items.map(i=>i.cat))];let filter=$("#packFilter")?.value||"Alle Kategorien";if($("#packFilter")){$("#packFilter").innerHTML='<option>Alle Kategorien</option>'+cats.map(c=>`<option>${c}</option>`).join("");$("#packFilter").value=filter}if(filter!=="Alle Kategorien")items=items.filter(i=>i.cat===filter);let all=relevantPack(),done=all.filter(i=>state.packDone[i.id]).length;if($("#packText"))$("#packText").textContent=`${done} / ${all.length}`;if($("#packFill"))$("#packFill").style.width=(all.length?done/all.length*100:0)+"%";$("#packCats").innerHTML=cats.map(c=>{let l=all.filter(i=>i.cat===c),d=l.filter(i=>state.packDone[i.id]).length;return `<div class="packCat"><h3>${c}</h3><div class="bar"><div class="fill" style="width:${l.length?d/l.length*100:0}%"></div></div><p class="muted">${d} / ${l.length}</p></div>`}).join("");$("#products").innerHTML=items.map(p=>`<article class="product ${state.packDone[p.id]?"done":""}" data-pack="${p.id}"><div class="photo" style="background-image:url('${p.img}')"></div><div class="check">✓</div><div class="body"><h3>${p.name}</h3><p class="muted">${p.cat} · ${p.qty}</p></div></article>`).join("");$$("[data-pack]").forEach(p=>p.onclick=()=>{state.packDone[p.dataset.pack]=!state.packDone[p.dataset.pack];save();renderPack()})}
function renderHouse(){$("#houseList").innerHTML=house.map(([id,t,i])=>`<div class="row ${state.houseDone[id]?"done":""}" data-house="${id}"><div class="box">✓</div><div class="text"><b>${t}</b></div><div>${i}</div></div>`).join("");$$("[data-house]").forEach(r=>r.onclick=()=>{state.houseDone[r.dataset.house]=!state.houseDone[r.dataset.house];save();renderHouse()})}
function parseTime(t){let m=String(t).match(/(\d{1,2}):(\d{2})/);return m?+m[1]*60+ +m[2]:600}function parseMins(t){let h=(String(t).match(/(\d+)\s*h/)||[])[1]||0;let m=(String(t).match(/(\d+)\s*min/)||[])[1]||0;return +h*60+ +m}function fmt(min){min=(min%1440+1440)%1440;return String(Math.floor(min/60)).padStart(2,"0")+":"+String(min%60).padStart(2,"0")}
function renderDepart(){["arrival","drive","buffer","wakeLead"].forEach(id=>{let e=$("#"+id); if(e)e.value=state.alarm[id]});let dep=parseTime(state.alarm.arrival)-parseMins(state.alarm.drive)-parseMins(state.alarm.buffer);let wake=dep-parseMins(state.alarm.wakeLead);state.alarm.departure=fmt(dep);state.alarm.wake=fmt(wake);$("#depTime").textContent=state.alarm.departure;$("#wakeTime").textContent=state.alarm.wake}
function renderTimeline(){let sel=allChosen();$("#timelineFull").innerHTML=sel.length?`<div class="timeline">${sel.map((s,i)=>`<div class="tl"><div><h3>Tag ${i+1}: ${s.timeline?s.timeline[0]:"Besuch / Aktivität"}</h3><p class="muted">${s.title||s.name}</p><button class="btn" onclick="toast('Verschieben ist vorbereitet')">verschieben</button></div><img src="${s.img||img.lake}"></div>`).join("")}</div>`:`<p class="muted">Noch keine Timeline.</p>`}
function renderTours(){let e=$("#tourCards");if(!e)return;let tours=[{t:"Panorama-Radtour",d:"Leichte Tour mit Aussicht.",i:img.bike},{t:"Wanderroute Natur",d:"Ruhige Strecke mit Picknick.",i:img.mount},{t:"See-Runde",d:"Ideal für Tagesausflug und Familie.",i:img.lake},{t:"Küstenroute",d:"Radfahren am Meer.",i:img.beach},{t:"Wald & Camping",d:"Kurze Naturtour mit Rast.",i:img.camp},{t:"Altstadt Spaziergang",d:"Kultur und gutes Essen.",i:img.city}];e.innerHTML=tours.map(x=>`<article class="suggest"><div class="photo" style="background-image:url('${x.i}')"></div><div class="body"><h3>${x.t}</h3><p class="muted">${x.d}</p></div></article>`).join("")}
function makeExport(){let sel=allChosen();let lines=["CREOVA Ultimate V5 Reiseplan","","Startort: "+state.start,"Ziel: "+(state.destination||"-"),"Zeitraum: "+(state.dateStart||"-")+" bis "+(state.dateEnd||"-"),"Budget: "+money(state.budget),"Personen: "+state.persons,"Interessen: "+state.interests.join(", "),"","Auswahl:"];sel.forEach(s=>lines.push("- "+(s.title||s.name)+" | "+money(priceOf(s))+" | "+(s.kind||s.cat||"Ziel")));lines.push("","Packliste offen:");relevantPack().filter(p=>!state.packDone[p.id]).forEach(p=>lines.push("- "+p.name+" ("+p.cat+")"));lines.push("","Hauscheck offen:");house.filter(h=>!state.houseDone[h[0]]).forEach(h=>lines.push("- "+h[1]));return lines.join("\n")}
function renderExport(){let e=$("#exportText");if(e)e.value=makeExport()}
function bind(){$$("[data-view]").forEach(b=>b.onclick=()=>nav(b.dataset.view));$("#tripType").innerHTML=D.tripTypes.map(x=>`<option>${x}</option>`).join("");$("#start").oninput=e=>{state.start=e.target.value;save()};$("#destination").oninput=e=>{state.destination=e.target.value;save()};$("#radius").onchange=e=>{state.radius=+e.target.value;save();render()};$("#tripType").onchange=e=>{state.tripType=e.target.value;save();render()};$("#weatherPref").onchange=e=>{state.weatherPref=e.target.value;save();render()};$("#dateStart").onchange=e=>{state.dateStart=e.target.value;save()};$("#dateEnd").onchange=e=>{state.dateEnd=e.target.value;save()};$("#budgetInput").oninput=e=>{state.budget=+e.target.value||0;save();renderBudget()};$("#budgetInput2").oninput=e=>{state.budget=+e.target.value||0;save();renderBudget()};$("#persons").oninput=e=>{state.persons=+e.target.value||1;save();renderBudget()};$("#persons2").oninput=e=>{state.persons=+e.target.value||1;save();renderBudget()};$("#sort").onchange=renderResults;$("#poiFilter").onchange=renderPois;$("#btnRefresh").onclick=()=>{seed++;renderResults();toast("Vorschläge neu sortiert")};$("#btnClear").onclick=()=>{state.selected=[];state.selectedPoi=[];state.interests=[];save();render();toast("Auswahl geleert")};$("#addInterest").onclick=()=>{let v=$("#customInterest").value.trim();if(v&&!state.interests.includes(v)){state.interests.push(v);$("#customInterest").value="";save();render()}};$("#addPack").onclick=()=>{let v=$("#customPack").value.trim();if(v){state.customPack.push(v);$("#customPack").value="";save();renderPack()}};$("#packFilter").onchange=renderPack;$("#btnLocation").onclick=()=>{navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>{state.coords={lat:p.coords.latitude,lon:p.coords.longitude};$("#loc").textContent=`✅ GPS: ${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`;save();render()},()=>toast("Standort nicht freigegeben")):toast("Standort nicht verfügbar")};$("#btnSearchLive").onclick=loadLive;$("#syncBtn").onclick=loadLive;$("#loadWeather").onclick=async()=>{try{await loadWeatherData();save();render();toast("Wetter geladen")}catch(e){toast("Wetter nicht erreichbar")}};$("#reloadMapData").onclick=loadLive;$("#fitMap").onclick=()=>{renderMapMarkers()};$("#saveAlarm").onclick=()=>{["arrival","drive","buffer","wakeLead"].forEach(id=>state.alarm[id]=$("#"+id).value);save();renderDepart();toast("Wecker gespeichert")};$("#rebalanceTimeline").onclick=()=>{toast("Timeline neu verteilt");renderTimeline()};$("#downloadPlan").onclick=()=>{let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([makeExport()],{type:"text/plain"}));a.download="creova-ultimate-v5-reiseplan.txt";a.click()};$("#resetAll").onclick=()=>{if(confirm("Alles löschen?")){localStorage.removeItem("creova_ultimate_v5");location.reload()}};$("#resetApp").onclick=()=>{if(confirm("App zurücksetzen?")){localStorage.removeItem("creova_ultimate_v5");location.reload()}}}
window.addEventListener("online",renderHome);window.addEventListener("offline",renderHome);
if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").then(()=>{}).catch(()=>{})}
document.addEventListener("DOMContentLoaded",()=>{bind();nav(state.view||"ziel")});
async function creovaLoadWeather(place) {

  if (!place || !place.lat || !place.lon) {

    console.warn("Keine Wetter-Koordinaten vorhanden:", place);

    return;

  }

  const url =

    "https://api.open-meteo.com/v1/forecast" +

    "?latitude=" + encodeURIComponent(place.lat) +

    "&longitude=" + encodeURIComponent(place.lon) +

    "&current=temperature_2m,weather_code,wind_speed_10m" +

    "&timezone=auto";

  try {

    const response = await fetch(url);

    if (!response.ok) {

      throw new Error("Open-Meteo Fehler: " + response.status);

    }

    const data = await response.json();

    const current = data.current;

    const temp = Math.round(current.temperature_2m);

    const wind = Math.round(current.wind_speed_10m);

    const text = creovaWeatherCodeText(current.weather_code);

    const weatherText =

      temp + " °C · " + text + " · " + wind + " km/h Wind";

    // Variante 1: Wenn es ein Wetter-Feld gibt

    const weatherEl =

      document.querySelector("#weather") ||

      document.querySelector("#weatherText") ||

      document.querySelector("#weather-text") ||

      document.querySelector("[data-weather]");

    if (weatherEl) {

      weatherEl.textContent = weatherText;

      return;

    }

    // Variante 2: Wetterkarte automatisch in Detailansicht einsetzen

    const detailBox =

      document.querySelector("#detail") ||

      document.querySelector("#details") ||

      document.querySelector(".detail") ||

      document.querySelector(".details") ||

      document.querySelector(".screen.active");

    if (detailBox) {

      let card = document.querySelector("#creovaWeatherCard");

      if (!card) {

        card = document.createElement("div");

        card.id = "creovaWeatherCard";

        card.className = "card weather-card";

        card.innerHTML = `

          <h3>Aktuelles Wetter</h3>

          <div id="creovaWeatherTemp"></div>

          <div id="creovaWeatherDesc"></div>

          <div id="creovaWeatherWind"></div>

        `;

        detailBox.prepend(card);

      }

      document.querySelector("#creovaWeatherTemp").textContent = temp + " °C";

      document.querySelector("#creovaWeatherDesc").textContent = text;

      document.querySelector("#creovaWeatherWind").textContent = wind + " km/h Wind";

    }

  } catch (error) {

    console.error("Wetter konnte nicht geladen werden:", error);

  }

}

function creovaWeatherCodeText(code) {

  const codes = {

    0: "Klarer Himmel",

    1: "Überwiegend klar",

    2: "Teilweise bewölkt",

    3: "Bewölkt",

    45: "Nebel",

    48: "Reifnebel",

    51: "Leichter Nieselregen",

    53: "Nieselregen",

    55: "Starker Nieselregen",

    61: "Leichter Regen",

    63: "Regen",

    65: "Starker Regen",

    71: "Leichter Schnee",

    73: "Schnee",

    75: "Starker Schnee",

    80: "Leichte Regenschauer",

    81: "Regenschauer",

    82: "Starke Regenschauer",

    95: "Gewitter"

  };

  return codes[code] || "Unbekannte Wetterlage";

}
