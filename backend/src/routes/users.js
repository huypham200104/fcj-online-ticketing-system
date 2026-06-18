import express from 'express';

const router = express.Router();

// Mock data - users
const users = [
  {
    id: 1,
    email: 'user@example.com',
    name: 'John Doe',
    password: 'password123', // In real app, this would be hashed
    role: 'customer',
    createdAt: new Date().toISOString()
  }
];

let userIdCounter = 2;

// POST - User registration
router.post('/register', (req, res) => {
  const { email, name, password, passwordConfirm } = req.body;
  
  // Validation
  if (!email || !name || !password || !passwordConfirm) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, name, password, passwordConfirm'
    });
  }
  
  if (password !== passwordConfirm) {
    return res.status(400).json({
      success: false,
      error: 'Passwords do not match'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters'
    });
  }
  
  // Check if user already exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: 'Email already registered'
    });
  }
  
  // Create new user
  const newUser = {
    id: userIdCounter++,
    email,
    name,
    password, // In real app, hash this password
    role: 'customer',
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
  });
});

// POST - User login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, password'
    });
  }
  
  // Find user
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }
  
  // In real app, generate JWT token here
  const token = `JWT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: token // In real app, this would be a JWT
    }
  });
});

// GET - Get user profile
router.get('/:userId', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.userId));
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// GET - List all users (admin only in real app)
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role
    })),
    total: users.length
  });
});

export default router;
