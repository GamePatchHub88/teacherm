const $=(s,e=document)=>e.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function api(u,m='GET',b){const r=await fetch(u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined});
 const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'حدث خطأ'),{status:r.status});return d}
document.documentElement.dataset.theme=localStorage.t||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
function theme(){const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=localStorage.t=t;$('#tg').textContent=t==='dark'?'☀️':'🌙'}
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',2800)}
function nav(extra=''){$('#nav').innerHTML=`<nav><a class="logo" href="/">Teacher<b>M</b></a><div class="row">${extra}<button id="tg" class="btn ghost sm" onclick="theme()">${document.documentElement.dataset.theme==='dark'?'☀️':'🌙'}</button></div></nav>`}
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
function shell(brand,links,right=''){$('#nav').innerHTML=`<header class="sh-top"><div class="sh-in"><a class="sh-brand" href="#">${brand}</a><nav class="sh-nav">${links}</nav><div class="row">${right}<button id="tg" class="sh-btn" onclick="theme()">${document.documentElement.dataset.theme==='dark'?'☀️':'🌙'}</button></div></div></header>`}
function splash(i,n,s){try{if(sessionStorage.sp)return;sessionStorage.sp=1}catch{}const d=document.createElement('div');d.className='sh-splash';d.innerHTML=`<div><span>${i}</span><h1>${esc(n)}</h1><p>${esc(s)}</p></div>`;document.body.appendChild(d);setTimeout(()=>d.remove(),1800)}
