const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const PATHS = require('../../config/paths');
const { Admin } = require(PATHS.db);


// Improved password validation with detailed error
function isValidPassword(password) {
  if (!password) {
    return { valid: false, error: 'Password tidak boleh kosong' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password minimal 8 karakter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung huruf kecil' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung huruf besar' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, error: 'Password harus mengandung angka' };
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return { valid: false, error: 'Password harus mengandung karakter spesial (!@#$%^&*)' };
  }
  return { valid: true };
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await Admin.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(400).json({ error: 'Username tidak ditemukan' });
    }

    if (user.password !== password) { // In production, use bcrypt to compare
      return res.status(400).json({ error: 'Password salah' });
    }

    // Create session
    req.session.user = {
      userId: user.username,
      name: user.name,
      email: user.email,
      isAdmin: true // Set based on user role if needed
    };

    // Also generate JWT for API access
    const token = jwt.sign(
      { userId: user.username, username: user.username }, 
      'secretkey', 
      { expiresIn: '24h' }
    );

    // Send success response
    res.json({ 
      message: 'Login berhasil', 
      token,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat proses login' });
  }
};

// Logout function
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
};

exports.checkEmailReset = async (req, res) => {
  const { email } = req.body;
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' });
  }

  try {
    const user = await Admin.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    res.json({ message: 'Email ditemukan. Silakan lanjut untuk mengganti password.' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi email' });
  }
};

exports.setNewPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ error: 'Password baru tidak boleh kosong' });
  }

  const passwordCheck = isValidPassword(newPassword);
  if (!passwordCheck.valid) {
    return res.status(400).json({
      error: passwordCheck.error
    });
  }

  try {
    const user = await Admin.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    // Update password
    const [numUpdated] = await Admin.update(
      { password: newPassword },
      { where: { email } }
    );

    if (numUpdated === 0) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah password' });
  }
};

exports.register = async (req, res) => {
  const { username, fullName, email, password } = req.body;

  console.log('[REGISTER] Received:', { username, fullName, email, password: password ? '***' : undefined });

  if (!username || !fullName || !email || !password) {
    console.log('[REGISTER] Missing fields');
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const passwordCheck = isValidPassword(password);
  if (!passwordCheck.valid) {
    console.log('[REGISTER] Invalid password format:', passwordCheck.error);
    return res.status(400).json({
      error: passwordCheck.error
    });
  }

  try {
    const existingUser = await Admin.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });

    if (existingUser) {
      console.log('[REGISTER] Username or email already exists:', existingUser);
      return res.status(400).json({ error: 'Username atau email sudah terdaftar' });
    }

    var name = fullName;

    // Insert new user
    const newAdmin = await Admin.create({
      username,
      name,
      email,
      password
    });

    console.log('[REGISTER] Insert result:', newAdmin);

    res.json({ message: 'Registrasi berhasil' });
  } catch (err) {
    console.error('[REGISTER] Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
};