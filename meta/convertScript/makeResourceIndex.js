const fs = require('fs');
const { exec } = require("child_process");
const xlsx = require("xlsx");
// @files 엑셀 파일을 가져온다.

const excelFile = xlsx.readFile("mapinfo.xlsx");
// @breif 엑셀 파일의 첫번째 시트의 정보를 추출

const sheetName = excelFile.SheetNames[0];          // @details 첫번째 시트 정보 추출
const firstSheet = excelFile.Sheets[sheetName];       // @details 시트의 제목 추출

// @details 엑셀 파일의 첫번째 시트를 읽어온다.

const jsonData = xlsx.utils.sheet_to_json(firstSheet, { defval: "" });

console.log(jsonData[175]['지역명'])

const testFolder = '../../mapset/tmj/';
//const testFolder = '../../mapset/png/';
//const testFolder = '../../ogg/bgm/';
//const testFolder = '../../ogg/se_event/';
//const testFolder = '../../ogg/wav_eft/';
//const testFolder = '../../graphics/ase_fm/';
//const testFolder = '../../graphics/ase_ps/';
//const testFolder = '../../graphics/pcxset/';


let outputStr = ''

let files = fs.readdirSync(testFolder);

let output = files.map((v, index)=>{
    
    return `/** ` + jsonData[index]['지역명']  + `*/
    map(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): FsbMapResource`
    //return `fx(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): Sounde`
    //return `bgm(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): Sounde`
    //return `se(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): Sounde`
    //return `fm(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): ImageSource`
    //return `ps(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): ImageSource`
    //return `pcx(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): ImageSource`
    //return `map(fileName: '` + v.replace('.tmj', '').replace('.png', '').replace('.ogg', '').replace('.tmj', '') + `'): ImageSource`
    
})


fs.writeFileSync('outputIndex.txt', output.join('\n'))
