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
/* رموز كل مادة: تظهر عائمة في الواجهة العلوية وفي الفوتر وفي بطاقات المواد (ليست ألواناً فقط) */
const SYM={ar:['أ','ب','ج','ض','ق','ع','ح','ظ','ء','ط'],math:['∑','π','√','∞','÷','×','%','∫','±','x²'],en:['A','Z','&','?','Abc','“ ”','!','Aa','ABC','Q'],sci:['⚛','H₂O','Δ','λ','E=mc²','O₂','μ','β','CO₂','Ω'],soc:['◎','N','✦','⌖','◈','⟡','E','W','S','◉'],isl:['☪','۞','✦','﴾','﴿','☽','۩','✺','★','۞']};
function symfx(k){const a=SYM[k];if(!a)return'';const P=[[4,16],[13,68],[23,30],[36,76],[50,12],[61,66],[73,28],[85,72],[92,14],[47,46]];
 return '<div class="symfx" aria-hidden="true">'+P.map((q,i)=>'<span style="inset-inline-start:'+q[0]+'%;top:'+q[1]+'%;animation-delay:'+(-i*.9)+'s;font-size:'+(1.2+((i*7)%5)*.32)+'rem">'+a[i%a.length]+'</span>').join('')+'</div>'}
function decorate(){const h=document.querySelector('.hero');if(!h)return;const o=h.querySelector('.symfx');if(o)o.remove();h.insertAdjacentHTML('afterbegin',symfx(document.documentElement.dataset.subject))}
function applySubject(n){const x=SUBJECTS.find(v=>v.n===n);if(x)document.documentElement.dataset.subject=x.k;else delete document.documentElement.dataset.subject;decorate();return x}

const DEF=(n,j)=>({greet:'بسم الله الرحمن الرحيم',title:'طلاب '+n,examTitle:'نتائج امتحان '+j,tagline:'مدرس '+j,
intro:`موقع ${n}، مدرس ${j}، لعرض أرقام جلوس الطلاب والاستعلام عن نتائج الامتحانات.`,searchHint:'اكتب اسمك أو جزءاً منه لمعرفة رقم جلوسك، أو اكتب رقم الجلوس مباشرة',
instructionsTitle:'تعليمات الامتحانات',instructions:'احضر بطاقتك وأدواتك قبل الامتحان بوقت كافٍ\nاقرأ الأسئلة جيداً قبل البدء في الإجابة\nالتزم الهدوء والانضباط داخل اللجنة',
footer:`جميع الحقوق محفوظة — ${n}، مدرس ${j}`,whatsapp:'',nameSearch:true,notFound:'لم نجد هذا الاسم، جرّب كتابة جزء منه فقط',
faq:[{q:'كيف أعرف رقم جلوسي؟',a:'اكتب اسمك أو جزءاً منه في خانة البحث وسيظهر رقم جلوسك بجوار اسمك.'},{q:'كيف أستعلم عن نتيجتي؟',a:'اختر الامتحان ثم اكتب رقم جلوسك وستظهر نتيجتك فوراً.'},{q:'ماذا أفعل إن لم أجد اسمي؟',a:'تأكد من كتابة الاسم بشكل صحيح أو جرّب جزءاً منه، وإن لم يظهر فتواصل مع المدرس.'}]});
const SITE=(n,j,s)=>({...DEF(n,j),...Object.fromEntries(Object.entries(s||{}).filter(([k,v])=>v!==''&&v!=null))});
function shell(brand,links,right='',home='/'){$('#nav').innerHTML=`<header class="topbar"><div class="topin"><a class="brand" href="${home}">${brand}</a><nav class="mainnav" aria-label="التنقل الرئيسي">${links}</nav><div class="tools">${right}<button id="tg" class="hbtn" onclick="theme()" aria-label="تبديل الثيم">${svg(document.documentElement.dataset.theme==='dark'?'sun':'moon',18)}</button><button class="hbtn burger" onclick="mm()" aria-label="فتح القائمة" aria-expanded="false">${svg('menu',20)}</button></div></div><nav class="mobmenu" id="mobmenu" aria-label="القائمة">${links}</nav></header>`;$('#mobmenu').onclick=e=>{if(e.target.closest('a,button'))mm(0)}}
function mm(v){const m=$('#mobmenu');if(!m)return;const o=v===undefined?!m.classList.contains('open'):!!v;m.classList.toggle('open',o);const b=$('.burger');if(b)b.setAttribute('aria-expanded',o)}
function splash(i,n,s,b='بسم الله الرحمن الرحيم'){try{if(sessionStorage.sp)return;sessionStorage.sp=1}catch{}const d=document.createElement('div');d.className='splash';d.setAttribute('aria-hidden','true');
d.innerHTML=`<div class="sp-core"><div class="sp-emblem"><svg viewBox="0 0 200 200" fill="none"><circle class="sp-ring" cx="100" cy="100" r="92" pathLength="1"/><rect class="sp-sq" x="48" y="48" width="104" height="104" rx="4" pathLength="1"/><rect class="sp-sq b" x="48" y="48" width="104" height="104" rx="4" pathLength="1" transform="rotate(45 100 100)"/><g transform="translate(59 59) scale(3.4)" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${IC[i]||IC.cap}</g></svg></div>${b?`<div class="sp-bism">${esc(b)}</div>`:''}<h1 class="sp-name">${esc(n)}</h1><div class="sp-sub">${esc(s)}</div></div><div class="sp-bar"><b></b></div>`;document.body.appendChild(d);setTimeout(()=>d.remove(),2000)}

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
function reveal(sel='.card,.ft,.st,.sc,.fd,.cta,.cta2,h2.c,.sec-sub,.mq,.gchip'){if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.1});
 [...document.querySelectorAll(sel)].filter(e=>!e.classList.contains('rv')).forEach((e,i)=>{e.classList.add('rv');if(e.dataset.rv)e.classList.add('rv-'+e.dataset.rv);e.style.setProperty('--d',(i%4)*90+'ms');io.observe(e)})}

IC.star='<path d="m12 2 3 7h7l-5.5 4.5 2 7.5L12 17l-6.5 4 2-7.5L2 9h7z"/>';
Object.assign(IC,{menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',shield:'<path d="M12 3l8 3v6c0 4.5-3.2 7.9-8 9-4.8-1.1-8-4.5-8-9V6l8-3z"/><path d="M9.5 12l1.8 1.8 3.2-3.6"/>',plus:'<path d="M12 5v14M5 12h14"/>',useradd:'<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6M16 11h6"/>',trash:'<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',dl:'<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>',help:'<circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4M12 17h.01"/>',clip:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',phone:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',chart:'<path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3"/>',award:'<circle cx="12" cy="8" r="6"/><path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1"/>',print:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',check:'<path d="M20 6 9 17l-5-5"/>'});
const PNAME={exam:'امتحان واحد',month:'شهر',year:'سنة',lifetime:'مدى الحياة'},PER={exam:'للامتحان',month:'/ شهر',year:'/ سنة',lifetime:'دفعة واحدة'};
const waLink=(n,t)=>'https://wa.me/'+n+'?text='+encodeURIComponent(t);
const PICON={exam:'clip',month:'cal',year:'award',lifetime:'crown'},PTAG={exam:'تجربة سريعة',month:'مرونة كاملة',year:'الأوفر سعراً',lifetime:'دفعة واحدة'};
function planCard(p,cur,wa,extra='',hot=false,o={}){const k=p.key,
 pr=p.price?'<div class="price"><b>'+p.price+'</b><small>'+esc(cur)+' <i>'+(PER[k]||'')+'</i></small></div>':'<div class="price ask">تواصل لمعرفة السعر</div>',
 msg='مرحباً، أريد الاشتراك في "'+p.name+'"'+(p.price?' بسعر '+p.price+' '+cur:'')+'.'+extra,
 rb=o.mine?'<span class="ribbon mine">'+svg('check',13)+' باقتك الحالية</span>':hot?'<span class="ribbon">'+svg('star',13)+' الأكثر طلباً</span>':'';
 return '<article class="card plan p-'+k+(hot?' hot':'')+(o.mine?' mine':'')+'" data-plan="'+k+'">'+rb+'<div class="ph">'+badge(PICON[k]||'cap',24)+'<div><h3>'+esc(p.name)+'</h3><span class="pk">'+(PTAG[k]||'')+'</span></div></div>'+pr+
 (o.save?'<div class="save">'+svg('bolt',14)+' وفّر '+o.save+'%'+(o.perMonth?' • ≈ '+o.perMonth+' '+esc(cur)+' / شهر':'')+'</div>':'')+
 '<p class="mut pd">'+esc(p.desc)+'</p><ul>'+(p.features||[]).map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul><a class="btn" target="_blank" rel="noopener" href="'+waLink(wa,msg)+'">'+svg('wa',16)+(o.mine?'تجديد / ترقية عبر واتساب':'اشترك عبر واتساب')+'</a></article>'}
/* كل الباقات: يحسب نسبة التوفير للسنة مقارنة بالشهر، ويميّز باقة المدرس الحالية */
function plansHTML(d,o={}){const by=Object.fromEntries(d.plans.map(p=>[p.key,p])),m=by.month&&by.month.price,y=by.year&&by.year.price,
 save=m&&y&&m*12>y?Math.round((1-y/(m*12))*100):0;
 return d.plans.map(p=>planCard(p,d.currency,d.whatsapp,o.extra||'',p.key===(o.hot||'year'),{mine:o.mine===p.key,save:p.key==='year'?save:0,perMonth:p.key==='year'&&y?Math.round(y/12):0})).join('')}
const faqHTML=l=>l.map((f,i)=>'<details class="sx-q"><summary><span class="sx-qn" aria-hidden="true">'+(i+1)+'</span><span class="sx-qt">'+esc(f.q)+'</span></summary><p>'+esc(f.a)+'</p></details>').join('');
const fmtWa=n=>'+'+String(n).replace(/^(20)(\d{2})(\d+)$/,'$1 $2 $3');
function foot(o){const k=document.documentElement.dataset.subject,L=(o.links||[]).map(l=>'<a href="'+l[0]+'">'+esc(l[1])+'</a>').join('');
 return '<div class="foot-orn" aria-hidden="true"></div><div class="foot-in"><div class="foot-top"><div class="foot-brand">'+badge(o.icon||k||'cap',26)+'<div><div class="foot-title">'+esc(o.title)+'</div>'+(o.sub?'<div class="foot-sub">'+esc(o.sub)+'</div>':'')+'</div></div>'+
 (o.wa?'<a class="wa" href="https://wa.me/'+esc(o.wa)+'" target="_blank" rel="noopener noreferrer">'+svg('wa',22)+'<span>'+esc(o.waText||'تواصل عبر واتساب')+'</span><bdi dir="ltr" class="wa-num">'+esc(fmtWa(o.wa))+'</bdi></a>':'')+'</div>'+
 (L?'<nav class="foot-links" aria-label="روابط الموقع">'+L+'</nav>':'')+
 '<div class="foot-bot"><div class="foot-copy">© '+new Date().getFullYear()+' '+esc(o.copy||'')+'</div><div class="foot-dev"><span>تطوير</span><a href="https://mohamedahmedhelmi.vercel.app/" target="_blank" rel="noopener noreferrer">محمد أحمد حلمي</a></div>'+
 '<button class="totop" type="button" onclick="scrollTo({top:0,behavior:\'smooth\'})" aria-label="العودة للأعلى" title="العودة للأعلى">'+svg('top',18)+'</button></div></div>'}

Object.assign(IC,{cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',crown:'<path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z"/><path d="M5 22h14"/>',top:'<path d="M12 19V5M5 12l7-7 7 7"/>',dash:'<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>'});
Object.assign(IC,{users:'<circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0M17 4a4 4 0 0 1 0 8M23 21a8 8 0 0 0-5-7.4"/>',bolt:'<path d="M13 2 3 14h8l-1 8 10-12h-8z"/>'});

/* ===== ألوان المنصة / ألوان موقع المدرس =====
   scope g = ألوان المدير للمنصة (الرئيسية/الدخول/الإدارة) — لا تغيّر ثيم المادة
   scope t = لون خاص بموقع المدرس (يتفوق على ثيم المادة) */
const PAL={green:{n:'أخضر',pri:'#0f766e',acc:'#d9a21b'},red:{n:'أحمر',pri:'#b91c1c',acc:'#d9a21b'},both:{n:'أخضر + أحمر',pri:'#0f766e',acc:'#dc2626'}};
const TPAL=[PAL.green,PAL.red,PAL.both,{n:'أزرق',pri:'#1d4ed8',acc:'#ea580c'},{n:'بنفسجي',pri:'#6d28d9',acc:'#db2777'},{n:'برتقالي',pri:'#c2410c',acc:'#0f766e'},{n:'كحلي وذهبي',pri:'#1e3a8a',acc:'#d9a21b'},{n:'وردي',pri:'#be123c',acc:'#0891b2'},{n:'أسود وذهبي',pri:'#27272a',acc:'#d9a21b'}];
const HEXR=/^#[0-9a-f]{6}$/i,lt=(h,p)=>{const n=parseInt(h.slice(1),16);return '#'+[n>>16&255,n>>8&255,n&255].map(v=>Math.round(v*p+255*(1-p)).toString(16).padStart(2,'0')).join('')};
function applyColors(c,scope='g'){const g=scope==='g',at=g?'data-g':'data-tc',id='cp-'+scope,R=document.documentElement;let st=document.getElementById(id);
 const ok=c&&HEXR.test(c.pri||'')&&HEXR.test(c.acc||'');
 if(!ok||(g&&c.pri.toLowerCase()==='#0f766e'&&c.acc.toLowerCase()==='#d9a21b')){if(st)st.remove();R.removeAttribute(at);return}
 if(!st){st=document.createElement('style');st.id=id;document.head.appendChild(st)}R.setAttribute(at,'');
 const sel='html['+at+']['+at+']'+(g?':not([data-subject])':''),P=c.pri,A=c.acc;
 st.textContent=sel+'{--pri:'+P+';--acc:'+A+';'+(g?'--bg:color-mix(in srgb,var(--pri) 7%,#fbf9f3);--card:color-mix(in srgb,var(--pri) 2%,#fff);--line:color-mix(in srgb,var(--pri) 18%,#e8e4da);--mut:color-mix(in srgb,var(--pri) 25%,#5f6b68);--ink:color-mix(in srgb,var(--pri) 14%,#0b1110)':'')+'}'+
 sel+'[data-theme=dark]{--pri:'+lt(P,.62)+';--acc:'+lt(A,.72)+';'+(g?'--bg:color-mix(in srgb,var(--pri) 10%,#090d0d);--card:color-mix(in srgb,var(--pri) 14%,#0c1111);--line:color-mix(in srgb,var(--pri) 26%,#141a1a);--mut:#9fb0ac;--ink:#e9f3f0':'')+'}';
 if(g){const m=document.querySelector('meta[name=theme-color]');if(m)m.content=P}}
if(!/^\/(t\/|dashboard)/.test(location.pathname)){try{const c=JSON.parse(localStorage.cg||'null');if(c)applyColors(c,'g')}catch{}
 api('/api/theme').then(t=>{try{localStorage.cg=JSON.stringify(t)}catch{}applyColors(t,'g')}).catch(()=>{})}

/* ===== حركة عامة: شريط التقدم، شريط علوي، تموّج الأزرار، إضاءة تتبع المؤشر ===== */
(function(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 const pr=document.createElement('div');pr.className='sp-prog';pr.setAttribute('aria-hidden','true');document.body.appendChild(pr);let tk=0;
 const upd=()=>{tk=0;const h=document.documentElement.scrollHeight-innerHeight;pr.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';const t=document.querySelector('.topbar');if(t)t.classList.toggle('sc',scrollY>10)};
 addEventListener('scroll',()=>{if(!tk)tk=requestAnimationFrame(upd)},{passive:true});upd();
 document.addEventListener('pointerdown',e=>{const b=e.target.closest('.btn');if(!b)return;const r=b.getBoundingClientRect(),d=Math.max(r.width,r.height)*2,s=document.createElement('span');s.className='rp';s.style.cssText='width:'+d+'px;height:'+d+'px;left:'+(e.clientX-r.left-d/2)+'px;top:'+(e.clientY-r.top-d/2)+'px';b.appendChild(s);setTimeout(()=>s.remove(),650)});
 document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.ft,.sc,.plan,.cta2,.gchip');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
})();
