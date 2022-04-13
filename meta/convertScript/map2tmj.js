const xlsx = require("xlsx");
const fs = require("fs");

// @files 엑셀 파일을 가져온다.

const excelFile = xlsx.readFile("mapinfo.xlsx");

//make output path if not exist
if (!fs.existsSync('../../mapset/tmj'))
    fs.mkdirSync('../../mapset/tmj');

if (!fs.existsSync('../../mapset/tsj'))
    fs.mkdirSync('../../mapset/tsj');

// @breif 엑셀 파일의 첫번째 시트의 정보를 추출

const sheetName = excelFile.SheetNames[0];          // @details 첫번째 시트 정보 추출
const firstSheet = excelFile.Sheets[sheetName];       // @details 시트의 제목 추출

// @details 엑셀 파일의 첫번째 시트를 읽어온다.

const jsonData = xlsx.utils.sheet_to_json(firstSheet, { defval: "" });

const offset = 0x1E0 // data 까지의 byte offset

let j = 0

for (j = 0; j < 500; j++) {
    let legacyMapPathP = '../legacy/mapset/map/' + jsonData[j]['MAP파일'].slice(1) + 'P.map'
    let tilesetSourceP = '../../mapset/png/' + jsonData[j]['PCX파일'].slice(1).toLowerCase() + 'p.png'
    let tilesetSourceS = '../../mapset/png/' + jsonData[j]['PCX파일'].slice(1).toLowerCase() + 's.png'

    let data

    try {
        data = Buffer.from(fs.readFileSync(legacyMapPathP))
    } catch {
        console.log('map no.' + j + ' ' + legacyMapPathP + ' not found')
        continue
    }

    // .map 파일로부터 맵 크기 읽기
    let width = data.readInt32LE(24)    // map 헤더 읽기
    let height = data.readInt32LE(28)

    let widthZ1 = data.readInt32LE(72)    // map 헤더 읽기
    let heightZ1 = data.readInt32LE(76)      // map 헤더 읽기

    // .png로부터 이미지 크기 읽어서 가로 세로 몇 타일인지 계산
    let tilesetPngBuffer = Buffer.from(fs.readFileSync('../../mapset/png/' + jsonData[j]['PCX파일'].slice(1) + 'P.png'))

    let tilesetWidth = tilesetPngBuffer.readInt32BE(16) / 64     // PNG 헤더 읽기
    let tilesetHeight = tilesetPngBuffer.readInt32BE(20) / 48     // PNG 헤더 읽기

    //tilesetWidth = data.readInt32LE(32)  // map으로부터 읽기
    //tilesetHeight = data.readInt32LE(36)

    let numberOfTilesInTileset = tilesetWidth * tilesetHeight  // also means S layer offset

    let dataZ0P = []
    let dataZ0S = []
    let dataZ0move = []
    let dataZ0order = []
    let dataZ1P = []
    let dataZ1S = []
    let dataZ1move = []
    let dataZ1order = []

    let z0moveOffset 

    let z1offset 
    let z1moveOffset = 0

    if(j == 343){  // 343번 맵은 Z0과 Z1 의 크기가 다르다. 버그일까?
        console.log(width)  // 44
        console.log(widthZ1)  // 35
        console.log(height)  // 35
        console.log(heightZ1) //43 

        //강제로 크기 지정
        //width = 43
        //height = 35
        //widthZ1 = 43
        //heightZ1 = 35
    }

    if(widthZ1) {
        z0moveOffset = 480 + width * height * 4
        z1offset = z0moveOffset + width * height * 4
        //z1moveOffset = z1offset + width * height * 4
        z1moveOffset = z1offset + width * height * 4
    } else {
        z0moveOffset = 480 + width * height * 4
    }


    for (var i = 0; i < width * height * 4; i += 4) {
        dataZ0P.push((data.readUInt32LE(offset + i) + 1))  // 타일 번호 1부터 시작이라 1 더해줘야함


        // todo : 타일 order 규칙 찾아야함
        dataZ0S.push((data.readUInt32LE(offset + i) + 1 + numberOfTilesInTileset))
        //if(data.readUInt16LE(z0moveOffset + i + 2) > 10){
        //    dataZ0S.push((data.readUInt32LE(offset + i) + 1)) // 타일 order가 10 넘으면 S레이어에 P레이어 타일셋을 그린다
        //} else {
        //    dataZ0S.push((data.readUInt32LE(offset + i) + 1 + numberOfTilesInTileset)) // 타일 order가 0이면 S레이어 타일셋을 그린다
        //}

        dataZ0move.push(data.readUInt16LE(z0moveOffset + i))
        dataZ0order.push(data.readUInt16LE(z0moveOffset + i + 2))

        if (widthZ1) {
            
            try{
                dataZ1P.push((data.readUInt32LE(z1offset + i) + 1))  // 타일 번호 1부터 시작이라 1 더해줘야함
                dataZ1S.push((data.readUInt32LE(z1offset + i) + 1 + numberOfTilesInTileset))

                //if(data.readUInt16LE(z1moveOffset + i + 2) > 10){   // 타일 order가 10 넘으면 S레이어에 P레이어 타일셋을 그린다
                //    dataZ1S.push((data.readUInt32LE(z1offset + i) + 1))
                //} else {
                //    dataZ1S.push((data.readUInt32LE(z1offset + i) + 1 + numberOfTilesInTileset))
                //}

                dataZ1move.push(data.readUInt16LE(z1moveOffset + i))
                dataZ1order.push(data.readUInt16LE(z1moveOffset + i + 2))
            } catch(e) {
                console.log(e)
                break
            }
        }
    }

    if(j==22) {
        fs.writeFileSync('move.txt', JSON.stringify(dataZ0move))
        fs.writeFileSync('order.txt', JSON.stringify(dataZ0order))
    }

    let outputPTsj =
    {
        "columns": tilesetWidth, "image": tilesetSourceP, "imageheight": tilesetHeight * 48, "imagewidth": tilesetWidth * 64, "margin": 0, "name": jsonData[j]['PCX파일'].slice(1).toLowerCase() + 'p', "spacing": 0, "tilecount": numberOfTilesInTileset, "tiledversion": "1.8.1", "tileheight": 48, "tilewidth": 64, "type": "tileset", "version": "1.8"
    }

    let outputSTsj = JSON.parse(JSON.stringify(outputPTsj))
    outputSTsj.name = jsonData[j]['PCX파일'].slice(1).toLowerCase() + 's'
    outputSTsj.image = tilesetSourceS

    let outputPJson = JSON.parse(JSON.stringify(dataZ0move))
    let outputSJson = JSON.parse(JSON.stringify(dataZ0move))

    let outputTmj = {
        "compressionlevel": 0, "tilewidth": 64, "tileheight": 48, "orientation": "orthogonal", "renderorder": "right-down", "tiledversion": "1.8.1", "width": width, "height": height,
        "layers": [{
            "id": 1, "name": "Z0 P Layer", "opacity": 1, "type": "tilelayer", "visible": true, "width": width, "height": height, "x": 0, "y": 0, "data": dataZ0P,
        }, {
            "id": 2, "name": "Z0 S Layer", "opacity": 1, "type": "tilelayer", "visible": true, "width": width, "height": height, "x": 0, "y": 0, "data": dataZ0S,
        }],
        "tilesets": [{
            "firstgid": 1, 
            ...outputPTsj
        }, {
            "firstgid": ((numberOfTilesInTileset) + 1), 
            ...outputSTsj
        }]
    }
    
    //if (widthZ1 && !checkArrayEqualElements(dataZ1P) && !checkArrayEqualElements(dataZ1S)) { // 그래픽 데이터가 모두 투명인 Z1 레이어에 대해서 데이터 안넣어 봤는데, 전체 tmj 용량 300kb 정도 차이라 그냥 모두 데이터 넣음
    if (widthZ1) {

        outputTmj.layers.push({
            "id": 3, "name": "Z1 P Layer", "opacity": 1, "type": "tilelayer", "visible": true, "width": width, "height": height, "x": 0, "y": 0, "data": dataZ1P,
        })

        outputTmj.layers.push({
            "id": 4, "name": "Z1 S Layer", "opacity": 1, "type": "tilelayer", "visible": true, "width": width, "height": height, "x": 0, "y": 0, "data": dataZ1S,
        })
    }

    let humanRead = false
    let pad = humanRead ? 4 : 0

    fs.writeFileSync('../../mapset/tmj/' + j.toString().padStart(4, '0') + '_' + jsonData[j]['MAP파일'].slice(1) + '.tmj', JSON.stringify(outputTmj, null, pad))
    fs.writeFileSync('../../mapset/tsj/' + jsonData[j]['PCX파일'].slice(1).toLowerCase() + 'p.tsj', JSON.stringify(outputPTsj, null, pad))
    fs.writeFileSync('../../mapset/tsj/' + jsonData[j]['PCX파일'].slice(1).toLowerCase() + 's.tsj', JSON.stringify(outputSTsj, null, pad))

    //fs.writeFileSync('../../mapset/json/' + jsonData[j]['PCX파일'].slice(1).toLowerCase() + 'p.json', JSON.stringify(outputSTsj, null, pad))
    //fs.writeFileSync('../../mapset/json/' + jsonData[j]['PCX파일'].slice(1).toLowerCase() + 's.json', JSON.stringify(outputSTsj, null, pad))

    console.log('map no.' + j + '  ../../mapset/tmj/' + j.toString().padStart(4, '0').toLowerCase() + '_' + jsonData[j]['MAP파일'].slice(1).toLowerCase() + '.tmj');

    //fs.appendFileSync('maplist.txt', j.toString().padStart(4, '0') + '_' + jsonData[j]['MAP파일'].slice(1) + '.tmj' + '\n')  // maplist.txt 를 만들기 위해 사용한 코드

    //fs.appendFileSync('maplist.txt', jsonData[j]['맵 번호'].toString().padStart(4, '0') + '_' + jsonData[j]['지역명'] + '\n')

}

function checkArrayEqualElements(_array)
{
   if(typeof _array !== 'undefined')    
  {
   return !!_array.reduce(function(a, b){ return (a === b) ? a : NaN; });
  }
  return "Array is Undefined";
}
