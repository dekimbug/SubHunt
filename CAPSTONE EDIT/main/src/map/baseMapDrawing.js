const Window_Manager = new WindowManager("[data-window-container]");

const mapTemplate = `<div id = "map" style = "height: 200px"></div>`
//Window_Manager.addWindow("300px", "300px", 0, "Map", 1, mapTemplate )

//Window_Manager.addWindow(1, 2, 300, "home", 4);


//build map of the world
var map = L.map('jarvis-main', {
    worldCopyJump: false,
    maxBoundsViscosity: 1,
    contextmenu: true,
    contextmenuWidth: 140,
    measureControl: true,
    contextmenuItems: [{
        text: 'Center map here',
        callback: centerMap
    },
    {
        text: 'Show Bathymetry',
        callback: drawingUtils.toggleBathy
    },
    ////////////////////////////////////
    //add individual Sonobuoy functionality
    ////////////////////////////////////
    // {
    //     text: 'Add Sonobuoy Here',
    //     callback: addSonobuoy
    // },
    ]
}).setView([43, 0], 2);
map.setMaxBounds([[-90, -720], [90, 720]])
map.options.maxZoom = 20;
function centerMap(e) {
    map.panTo(e.latlng);
}


//draw landmasses
var theGrid = L.vectorGrid.slicer(largeWorld, {
    vectorTileLayerStyles: {
        sliced: {
            weight: 0,
            zIndex:15,
            fillColor: '#9bc2c4',
            fillOpacity: 1,
            color: "black",
            stroke: true,
            fill: true
        }
    }
}).addTo(map);

var myStyle = {
    "color": "#ff7800",
    "weight": 1,
    "opacity": .4
};
//draw bathy data
//var oceanContours = L.geoJSON(bathy,{style:myStyle}).addTo(map);

var oceanContours2 = L.vectorGrid.slicer(bathy, {
    vectorTileLayerStyles: {
        sliced: {
            weight: 1,
            opacity: .4,
            color: "#ff7800",
            stroke: true,
            fill: false
        }
    }
})
//add listeners
map.on('mousemove', function (e) {
    var lat = drawingUtils.formatLat(e.latlng.lat);
    var lon = drawingUtils.formatLon(e.latlng.lng);
    document.getElementById("latLongReadout").innerHTML = lat + "/" + lon;
});

map.on('click', function (e) {

});

//add corner readouts
L.Control.textbox = L.Control.extend({
    onAdd: function (map) {

        var text = L.DomUtil.create('div');
        text.id = "latLongReadout";
        return text;
    },

    onRemove: function (map) {
        // Nothing to do here
    }
});
L.control.textbox = function (opts) { return new L.Control.textbox(opts); }
L.control.textbox({ position: 'bottomleft' }).addTo(map);


L.Control.textbox = L.Control.extend({
    onAdd: function (map) {

        var text = L.DomUtil.create('div');
        text.id = "pdReadout";
        return text;
    },

    onRemove: function (map) {
        // Nothing to do here
    }
});
L.control.textbox = function (opts) { return new L.Control.textbox(opts); }
L.control.textbox({ position: 'bottomright' }).addTo(map);


$('#map').css('cursor', 'default');
