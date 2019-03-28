const PSD = require('psd');
const path = require('path');

export function generatePng (filePath, savePath) {
  let arr = filePath.split('\\');
  let fileName = arr[arr.length - 1].split('.')[0];
  PSD.open(filePath).then(function (psd) {
    return psd.image.saveAsPng(path.join(savePath, `${fileName}.png`));
  }).then(function () {
    console.log('finish');
  });
  return PSD.open(filePath);
}

export function generatePng2 (filePath) {
  return PSD.open(filePath);
}
