/* repuestos-arcade-pinball — lógica compartida de todas las páginas.
   Cada página declara <body data-page="..."> y este script arma encabezado, contenido, pie, galería y lista de consulta. */
(function(){
"use strict";
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const waLink = msg => "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
const coverOf = p => p.imgs.length ? IMG[p.imgs[0]] : VID.posters[p.poster];
const ICON_WA = '<svg viewBox="0 0 32 32" fill="currentColor"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.6.9-1.8.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.7 3.7 0 0 0-1.1 2.7 6.4 6.4 0 0 0 1.4 3.4 14.6 14.6 0 0 0 5.6 4.9c2 .8 2.8.9 3.8.7a3.2 3.2 0 0 0 2.1-1.5 2.6 2.6 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4z"/></svg>';
const page = document.body.dataset.page || "inicio";
const generalMsg = "Hola, vi el catálogo de " + BRAND + " y quiero hacer una consulta.";

/* ---------- lista de consulta (se conserva entre páginas) ---------- */
const store = {
  get(){ try{ return JSON.parse(localStorage.getItem("rap-lista")||"{}") }catch(e){ return {} } },
  set(v){ try{ localStorage.setItem("rap-lista", JSON.stringify(v)) }catch(e){} }
};
let list = store.get();

/* ---------- estructura común ---------- */
const menuItems = [{id:"inicio",href:"index.html",name:"Inicio"}]
  .concat(CATS.map(c=>({id:c.id,href:c.id+".html",name:c.name})))
  .concat([{id:"videos",href:"videos.html",name:"Videos"}]);

document.body.insertAdjacentHTML("afterbegin", `
<header class="top"><div class="wrap">
  <div class="top-in">
    <a class="logo" href="index.html" aria-label="${BRAND}, inicio">
      <span class="logo-mark" aria-hidden="true">RP</span>
      <span class="logo-txt">${BRAND}<small>Repuestos de arcade, flipper y retro</small></span>
    </a>
    <button class="icon-btn" id="listBtn" type="button" aria-label="Ver mi lista de consulta">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5h11M9 12h11M9 19h11"/><path d="m3 5 1.5 1.5L7 4M3 12l1.5 1.5L7 11M3 19l1.5 1.5L7 18"/></svg>
      <span class="hide-sm">Mi consulta</span><span class="badge" id="listCount" hidden>0</span>
    </button>
  </div>
  <nav class="menu" id="menu" aria-label="Secciones">${menuItems.map(m=>`<a href="${m.href}"${m.id===page?' aria-current="page"':""}>${m.name}</a>`).join("")}</nav>
</div></header>`);

document.body.insertAdjacentHTML("beforeend", `
<a class="fab" id="fab" href="#" target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${ICON_WA}</a>
<div class="lb" id="lb" role="dialog" aria-modal="true" aria-labelledby="lbTitle">
  <div class="lb-top"><span id="lbTitle"></span><button class="icon-btn" id="lbClose" type="button" aria-label="Cerrar">✕ Cerrar</button></div>
  <div class="lb-stage">
    <button class="lb-nav lb-prev" id="lbPrev" type="button" aria-label="Foto anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m15 18-6-6 6-6"/></svg></button>
    <img id="lbImg" alt="">
    <button class="lb-nav lb-next" id="lbNext" type="button" aria-label="Foto siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 18 6-6-6-6"/></svg></button>
  </div>
  <div class="lb-foot" id="lbFoot"></div>
</div>
<div class="drawer" id="drawer"><div class="drawer-bg" id="drBg"></div>
  <aside class="drawer-panel" aria-label="Mi lista de consulta">
    <div class="drawer-head"><span>Mi consulta</span><button class="icon-btn" id="drClose" type="button">✕</button></div>
    <div class="drawer-list" id="drList"></div>
    <div class="drawer-foot"><a class="btn btn-wa" id="drSend" href="#" target="_blank" rel="noopener">${ICON_WA}Enviar por WhatsApp</a></div>
  </aside>
</div>
<div class="toast" id="toast" role="status"></div>`);
$("#fab").href = waLink(generalMsg);

function toast(t){ const el=$("#toast"); el.textContent=t; el.classList.add("show"); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove("show"),1800); }

/* ---------- tarjeta de producto ---------- */
function card(p){
  const n=p.imgs.length, inList=!!list[p.id];
  const nav = n>1 ? `<button class="nav prev" type="button" data-step="-1" aria-label="Foto anterior"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m15 18-6-6 6-6"/></svg></button>
      <button class="nav next" type="button" data-step="1" aria-label="Foto siguiente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="m9 18 6-6-6-6"/></svg></button>
      <div class="dots">${p.imgs.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</div><span class="count">${n} fotos</span>` : "";
  const msg = `Hola, quiero consultar por: ${p.name} (${p.model}). ¿Está disponible?`;
  return `<article class="card${p.wide?" wide":""}" data-id="${p.id}" data-i="0">
    <div class="media">
      <img src="${coverOf(p)}" alt="${esc(p.name)}" loading="lazy" data-open>
      ${p.tag?`<span class="tag">${p.tag}</span>`:""}${nav}
    </div>
    <div class="body">
      <h3>${p.name}</h3>
      <div class="model">${p.model}</div>
      <p class="desc">${p.desc}</p>
      <ul class="specs">${p.specs.map(s=>`<li>${s}</li>`).join("")}${p.video?`<li><a href="videos.html">Ver video</a></li>`:""}</ul>
      <div class="ctas">
        <a class="btn btn-wa" href="${waLink(msg)}" target="_blank" rel="noopener">${ICON_WA}Consultar</a>
        <button class="btn btn-ghost add" type="button" data-add="${p.id}" aria-pressed="${inList}" aria-label="${inList?"Quitar de":"Agregar a"} mi consulta">${inList?"✓":"+"}</button>
      </div>
    </div>
  </article>`;
}
function step(art,d){
  const p=P.find(x=>x.id===art.dataset.id); const n=p.imgs.length;
  const i=((+art.dataset.i)+d+n)%n; art.dataset.i=i;
  art.querySelector(".media img").src=IMG[p.imgs[i]];
  art.querySelectorAll(".dots i").forEach((dot,k)=>dot.classList.toggle("on",k===i));
}
function bindCards(root){
  root.addEventListener("click",e=>{
    const st=e.target.closest("[data-step]"); if(st){ step(st.closest(".card"),+st.dataset.step); return; }
    const op=e.target.closest("[data-open]");
    if(op){ const art=op.closest(".card"); const p=P.find(x=>x.id===art.dataset.id);
      if(!p.imgs.length){ location.href="videos.html"; return; }
      openLB(p,+art.dataset.i); return; }
    const add=e.target.closest("[data-add]"); if(add) toggleList(add.dataset.add);
  });
  let sx=null;
  root.addEventListener("touchstart",e=>{ if(e.target.closest(".media")) sx=e.touches[0].clientX; },{passive:true});
  root.addEventListener("touchend",e=>{ const m=e.target.closest(".media"); if(sx===null||!m) return; const d=e.changedTouches[0].clientX-sx; const art=m.closest(".card");
    if(Math.abs(d)>45 && P.find(x=>x.id===art.dataset.id).imgs.length>1) step(art,d<0?1:-1); sx=null; });
}

/* ---------- páginas ---------- */
const main = $("#main");
const steps = `<section class="section"><div class="wrap">
  <div class="sec-head"><h2>Cómo comprar</h2></div>
  <div class="steps">
    <div class="step"><h3>Elegí</h3><p>Tocá “Consultar” en el producto, o sumá varios a tu lista con el botón +.</p></div>
    <div class="step"><h3>Escribinos</h3><p>Se abre WhatsApp con el mensaje armado. Te pasamos estado y disponibilidad.</p></div>
    <div class="step"><h3>Pagá</h3><p>Transferencia o efectivo.</p></div>
    <div class="step"><h3>Recibí</h3><p>Envíos a todo el país por correo o transporte.</p></div>
  </div></div></section>`;
const contact = `<section class="contact"><div class="wrap">
  <h2>¿Buscás una pieza puntual?</h2>
  <p>Si no la ves en el catálogo, preguntanos: tenemos más repuestos de arcade y flipper en depósito.</p>
  <div class="row"><a class="btn btn-wa" id="contactWa" href="${waLink(generalMsg)}" target="_blank" rel="noopener">${ICON_WA}${PHONE_TXT}</a></div>
  <div class="foot">${BRAND} · Argentina.<br>Las marcas y títulos mencionados pertenecen a sus respectivos dueños y se citan solo para identificar cada pieza.</div>
</div></section>`;

if(page==="inicio"){
  const total=P.length, marq=P.filter(p=>p.cat==="marquesinas").length, fotos=new Set(P.flatMap(p=>p.imgs)).size;
  const tiles = CATS.map(c=>{
    const items=P.filter(p=>p.cat===c.id); const first=items[0];
    return `<a class="tile" href="${c.id}.html"><div class="tile-img"><img src="${coverOf(first)}" alt="" loading="lazy"></div>
      <div class="tile-body"><h3>${c.name}</h3><p>${c.intro}</p><span class="n">${items.length} productos</span></div></a>`;
  }).join("") + `<a class="tile" href="videos.html"><div class="tile-img"><img src="${VID.posters[VIDEOS[0].src]}" alt="" loading="lazy"></div>
      <div class="tile-body"><h3>Videos</h3><p>Mirá el estado real de las piezas antes de consultar.</p><span class="n">${VIDEOS.length} videos</span></div></a>`;
  main.innerHTML = `
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <div class="kicker">PRESS START</div>
      <h1>${BRAND}</h1>
      <p class="lead">Repuestos de arcade y flipper: marquesinas originales, pistolas de luz, controles, monederos, bobinas, electrónica y coleccionables retro, con fotos reales de cada pieza.</p>
      <div class="hero-ctas">
        <a class="btn btn-wa" href="${waLink(generalMsg)}" target="_blank" rel="noopener">${ICON_WA}Consultar por WhatsApp</a>
        <a class="btn btn-alt" href="#secciones">Ver secciones</a>
      </div>
      <div class="hero-facts">
        <div><b>${total}</b>productos</div><div><b>${marq}</b>marquesinas</div><div><b>${fotos}</b>fotos reales</div><div><b>${VIDEOS.length}</b>videos</div>
      </div>
    </div>
    <div class="sign" aria-hidden="true"><div class="s1">INSERT COIN</div><div class="s2">${BRAND}</div><div class="s3">Arcade · Flipper · Retro</div></div>
  </div></section>
  <section class="section" id="secciones"><div class="wrap">
    <div class="sec-head"><h2>Secciones</h2><p>Cada sección tiene su propia página.</p></div>
    <div class="tiles">${tiles}</div>
  </div></section>${steps}${contact}`;
} else if(page==="videos"){
  main.innerHTML = `<div class="wrap">
    <div class="page-head"><div class="crumbs"><a href="index.html">INICIO</a> &gt; VIDEOS</div><h1>Videos</h1><p>Mirá el estado real de las piezas antes de consultar.</p></div>
    <div class="videos" style="margin:24px 0 10px">${VIDEOS.map(v=>`<div class="video"><video controls playsinline preload="none" poster="${VID.posters[v.src]}" src="${VID[v.src]}"></video><h3>${v.title}</h3><p>${v.text}</p></div>`).join("")}</div>
  </div>${contact}`;
} else {
  const c = CATS.find(x=>x.id===page);
  if(c){
    document.title = c.name + " — " + BRAND;
    main.innerHTML = `<div class="wrap">
      <div class="page-head"><div class="crumbs"><a href="index.html">INICIO</a> &gt; ${c.name.toUpperCase()}</div><h1>${c.name}</h1><p>${c.intro}</p></div>
      <div class="tools"><label class="search"><span class="sr">Buscar en ${esc(c.name)}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
        <input id="q" type="search" placeholder="Buscar en ${esc(c.name)}…" autocomplete="off"></label></div>
      <div class="grid${c.id==="marquesinas"?" marq":""}" id="grid"></div>
    </div>${contact}`;
    const render=()=>{
      const q=$("#q").value.trim().toLowerCase();
      const items=P.filter(p=>p.cat===c.id && (!q||(p.name+" "+p.model+" "+p.desc+" "+p.specs.join(" ")).toLowerCase().includes(q)));
      $("#grid").innerHTML = items.length ? items.map(card).join("") : `<div class="empty" style="grid-column:1/-1">No encontramos “${esc(q)}”. Escribinos por WhatsApp: puede que lo tengamos en depósito.</div>`;
    };
    $("#q").addEventListener("input",render); render(); bindCards($("#grid"));
  }
}

/* ---------- galería ampliada ---------- */
let lbP=null,lbI=0,lastFocus=null;
function openLB(p,i){ lbP=p; lbI=i; lastFocus=document.activeElement; $("#lb").classList.add("open"); showLB(); $("#lbClose").focus(); document.body.style.overflow="hidden"; }
function showLB(){ $("#lbImg").src=IMG[lbP.imgs[lbI]]; $("#lbImg").alt=lbP.name+" — foto "+(lbI+1); $("#lbTitle").textContent=lbP.name;
  $("#lbFoot").textContent=`${lbP.model} · Foto ${lbI+1} de ${lbP.imgs.length}`; const m=lbP.imgs.length>1; $("#lbPrev").hidden=!m; $("#lbNext").hidden=!m; }
function closeLB(){ $("#lb").classList.remove("open"); document.body.style.overflow=""; lastFocus&&lastFocus.focus(); }
$("#lbClose").addEventListener("click",closeLB);
$("#lbPrev").addEventListener("click",()=>{lbI=(lbI-1+lbP.imgs.length)%lbP.imgs.length;showLB()});
$("#lbNext").addEventListener("click",()=>{lbI=(lbI+1)%lbP.imgs.length;showLB()});
$("#lb").addEventListener("click",e=>{ if(e.target.id==="lb"||e.target.classList.contains("lb-stage")) closeLB(); });
let tx=null;
$("#lb").addEventListener("touchstart",e=>{tx=e.touches[0].clientX},{passive:true});
$("#lb").addEventListener("touchend",e=>{ if(tx===null||!lbP||lbP.imgs.length<2) return; const d=e.changedTouches[0].clientX-tx; if(Math.abs(d)>50){ d<0?$("#lbNext").click():$("#lbPrev").click(); } tx=null; });
addEventListener("keydown",e=>{
  if($("#lb").classList.contains("open")){ if(e.key==="Escape")closeLB(); if(e.key==="ArrowRight")$("#lbNext").click(); if(e.key==="ArrowLeft")$("#lbPrev").click(); }
  else if($("#drawer").classList.contains("open") && e.key==="Escape") closeDrawer();
});

/* ---------- lista de consulta ---------- */
function toggleList(id){
  const p=P.find(x=>x.id===id);
  if(list[id]){ delete list[id]; toast("Quitado de tu consulta"); } else { list[id]=1; toast("Agregado: "+p.name); }
  store.set(list); updateList();
  document.querySelectorAll(`[data-add="${id}"]`).forEach(b=>{ b.setAttribute("aria-pressed",!!list[id]); b.textContent=list[id]?"✓":"+"; });
}
function updateList(){
  const ids=Object.keys(list).filter(id=>P.find(p=>p.id===id));
  const b=$("#listCount"); b.textContent=ids.length; b.hidden=!ids.length;
  const dl=$("#drList");
  if(!ids.length){ dl.innerHTML=`<div class="empty">Tu lista está vacía. Tocá + en cualquier producto para consultar varios juntos.</div>`; $("#drSend").href=waLink(generalMsg); return; }
  dl.innerHTML=ids.map(id=>{ const p=P.find(x=>x.id===id);
    return `<div class="li"><img src="${coverOf(p)}" alt=""><div><b>${p.name}</b><span>${p.model}</span></div><button type="button" data-rm="${id}" aria-label="Quitar ${esc(p.name)}">✕</button></div>`; }).join("");
  const msg="Hola, quiero consultar disponibilidad de estos productos de "+BRAND+":\n\n"+
    ids.map(id=>{const p=P.find(x=>x.id===id);return `• ${p.name} (${p.model})`}).join("\n")+"\n\n¿Cómo coordinamos el envío?";
  $("#drSend").href=waLink(msg);
}
$("#drList").addEventListener("click",e=>{ const rm=e.target.closest("[data-rm]"); if(rm) toggleList(rm.dataset.rm); });
function openDrawer(){ $("#drawer").classList.add("open"); document.body.style.overflow="hidden"; $("#drClose").focus(); }
function closeDrawer(){ $("#drawer").classList.remove("open"); document.body.style.overflow=""; $("#listBtn").focus(); }
$("#listBtn").addEventListener("click",openDrawer);
$("#drClose").addEventListener("click",closeDrawer);
$("#drBg").addEventListener("click",closeDrawer);
updateList();

/* centra en el menú la sección actual */
const cur=document.querySelector('#menu [aria-current="page"]'), mn=$("#menu");
if(cur&&mn) mn.scrollLeft = cur.offsetLeft - (mn.clientWidth-cur.offsetWidth)/2;
})();
