const $=(s,e=document)=>e.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(u,m='GET',b){const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'حدث خطأ'),{status:r.status});return d}
document.documentElement.dataset.theme=localStorage.t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function theme(){const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=localStorage.t=t;$('#tg').textContent=t==='dark'?'☀️':'🌙'}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2800)}
function nav(extra=''){$('#nav').innerHTML=`<nav><a class="logo" href="/">Teacher<b>M</b></a><div class="row">${extra}<button id="tg" class="btn ghost sm" onclick="theme()">${document.documentElement.dataset.theme==='dark'?'☀️':'🌙'}</button></div></nav>`}
async function logout(){await api('/api/logout','POST');location='/'}
