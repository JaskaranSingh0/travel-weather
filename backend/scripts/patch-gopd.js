// Patch script to handle potential case-sensitive missing gOPD file in gopd package on Linux
// Some environments report "Cannot find module './gOPD'" which suggests the package
// expected a file that isn't present. This script ensures a fallback implementation exists.

const fs = require('fs');
const path = require('path');

try {
  const gopdDir = path.dirname(require.resolve('gopd'));
  const candidate = path.join(gopdDir, 'gOPD.js');
  if (!fs.existsSync(candidate)) {
    // Provide a minimal implementation mirroring Object.getOwnPropertyDescriptor
    const content = "module.exports = function gOPD(obj, prop){ try { return Object.getOwnPropertyDescriptor(Object(obj), prop); } catch(e){ return undefined; } };";
    fs.writeFileSync(candidate, content, 'utf8');
    console.log('[patch-gopd] Created missing gOPD.js shim');
  } else {
    console.log('[patch-gopd] gOPD.js already exists');
  }
} catch (e) {
  console.log('[patch-gopd] Skipped patch: gopd not resolvable (' + e.message + ')');
}
