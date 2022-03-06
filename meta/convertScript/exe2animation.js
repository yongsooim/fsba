
const fs = require("fs");
const { toASCII } = require("punycode");

const legacyExePath = '../legacy/exe/FLYINGSB.EXE'

let exeBuffer = Buffer.from(fs.readFileSync(legacyExePath))
const exeByteSize = exeBuffer.length

const maxFileNameLength = 20
let fileNameCounter
let fileNameBuffer = ''
let context = 'detectingTag' // tag is @ or !, 'detectingTag'| 'detectingFileName' | 'detectingAnimInfo'
let detectedTag = ''
let outputStr = ""
let startAddress = 0
let fileNameLength = 0
let numberingFm = 0
let numberingSe = 0

for (let i = 0; i < exeByteSize; i++) {
    if (context == 'detectingTag') {
        if (exeBuffer.readUInt8(i) == '@'.charCodeAt(0) || exeBuffer.readUInt8(i) == '!'.charCodeAt(0) ) {  // if tag(@ or !) found
            fileNameCounter = maxFileNameLength
            fileNameBuffer = String.fromCharCode(exeBuffer.readUInt8(i))
            context = 'detectingFileName'
            detectedTag = String.fromCharCode(exeBuffer.readUInt8(i))
            startAddress = i
            fileNameLength = 0
        }
    } else if (context == 'detectingFileName') {
        fileNameCounter--
        fileNameLength++

        if (fileNameCounter < 0) {
            context = 'detectingTag'
            fileNameBuffer = ""
            continue

        } else {
            if (exeBuffer.readUInt8(i) == '@'.charCodeAt(0) || exeBuffer.readUInt8(i) == '!'.charCodeAt(0) ) {
                fileNameCounter = maxFileNameLength
                fileNameBuffer = String.fromCharCode(exeBuffer.readUInt8(i))
                detectedTag = String.fromCharCode(exeBuffer.readUInt8(i))
            }

            fileNameBuffer += String.fromCharCode(exeBuffer.readUInt8(i))

            if (fileNameBuffer.substring(fileNameBuffer.length - 4) == '.pcx' 
             || fileNameBuffer.substring(fileNameBuffer.length - 4) == '.PCX') {
                outputStr += '0x' + startAddress.toString(16).toUpperCase().padStart(6, '0') + ' : ' + fileNameBuffer.padEnd(15)  // 주소 + 파일명 출력
                context = 'detectingAnimInfo'
                fileNameBuffer = ""
            }
        }
    } else if (context == 'detectingAnimInfo') {
        
        // 데이터 출력 부분

        //i = startAddress + fileNameLength

        while(i % 4 != 0){  // 4 byte alignment
            i++
        }
        
        i += 16 // 이후 16바이트는 무조건 0이어서 생략함.

        if(detectedTag == '@'){ // ase_ps, 가변 프레임 크기임. 애니메이션 번호?, 프레임의 위치, 크기, offset 정보, 4바이트씩 총 7개
            for(let j = 0 ; j < 64 ; j += 4){  // .pcx 가 나온 이후 16바이트는 무조건 0이어서 생략함. (0x1CED68 : @Gatewarp.pcx는 데이터가 있긴 한데 의미불명)
                outputStr += exeBuffer.readInt32LE(i + j).toString().padStart(12) + ", "
            }
            outputStr += "\n"
        } else if(detectedTag == '!'){  // ase_fm, 고정 프레임 크기. 2바이트씩 가로/세로 정보 , 뒤에 두개는 뭔지 모르겠음. 대부분 32, 82 인데 아닌 것도 있음
            for(let j = 0 ; j < 32 ; j += 2){  // .pcx 가 나온 이후 16바이트는 무조건 0이어서 생략함. 
                outputStr += exeBuffer.readInt16LE(i + j).toString().padStart(12) + ", "
            }
            outputStr += "\n"
        }
        
        context = 'detectingTag'
        fileNameBuffer = ""
    }
}

fs.writeFileSync('outputAnimation.txt', outputStr)
