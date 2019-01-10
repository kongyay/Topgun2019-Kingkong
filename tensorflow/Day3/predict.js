const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var data = [];

// READ
function readCSV() {
    data = []
    var fs = require('fs');
    var fileContents = fs.readFileSync('./THB.csv');
    var lines = fileContents.toString().split('\n');

    for (var i = 0; i < lines.length; i++) {
        var subline = lines[i].toString().split(',');
        var corrected = [new Date(subline[0]+subline[1]),parseFloat(subline[2])]
        data.push(corrected);      
    }
    data.sort(function(a,b){
        return a[0] - b[0];
    });
}

async function main(){
    // CSV DAYS
    const model = await tf.loadModel('file://model/model.json');
    readCSV()

    // PREPARE
    let num = 5
    data = data.map(d => d[1])
    
    for(let i=0;i<num;i++) {
        let xx = [[data.slice(data.length-3)]];
        console.log(xx)
        let xxx = tf.tensor2d(xx);
        xxx = tf.reshape(xxx,[1,3,1]);

        const r = model.predict(xxx);
        let result = r.dataSync()[0];
        console.log(data[i][0],'=>',result,"Actual:",data[i][1]);
    }

}

main();