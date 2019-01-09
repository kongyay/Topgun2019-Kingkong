const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var data = [];

// READ
function readCSV() {
    data = []
    var fs = require('fs');
    var fileContents = fs.readFileSync('./THB_input.csv');
    var lines = fileContents.toString().split('\n');

    for (var i = 0; i < lines.length; i++) {
        var subline = lines[i].toString().split(',');
        var corrected = [new Date(subline[0]+subline[1]).getTime(),parseFloat(subline[2])]
        data.push(corrected);
    }
}

async function main(){
    // PREDICTION
    const model = await tf.loadModel('file://model/model.json');
    readCSV()
    
    for(let i=0;i<data.length;i++) {
        let xx = [[data[i][0]]];
        let xxx = tf.tensor2d(xx);
        xxx = tf.reshape(xxx,[1,1,1]);

        const r = model.predict(xxx);
        let result = r.dataSync()[0];
        console.log(data[i][0],'=>',result,"Actual:",data[i][1]);
    }

}

main();