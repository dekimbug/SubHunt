class Buoy {
    constructor(id, rf, lat, long, deploy_time, lsu_time, type, depth, life, drift_course, drift_speed, props) {
        this.id = id;
        this.rf = rf;
        this.lat = lat;
        this.long = long;
        this.current_lat_long = this.get_current_position;//array where 0 is lat, 1 is long
        this.life_remaining = this.get_life_remaining;
        this.lsu_time = new Date(lsu_time);
        this.deploy_time = new Date(deploy_time)
        this.type = type;
        this.depth = depth;
        this.life = life;
        this.drift_course = drift_course;
        this.drift_speed = drift_speed;
        this.props = props;

        this.cpa_predict = { "up_doppler": false };
        this.up_doppler = false;
        this.lost = true;
        this.drawing = null;
        this.manual_bearings = [];
        this.type = "DIFAR"
        this.consecutive_bearings_incompatible = false;
    }

    //need a drawing function

    get_life_remaining() {
        var time_left = new Date(this.deploy_time.getTime() + this.life * 60 * 60 * 1000)
        return time_left
    }

    get_current_position(time_offset) {
        if (!time_offset)
            time_offset = 0;
        var current_time = new Date();
        var time_elapsed = (current_time.getTime() - this.lsu_time.getTime()) / 1000 / 60 / 60 + time_offset;//hours
        var distance_traveled = this.drift_speed * time_elapsed;//nm
        var latlong = geomath.llFromDistance(this.lat, this.long, distance_traveled, this.drift_course)
        return latlong;
    }


    draw(fill) {
        if (this.drawing) {
            this.erase_drawing();
        }
        var current_pos = this.get_current_position(0);
        var position = { lat: current_pos[0], lng: current_pos[1] };

        let buoy_color = "grey";
        if (this.up_doppler)
            buoy_color = "green"
        if (this.up_doppler === false && this.lost === false)
            buoy_color = "yellow"
        var styleOptions = {
            name: this.id, fill: fill, color: buoy_color, weight: .5, radius: datastore.odr * 1852, contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [{
                text: 'Delete Tactic',
                callback: function () { buoyUtils.deleteTactic(theId) }
            },
            ]
        }


        if (this.drawing) {
            this.erase_drawing();
        }

        var mysymbol = new ms.Symbol(
            "GPGPGPUYD---SVG", {
            size: 20,
            color: buoy_color,
        })

        var myicon = L.divIcon({
            className: '',
            html: mysymbol.asSVG(),
            iconAnchor: new L.Point(mysymbol.getAnchor().x, mysymbol.getAnchor().y)
        });



        //L.marker(position, { icon: myicon, draggable: true }).addTo(map);

        var styleOptionsMarker = {
            name: this.id,//fill:fill,color:"black",weight:.5,radius: 200,
            icon: myicon,
            contextmenu: true,
            contextmenuWidth: 140,
            contextmenuItems: [{
                text: 'View Details',
                callback: function () { datastore.subsurface_tracks[this.id].show_details() }
            },
            ]
        }

        this.drawing = ([L.circle(position, styleOptions).addTo(map).on("click", datastore.buoys[this.id].show_details),
        L.circle([position.lat, position.lng - 360], styleOptions).addTo(map).on("click", datastore.buoys[this.id].show_details),
        L.circle([position.lat, position.lng + 360], styleOptions).addTo(map).on("click", datastore.buoys[this.id].show_details),
        L.marker([position.lat, position.lng + 360], styleOptionsMarker).addTo(map).on("click", datastore.buoys[this.id].show_details),
        L.marker([position.lat, position.lng - 360], styleOptionsMarker).addTo(map).on("click", datastore.buoys[this.id].show_details),
        L.marker(position, styleOptionsMarker).addTo(map).on("click", datastore.buoys[this.id].show_details)]);
    }

    erase_drawing() {
        for (let i = 0; i < this.drawing.length; i++) {
            map.removeLayer(this.drawing[i])
        }
        this.drawing = null;
    }

    show_details() {
        console.log(this.id)
    }

}