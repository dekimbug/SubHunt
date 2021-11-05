class Manual_Bearing {
    constructor(id, buoy_id, time, bearing, error, freq) {
        this.id = id;
        this.buoy_id = buoy_id;
        this.time = new Date(time);
        this.bearing = bearing;
        this.error = error;
        this.freq = freq;

        var position = this.get_buoy_lat_long();
        this.lat = position[0];
        this.long = position[1];

        this.drawing = null;
    }

    get_buoy_lat_long() {
        var now = new Date();
        var time_offset = (this.time.getTime() - now.getTime()) / 1000 / 60 / 60;
        let position = datastore.buoys[this.buoy_id].get_current_position(time_offset);
        return position;
    }

    draw() {
        var bearing_end = geomath.llFromDistance(this.lat, this.long, datastore.odr, this.bearing)

        var latlngs = [
            [this.lat, this.long],
            bearing_end
        ];

        console.log(latlngs)

        let style = { color: "red", weight: 1 }
        this.drawing = (L.polyline(latlngs, style).addTo(map), L.polyline([[this.lat, this.long - 360], [bearing_end[0], bearing_end[1] - 360]], style).addTo(map), L.polyline([[this.lat, this.long + 360], [bearing_end[0], bearing_end[1] + 360]], style).addTo(map));

    }

    erase() {
        if (this.drawing) {
            map.removeLayer(this.drawing);
        }
        this.drawing = null;
    }
}