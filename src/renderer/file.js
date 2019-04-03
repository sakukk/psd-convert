const fs = require('fs');
const path = require('path');

export function readFileList (dirPath) {
  let temp = fs.readdirSync(dirPath);
  let result = [];
  temp.map(item => {
    if (path.extname(item) === '.psd') {
      return result.push(path.join(dirPath, item));
    }
  });
  return result;
}
