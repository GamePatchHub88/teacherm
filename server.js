require('dotenv').config();
const express=require('express'),mongoose=require('mongoose'),bcrypt=require('bcryptjs'),jwt=require('jsonwebtoken'),
cookie=require('cookie-parser'),rate=require('express-rate-limit'),helmet=require('helmet'),path=require('path');
const app=express();app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:false}),express.json({limit:'8mb'}),cookie());
let conn;
function db(){return conn||(conn=(async()=>{
 if(!/^mongodb/.test(process.env.MONGODB_URI||''))throw new Error('MONGODB_URI missing');
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000});
 const{ADMIN_EMAIL:e,ADMIN_PASSWORD:p}=process.env;
 if(e&&p&&!await User.findOne({role:'admin'}))await User.create({name:'مدير المنصة',email:e,password:await bcrypt.hash(p,10),role:'admin'});

 if(!await Plan.countDocuments())await Plan.insertMany([['exam','باقة امتحان واحد','نشر نتائج امتحان واحد',['امتحان واحد','رفع ملف Excel','رابط خاص بك']],['month','باقة شهر','اشتراك لمدة 30 يوماً',['امتحانات غير محدودة','رفع ملف Excel','تعديل نصوص الموقع']],['year','باقة سنة','اشتراك لمدة 365 يوماً',['امتحانات غير محدودة','رفع ملف Excel','تعديل نصوص الموقع','أفضل قيمة']],['lifetime','باقة مدى الحياة','اشتراك مفتوح بلا تجديد',['امتحانات غير محدودة','بدون تجديد أبداً','أولوية في الدعم']]].map((x,i)=>({key:x[0],name:x[1],desc:x[2],features:x[3],order:i,price:null})));
})().catch(x=>{conn=null;throw x}))}
app.use('/api',(q,s,n)=>db().then(()=>n()).catch(x=>{console.error(x);s.status(500).json({error:/missing/.test(x.message)?'متغير MONGODB_URI غير مضبوط في Vercel':/ServerSelection/.test(x.name)?'تعذر الوصول لقاعدة البيانات: فعّل 0.0.0.0/0 في Atlas Network Access':/auth/i.test(x.message)?'كلمة مرور قاعدة البيانات غير صحيحة':'خطأ اتصال: '+x.name})}));
const P=f=>(q,s)=>s.sendFile(path.join(__dirname,'public',f));
const S=mongoose.Schema,T=mongoose.Types.ObjectId;
const User=mongoose.model('User',new S({name:String,subject:String,phone:String,email:{type:String,unique:true,lowercase:true},
 password:String,slug:{type:String,unique:true,sparse:true},role:{type:String,default:'teacher'},site:S.Types.Mixed,plan:S.Types.Mixed,active:{type:Boolean,default:true}},{timestamps:true}));
const Plan=mongoose.model('Plan',new S({key:{type:String,unique:true},name:String,price:Number,desc:String,features:[String],active:{type:Boolean,default:true},order:Number}));
const Setting=mongoose.model('Setting',new S({k:{type:String,unique:true},v:S.Types.Mixed}));
const getS=async()=>{const o={whatsapp:'201110742678',currency:'ج.م',enforce:false};(await Setting.find().lean()).forEach(x=>o[x.k]=x.v);return o};
const planOk=u=>{const p=u&&u.plan;if(!p||!p.type)return false;if(p.type==='lifetime')return true;if(p.type==='exam')return (p.examsLeft||0)>0;return !!p.expiresAt&&new Date(p.expiresAt)>new Date()};
const Exam=mongoose.model('Exam',new S({teacher:{type:T,index:true},title:String},{timestamps:true}));
const Result=mongoose.model('Result',new S({teacher:T,exam:{type:T,index:true},seat:String,name:String,nameN:String,data:S.Types.Mixed}));
Result.schema.index({exam:1,seat:1},{unique:true});
const SUB=['اللغة العربية','الرياضيات','اللغة الإنجليزية','العلوم','الدراسات الاجتماعية','المواد الشرعية'];
const an=s=>String(s||'').replace(/[\u064B-\u0652\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').toLowerCase().trim().replace(/\s+/g,' ');
const norm=s=>String(s??'').trim().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const wrap=f=>(q,s,n)=>Promise.resolve(f(q,s,n)).catch(e=>s.status(e.code===11000?409:500).json({error:e.code===11000?'القيمة مستخدمة بالفعل':'خطأ في الخادم'}));
const sign=u=>jwt.sign({id:u.id},process.env.JWT_SECRET,{expiresIn:'365d'});
const setC=(s,u)=>s.cookie('tk',sign(u),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:31536e6});
const auth=wrap(async(q,s,n)=>{try{const d=jwt.verify(q.cookies.tk,process.env.JWT_SECRET);q.user=await User.findById(d.id)}catch{}
 try{q.imp=!!jwt.verify(q.cookies.adm,process.env.JWT_SECRET)}catch{}
 if(!q.user)return s.status(401).json({error:'سجّل الدخول أولاً'});
 if(!q.user.active&&q.user.role!=='admin'&&!q.imp)return s.status(403).json({error:'حسابك قيد المراجعة أو موقوف'});n()});
const admin=(q,s,n)=>q.user.role==='admin'?n():s.status(403).json({error:'غير مصرح'});
const pub=u=>({id:u.id,name:u.name,subject:u.subject,slug:u.slug,role:u.role,active:u.active,email:u.email,site:u.site||{},plan:u.plan||null,planOk:planOk(u)});

app.post('/api/register',rate({windowMs:36e5,limit:20}),wrap(async(q,s)=>{
 const{name,subject,phone,email,password,slug}=q.body;
 if(!SUB.includes(subject))return s.status(400).json({error:'اختر المادة من القائمة'});
 if(!name||!subject||!email||!(password&&password.length>=8))return s.status(400).json({error:'أكمل البيانات (كلمة المرور 8 أحرف على الأقل)'});
 if(!/^[a-z0-9-]{3,30}$/.test(slug||''))return s.status(400).json({error:'الرابط: حروف إنجليزية صغيرة وأرقام وشرطة (3-30)'});
 const u=await User.create({name,subject,phone,email,slug,password:await bcrypt.hash(password,10),active:process.env.AUTO_APPROVE!=='false'});
 setC(s,u);s.json(pub(u))}));
app.post('/api/login',rate({windowMs:9e5,limit:30}),wrap(async(q,s)=>{
 const u=await User.findOne({email:String(q.body.email||'').toLowerCase()});
 if(!u||!await bcrypt.compare(q.body.password||'',u.password))return s.status(401).json({error:'بيانات الدخول غير صحيحة'});
 setC(s,u);s.json(pub(u))}));
app.post('/api/logout',(q,s)=>{s.clearCookie('tk');s.clearCookie('adm');s.json({ok:1})});
app.get('/api/me',auth,(q,s)=>s.json({...pub(q.user),imp:!!q.imp}));
app.put('/api/me',auth,wrap(async(q,s)=>{const{name,subject}=q.body;if(subject&&!SUB.includes(subject))return s.status(400).json({error:'مادة غير صحيحة'});Object.assign(q.user,{name:name||q.user.name,subject:subject||q.user.subject});await q.user.save();s.json(pub(q.user))}));

app.get('/api/exams',auth,wrap(async(q,s)=>{
 const ex=await Exam.find({teacher:q.user.id}).sort('-createdAt').lean();
 const c=await Result.aggregate([{$match:{teacher:q.user._id}},{$group:{_id:'$exam',n:{$sum:1}}}]);
 const m=Object.fromEntries(c.map(x=>[x._id,x.n]));s.json(ex.map(e=>({...e,count:m[e._id]||0})))}));
app.post('/api/exams',auth,wrap(async(q,s)=>{if(!q.body.title)return s.status(400).json({error:'اكتب اسم الامتحان'});
 if(!q.imp&&(await getS()).enforce){if(!planOk(q.user))return s.status(402).json({error:'اشترك في إحدى الباقات لإضافة امتحانات جديدة (تبويب الباقات)'});
  if(q.user.plan.type==='exam'){q.user.plan.examsLeft--;q.user.markModified('plan');await q.user.save()}}
 s.json(await Exam.create({teacher:q.user.id,title:q.body.title}))}));
app.delete('/api/exams/:id',auth,wrap(async(q,s)=>{const e=await Exam.findOneAndDelete({_id:q.params.id,teacher:q.user.id});if(e)await Result.deleteMany({exam:e.id});s.json({ok:1})}));
app.post('/api/exams/:id/results',auth,wrap(async(q,s)=>{
 const e=await Exam.findOne({_id:q.params.id,teacher:q.user.id});if(!e)return s.status(404).json({error:'غير موجود'});
 const m=new Map();for(const r of q.body.rows||[]){const seat=norm(r.seat);if(seat)m.set(seat,{teacher:q.user._id,exam:e._id,seat,name:r.name||'',nameN:an(r.name),data:r.data||{}})}
 await Result.deleteMany({exam:e._id});if(m.size)await Result.insertMany([...m.values()],{ordered:false});s.json({count:m.size})}));

const own=q=>T.isValid(q.params.id)?Exam.findOne({_id:q.params.id,teacher:q.user.id}):null;
const cleanD=d=>{const o={};if(d&&typeof d==='object')for(const k of Object.keys(d).slice(0,30)){const kk=String(k).replace(/[.$]/g,'').trim().slice(0,40),v=String(d[k]??'').trim().slice(0,200);if(kk&&v!=='')o[kk]=v}return o};
app.get('/api/exams/:id/results',auth,wrap(async(q,s)=>{const e=await own(q);if(!e)return s.status(404).json({error:'غير موجود'});
 const t=String(q.query.q||'').trim(),f={exam:e._id};
 if(t){const n=norm(t);if(/^[0-9]+$/.test(n))f.seat=new RegExp('^'+n);else f.nameN=new RegExp(an(t).split(' ').map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*'))}
 const[rows,total]=await Promise.all([Result.find(f).sort('-_id').limit(100).select('seat name data -_id').lean(),Result.countDocuments({exam:e._id})]);s.json({rows,total})}));
app.post('/api/exams/:id/student',auth,wrap(async(q,s)=>{const e=await own(q);if(!e)return s.status(404).json({error:'غير موجود'});
 const seat=norm(q.body.seat).slice(0,30),name=String(q.body.name||'').trim().slice(0,120);
 if(!seat)return s.status(400).json({error:'اكتب رقم الجلوس'});if(name.length<2)return s.status(400).json({error:'اكتب اسم الطالب'});
 const r=await Result.updateOne({exam:e._id,seat},{$set:{teacher:q.user._id,name,nameN:an(name),data:cleanD(q.body.data)}},{upsert:true});
 s.json({ok:1,added:!!r.upsertedCount})}));
app.delete('/api/exams/:id/student/:seat',auth,wrap(async(q,s)=>{const e=await own(q);if(!e)return s.status(404).json({error:'غير موجود'});
 await Result.deleteOne({exam:e._id,seat:norm(q.params.seat)});s.json({ok:1})}));

app.get('/api/public/:slug',wrap(async(q,s)=>{
 const u=await User.findOne({slug:q.params.slug,active:true});if(!u)return s.status(404).json({error:'الصفحة غير موجودة'});
 s.json({name:u.name,subject:u.subject,site:u.site||{},exams:await Exam.find({teacher:u.id}).sort('-createdAt').select('title')})}));
app.post('/api/public/:slug/lookup',rate({windowMs:6e4,limit:20}),wrap(async(q,s)=>{
 const u=await User.findOne({slug:q.params.slug,active:true});if(!u||!T.isValid(q.body.examId))return s.status(404).json({error:'غير موجود'});
 const r=await Result.findOne({teacher:u._id,exam:q.body.examId,seat:norm(q.body.seat)}).lean();
 if(!r)return s.status(404).json({error:'لا توجد نتيجة بهذا الرقم'});s.json({name:r.name,data:r.data})}));

app.post('/api/admin/impersonate/:id',auth,admin,wrap(async(q,s)=>{
 const u=await User.findOne({_id:q.params.id,role:'teacher'});if(!u)return s.status(404).json({error:'غير موجود'});
 const o={httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:864e5};
 s.cookie('adm',sign(q.user),o);s.cookie('tk',jwt.sign({id:u.id},process.env.JWT_SECRET,{expiresIn:'1d'}),o);s.json({ok:1})}));
app.post('/api/admin/stop',wrap(async(q,s)=>{
 let a;try{a=await User.findById(jwt.verify(q.cookies.adm,process.env.JWT_SECRET).id)}catch{}
 if(!a||a.role!=='admin')return s.status(401).json({error:'لا توجد جلسة مدير'});
 s.clearCookie('adm');setC(s,a);s.json({ok:1})}));
app.get('/api/plans',wrap(async(q,s)=>{const c=await getS();s.json({plans:await Plan.find({active:true}).sort('order').lean(),whatsapp:c.whatsapp,currency:c.currency})}));
app.get('/api/admin/settings',auth,admin,wrap(async(q,s)=>s.json({...await getS(),plans:await Plan.find().sort('order').lean()})));
app.put('/api/admin/settings',auth,admin,wrap(async(q,s)=>{const b=q.body||{};
 const o={whatsapp:String(b.whatsapp||'').replace(/\D/g,'').slice(0,15),currency:String(b.currency||'ج.م').slice(0,10),enforce:!!b.enforce};
 if(!o.whatsapp)return s.status(400).json({error:'اكتب رقم واتساب صحيح'});
 for(const k in o)await Setting.updateOne({k},{v:o[k]},{upsert:true});s.json(o)}));
app.put('/api/admin/plans/:key',auth,admin,wrap(async(q,s)=>{const b=q.body||{};
 const f=(Array.isArray(b.features)?b.features:String(b.features||'').split('\n')).map(x=>String(x).trim().slice(0,120)).filter(Boolean).slice(0,12);
 const pr=b.price===''||b.price==null?null:Math.max(0,Number(b.price)||0);
 const r=await Plan.findOneAndUpdate({key:q.params.key},{name:String(b.name||'').slice(0,60),desc:String(b.desc||'').slice(0,300),price:pr,features:f,active:!!b.active},{new:true});
 if(!r)return s.status(404).json({error:'غير موجود'});s.json(r)}));
app.post('/api/admin/users/:id/plan',auth,admin,wrap(async(q,s)=>{
 const u=await User.findOne({_id:q.params.id,role:'teacher'});if(!u)return s.status(404).json({error:'غير موجود'});
 const t=q.body.type;
 if(!t||t==='none')u.plan=null;
 else{if(!await Plan.findOne({key:t}))return s.status(400).json({error:'باقة غير صحيحة'});
  const d=864e5,now=Date.now(),old=u.plan||{},p={type:t,startedAt:new Date(now)};
  const base=old.expiresAt&&+new Date(old.expiresAt)>now?+new Date(old.expiresAt):now;
  if(t==='month')p.expiresAt=new Date(base+30*d);if(t==='year')p.expiresAt=new Date(base+365*d);
  if(t==='exam')p.examsLeft=(old.type==='exam'?old.examsLeft||0:0)+1;
  u.plan=p}
 u.markModified('plan');await u.save();s.json({ok:1})}));
app.put('/api/site',auth,wrap(async(q,s)=>{
 const b=q.body||{},o={};
 ['greet','title','examTitle','tagline','intro','instructionsTitle','instructions','searchHint','footer','notFound'].forEach(k=>{if(typeof b[k]==='string')o[k]=b[k].slice(0,3000)});
 o.whatsapp=String(b.whatsapp||'').replace(/\D/g,'').slice(0,15);o.nameSearch=b.nameSearch!==false;
 o.faq=(Array.isArray(b.faq)?b.faq:[]).slice(0,20).map(f=>({q:String(f.q||'').slice(0,300),a:String(f.a||'').slice(0,1500)})).filter(f=>f.q&&f.a);
 q.user.site=o;q.user.markModified('site');await q.user.save();s.json(o)}));
app.post('/api/public/:slug/search',rate({windowMs:6e4,limit:30}),wrap(async(q,s)=>{
 const u=await User.findOne({slug:q.params.slug,active:true});
 if(!u||!T.isValid(q.body.examId))return s.status(404).json({error:'غير موجود'});
 if(u.site&&u.site.nameSearch===false)return s.status(403).json({error:'البحث بالاسم غير متاح، استخدم رقم الجلوس'});
 const t=an(q.body.q);if(t.length<3)return s.json([]);
 const re=new RegExp(t.split(' ').map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*'));
 s.json(await Result.find({teacher:u._id,exam:q.body.examId,nameN:re}).limit(15).select('name seat -_id').lean())}));
app.get('/api/admin/users',auth,admin,wrap(async(q,s)=>s.json((await User.find({role:'teacher'}).sort('-createdAt').lean()).map(u=>({...u,password:undefined})))));
app.patch('/api/admin/users/:id',auth,admin,wrap(async(q,s)=>{await User.updateOne({_id:q.params.id,role:'teacher'},{active:!!q.body.active});s.json({ok:1})}));
app.delete('/api/admin/users/:id',auth,admin,wrap(async(q,s)=>{const u=await User.findOneAndDelete({_id:q.params.id,role:'teacher'});
 if(u){await Exam.deleteMany({teacher:u._id});await Result.deleteMany({teacher:u._id})}s.json({ok:1})}));

app.get('/t/:slug',P('t.html'));app.get('/dashboard',P('dashboard.html'));app.get('/admin',P('admin.html'));app.get('/login',P('login.html'));
app.use(express.static(path.join(__dirname,'public')));
app.use((q,s)=>s.status(404).sendFile(path.join(__dirname,'public','index.html')));

if(require.main===module)app.listen(process.env.PORT||3000,()=>console.log('TeacherM running on :'+(process.env.PORT||3000)));
module.exports=app;
