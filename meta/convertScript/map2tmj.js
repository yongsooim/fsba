const xlsx = require( "xlsx" );
const fs = require("fs");


// @files 엑셀 파일을 가져온다.

const excelFile = xlsx.readFile( "mapinfo.xlsx" );


//make output path if not exist
if(!fs.existsSync('../../mapset/tmj'))
    fs.mkdirSync('....//mapset/tmj');

if(!fs.existsSync('../../mapset/tsj'))
    fs.mkdirSync('../../mapset/tsj');

// @breif 엑셀 파일의 첫번째 시트의 정보를 추출

const sheetName = excelFile.SheetNames[0];          // @details 첫번째 시트 정보 추출
const firstSheet = excelFile.Sheets[sheetName];       // @details 시트의 제목 추출

// @details 엑셀 파일의 첫번째 시트를 읽어온다.

const jsonData = xlsx.utils.sheet_to_json( firstSheet, { defval : "" } );

const offset = 0x1E0 // data 까지의 byte offset

for(let j = 0 ; j < 500 ; j++){
let legacyMapPathP = '../legacy/mapset/map/' + jsonData[j]['MAP파일'].slice(1) + 'P.map'
let tilesetSourceP = '../../mapset/png/' + jsonData[j]['PCX파일'].slice(1) + 'P.png'
let tilesetSourceS = '../../mapset/png/' + jsonData[j]['PCX파일'].slice(1) + 'S.png'

let data

try{
    data = Buffer.from(fs.readFileSync(legacyMapPathP))
} catch{
    console.log('map no.' + j + ' ' + legacyMapPathP + ' not found')
    continue
}

let width = data.readInt32LE(24)
let height = data.readInt32LE(28)

let imageWidth = data.readInt32LE(32)
let imageHeight = data.readInt32LE(36)

let dataP = []
let dataS = []

for(var i = 0 ; i < width * height ; i++){
    dataP.push((data.readUInt32LE(offset + i * 4 ) + 1) )  // 타일 번호 1부터 시작이라 1 더해줘야함
    dataS.push((data.readUInt32LE(offset + i * 4 ) + 1 + width * height) )
}

console.log('map no.' + j);

let outputJson = {
    "compressionlevel":0,
    "height" : height,
    "width" : width,
    "infinite":false,
    "tilewidth":64,
    "tileheight":48,
    "orientation":"orthogonal",
    "renderorder":"right-down",
    "tiledversion":"1.8.1",
    "layers":[
        {
         "data": dataP,
         "id":1,
         "name":"P Layer",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":width,
         "height":height,
         "x":0,
         "y":0
        }, 
        {
         "data": dataS,
         "id":1,
         "name":"S Layer",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":width,
         "height":height,
         "x":0,
         "y":0
        }],
    "tilesets":[
        {
            "firstgid":1,
            "source": '../tsj/' + jsonData[j]['PCX파일'].slice(1) + 'P.tsj'
        }, 
        {
            "firstgid":((width *height) + 1),
            "source": '../tsj/'+ jsonData[j]['PCX파일'].slice(1) + 'S.tsj'
        }]
}

    let outputPTsj = 
    { "columns":width,
    "image": tilesetSourceP,
    "imageheight": imageHeight,
    "imagewidth": imageWidth,
    "margin":0,
    "name":"TileSetP",
    "spacing":0,
    "tilecount":imageHeight * imageWidth,
    "tiledversion":"1.8.1",
    "tileheight":48,
    "tilewidth":64,
    "type":"tileset",
    "version":"1.8"
    }

    let outputSTsj = 
    { "columns":width,
    "image": tilesetSourceS,
    "imageheight": imageHeight,
    "imagewidth": imageWidth,
    "margin":0,
    "name":"TileSetS",
    "spacing":0,
    "tilecount":imageHeight * imageWidth,
    "tiledversion":"1.8.1",
    "tileheight":48,
    "tilewidth":64,
    "type":"tileset",
    "version":"1.8"
    }

fs.writeFileSync('../../mapset/tmj/' +j.toString().padStart(4, '0') + '_' + jsonData[j]['MAP파일'].slice(1) + '.tmj', JSON.stringify(outputJson, null, 4))
fs.writeFileSync('../../mapset/tsj/' +jsonData[j]['PCX파일'].slice(1) + 'P.tsj', JSON.stringify(outputPTsj, null, 4))
fs.writeFileSync('../../mapset/tsj/' +jsonData[j]['PCX파일'].slice(1) + 'S.tsj', JSON.stringify(outputSTsj, null, 4))
}
