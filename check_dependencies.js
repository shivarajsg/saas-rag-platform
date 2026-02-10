const fs = require('fs');
const path = require('path');

// List of packages we need to check
const requiredPackages = [
  '@radix-ui/react-dialog',
  '@radix-ui/react-select',
  '@radix-ui/react-scroll-area',
];

console.log('Checking for required dependencies...');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');

try {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  
  // Extract dependencies from package.json
  const dependencies = packageJson.dependencies || {};
  
  let missingPackages = [];
  
  // Check if each required package is in the dependencies
  requiredPackages.forEach(pkg => {
    if (!dependencies[pkg]) {
      missingPackages.push(pkg);
    }
  });
  
  if (missingPackages.length === 0) {
    console.log('✅ All required dependencies are present in package.json.');
  } else {
    console.log('❌ The following dependencies are missing from package.json:');
    missingPackages.forEach(pkg => {
      console.log(`   - ${pkg}`);
    });
    console.log('\nPlease install them with:');
    console.log(`npm install ${missingPackages.join(' ')}`);
  }
  
  // Now check if node_modules for these packages actually exist
  console.log('\nChecking for package installations in node_modules...');
  
  const installedMissing = [];
  
  requiredPackages.forEach(pkg => {
    try {
      // Try to access the package's main file
      require.resolve(pkg);
    } catch (e) {
      installedMissing.push(pkg);
    }
  });
  
  if (installedMissing.length === 0) {
    console.log('✅ All required packages are properly installed.');
  } else {
    console.log('❌ The following packages are in package.json but may not be installed:');
    installedMissing.forEach(pkg => {
      console.log(`   - ${pkg}`);
    });
    console.log('\nPlease install them with:');
    console.log('npm install');
  }
  
} catch (error) {
  console.error('Error checking dependencies:', error.message);
} 