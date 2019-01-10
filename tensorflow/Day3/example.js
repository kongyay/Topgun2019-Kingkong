const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var data = []
var xs = [];
var ys = [];

let MAXX = -999;
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

    for (var i = 0; i < lines.length/20; i++) {
        var subline = lines[i].toString().split(',');
        var corrected = [new Date(subline[0]+subline[1]),parseFloat(subline[2])]
        data.push(corrected);
    }
    data.sort((a,b) => a[0]-b[0])
    return data
}

async function prepareData() {
    
    // xs = data.map(d => [d[0]]);
    // ys = data.map(d => d[1]);

    xs = []
    ys = []

    // let mappedX = data.map(d => d[0]);
    let mappedY = data.map(d => d[1]);
    
    // for (let i=0; i<xs.length; i++) {
    //     if (MAXX <= xs[i]) {
    //         MAXX = xs[i];
    //     }
    // }

    for (let i=0; i<mappedY.length; i++) {
        if (MAXY < mappedY[i]) {
            MAXY = mappedY[i];
        }
        if (MINY > mappedY[i]) {
            MINY = mappedY[i];
        }
    }

    // let xs = data.map((number) => {
    //     return number/MAXX;
    // })

    mappedY = mappedY.map((yi) => {
        return (yi-MINY)/(MAXY-MINY);
    })

    for (let i=0; i<mappedY.length-6; i++) {
        xs.push([mappedY[i],mappedY[i+1],mappedY[i+2],mappedY[i+3]])
        ys.push([mappedY[i+4],mappedY[i+5],mappedY[i+6]])
    }

    // let arr = range(TIME_STEP, dataset.length - NUM_OUT + 1);

    // arr.forEach(function(i) {
        
    // });
    
}

var model = tf.sequential();

model.add(tf.layers.lstm({
    units: 64, // Node in layer
    inputShape: [4,1], // [Time Step, Dimension]
    returnSequences: true
}));

model.add(tf.layers.lstm({
    units: 64, // Node in layer
    returnSequences: true
}));

model.add(tf.layers.dropout({
    rate: 0.2
}))

model.add(tf.layers.lstm({
    units: 64, // Node in layer
    returnSequences: false
}));

model.add(tf.layers.dense({
    units: 3, // Node = How many output we want ?
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
                batchSize: 256, // How many data per train
                epochs: 1000,
                shuffle: false, // Pick randomly. not Order
                validationSplit: 0.2 // 0.2 = 80 train & 20 test
            });
            // console.log('History',history.history);/
    }

    readCSV()
    
    // new_xs = []
    await prepareData();
    // for(let i=0;i<xs.length;i++)
    // {
    //     m = [i]
    //     new_xs.push(m)
    // }
    console.log(xs)
    console.log(ys)

    // xs = [ [ 0.2733, 0.2638, 0.2682 ],
    //     [ 0.2638, 0.2682, 0.267 ],
    //     [ 0.2682, 0.267, 0.267 ],
    //     [ 0.267, 0.267, 0.2644 ],
    //     [ 0.267, 0.2644, 0.2682 ],
    //     [ 0.2644, 0.2682, 0.2758 ],
    //     [ 0.2682, 0.2758, 0.2784 ],
    //     [ 0.2758, 0.2784, 0.2746 ],
    //     [ 0.2784, 0.2746, 0.2663 ],
    //     [ 0.2746, 0.2663, 0.267 ]]
    // ys = [ [0.267,0.267,0.2644],
    //     [0.267,0.2644,0.2682],
    //     [0.2644,0.2682,0.2758],
    //     [0.2682,0.2758,0.2784],
    //     [0.2758,0.2784,0.2746],
    //     [0.2784,0.2746,0.2663],
    //     [0.2746,0.2663,0.267],
    //     [0.2663,0.267,0.2562],
    //     [0.267,0.2562,0.267],
    //     [0.2562,0.2663,0.267 ]]

    try {
        trainXS = tf.tensor2d(xs);
        trainXS = tf.reshape(trainXS,[xs.length,4,1]); // 2d to 3d shape (-1: auto) [Data,Step,Feature]

        trainYS = tf.tensor2d(ys);
        trainYS = tf.reshape(trainYS,[ys.length,3]); // 2d to 3d shape (-1: auto) [Data,Feature]
        
        console.log(trainXS)
        console.log(trainYS)

        await trainModel();
    } catch (error) {
        console.log('TRAIN ERR:', error.message);
    } 
    const saveResult = await model.save('file://model');
    
    load = async () => {
        const model = await tf.loadModel('file://model/model.json');
      };
      
    load();

    let xx = [[ 0.2733, 0.2638, 0.2682, 0.267 ]];
    // let xx = [[ 0.2733]];

    
    let xxx = tf.tensor2d(xx);
    xxx = tf.reshape(xxx,[1,4,1]);

    let r = model.predict(xxx);
    let result = r.dataSync()[0];
    let n_result = result*(MAXY-MINY)+MINY
    // console.log('->',r.dataSync().map((data)=> data*(MAXY-MINY)+MINY))
    console.log('->',r.dataSync())
    // console.log('RESULT 1',result,n_result);

    xx = [[ 0.2638, 0.2682, 0.267 ,0.267 ]];
    xxx = tf.tensor2d(xx);
    xxx = tf.reshape(xxx,[1,4,1]);

    r = model.predict(xxx);
    result = r.dataSync()[0];
    n_result = result*(MAXY-MINY)+MINY
    // console.log('RESULT 2',result, n_result);
    
}

main();