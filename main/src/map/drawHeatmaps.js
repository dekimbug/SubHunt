

let colorPalette = ["red","blue"]


var addressPoints = new Array;
for(let dummyi=0;dummyi<10000;dummyi++){
    addressPoints.push(new Object)
    let point = addressPoints[dummyi]
    point.lon = Math.random() * -30 - 20;
    point.lat = Math.random() * 30 + 10;
    if(point.lat > 25)
        point.pd = 1;
    else
        point.pd = .2;
}

function drawHeatMap(pdIndex){
    var tempData = addressPoints.slice(0);
    var thisData = [];
    console.log(tempData)
    for(var i=0;i<colorPalette.length;i++){
        console.log(tempData.length)
        let threshold = (i+1) / colorPalette.length;
        for(var ii=tempData.length-1;ii>=0;ii--){
            if(tempData[ii][pdIndex] <= threshold){
                thisData.push([tempData[ii].lat,tempData[ii].lon])
                tempData.splice(ii,1);
            }
        }
        var grid = L.TileLayer.maskCanvas({
            radius: 2000,  // radius in pixels or in meters (see useAbsoluteRadius)
            useAbsoluteRadius: true,  // true: r in meters, false: r in pixels
            noMask: true,  // true results in normal (filled) circled, instead masked circles
            lineColor: colorPalette[i],   // color of the circle outline if noMask is true
            color: colorPalette[i]   // color of the circle outline if noMask is true
        });
        console.log(thisData);
        grid.setData(thisData)
        map.addLayer(grid);
        thisData.length = 0;
        
    }

}
