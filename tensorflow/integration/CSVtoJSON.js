
var fs = require('fs');
var data = []

var fileContents = fs.readFileSync('./sanam.csv');
var lines = fileContents.toString().split('\n');

for (var i = 1; i < lines.length; i++) {
    var subline = lines[i].toString().split(';');
    //console.log(subline)
    for(var k = 1;k < subline.length; k++) {
        var hourly = {
            "timestamp": `${subline[0]}T${(k-1<10? '0':'') + (0+k-1)}:00:00.000+07:00`,
            "P-IN": parseInt(subline[k]),
            "P-OUT": 0
        }
        data.push(hourly)
    }
    
    

}

console.log(data)


fs.writeFile("bigchunkus.json", JSON.stringify(data), function(err) {
    if (err) {
        console.log(err);
    }
});

/*
{
    timestamp: "YYYY-MM-DDTHH:00:00:000Z",
    P-IN: xxx,
    P-OUT: 0
}

*/