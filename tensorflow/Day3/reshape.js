const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var data = []
var xs = [];
var ys = [];

let MAXY = -999;
let MINY = 999

function range(start, end) {
    var ans = [];
    for (let i = start; i < end; i++) {
        ans.push(i);
    }
    return ans;
}

// READ
function readCSV() {
    data = []
    var fs = require('fs');
    var fileContents = fs.readFileSync('./THB.csv');
    var lines = fileContents.toString().split('\n');

    for (var i = 0; i < lines.length; i++) {
        var subline = lines[i].toString().split(',');
        var corrected = [new Date(subline[0]+subline[1]).getTime(),parseFloat(subline[2])]
        data.push(corrected);
    }
    return data.reverse()
}

async function prepareData() {
    xs = []
    ys = []
    let mappedX = data.map(d => d[0]);
    let mappedY = data.map(d => d[1]);
    for (let i=0; i<mappedX.length-2; i++) {
        xs.push([mappedX[i],mappedX[i+1],mappedX[i+2]])
        ys.push((mappedY[i]+mappedY[i+1]+mappedY[i+2])/3)
    }


    for (let i=0; i<ys.length; i++) {
        if (MAXY < ys[i]) {
            MAXY = ys[i];
        }
        if (MINY > ys[i]) {
            MINY = ys[i];
        }
    }

    

    ys = ys.map((yi) => {
        return (yi-MINY)/(MAXY-MINY);
    })

    // let arr = range(TIME_STEP, dataset.length - NUM_OUT + 1);

    // arr.forEach(function(i) {
        
    // });

       //[T1,P1,S1],[T2,P2,S2],[T3,P3,S3]
    
}

const model = tf.sequential();

model.add(tf.layers.lstm({
    units: 64, // Node in layer
    inputShape: [3,1], // [Time Step, Dimension]
    returnSequences: true
}));

model.add(tf.layers.lstm({
    units: 64, // Node in layer
    returnSequences: false
}));

model.add(tf.layers.dense({
    units: 1, // Node = How many output we want ?
   // kernelInitializer: 'VarianceScaling', // Randomer
    activation: 'relu'
}));

const LEARNING_RATE = 0.001;
const optimizer = tf.train.adam(LEARNING_RATE);

model.compile({
    optimizer: optimizer,
    loss: 'meanSquaredError',
    metrics: ['accuracy'],
});

async function main(){
	async function trainModel(){
        const history = await model.fit(
            trainXS,
            trainYS,
            {
                batchSize: 128, // How many data per train
                epochs: 20,
                shuffle: false, // Pick randomly. not Order
                validationSplit: 0.2 // 0.2 = 80 train & 20 test
            });
    }

    readCSV()
    
    await prepareData();
    console.log(xs)
    console.log(ys)

    try {
        trainXS = tf.tensor2d(xs);
        trainXS = tf.reshape(trainXS,[-1,3,1]); // 2d to 3d shape (-1: auto) [Data,Step,Feature]

        trainYS = tf.tensor1d(ys);
        trainYS = tf.reshape(trainYS,[-1,1]); // 2d to 3d shape (-1: auto) [Data,Feature]
    
        await trainModel();
    } catch (error) {
        console.log('TRAIN ERR:', error.message);
    } 
    const saveResult = await model.save('file://model');
    
    const load = async () => {
        const model = await tf.loadModel('file://model/model.json');
      };
      
    load();

    let xx = [[1533229200000]];
    let xxx = tf.tensor2d(xx);
    xxx = tf.reshape(xxx,[1,3,1]);

    const r = model.predict(xxx);
    let result = r.dataSync()[0];
    let n_result = result*(MAXY-MINY)+MINY
    console.log('RESULT',n_result);
}

main();