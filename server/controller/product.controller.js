const path = require('path');
const multer = require('multer');
const fs = require('fs');
const fsPromises = require('fs/promises');
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

// Add this helper function at the top of your file
async function deleteImageFile(filename) {
  if (!filename) return;
  
  const imagePath = path.join(__dirname, '../../public/uploads/products', filename);
  
  try {
    await fsPromises.access(imagePath); // Check if file exists
    await fsPromises.unlink(imagePath); // Delete the file
    console.log(`Deleted image: ${filename}`);
    return true;
  } catch (err) {
    console.log(`Could not delete image ${filename}: ${err.message}`);
    return false;
  }
}

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
        deskripsi,
        kategoriMain,
        kategoriSub
      } = req.body;

      if (!namaProduk || !hargaProduk || !kategoriMain || !kategoriSub) {
        return res.status(400).json({ error: 'Field nama, harga, kategori utama dan kategori sekondary wajib diisi' });
      }

      if (!req.files || !req.files.gambarUtama) {
        return res.status(400).json({ error: 'Gambar utama produk wajib diunggah' });
      }

      const newProduct = await Product.create({
        namaProduk,
        namaLatin: namaLatin || null,
        hargaProduk: parseFloat(hargaProduk),
        stockProduk: 0,
        deskripsi: deskripsi || null,
        kategoriMain: kategoriMain,
        kategoriSub: kategoriSub,
        gambarUtama: req.files.gambarUtama[0].filename,
        gambarKedua: req.files.gambarKedua ? req.files.gambarKedua[0].filename : null,
        gambarKetiga: req.files.gambarKetiga ? req.files.gambarKetiga[0].filename : null,
        gambarKeempat: req.files.gambarKeempat ? req.files.gambarKeempat[0].filename : null
      });

      res.status(201).json({ 
        message: 'Produk berhasil ditambahkan', 
        product: newProduct,
        redirect: '/admin-products'
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

/**
 * Delete a product by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find the product to get image paths before deletion
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }
    
    // Store image paths to delete after product is removed from database
    const imagesToDelete = [
      product.gambarUtama,
      product.gambarKedua,
      product.gambarKetiga,
      product.gambarKeempat
    ].filter(img => img); // Filter out null/undefined values
    
    // Delete the product from database
    const result = await Product.destroy({
      where: { id: productId }
    });
    
    if (result === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found or already deleted' 
      });
    }
    
    // Delete associated image files
    const uploadDir = path.join(__dirname, '../../public/uploads/products');
    
    // Delete each image asynchronously
    const deletePromises = imagesToDelete.map(async (imageName) => {
      if (!imageName) return;
      
      const imagePath = path.join(uploadDir, imageName);
      
      try {
        await fsPromises.access(imagePath); // Check if file exists
        await fsPromises.unlink(imagePath); // Delete the file
        console.log(`Deleted image: ${imageName}`);
      } catch (err) {
        // File doesn't exist or other error - just log it
        console.log(`Could not delete image ${imageName}: ${err.message}`);
      }
    });
    
    // Wait for all image deletions to complete
    await Promise.all(deletePromises);
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Product successfully deleted' 
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete product', 
      error: error.message 
    });
  }
};

exports.updateProduct = (req, res) => {
  productUpload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    
    try {
      const productId = req.params.id;
      
      // Find the product to update
      const product = await Product.findByPk(productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Extract form data
      const {
        namaProduk,
        namaLatin,
        hargaProduk,
        deskripsi,
        kategoriMain,
        kategoriSub
      } = req.body;

      // Validation - same as in createProduct
      if (!namaProduk || !hargaProduk || !kategoriMain) {
        return res.status(400).json({ error: 'Field nama, harga, and kategori utama wajib diisi' });
      }

      // Prepare update data
      const updateData = {
        namaProduk,
        namaLatin: namaLatin || null,
        hargaProduk: parseFloat(hargaProduk),
        deskripsi: deskripsi || null,
        kategoriMain,
        kategoriSub: kategoriSub || '' // Use empty string to avoid null constraint violation
      };
      
      // Handle images - similar to createProduct but checking for existing images
      
      // Main image handling
      if (req.files && req.files.gambarUtama) {
        // New image uploaded - save new filename and delete old image
        updateData.gambarUtama = req.files.gambarUtama[0].filename;
        if (product.gambarUtama) {
          await deleteImageFile(product.gambarUtama);
        }
      }
      // If no new image uploaded, keep the existing one
      
      // Second image handling
      if (req.files && req.files.gambarKedua) {
        // New second image uploaded - save new filename and delete old image
        updateData.gambarKedua = req.files.gambarKedua[0].filename;
        if (product.gambarKedua) {
          await deleteImageFile(product.gambarKedua);
        }
      } else if (req.body.removeGambarKedua === 'true') {
        // Client requested to remove this image
        if (product.gambarKedua) {
          await deleteImageFile(product.gambarKedua);
        }
        updateData.gambarKedua = null;
      }
      // If neither condition is true, keep the existing image (don't include in updateData)
      
      // Third image handling
      if (req.files && req.files.gambarKetiga) {
        // New third image uploaded - save new filename and delete old image
        updateData.gambarKetiga = req.files.gambarKetiga[0].filename;
        if (product.gambarKetiga) {
          await deleteImageFile(product.gambarKetiga);
        }
      } else if (req.body.removeGambarKetiga === 'true') {
        // Client requested to remove this image
        if (product.gambarKetiga) {
          await deleteImageFile(product.gambarKetiga);
        }
        updateData.gambarKetiga = null;
      }
      // If neither condition is true, keep the existing image (don't include in updateData)
      
      // Fourth image handling
      if (req.files && req.files.gambarKeempat) {
        // New fourth image uploaded - save new filename and delete old image
        updateData.gambarKeempat = req.files.gambarKeempat[0].filename;
        if (product.gambarKeempat) {
          await deleteImageFile(product.gambarKeempat);
        }
      } else if (req.body.removeGambarKeempat === 'true') {
        // Client requested to remove this image
        if (product.gambarKeempat) {
          await deleteImageFile(product.gambarKeempat);
        }
        updateData.gambarKeempat = null;
      }
      // If neither condition is true, keep the existing image (don't include in updateData)
      
      // Log update data for debugging
      console.log('Updating product with data:', updateData);
      
      // Update the product in the database
      await product.update(updateData);
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        product: {
          id: product.id,
          namaProduk: product.namaProduk,
          updatedAt: product.updatedAt
        },
        redirect: '/admin-products'  // Include redirect path for frontend
      });
      
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({ 
        error: 'Failed to update product', 
        details: error.message
      });
    }
  });
};