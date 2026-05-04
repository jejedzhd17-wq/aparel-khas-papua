// User interface
export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this would be hashed
  createdAt: string;
}

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
}

const USERS_STORAGE_KEY = 'noken-registered-users';
const CURRENT_USER_KEY = 'noken-user';

// Get all registered users
export function getAllUsers(): RegisteredUser[] {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

// Check if email already exists
export function emailExists(email: string): boolean {
  const users = getAllUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Register a new user
export function registerUser(name: string, email: string, password: string): { success: boolean; message: string } {
  // Validate inputs
  if (!name || !email || !password) {
    return { success: false, message: 'Semua field harus diisi' };
  }

  if (!email.includes('@')) {
    return { success: false, message: 'Format email tidak valid' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password minimal 6 karakter' };
  }

  // Check if email already exists
  if (emailExists(email)) {
    return { success: false, message: 'Email sudah terdaftar' };
  }

  // Create new user
  const users = getAllUsers();
  const newUser: RegisteredUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password, // In production, hash this!
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'Akun berhasil dibuat' };
}

// Login user
export function loginUser(email: string, password: string): { success: boolean; message: string; user?: LoggedInUser } {
  if (!email || !password) {
    return { success: false, message: 'Email dan password harus diisi' };
  }

  if (!email.includes('@')) {
    return { success: false, message: 'Format email tidak valid' };
  }

  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, message: 'Email tidak terdaftar. Silakan daftar terlebih dahulu.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Password salah' };
  }

  // Save logged-in user
  const loggedInUser: LoggedInUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));

  return { success: true, message: 'Login berhasil', user: loggedInUser };
}

// Get current logged-in user
export function getCurrentUser(): LoggedInUser | null {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Logout user
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
