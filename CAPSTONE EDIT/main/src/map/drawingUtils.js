var drawingUtils = {


    removeLayer(name){
        map.eachLayer( function(layer) {
            if(layer.options.name != name){
                console.log(layer.options.name == name);
            }
        });
    },

    formatLat(lat){
        var side = "N";
        if(lat < 0){
            side = "S";
        }
        
        lat = Math.abs(Math.round(lat*100)/100);
        return lat + side;
    },

    formatLon(lon){
        var side = "E";
        if(lon < 0){
            side = "W";
        }
        
        lon = Math.abs(Math.round(lon*100)/100);
        return lon + side;
    },

    toggleBathy(){
        if(map.hasLayer(oceanContours2)){
            map.removeLayer(oceanContours2); 
            map.contextmenu.removeItem(5)
            map.contextmenu.insertItem({text:"Show Bathmetry",callback:drawingUtils.toggleBathy},5)  
        }
        else{
            map.addLayer(oceanContours2);
            map.contextmenu.removeItem(5)
            map.contextmenu.insertItem({text:"Hide Bathmetry",callback:drawingUtils.toggleBathy},5)
        }
    },


}