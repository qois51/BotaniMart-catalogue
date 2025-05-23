const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { queryProducts } = require('../logic/queryProduct');
const PATHS = require('../../config/paths');
const { Product } = require(PATHS.db);

// Configure temp storage for images
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const tempDir = path.join(__dirname, '../../public/uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'temp-' + uniqueSuffix + ext);
  }
});

// Configure product image storage
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const productDir = path.join(__dirname, '../../public/uploads/products');
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    cb(null, productDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'), false);
  }
};

// Multer setup for temporary uploads
const tempUpload = multer({ 
  storage: tempStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single('image');

// Multer setup for product uploads
const productUpload = multer({ 
  storage: productStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'gambarUtama', maxCount: 1 },
  { name: 'gambarKedua', maxCount: 1 },
  { name: 'gambarKetiga', maxCount: 1 },
  { name: 'gambarKeempat', maxCount: 1 }
]);

// Controller methods
exports.getAllProducts = async (req, res) => {
  try {
    const products = await queryProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID parameter' });
    }
    
    const product = await queryProducts(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  productUpload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    
    try {
      const {
        namaProduk,
        namaLatin,
        hargaProduk,
        stockProduk,
        deskripsi,
        specification,
        caraPerawatan,
        kategoriMain,
        kategoriSub
      } = req.body;

      if (!namaProduk || !hargaProduk || !deskripsi || !kategoriMain) {
        return res.status(400).json({ error: 'Field nama, harga, deskripsi, dan kategori utama wajib diisi' });
      }

      if (!req.files || !req.files.gambarUtama) {
        return res.status(400).json({ error: 'Gambar utama produk wajib diunggah' });
      }

      const newProduct = await Product.create({
        namaProduk,
        namaLatin: namaLatin || null,
        hargaProduk: parseFloat(hargaProduk),
        stockProduk: parseInt(stockProduk) || 0,
        deskripsi,
        specification: specification || null,
        caraPerawatan: caraPerawatan || null,
        kategoriMain,
        kategoriSub: kategoriSub || null,
        gambarUtama: req.files.gambarUtama[0].filename,
        gambarKedua: req.files.gambarKedua ? req.files.gambarKedua[0].filename : null,
        gambarKetiga: req.files.gambarKetiga ? req.files.gambarKetiga[0].filename : null,
        gambarKeempat: req.files.gambarKeempat ? req.files.gambarKeempat[0].filename : null
      });

      res.status(201).json({ 
        message: 'Produk berhasil ditambahkan', 
        product: newProduct,
        redirect: '/views/dashboard.html'
      });
    } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan produk' });
    }
  });
};

exports.uploadTempImage = (req, res) => {
  tempUpload(req, res, function(err) {
    if (err) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const tempPath = `/uploads/temp/${req.file.filename}`;
    res.json({ 
      success: true, 
      tempPath,
      filename: req.file.filename
    });
  });
};

exports.addProductView = async (req, res) => {
  const productId = req.params.id;
  try {
    await Product.sequelize.query(
      'UPDATE products SET views = views + 1 WHERE id = :id',
      {
        replacements: { id: productId },
        type: Product.sequelize.QueryTypes.UPDATE
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error add product views:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};