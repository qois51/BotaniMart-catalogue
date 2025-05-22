const fs = require('fs');
const path = require('path');

function setupDirectories() {
  const directories = [
    path.join(__dirname, '../../public/uploads'),
    path.join(__dirname, '../../public/uploads/temp'),
    path.join(__dirname, '../../public/uploads/products')
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  console.log('Directory setup complete');
}

// Add this to your server startup routine
function checkUploadDirectories() {
  const uploadDir = path.join(__dirname, '../../public/uploads');
  const tempDir = path.join(__dirname, '../../public/uploads/temp');
  
  try {
    // Check if directories exist, create if not
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating uploads directory');
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    if (!fs.existsSync(tempDir)) {
      console.log('Creating temp uploads directory');
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Try writing a test file to verify permissions
    const testFile = path.join(tempDir, 'test.txt');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    console.log('Upload directories verified');
  } catch (error) {
    console.error('Directory permission issue:', error);
  }
}

checkUploadDirectories();

module.exports = { setupDirectories };