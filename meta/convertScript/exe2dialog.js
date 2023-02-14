
const iconv = require('iconv-lite');
const fs = require("fs");

const legacyExePath = '../legacy/exe/FLYINGSB.EXE'


// 0x17DFEC (문자열 시작 주소)
//const byteOffset = 0x1935a0
const byteOffset = 0x17DFEC
const byteEnd = 0x18DFEC

const byteLength = byteEnd - byteOffset

let fileBuffer = fs.readFileSync(legacyExePath)

//let fileSub = fileBuffer.subarray(byteOffset, byteEnd)
let fileSub = fileBuffer.subarray(0, fileBuffer.length)

let utf8Str = iconv.decode(fileSub,  'euc-kr');

let outputStr = utf8Str.replace(/[\0\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\�뛳떂뜽淺뫜븷뀪]/g, '')
outputStr = outputStr.replace('\n ', '\n')
outputStr = outputStr.replace('\n\n', '\n')
outputStr = outputStr.replace('\n\n', '\n')
outputStr = outputStr.replace('\n\n', '\n')
outputStr = outputStr.replace('\n\n', '\n')

fs.writeFileSync('outputDialog.txt', outputStr)
