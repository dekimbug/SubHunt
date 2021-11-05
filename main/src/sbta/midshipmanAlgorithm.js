class MidshipmanAlgorithm {
    constructor() {
        //this established all of your important class variables
        this.position_estimate = [0, 0];
        this.tracks = [];
        this.c_s_estimate = {course:45, speed:10}
        this.referenceTime = new Date(0);//this is the time that all of the tracks are based off of
        this.max_intensity = 100;//used for the heatmap
    }

    reset() {
        this.tracks.length = 0;
        this.c_s_estimate = null;
        this.referenceTime = new Date();
        this.erase();

    }

    incorporate_new_bearing(buoy_id, quantity) {
        //get the buoy of the new bearing
        let buoy = datastore.buoys[buoy_id];
        let bearings = [];
        //get all the bearings from this buoys that have happened since referenceTime
        for (let i = 0; i < buoy.manual_bearings.length; i++) {
            if (buoy.manual_bearings[i].time > this.referenceTime.getTime()) {
                bearings.push(buoy.manual_bearings[i])
            }
        }
        //get the latest bearing to do something with
        let latest_bearing = bearings[bearings.length - 1];


        //set these for evaluation
        this.position_estimate = [0, 0];
        this.c_s_estimate = {course:45, speed:10}
    }

    draw() {
        midshipmanAlgorithm.erase()
    }

    erase() {
        //erase the drawing/heatmap here
    }


}

