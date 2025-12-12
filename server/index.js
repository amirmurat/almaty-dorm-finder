import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Создаем папку для данных если её нет
await fs.mkdir(DATA_DIR, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());

// Функции для работы с JSON файлами
async function readData(fileName) {
  try {
    const filePath = path.join(DATA_DIR, `${fileName}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function writeData(fileName, data) {
  const filePath = path.join(DATA_DIR, `${fileName}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ===== ОБЩЕЖИТИЯ =====
// Для простоты, фронтенд будет читать данные напрямую из src/data/dorms.ts
// Сервер просто проксирует запросы или возвращает данные из JSON если они есть
app.get('/api/dorms', async (req, res) => {
  try {
    // Пробуем прочитать из JSON файла
    let dorms = await readData('dorms');
    
    // Если данных нет, возвращаем пустой массив
    // Фронтенд будет использовать свои данные из src/data/dorms.ts
    if (dorms.length === 0) {
      console.log('No dorms in JSON, frontend will use local data');
      return res.json([]);
    }
    
    res.json(dorms);
  } catch (error) {
    console.error('Error loading dorms:', error);
    res.status(500).json({ error: 'Failed to load dorms' });
  }
});

app.get('/api/dorms/:id', async (req, res) => {
  try {
    const dorms = await readData('dorms');
    const dorm = dorms.find(d => d.id === req.params.id);
    
    if (!dorm) {
      return res.status(404).json({ error: 'Dorm not found' });
    }
    
    res.json(dorm);
  } catch (error) {
    console.error('Error loading dorm:', error);
    res.status(500).json({ error: 'Failed to load dorm' });
  }
});

// ===== ПОЛЬЗОВАТЕЛИ =====
app.get('/api/users', async (req, res) => {
  try {
    const users = await readData('users');
    // Не возвращаем пароли
    const safeUsers = users.map(({ passwordHash, salt, ...user }) => user);
    res.json(safeUsers);
  } catch (error) {
    console.error('Error loading users:', error);
    res.status(500).json({ error: 'Failed to load users' });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }
    
    const users = await readData('users');
    
    // Проверяем, существует ли пользователь
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Простое хэширование (в продакшене использовать bcrypt)
    const salt = Math.random().toString(36).substring(2, 15);
    const passwordHash = await simpleHash(password + salt);
    
    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email: email.toLowerCase(),
      phone,
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    await writeData('users', users);
    
    // Возвращаем пользователя без пароля
    const { passwordHash: _, salt: __, ...safeUser } = newUser;
    res.status(201).json(safeUser);
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const users = await readData('users');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Проверяем пароль
    const passwordHash = await simpleHash(password + user.salt);
    if (passwordHash !== user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Создаем сессию
    const session = {
      userId: user.id,
      token: Math.random().toString(36).substring(2, 20),
      createdAt: new Date().toISOString()
    };
    
    const sessions = await readData('sessions');
    sessions.push(session);
    await writeData('sessions', sessions);
    
    // Возвращаем пользователя и токен
    const { passwordHash: _, salt: __, ...safeUser } = user;
    res.json({ user: safeUser, token: session.token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// ===== ЗАЯВКИ =====
app.get('/api/requests', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const sessions = await readData('sessions');
    const session = sessions.find(s => s.token === token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    const requests = await readData('requests');
    // Фильтруем по userId если есть
    const userRequests = requests.filter(r => !r.userId || r.userId === session.userId);
    res.json(userRequests);
  } catch (error) {
    console.error('Error loading requests:', error);
    res.status(500).json({ error: 'Failed to load requests' });
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const sessions = await readData('sessions');
    const session = sessions.find(s => s.token === token);
    
    const {
      dormId,
      dormName,
      fullName,
      university,
      contactType,
      contactValue,
      roomType,
      budget,
      moveInMonth
    } = req.body;
    
    if (!dormId || !fullName || !university || !contactValue || !roomType || !budget || !moveInMonth) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newRequest = {
      id: Math.random().toString(36).substring(2, 10).toUpperCase(),
      dormId,
      dormName,
      fullName,
      university,
      contactType: contactType || 'email',
      contactValue,
      roomType,
      budget: Number(budget),
      moveInMonth,
      timestamp: new Date().toISOString(),
      userId: session?.userId
    };
    
    const requests = await readData('requests');
    requests.push(newRequest);
    await writeData('requests', requests);
    
    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: 'Failed to create request' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const sessions = await readData('sessions');
    const session = sessions.find(s => s.token === token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const requests = await readData('requests');
    const filtered = requests.filter(r => r.id !== req.params.id);
    
    // Проверяем, что запрос принадлежит пользователю
    const request = requests.find(r => r.id === req.params.id);
    if (request && request.userId !== session.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    await writeData('requests', filtered);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({ error: 'Failed to delete request' });
  }
});

// ===== ДЕМО ПЛАТЕЖИ =====
app.get('/api/payments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const sessions = await readData('sessions');
    const session = sessions.find(s => s.token === token);
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const payments = await readData('payments');
    const userPayments = payments.filter(p => !p.userId || p.userId === session.userId);
    res.json(userPayments);
  } catch (error) {
    console.error('Error loading payments:', error);
    res.status(500).json({ error: 'Failed to load payments' });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const sessions = await readData('sessions');
    const session = sessions.find(s => s.token === token);
    
    const { requestId, dormId, dormName, amount, status } = req.body;
    
    if (!dormId || !dormName || !amount || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const newPayment = {
      id: 'DEMO-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
      requestId,
      dormId,
      dormName,
      amount: Number(amount),
      status: status || 'success',
      timestamp: new Date().toISOString(),
      userId: session?.userId
    };
    
    const payments = await readData('payments');
    payments.push(newPayment);
    await writeData('payments', payments);
    
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Простая функция хэширования (для демо)
async function simpleHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Data stored in: ${DATA_DIR}`);
});

