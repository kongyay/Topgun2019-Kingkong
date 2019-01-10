const tf = require('@tensorflow/tfjs');
require('@tensorflow/tfjs-node');

var data = [];
const MAXY = 36.50
const MINY = 28.615
// READ

function denorm(result){
    return result*(MAXY-MINY)+MINY
}
// [1,2,3,4,5,6,7,8,9,10,11,12]
module.exports = async (data) => {
    // CSV DAYS
    const model = await tf.loadModel('file://model/model.json');

    // PREPARE
    data = data.map((yi) => {
        return parseFloat(((yi-MINY)/(MAXY-MINY)).toFixed(4));
    })
    
    let xx = [data];
    //console.log(xx[0].map((xi)=> denorm(xi)))
    let xxx = tf.tensor2d(xx);
    xxx = tf.reshape(xxx,[1,12,1]);

    const r = model.predict(xxx);
    let result = r.dataSync();
    n_result = result.map(r => denorm(r))
    //console.log(data[i][0],'=>',n_result);
    return n_result

}