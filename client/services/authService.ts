// Antarmuka Pengguna (User Interface)
export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string; // Di lingkungan produksi, ini harus di-hash
  createdAt: string;
}

export interface LoggedInUser {
  id: string;
  name: string;
  email: string;
}

const USERS_STORAGE_KEY = 'noken-registered-users';
const CURRENT_USER_KEY = 'noken-user';

// Ambil semua pengguna terdaftar
export function getAllUsers(): RegisteredUser[] {
  try {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

// Periksa apakah email sudah terdaftar
export function emailExists(email: string): boolean {
  const users = getAllUsers();
  return users.some(u => u.email.toLowerCase() === email.toLowerCase());
}

// Daftarkan pengguna baru
export function registerUser(name: string, email: string, password: string): { success: boolean; message: string } {
  // Validasi masukan
  if (!name || !email || !password) {
    return { success: false, message: 'Semua field harus diisi' };
  }

  if (!email.includes('@')) {
    return { success: false, message: 'Format email tidak valid' };
  }

  if (password.length < 6) {
    return { success: false, message: 'Password minimal 6 karakter' };
  }

  // Periksa apakah email sudah terdaftar
  if (emailExists(email)) {
    return { success: false, message: 'Email sudah terdaftar' };
  }

  // Buat pengguna baru
  const users = getAllUsers();
  const newUser: RegisteredUser = {
    id: `user_${Date.now()}`,
    name,
    email: email.toLowerCase(),
    password, // Di lingkungan produksi, lakukan hash!
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, message: 'Akun berhasil dibuat' };
}

// Login pengguna
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

  // Simpan data login pengguna
  const loggedInUser: LoggedInUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(loggedInUser));

  return { success: true, message: 'Login berhasil', user: loggedInUser };
}

// Ambil data pengguna yang sedang login
export function getCurrentUser(): LoggedInUser | null {
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Logout pengguna
export function logout(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem('noken-token');
}

// Periksa apakah pengguna sudah terautentikasi
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
