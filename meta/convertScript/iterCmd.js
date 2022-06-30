const fs = require('fs');
const { exec } = require("child_process");

const testFolders = [
    ['../../wav/bgm/', '../../webm/bgm/'],
    ['../../wav/se_event/', '../../webm/se_event/'],
    ['../../wav/wav_eft/', '../../webm/wav_eft/'],
];

testFolders.forEach(testFolder => {
    fs.readdir(testFolder[0], (err, files) => {
        files.forEach(file => {

            // wav -> webm
            const cmd = "ffmpeg -i " + testFolder[0] + file + " " + testFolder[1]+file.replace(/\.[^/.]+$/, "") + ".webm"
            //console.log(cmd)
            exec(cmd, (error, stdout, stderr) => {
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




