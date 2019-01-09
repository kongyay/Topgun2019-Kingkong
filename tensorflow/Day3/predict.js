const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');


async function main(){
    // PREDICTION
    const model = await tf.loadModel('file://model/model.json');

    let xx = [[1533229200000]];
    let xxx = tf.tensor2d(xx);
    xxx = tf.reshape(xxx,[1,1,1]);

    const r = model.predict(xxx);
    let result = r.dataSync()[0];
    console.log('RESULT',result);
}

main();