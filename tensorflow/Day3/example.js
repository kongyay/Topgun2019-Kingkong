const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var data = []
var xs = [];
var ys = [];

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
    return data
}

async function prepareData() {
    // let MAX = -999;
    // const len = data.length
    // for (i=0; i<len; i++) {
    //     if (MAX <= data[i]) {
    //         MAX = data[i];
    //     }
    // }
    
    // let dataset = data.map((number) => {
    //     return number/MAX;
    // })

    // let arr = range(TIME_STEP, dataset.length - NUM_OUT + 1);

    // arr.forEach(function(i) {
        
    // });

       //[T1,P1,S1],[T2,P2,S2],[T3,P3,S3]
   xs = data.map(d => [d[0]]);
   ys = data.map(d => d[1]);
    
}

const model = tf.sequential();

model.add(tf.layers.lstm({
    units: 50, // Node in layer
    inputShape: [1,1], // [Time Step, Dimension]
    returnSequences: false
}));

model.add(tf.layers.dense({
    units: 1, // Node = How many output we want ?
    kernelInitializer: 'VarianceScaling', // Randomer
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
                batchSize: 1, // How many data per train
                epochs: 100,
                shuffle: true, // Pick randomly. not Order
                validationSplit: 0.2 // 0.2 = 80 train & 20 test
            });
    }

    readCSV()
    
    await prepareData();
    console.log(xs)

    try {
        trainXS = tf.tensor2d(xs);
        trainXS = tf.reshape(trainXS,[-1,1,1]); // 2d to 3d shape (-1: auto) [Data,Step,Feature]

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

    let xx = [[10,20,30]];
    let xxx = tf.tensor2d(xx);
    xxx = tf.reshape(xxx,[1,3,1]);

    const r = model.predict(xxx);
    let result = r.dataSync()[0];
    console.log('RESULT',result);
}

main();