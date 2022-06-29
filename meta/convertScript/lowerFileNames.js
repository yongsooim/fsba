const fs = require('fs');
const { exec } = require("child_process");

const testFolders = [
    '../../wav/bgm/',
    '../../wav/se_event/',
    '../../wav/wav_eft/',
];

testFolders.forEach(testFolder => {
    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {

            // for git
            //exec("git mv --force " + testFolder + file + " " + testFolder+file.toLowerCase(), (error, stdout, stderr) => {
            //    if (error) {
            //        console.log(`error: ${error.message}`);
            //        return;
            //    }
            //    if (stderr) {
            //        console.log(`stderr: ${stderr}`);
            //        return;
            //    }
            //    console.log(`stdout: ${stdout}`);
            //});


            //for windows
            exec("rename " + testFolder + file + " " + testFolder+file.toLowerCase(), (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
        });
    });
})




