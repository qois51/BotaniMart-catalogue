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
    
    // Create directory if it doesn't exist
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
    
    // Create directory if it doesn't exist
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
}).single('image');

// Multer setup for product uploads
const productUpload = multer({ 
  storage: productStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
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
      // Extract form data
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

      console.log('[CREATE PRODUCT] Received:', { 
        namaProduk, 
        hargaProduk, 
        kategoriMain,
        images: req.files ? Object.keys(req.files).length + ' files' : 'No files' 
      });
      
      // Check for required fields
      if (!namaProduk || !hargaProduk || !deskripsi || !kategoriMain) {
        console.log('[CREATE PRODUCT] Missing required fields');
        return res.status(400).json({ error: 'Field nama, harga, deskripsi, dan kategori utama wajib diisi' });
      }

      // Check if main image was uploaded
      if (!req.files || !req.files.gambarUtama) {
        console.log('[CREATE PRODUCT] Missing main image');
        return res.status(400).json({ error: 'Gambar utama produk wajib diunggah' });
      }
      
      try {
        // Create product object with image paths
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

        console.log('[CREATE PRODUCT] Insert result:', {
          id: newProduct.id,
          name: newProduct.namaProduk,
          images: {
            main: newProduct.gambarUtama,
            second: newProduct.gambarKedua,
            third: newProduct.gambarKetiga,
            fourth: newProduct.gambarKeempat
          }
        });

        res.status(201).json({ 
          message: 'Produk berhasil ditambahkan', 
          product: newProduct,
          redirect: '/views/dashboard.html'
        });
      } catch (err) {
        console.error('[CREATE PRODUCT] Database error:', err);
        res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan produk' });
      }
    } catch (error) {
      console.error('[CREATE PRODUCT] Processing error:', error);
      res.status(500).json({ error: `Terjadi kesalahan: ${error.message}` });
    }
  });
};

// In product.controller.js
exports.uploadTempImage = (req, res) => {
  // Debug log
  console.log('Temp upload request received');
  
  tempUpload(req, res, function(err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file);
    
    // Return the path to the temporary file
    const tempPath = `/uploads/temp/${req.file.filename}`;
    res.json({ 
      success: true, 
      tempPath: tempPath,
      filename: req.file.filename
    });
  });
};