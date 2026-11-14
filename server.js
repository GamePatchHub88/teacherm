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
})().catch(x=>{conn=null;throw x}))}
app.use('/api',(q,s,n)=>db().then(()=>n()).catch(x=>{console.error(x);s.status(500).json({error:/missing/.test(x.message)?'متغير MONGODB_URI غير مضبوط في Vercel':/ServerSelection/.test(x.name)?'تعذر الوصول لقاعدة البيانات: فعّل 0.0.0.0/0 في Atlas Network Access':/auth/i.test(x.message)?'كلمة مرور قاعدة البيانات غير صحيحة':'خطأ اتصال: '+x.name})}));
const P=f=>(q,s)=>s.sendFile(path.join(__dirname,'public',f));
const S=mongoose.Schema,T=mongoose.Types.ObjectId;
const User=mongoose.model('User',new S({name:String,subject:String,phone:String,email:{type:String,unique:true,lowercase:true},
 password:String,slug:{type:String,unique:true,sparse:true},role:{type:String,default:'teacher'},active:{type:Boolean,default:true}},{timestamps:true}));
const Exam=mongoose.model('Exam',new S({teacher:{type:T,index:true},title:String},{timestamps:true}));
const Result=mongoose.model('Result',new S({teacher:T,exam:{type:T,index:true},seat:String,name:String,data:S.Types.Mixed}));
Result.schema.index({exam:1,seat:1},{unique:true});
const norm=s=>String(s??'').trim().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const wrap=f=>(q,s,n)=>Promise.resolve(f(q,s,n)).catch(e=>s.status(e.code===11000?409:500).json({error:e.code===11000?'القيمة مستخدمة بالفعل':'خطأ في الخادم'}));
const sign=u=>jwt.sign({id:u.id},process.env.JWT_SECRET,{expiresIn:'30d'});
const setC=(s,u)=>s.cookie('tk',sign(u),{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:2592e6});
const auth=wrap(async(q,s,n)=>{try{const d=jwt.verify(q.cookies.tk,process.env.JWT_SECRET);q.user=await User.findById(d.id)}catch{}
 if(!q.user)return s.status(401).json({error:'سجّل الدخول أولاً'});
 if(!q.user.active&&q.user.role!=='admin')return s.status(403).json({error:'حسابك قيد المراجعة أو موقوف'});n()});
const admin=(q,s,n)=>q.user.role==='admin'?n():s.status(403).json({error:'غير مصرح'});
const pub=u=>({id:u.id,name:u.name,subject:u.subject,slug:u.slug,role:u.role,active:u.active,email:u.email});

app.post('/api/register',rate({windowMs:36e5,limit:20}),wrap(async(q,s)=>{
 const{name,subject,phone,email,password,slug}=q.body;
 if(!name||!subject||!email||!(password&&password.length>=8))return s.status(400).json({error:'أكمل البيانات (كلمة المرور 8 أحرف على الأقل)'});
 if(!/^[a-z0-9-]{3,30}$/.test(slug||''))return s.status(400).json({error:'الرابط: حروف إنجليزية صغيرة وأرقام وشرطة (3-30)'});
 const u=await User.create({name,subject,phone,email,slug,password:await bcrypt.hash(password,10),active:process.env.AUTO_APPROVE!=='false'});
 setC(s,u);s.json(pub(u))}));
app.post('/api/login',rate({windowMs:9e5,limit:30}),wrap(async(q,s)=>{
 const u=await User.findOne({email:String(q.body.email||'').toLowerCase()});
 if(!u||!await bcrypt.compare(q.body.password||'',u.password))return s.status(401).json({error:'بيانات الدخول غير صحيحة'});
 setC(s,u);s.json(pub(u))}));
app.post('/api/logout',(q,s)=>{s.clearCookie('tk');s.json({ok:1})});
app.get('/api/me',auth,(q,s)=>s.json(pub(q.user)));
app.put('/api/me',auth,wrap(async(q,s)=>{const{name,subject}=q.body;Object.assign(q.user,{name:name||q.user.name,subject:subject||q.user.subject});await q.user.save();s.json(pub(q.user))}));

app.get('/api/exams',auth,wrap(async(q,s)=>{
 const ex=await Exam.find({teacher:q.user.id}).sort('-createdAt').lean();
 const c=await Result.aggregate([{$match:{teacher:q.user._id}},{$group:{_id:'$exam',n:{$sum:1}}}]);
 const m=Object.fromEntries(c.map(x=>[x._id,x.n]));s.json(ex.map(e=>({...e,count:m[e._id]||0})))}));
app.post('/api/exams',auth,wrap(async(q,s)=>{if(!q.body.title)return s.status(400).json({error:'اكتب اسم الامتحان'});s.json(await Exam.create({teacher:q.user.id,title:q.body.title}))}));
app.delete('/api/exams/:id',auth,wrap(async(q,s)=>{const e=await Exam.findOneAndDelete({_id:q.params.id,teacher:q.user.id});if(e)await Result.deleteMany({exam:e.id});s.json({ok:1})}));
app.post('/api/exams/:id/results',auth,wrap(async(q,s)=>{
 const e=await Exam.findOne({_id:q.params.id,teacher:q.user.id});if(!e)return s.status(404).json({error:'غير موجود'});
 const m=new Map();for(const r of q.body.rows||[]){const seat=norm(r.seat);if(seat)m.set(seat,{teacher:q.user._id,exam:e._id,seat,name:r.name||'',data:r.data||{}})}
 await Result.deleteMany({exam:e._id});if(m.size)await Result.insertMany([...m.values()],{ordered:false});s.json({count:m.size})}));

app.get('/api/public/:slug',wrap(async(q,s)=>{
 const u=await User.findOne({slug:q.params.slug,active:true});if(!u)return s.status(404).json({error:'الصفحة غير موجودة'});
 s.json({name:u.name,subject:u.subject,exams:await Exam.find({teacher:u.id}).sort('-createdAt').select('title')})}));
app.post('/api/public/:slug/lookup',rate({windowMs:6e4,limit:20}),wrap(async(q,s)=>{
 const u=await User.findOne({slug:q.params.slug,active:true});if(!u||!T.isValid(q.body.examId))return s.status(404).json({error:'غير موجود'});
 const r=await Result.findOne({teacher:u._id,exam:q.body.examId,seat:norm(q.body.seat)}).lean();
 if(!r)return s.status(404).json({error:'لا توجد نتيجة بهذا الرقم'});s.json({name:r.name,data:r.data})}));

app.get('/api/admin/users',auth,admin,wrap(async(q,s)=>s.json((await User.find({role:'teacher'}).sort('-createdAt').lean()).map(u=>({...u,password:undefined})))));
app.patch('/api/admin/users/:id',auth,admin,wrap(async(q,s)=>{await User.updateOne({_id:q.params.id,role:'teacher'},{active:!!q.body.active});s.json({ok:1})}));
app.delete('/api/admin/users/:id',auth,admin,wrap(async(q,s)=>{const u=await User.findOneAndDelete({_id:q.params.id,role:'teacher'});
 if(u){await Exam.deleteMany({teacher:u._id});await Result.deleteMany({teacher:u._id})}s.json({ok:1})}));

app.get('/t/:slug',P('t.html'));app.get('/dashboard',P('dashboard.html'));app.get('/admin',P('admin.html'));
app.use(express.static(path.join(__dirname,'public')));
app.use((q,s)=>s.status(404).sendFile(path.join(__dirname,'public','index.html')));

if(require.main===module)app.listen(process.env.PORT||3000,()=>console.log('TeacherM running on :'+(process.env.PORT||3000)));
module.exports=app;
