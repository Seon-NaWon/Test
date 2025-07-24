const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

// 1. 폼 데이터 및 JSON 모두 받을 수 있게 미들웨어 추가
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. 세션 미들웨어
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// 3. 하드코딩된 유저 (비번: 1234)
const users = [
  {
    email: 'user@email.com',
    password: '$2b$10$eqPpU4OiiiiBbQ9HiMSbquNywr5ZjbM6cuVw/m1cp1dJPils9WCr6' // 1234의 해시
  }
];

// 4. 루트로 접속하면 /login 으로 리다이렉트
app.get('/', (req, res) => {
  res.redirect('/login');
});

// 5. public 폴더에서 login.html 내려주기
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 6. 로그인 처리
app.post('/login', async (req, res) => {
  // 2.1) 폼 or JSON에서 email, password 추출
  const { email, password } = req.body;

  // 2.2) 입력값 콘솔(터미널)에 원본 표시
  console.log(`서버 콘솔 >> 입력 이메일: ${email}`);
  console.log(`서버 콘솔 >> 입력 비밀번호(원본): ${password}`);

  // 3) 유저 존재 확인
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).send('유저 없음');

  // 4) bcrypt로 비밀번호 비교
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).send('비밀번호 불일치');

  // 5) 응답에는 마스킹된 비번만 표시
  res.json({
    message: '로그인 성공',
    email,
    password: '*'.repeat(password.length)
  });
});

// (옵션) 서버 상태 체크 라우트(문제 해결용)
app.get('/health', (req, res) => {
  res.send('Server running!');
});

app.listen(3000, () => console.log('서버 시작: http://localhost:3000'));
