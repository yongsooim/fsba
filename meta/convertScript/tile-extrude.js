const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function *walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

for (const filePath of walkSync('../../mapset/png')) {
  console.log(filePath);
  exec(`tile-extruder --tileWidth 64 --tileHeight 48 --input ${filePath} --output ${filePath}`)
}
