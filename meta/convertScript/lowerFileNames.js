const fs = require('fs');
const { exec } = require("child_process");




const testFolder = '../../mapset/json/';

fs.readdir(testFolder, (err, files) => {
    files.forEach(file => {

        exec("git mv --force " + testFolder + file + " " + testFolder+file.toLowerCase(), (error, stdout, stderr) => {
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



