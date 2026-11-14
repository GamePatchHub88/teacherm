const $=(s,e=document)=>e.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(u,m='GET',b){const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'حدث خطأ'),{status:r.status});return d}
document.documentElement.dataset.theme=localStorage.t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function theme(){const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=localStorage.t=t;$('#tg').innerHTML=svg(t==='dark'?'sun':'moon',18)}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2800)}
function nav(extra=''){$('#nav').innerHTML=`<nav><a class="logo" href="/">Teacher<b>M</b></a><div class="row">${extra}<button id="tg" class="sh-btn" onclick="theme()">${svg(document.documentElement.dataset.theme==='dark'?'sun':'moon',18)}</button></div></nav>`}
async function logout(){await api('/api/logout','POST');location='/'}

const SUBJECTS=[{k:'ar',n:'اللغة العربية',i:'📖'},{k:'math',n:'الرياضيات',i:'📐'},{k:'en',n:'اللغة الإنجليزية',i:'🔤'},{k:'sci',n:'العلوم',i:'🔬'},{k:'soc',n:'الدراسات الاجتماعية',i:'🌍'},{k:'isl',n:'المواد الشرعية',i:'🕌'}];
const subjOpts=sel=>SUBJECTS.map(x=>`<option ${x.n===sel?'selected':''}>${x.n}</option>`).join('');
function applySubject(n){const x=SUBJECTS.find(v=>v.n===n);if(x)document.documentElement.dataset.subject=x.k;else delete document.documentElement.dataset.subject;return x}

const DEF=(n,j)=>({greet:'بسم الله الرحمن الرحيم',title:'طلاب '+n,examTitle:'نتائج امتحان '+j,tagline:'مدرس '+j,
intro:`موقع ${n}، مدرس ${j}، لعرض أرقام جلوس الطلاب والاستعلام عن نتائج الامتحانات.`,searchHint:'اكتب اسمك أو جزءاً منه لمعرفة رقم جلوسك، أو اكتب رقم الجلوس مباشرة',
instructionsTitle:'تعليمات الامتحانات',instructions:'احضر بطاقتك وأدواتك قبل الامتحان بوقت كافٍ\nاقرأ الأسئلة جيداً قبل البدء في الإجابة\nالتزم الهدوء والانضباط داخل اللجنة',
footer:`جميع الحقوق محفوظة — ${n}، مدرس ${j}`,whatsapp:'',nameSearch:true,notFound:'لم نجد هذا الاسم، جرّب كتابة جزء منه فقط',
faq:[{q:'كيف أعرف رقم جلوسي؟',a:'اكتب اسمك أو جزءاً منه في خانة البحث وسيظهر رقم جلوسك بجوار اسمك.'},{q:'كيف أستعلم عن نتيجتي؟',a:'اختر الامتحان ثم اكتب رقم جلوسك وستظهر نتيجتك فوراً.'},{q:'ماذا أفعل إن لم أجد اسمي؟',a:'تأكد من كتابة الاسم بشكل صحيح أو جرّب جزءاً منه، وإن لم يظهر فتواصل مع المدرس.'}]});
const SITE=(n,j,s)=>({...DEF(n,j),...Object.fromEntries(Object.entries(s||{}).filter(([k,v])=>v!==''&&v!=null))});
function shell(brand,links,right=''){$('#nav').innerHTML=`<header class="sh-top"><div class="sh-in"><a class="sh-brand" href="#">${brand}</a><nav class="sh-nav">${links}</nav><div class="row">${right}<button id="tg" class="sh-btn" onclick="theme()">${svg(document.documentElement.dataset.theme==='dark'?'sun':'moon',18)}</button></div></div></header>`}
function splash(i,n,s){try{if(sessionStorage.sp)return;sessionStorage.sp=1}catch{}const d=document.createElement('div');d.className='sh-splash';d.innerHTML=`<div>${badge(i,44)}<h1>${esc(n)}</h1><p>${esc(s)}</p></div>`;document.body.appendChild(d);setTimeout(()=>d.remove(),1800)}

const IC={cap:'<path d="M22 10 12 5 2 10l10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
ar:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
math:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/>',
en:'<path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>',
sci:'<path d="M10 2v7.5L4.5 19a2 2 0 0 0 1.7 3h11.6a2 2 0 0 0 1.7-3L14 9.5V2M8.5 2h7M7 16h10"/>',
soc:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20"/>',
isl:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/><path d="M17 5l.6 1.6L19 7l-1.4.5L17 9l-.6-1.5L15 7l1.4-.4z"/>',
up:'<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
palette:'<circle cx="12" cy="12" r="10"/><path d="M8 10h.01M12 7h.01M16 10h.01M12 17a2 2 0 0 0 0-4"/>',
pen:'<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',lock:'<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
wa:'<path d="M21 12a9 9 0 0 1-13.4 7.8L3 21l1.3-4.4A9 9 0 1 1 21 12z"/>',
link:'<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
share:'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>'};
const svg=(k,s=22)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[k]||IC.cap}</svg>`;
const badge=(k,s=22)=>`<span class="ib">${svg(k,s)}</span>`;
function reveal(sel='.card,.ft,.st,.sc,.fd,.cta'){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});
 [...document.querySelectorAll(sel)].filter(e=>!e.classList.contains('rv')).forEach((e,i)=>{e.classList.add('rv');e.style.setProperty('--d',(i%4)*90+'ms');io.observe(e)})}

IC.star='<path d="m12 2 3 7h7l-5.5 4.5 2 7.5L12 17l-6.5 4 2-7.5L2 9h7z"/>';
const PNAME={exam:'امتحان واحد',month:'شهر',year:'سنة',lifetime:'مدى الحياة'};
const waLink=(n,t)=>'https://wa.me/'+n+'?text='+encodeURIComponent(t);
function planCard(p,cur,wa,extra=''){const pr=p.price?'<div class="price">'+p.price+' <small>'+esc(cur)+'</small></div>':'<div class="price" style="font-size:1.2rem">تواصل لمعرفة السعر</div>';
 const msg='مرحباً، أريد الاشتراك في "'+p.name+'"'+(p.price?' بسعر '+p.price+' '+cur:'')+'.'+extra;
 return '<div class="card plan">'+badge({exam:'pen',month:'sun',year:'cap',lifetime:'star'}[p.key]||'cap')+'<h3 style="margin:.3em 0">'+esc(p.name)+'</h3>'+pr+'<p class="mut" style="margin:0">'+esc(p.desc)+'</p><ul>'+(p.features||[]).map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul><a class="btn" target="_blank" rel="noopener" href="'+waLink(wa,msg)+'">'+svg('wa',16)+'اشترك عبر واتساب</a></div>'}
