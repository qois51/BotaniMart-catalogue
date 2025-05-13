const jwt = require('jsonwebtoken');
const PATHS = require('../../config/paths');
const { db } = require(PATHS.db);
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

function isValidPassword(password) {
  return passwordPattern.test(password);
}

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await db.selectFrom('admins')
      .where('username', '=', username)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      return res.status(400).json({ error: 'Username tidak ditemukan' });
    }

    if (user.password !== password) {
      return res.status(400).json({ error: 'Password salah' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, 'secretkey', {
      expiresIn: '24h',
    });

    res.json({ message: 'Login berhasil', token });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat proses login' });
  }
};

exports.checkEmailReset = async (req, res) => {
  const { email } = req.body;
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' });
  }

  try {
    const user = await db.selectFrom('admins')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

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

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      error: 'Password baru tidak memenuhi kriteria'
    });
  }

  try {
    const user = await db.selectFrom('admins')
      .where('email', '=', email)
      .selectAll()
      .executeTakeFirst();

    if (!user) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    // Update password
    const result = await db.updateTable('admins')
      .set({ password: newPassword })
      .where('email', '=', email)
      .execute();

    if (result.numUpdatedRows === 0) {
      return res.status(404).json({ error: 'Email tidak ditemukan' });
    }

    res.json({ message: 'Password berhasil diubah' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengubah password' });
  }
};