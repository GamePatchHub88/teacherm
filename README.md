# TeacherM
1. ضع رابط MongoDB في `.env` (MONGODB_URI) وغيّر JWT_SECRET وبيانات الأدمن.
2. `npm install` ثم `npm start` ← http://localhost:3000
3. الأدمن: /admin — المدرسون: /dashboard — صفحة الطلاب: /t/اسم-المدرس
النشر: أي استضافة Node (Render/Railway/VPS) وربط الدومين teacherm.com.

## Vercel
أضف المتغيرات (MONGODB_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, AUTO_APPROVE, NODE_ENV=production) في Settings → Environment Variables.
في MongoDB Atlas: Network Access → Allow 0.0.0.0/0.
