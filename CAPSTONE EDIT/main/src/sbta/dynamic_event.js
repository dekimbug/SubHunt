class Dynamic_Event_Manager{
    constructor(){
        this.implausible_count = 0
    }

    bearing_is_plausibile_without_dynamic(bearing_obj,track_id,bearing_swing){
        let track = datastore.subsurface_tracks[track_id];
        let buoy = datastore.buoys[bearing_obj.buoy_id];
        let other_bearings = buoy.manual_bearings;
        if(other_bearings.length <= 1){
            buoy.consecutive_bearings_incompatible = false;
            return true;
        }

        //get the implied fzeros for received bearing +/= the bearing swing error on last bearing
        let previous_bearing = other_bearings[other_bearings.length-2];
        let previous_fzero = this.get_plus_minus_fzero(previous_bearing,track,bearing_swing)

        //get the implied fzeros for received bearing +/= the bearing swing error on current bearing
        let current_bearing = other_bearings[other_bearings.length-1];
        let current_fzero = this.get_plus_minus_fzero(current_bearing,track,bearing_swing)

        for(let fzero in current_fzero){
            console.log(previous_fzero.minus_fzero ,current_fzero[fzero], previous_fzero.plus_fzero,fzero)
            if(current_fzero[fzero] <= previous_fzero.plus_fzero && current_fzero[fzero] >= previous_fzero.minus_fzero){
                buoy.consecutive_bearings_incompatible = false;
                return true;
            }
            if(current_fzero[fzero] >= previous_fzero.plus_fzero && current_fzero[fzero] <= previous_fzero.minus_fzero){
                buoy.consecutive_bearings_incompatible = false;
                return true;
            }
        }

        buoy.consecutive_bearings_incompatible = true;
        return false;

    }

    get_plus_minus_fzero(bearing,track,bearing_swing){
        let result = new Object;

        result.nominal_fzero = this.getfzero(bearing,track);

        let bearing_val = bearing.bearing;
        
        let minus_bearing = bearing;
        minus_bearing.bearing = bearing_val - bearing_swing;
        result.minus_fzero = this.getfzero(minus_bearing,track);


        let plus_bearing = bearing;
        plus_bearing.bearing = bearing_val + bearing_swing;
        result.plus_fzero = this.getfzero(plus_bearing,track);

        return result;
    }
    getfzero(bearing_obj,track){
        let fone = bearing_obj.freq;
        let bearing = bearing_obj.bearing;
        let buoy = datastore.buoys[bearing_obj.buoy_id];
        let drift_course = buoy.drift_course;
        let drift_speed = buoy.drift_speed;
        let rel_c_and_s = geomath.get_relative_course_and_speed(drift_course,drift_speed,track.course,track.speed);
        let relcourse = rel_c_and_s.course;
        let relspeed = rel_c_and_s.speed;

        var interiorangle = 90 - geomath.distbtwnangle((bearing+540)%360,relcourse);
        var inboundspeed = Math.sin(geomath.degtorad(interiorangle)) * relspeed / Math.sin(geomath.degtorad(90));
        var fzero = fone + (fone * inboundspeed) / (inboundspeed - 3000);
        return fzero;
    }

    get_received_frequency_to_buoy(buoy_id,f_zero,time_offset=0){
        var buoy = datastore.buoys[buoy_id]
        
        var buoy_position = buoy.get_current_position(time_offset);
        var sub_position = this.get_current_position(time_offset);
        
        var bearing_to_buoy = geomath.get_bearing_between_two_points(sub_position[0],sub_position[1],buoy_position[0],buoy_position[1]);
        var rel_c_and_s = geomath.get_relative_course_and_speed(buoy.drift_course,buoy.drift_speed,this.course,this.speed);
    
        var aob = geomath.distbtwnangle(rel_c_and_s.course,bearing_to_buoy);
    
            let interiorangle = 90 - aob;
            let inboundspeed = Math.sin(geomath.degtorad(interiorangle)) * rel_c_and_s.speed / Math.sin(geomath.degtorad(90));
            let freq = (inboundspeed-3000)*f_zero/2/(inboundspeed-1500);
            return freq;
      }


}