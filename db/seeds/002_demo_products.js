
// seed_products.js
module.exports = {
  run: async (db) => {
    const now = new Date().toISOString();
    
    await db.insertInto('products')
      .values([
        {
          product_name: 'Bibit Cabai Rawit',
          product_price: '40000',
          product_desc: 'Bibit cabai rawit unggul, hasil panen melimpah, tahan penyakit',
          product_stock: 120,
          product_picture: '/uploads/cabai-rawit.jpg',
          product_type: 'Bibit Tanaman',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Pupuk Organik 5kg',
          product_price: '75000',
          product_desc: 'Pupuk kompos organik untuk semua jenis tanaman, ramah lingkungan',
          product_stock: 80,
          product_picture: '/uploads/pupuk-organik.jpg',
          product_type: 'Pupuk',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Bibit Padi Ciherang',
          product_price: '55000',
          product_desc: 'Bibit padi varietas ciherang, umur pendek (110-115 hari), hasil tinggi',
          product_stock: 65,
          product_picture: '/uploads/bibit-padi.jpg',
          product_type: 'Bibit Padi',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Pestisida Nabati',
          product_price: '60000',
          product_desc: 'Pestisida alami dari ekstrak nimba, aman untuk tanaman sayuran',
          product_stock: 45,
          product_picture: '/uploads/pestisida.jpg',
          product_type: 'Pestisida',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Bibit Tomat Ceri',
          product_price: '35000',
          product_desc: 'Bibit tomat ceri organik, cocok untuk hidroponik atau polybag',
          product_stock: 90,
          product_picture: '/uploads/tomat-ceri.jpg',
          product_type: 'Bibit Tanaman',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Polybag 30x40cm',
          product_price: '2500',
          product_desc: 'Polybag ukuran 30x40cm, tebal dan kuat untuk pembibitan',
          product_stock: 200,
          product_picture: '/uploads/polybag.jpg',
          product_type: 'Alat Pertanian',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Bibit Jagung Manis',
          product_price: '45000',
          product_desc: 'Bibit jagung manis hibrida, umur panen 65-70 hari setelah tanam',
          product_stock: 75,
          product_picture: '/uploads/jagung.jpg',
          product_type: 'Bibit Jagung',
          created_at: now,
          updated_at: now
        },
        {
          product_name: 'Sprayer Manual 5L',
          product_price: '120000',
          product_desc: 'Alat semprot pupuk/pestisida kapasitas 5 liter dengan nozzle adjustable',
          product_stock: 30,
          product_picture: '/uploads/sprayer.jpg',
          product_type: 'Alat Pertanian',
          created_at: now,
          updated_at: now
        }
      ])
      .execute();
  }
};