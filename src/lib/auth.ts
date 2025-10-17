// Frontend-only authentication utilities with SHA-256 password hashing

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  salt: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  token: string;
  createdAt: string;
}

const USERS_KEY = "users";
const SESSION_KEY = "session";

// Generate random salt
function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Generate random token
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Hash password with salt using SHA-256
async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Get all users
export function getUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read users:", error);
    return [];
  }
}

// Save user
function saveUser(user: User): void {
  try {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Failed to save user:", error);
    throw error;
  }
}

// Update user
function updateUser(user: User): void {
  try {
    const users = getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch (error) {
    console.error("Failed to update user:", error);
    throw error;
  }
}

// Delete user
export function deleteUser(userId: string): void {
  try {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw error;
  }
}

// Register new user
export async function register(
  name: string,
  email: string,
  password: string,
  phone?: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    // Check if email already exists
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Пользователь с таким email уже существует" };
    }

    // Generate salt and hash password
    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const user: User = {
      id: generateToken().substring(0, 16),
      name,
      email,
      phone,
      salt,
      passwordHash,
      createdAt: new Date().toISOString()
    };

    saveUser(user);
    return { success: true, user };
  } catch (error) {
    console.error("Registration failed:", error);
    return { success: false, error: "Ошибка регистрации" };
  }
}

// Login user
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: "Неверный email или пароль" };
    }

    // Verify password
    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: "Неверный email или пароль" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false, error: "Ошибка входа" };
  }
}

// Create session
export function createSession(userId: string): Session {
  const session: Session = {
    userId,
    token: generateToken(),
    createdAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
}

// Get current session
export function getSession(): Session | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to read session:", error);
    return null;
  }
}

// Clear session (logout)
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

// Get current user from session
export function getCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;

  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
}

// Reset password (demo)
export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return { success: false, error: "Пользователь не найден" };
    }

    // Generate new salt and hash
    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    user.salt = salt;
    user.passwordHash = passwordHash;
    updateUser(user);

    return { success: true };
  } catch (error) {
    console.error("Password reset failed:", error);
    return { success: false, error: "Ошибка сброса пароля" };
  }
}

// Validate password strength
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Пароль должен содержать минимум 8 символов" };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: "Пароль должен содержать хотя бы одну цифру" };
  }
  return { valid: true };
}
