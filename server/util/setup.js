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

/**
 * Cleans up temporary files that are older than the specified age
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 24 hours)
 * @returns {Promise<number>} - Number of files removed
 */
async function cleanupTempFiles(maxAgeMs = 24 * 60 * 60 * 1000) {
  const tempDir = path.join(__dirname, '../../public/uploads/temp');
  let filesRemoved = 0;
  
  try {
    // Check if temp directory exists
    if (!fs.existsSync(tempDir)) {
      console.log('Temp directory does not exist, nothing to clean');
      return 0;
    }
    
    console.log(`Cleaning up temp files older than ${maxAgeMs/3600000} hours...`);
    
    // Get all files in the temp directory
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      
      try {
        // Get file stats
        const stats = fs.statSync(filePath);
        
        // Check if file is older than maxAgeMs
        if (now - stats.mtime.getTime() > maxAgeMs) {
          console.log(`Removing old temp file: ${file}`);
          fs.unlinkSync(filePath);
          filesRemoved++;
        }
      } catch (fileError) {
        console.error(`Error processing file ${file}:`, fileError);
      }
    }
    
    console.log(`Temp cleanup complete. Removed ${filesRemoved} files.`);
    return filesRemoved;
    
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    return 0;
  }
}

/**
 * Schedule regular cleanup of temp files
 * @param {number} intervalMs - Interval between cleanups in milliseconds (default: 1 hour)
 */
function scheduleCleanup(intervalMs = 60 * 60 * 1000) {
  console.log(`Scheduling temp file cleanup every ${intervalMs/60000} minutes`);
  
  // Run cleanup immediately on startup
  cleanupTempFiles().catch(err => {
    console.error('Initial cleanup failed:', err);
  });
  
  // Schedule regular cleanups
  setInterval(() => {
    cleanupTempFiles().catch(err => {
      console.error('Scheduled cleanup failed:', err);
    });
  }, intervalMs);
}

// Initialize
checkUploadDirectories();

module.exports = { 
  setupDirectories,
  cleanupTempFiles,
  scheduleCleanup
};