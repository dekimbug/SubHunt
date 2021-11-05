class SBTA{
    constructor(){
        this.tracks = [];
        this.c_s_estimate = this.get_course_and_speed_estimates_from_tracks(this.tracks)
        this.freq_stdev = 5000;
        this.track_drawing = null;
        this.heat_map_drawing = null;
        this.fzero = 100;
        this.referenceTime = new Date(0);
    }

    reset(){
        this.tracks.length = 0;
        this.c_s_estimate = null;
        this.referenceTime = new Date();
        this.erase_heatmap();

    }

    incorporate_new_bearing(buoy_id,quantity){
        console.log("INCORPORATE",buoy_id);
        
        var t1 = performance.now();
        let buoy = datastore.buoys[buoy_id];
        let bearings = [];
        for (let i = 0; i < buoy.manual_bearings.length;i++){
            if(buoy.manual_bearings[i].time > this.referenceTime.getTime()){
                bearings.push(buoy.manual_bearings[i])
            }
        }
        let latest_bearing = bearings[bearings.length-1]
        if(this.tracks.length > 0){
            //mark reliability of tracks given new bearing
            this.tracks = this.mark_track_reliability(this.tracks,latest_bearing);

            //assess whether this is the same as the original frequency being tracked, go to 3 stdeviations from the estimated freq +- max deviation
            let fzeroEstimate = this.get_fzero_estimate_from_tracks(this.tracks);
            let maxDeviations = this.getMaxDeivation(fzeroEstimate, 30);
            if (latest_bearing.freq < maxDeviations.low - 3 * fzeroEstimate.stdev || latest_bearing.freq > maxDeviations.high + 3 * fzeroEstimate.stdev){
                datastore.delete_manual_bearing(latest_bearing.id,buoy_id)
                return;
            }
        }

        if(bearings.length < 3)
            return;
        let max_combinations = 10;
        let bearing_combinations = this.get_newest_bearing_combinations(bearings);
        let number_of_combinations = bearing_combinations.length; 
        if(number_of_combinations > max_combinations){
            bearing_combinations = this.getRandomSubarray(bearing_combinations, max_combinations)
        }
        quantity = Math.round(quantity/number_of_combinations);
        let new_tracks = [];
        for(let i = 0;i<bearing_combinations.length;i++){
            let _bearings = bearing_combinations[i];
            let tracks = this.get_speed_fit_course_and_speed(_bearings[0],_bearings[1],_bearings[2],quantity)
            new_tracks = new_tracks.concat(tracks);
            //tracks = getRandomSubarray(arr, size)
        }
        this.tracks = this.combine_tracks(this.tracks,new_tracks,10000)
        this.c_s_estimate = this.get_course_and_speed_estimates_from_tracks(this.tracks)
        var t2 = performance.now();
        console.log("time to run sbta: " + (t2-t1))

    }

    combine_tracks(old_tracks,new_tracks,quantity_desired){
        let combined_tracks = old_tracks.concat(new_tracks);
        let result_tracks = []
        let N = combined_tracks.length;
        let index = Math.round(Math.random() * N)
        let beta = 0.0
        let max_weight = Math.max.apply(Math, combined_tracks.map(function(o) { return o.reliability; }));
        this.max_intensity = max_weight;

        for(let i=0;i<N;i++){
           beta += Math.random() * 2.0 * max_weight;
           while(beta > combined_tracks[index].reliability){
                beta -= combined_tracks[index].reliability;
                index = (index + 1) % N;
           }
           result_tracks.push(combined_tracks[index]);
        }
        result_tracks.length = Math.min(result_tracks.length,quantity_desired);

        //result_tracks = this.fuzz_tracks(result_tracks,.01,3,1);
        return result_tracks;
    }

    fuzz_tracks(tracks,position_fuzz,course_fuzz,speed_fuzz){
        let fuzzed_tracks = [];
        for(let i=0;i<tracks.length;i++){
            let track = tracks[i];
            let direction = Math.random() * 360;
            let distance = geomath.gaussian(0, position_fuzz);//nautical miles
            let newPos = geomath.llFromDistance(track.lat, track.long, distance, direction);
            track.lat = newPos[0];
            track.long = newPos[1];
            track.course = (3600 + geomath.gaussian(track.course, course_fuzz)) % 360;//degrees
            track.speed = Math.max(.1, geomath.gaussian(track.speed, speed_fuzz));//kts

            fuzzed_tracks.push(track);
        }

        return fuzzed_tracks;
    }

    //this is just for testing, does not produce anything usable for the end-user
    build_tracks_and_estimate(bearing1_index,bearing2_index,bearing3_index,track_quantity){
        let bearing1 = datastore.buoys[bearing1_index];
        let bearing2 = datastore.buoys[bearing2_index];
        let bearing3 = datastore.buoys[bearing3_index];
        let tracks = this.get_speed_fit_course_and_speed(bearing1,bearing2,bearing3,track_quantity);

        //mark reliability of the tracks
        tracks = this.mark_track_reliability(tracks).tracks; 
        let estimates = this.get_course_and_speed_estimates_from_tracks(tracks);
        sbta.c_s_estimate = estimates;
        return estimates;
    }

    get_most_recent_bearing_not_in_this_list(bearing1,bearing2,bearing3){
        let all_bearings = datastore.manual_bearings;
        let bearing_id_list = [bearing1.id,bearing2.id,bearing3.id];

        //assumes bearings are in chronological order
        for(var i=all_bearings.length-1;i>-1;i--){
            let this_bearing = all_bearings[i];
            let included = bearing_id_list.includes(this_bearing.id);
            if(!included)
                return this_bearing;
        }

        return null;
    }

    draw_heatmap(){
        sbta.erase_heatmap();
        let tracks = sbta.tracks;
        let heat_data = [];
        let now = new Date();
        for(var i=0;i<tracks.length;i++){
            let track = tracks[i];
            let position = track.get_position_at_time(now);
            let intensity = track.reliability;
            heat_data.push([position[0],position[1],intensity]);
        }
        this.heat_map_drawing = L.heatLayer(heat_data, {radius: 10,max:sbta.max_intensity}).addTo(map);
    }

    erase_heatmap(){
        if(this.heat_map_drawing)
            map.removeLayer(this.heat_map_drawing)
    }

    draw_track(fill){
        let estimate_position = this.get_position_estimate_from_tracks(this.tracks,new Date());
        if(!estimate_position.lat || !estimate_position.long)
            return;
        if(this.drawing){
            this.erase_drawing();
        }

        var position = {lat:estimate_position.reliable_lat,lng:estimate_position.reliable_long} ;
        var styleOptions = {name:this.id,fill:fill,color:"orange",weight:.5,radius: 50,contextmenu: true,    
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: 'View Details',
            callback: function(){datastore.subsurface_tracks[this.id].show_details()}
        },
        ]}
    
            
        
        this.track_drawing = ([L.circle(position, styleOptions).addTo(map),L.circle([position.lat,position.lng - 360], styleOptions).addTo(map),L.circle([position.lat,position.lng + 360], styleOptions).addTo(map)]);
        //.on("click", datastore.subsurface_tracks[this.id].show_details)
    }
        
    erase_track_drawing(){
            map.removeLayer(this.track_drawing[0])
            map.removeLayer(this.track_drawing[1])
            map.removeLayer(this.track_drawing[2])
    }

    get_position_estimate_confidence(tracks,time,threshold_distance,threshold_percentage){
        let track_length = tracks.length;
        time = new Date(time);
        if(track_length === 0)
            return {reliable_percentage:0,confident:false};
        let position_estimate = this.get_position_estimate_from_tracks(tracks,time);
        let total_close = 0;
        for(let i=0;i<track_length;i++){
            let track = tracks[i];
            let track_pos = track.get_position_at_time(time); 
            let distance = geomath.get_distance_between_points(position_estimate.reliable_lat, position_estimate.reliable_long, track_pos[0], track_pos[1]);
            if(distance <= threshold_distance)
                total_close += 1
        }
        let percentage = total_close / track_length;
        let result = new Object;
        result.reliable_percentage = percentage;
        result.confident = (percentage >= threshold_percentage) 
        result.position = position_estimate;
        let now = new Date();
        let time_offset = (time.getTime() - now.getTime()) / 1000 / 60 / 60;
        let primary_track_position = datastore.subsurface_tracks[datastore.primary_subsurface_track_id].get_current_position(time_offset);
        result.distance_to_pri_track = geomath.get_distance_between_points(position_estimate.reliable_lat, position_estimate.reliable_long, primary_track_position[0], primary_track_position[1]);
        return result;
    }

    get_fzero_estimate_from_tracks(tracks){
        //intialize outputs
        let number_of_tracks = tracks.length;

        let fzeroAvg = 0
        let fzeros = [];

        //go over every track, get the x,y components of velocity, push them to arrays, and track totals
        for(let i=0;i<number_of_tracks;i++){
            fzeroAvg += tracks[i].fzero;
            fzeros.push(tracks[i].fzero)
        }

        let result = {};
        result.stdev = geomath.standardDeviation(fzeros);
        result.avg = fzeroAvg / number_of_tracks;

        return result;
    }

    get_position_estimate_from_tracks(tracks,time){
        let tracks_count = tracks.length;
        if(tracks_count === 0){
            return {lat:null,long:null};
        }
        let now = new Date(time);
        let total_reliability = 0;
        
        let result = new Object;
        result.lat = 0;
        result.long = 0;
        result.reliable_lat = 0;
        result.reliable_long = 0;
        for(let i=0;i<tracks_count;i++){
            let track_pos = tracks[i].get_position_at_time(now);
            let reliability = tracks[i].reliability;
            total_reliability += reliability;
            
            result.lat += track_pos[0];
            result.long += track_pos[1];

            result.reliable_lat += track_pos[0] * reliability;
            result.reliable_long += track_pos[1] * reliability;
        }
        result.lat = result.lat / tracks_count;
        result.long = result.long / tracks_count;

        result.reliable_lat = result.reliable_lat / total_reliability;
        result.reliable_long = result.reliable_long / total_reliability;

        return result;
        
    }
    get_course_and_speed_estimates_from_tracks(tracks){
        //intialize outputs
        let number_of_tracks = tracks.length;
        let total_x = 0;
        let total_y = 0;

        //go over every track, get the x,y components of velocity, push them to arrays, and track totals
        for(let i=0;i<number_of_tracks;i++){
            let x = tracks[i].speed * Math.sin(geomath.degtorad(tracks[i].course))
            let y = tracks[i].speed * Math.cos(geomath.degtorad(tracks[i].course))
            total_x += x;
            total_y += y;
        }

        //get the average x,y component
        let average_x = total_x / number_of_tracks;
        let average_y = total_y / number_of_tracks;

        //get the formatted course,speed, and average standard deviation for the result
        let result = new Object;
        result.course = (3600 + geomath.radtodeg(Math.atan2(average_x,average_y))) % 360;
        result.speed = Math.pow(average_x*average_x+average_y*average_y,.5);

        let course_differences = [];
        let speed_differences = [];
        //go over every track, get the distance from mean course and speed
        for(let i=0;i<number_of_tracks;i++){
            let track = tracks[i];
            let speed_difference = track.speed - result.speed;
            let course_difference = geomath.distbtwnangle(result.course,track.course);

            speed_differences.push(speed_difference);
            course_differences.push(course_difference);
        }

        result.speed_standard_deviation = geomath.standardDeviation(speed_differences)
        result.course_standard_deviation = geomath.standardDeviation(course_differences)

        return result;
    }

    check_frequency_match(track,bearing){
        let observed_freq = bearing.freq;
        let observed_bearing = bearing.bearing;
        let rel_c_and_s = track.get_rel_c_and_s(bearing);
        let track_fzero = track.fzero;

        let observed_fzero = this.getfzero(observed_freq,observed_bearing,rel_c_and_s.speed,rel_c_and_s.course);
        let std_dev = observed_fzero / this.freq_stdev;

        let score = this.get_guassian_likelihood(track_fzero,observed_fzero,std_dev);

        return score;
    }

    mark_track_reliability(tracks,bearing){
        let bearing_time = new Date(bearing.time);
        let buoy_id = bearing.buoy_id;
        let measured_bearing = bearing.bearing;
        let bearing_error = bearing.error;
        for(var i=0;i<tracks.length;i++){
            let track = tracks[i];
            let estimated_bearing = track.get_bearing_from_buoy(buoy_id,bearing_time)
            let bearing_difference = geomath.distbtwnangle(estimated_bearing,measured_bearing);
            let reliability = this.get_guassian_likelihood(0,bearing_difference,bearing_error);
            let freq_reliability = this.check_frequency_match(track,bearing)
            tracks[i].reliability = reliability * freq_reliability * freq_reliability;
        }
        return tracks;
    }
    
    mark_track_stdev(tracks){
        //intialize outputs
        let number_of_tracks = tracks.length;
        let x_array = [];
        let y_array = [];

        //go over every track, get the x,y components of velocity, push them to arrays, and track totals
        for(let i=0;i<number_of_tracks;i++){
            let x = tracks[i].speed * Math.sin(geomath.degtorad(tracks[i].course))
            let y = tracks[i].speed * Math.cos(geomath.degtorad(tracks[i].course))
            x_array.push(x);
            y_array.push(y);
        }

        //get the standard deviation of the x,y components
        let stdev_x = geomath.standardDeviation(x_array)
        let stdev_y = geomath.standardDeviation(y_array)
        
        let stdev = (stdev_x + stdev_y) / 2;

        for(let i=0;i<number_of_tracks;i++){
            tracks[i].stdev = 1/Math.pow(stdev,3);
        }      

        return {tracks:tracks,stdev:stdev}
    }

    get_speed_fit_course_and_speed(bearing1,bearing2,bearing3,track_quantity){
        //algorithm parameters
        let mintmarange = 0;
        let range = 2 * geomath.nm_to_yards(datastore.odr);
        let max_speed = 40;
        let considerdop = true;

        //result
        let result = new Array();

        //get bearing information
        let buoy = datastore.buoys[bearing1.buoy_id];
        let perfect_reliability = this.get_guassian_likelihood(0,0,bearing1.error);
        

        for(let i=0;i<track_quantity;i++){
            //store bearing information into bearing/time/freq variables
            let tempbearing1 = geomath.gaussian(bearing1.bearing,bearing1.error);
            let tempbearing2 = geomath.gaussian(bearing2.bearing,bearing2.error);
            let tempbearing3 = geomath.gaussian(bearing3.bearing,bearing3.error);
            let tempfreq1 = bearing1.freq;
            let tempfreq2 = bearing2.freq;
            let tempfreq3 = bearing3.freq;
            //these are in seconds
            let time1 = bearing1.time.getTime() / 1000;
            let time2 = bearing2.time.getTime() / 1000;
            let time3 = bearing3.time.getTime() / 1000;
            
            //get random position along first bearing
            let dist1 = Math.random() * (range - mintmarange) + mintmarange;

            //The following math comes from here: https://math.stackexchange.com/questions/2076508/one-line-broken-into-2-equal-length-segments-intersecting-3-vectors
            //the math was modified slightly to allow for differing times between bearings
            //establish vectors for some linear algebra
            let vect1 = new Array(3);
            let vect2 = new Array(3);
            let vect3 = new Array(3);

            //fill in the vectors
            vect1[0] = Math.sin(geomath.degtorad(tempbearing1));
            vect2[0] = Math.sin(geomath.degtorad(tempbearing2));
            vect3[0] = Math.sin(geomath.degtorad(tempbearing3));
            vect1[1] = Math.cos(geomath.degtorad(tempbearing1));
            vect2[1] = Math.cos(geomath.degtorad(tempbearing2));
            vect3[1] = Math.cos(geomath.degtorad(tempbearing3));
            vect1[2] = 0;
            vect2[2] = 0;
            vect3[2] = 0;
            //this was in the original code, not sure the point since it is overwritten two lines down
            //let vectNum = crossProduct(vect1, vect2);
            let fitratio = (time2-time1)/(time3-time2);
            let vectNum = this.crossProduct(vect2,vect3);
            let vectDenom = this.crossProduct(vect1,vect3);
            var vectorT = (fitratio+1) * vectNum[2] / vectDenom[2];
            vect1 = this.vectorMult(vect1,vectorT);
            let vectResult = this.vectorSub(vect1,vect2)
            
            //this is the implied course from the data
            var course = geomath.radtodeg(Math.atan2(vectResult[0],vectResult[1]));
            
            var x1 = Math.sin(geomath.degtorad(tempbearing1)) * dist1;
            var y1 = Math.cos(geomath.degtorad(tempbearing1)) * dist1;
            var x3 = Math.sin(geomath.degtorad(tempbearing3)) * range;
            var y3 = Math.cos(geomath.degtorad(tempbearing3)) * range;
            let hit = this.line_intersect(x1, y1, (x1 + 100000*Math.sin(geomath.degtorad(course))), (y1 + 100000*Math.cos(geomath.degtorad(course))), 0, 0, x3, y3);
            if(hit.hits == 0){
                course = (course + 180)%360;
                hit = this.line_intersect(x1, y1, x1 + 100000*Math.sin(geomath.degtorad(course)), y1 + 100000*Math.cos(geomath.degtorad(course)), 0, 0, x3, y3);
                if(hit.hits == 0){
                    continue;
                }
            }
            x3 = hit.x;
            y3 = hit.y;
            var coursedist = Math.pow(Math.pow(x3-x1,2)+Math.pow(y3-y1,2),.5);
            let calcspeed = coursedist / 2000 / ((time3 - time1)/60/60);
            if(calcspeed > max_speed)
                continue;
            course = (course +360) % 360;
            if(considerdop == true){
                var firstf = this.getfzero(tempfreq1,tempbearing1,calcspeed,course);
                firstf = Math.round(firstf * 10) / 10;
                var secondf = this.getfzero(tempfreq2,tempbearing2,calcspeed,course);
                secondf = Math.round(secondf * 10) / 10;
                var thirdf = this.getfzero(tempfreq3,tempbearing3,calcspeed,course);
                thirdf = Math.round(thirdf * 10) / 10;

                if(Math.abs(firstf-secondf) > thirdf/this.freq_stdev || Math.abs(secondf-thirdf) > firstf/this.freq_stdev || Math.abs(thirdf-firstf) > secondf/this.freq_stdev)
                    continue;
            }

            
            let freq_stdev = firstf / this.freq_stdev;
            let freq_reliability = this.get_guassian_likelihood(firstf,firstf,freq_stdev);
            
            let absolute_c_and_s = geomath.get_absolute_course_and_speed(buoy.drift_course,buoy.drift_speed,course,calcspeed);
            let pos = geomath.llFromDistance(bearing1.lat, bearing1.long, geomath.yards_to_nm(dist1), tempbearing1);
            result.push(new Object);
            let index = result.length - 1;
            let track = new SBTA_Track(pos[0],pos[1],new Date(bearing1.time),absolute_c_and_s.course,absolute_c_and_s.speed,firstf,freq_reliability*perfect_reliability)

            let other_bearing = this.get_most_recent_bearing_not_in_this_list(bearing1,bearing2,bearing3);
            if(other_bearing){
                track = this.mark_track_reliability(track,other_bearing)
            }


            result[index] = track;

        }
        return result;
    }

    get_newest_bearing_combinations(bearing_array){
        if(bearing_array.length < 3){
            return null;
        }

        let group_quantity = 3;
        let number_of_bearings = bearing_array.length;
        let combinations = [];

        for(var i=0;i<number_of_bearings-(group_quantity-1);i++){
            for(var ii=i+1;ii<number_of_bearings-(group_quantity-2);ii++){
                combinations.push([bearing_array[i],bearing_array[ii],bearing_array[number_of_bearings-1]])
            }
        }
        return (combinations);
    }

    get_bearing_combinations(bearing_array){
        if(bearing_array.length < 3){
            return null;
        }

        let group_quantity = 3;
        let number_of_bearings = bearing_array.length;
        let combinations = [];

        for(var i=0;i<number_of_bearings-(group_quantity-1);i++){
            for(var ii=i+1;ii<number_of_bearings-(group_quantity-2);ii++){
                for( var iii=ii+1;iii<number_of_bearings;iii++){
                    combinations.push([bearing_array[i],bearing_array[ii],bearing_array[iii]])
                }
            }
        }
        return (combinations);
    }

    getfzero(fone,bearing,relspeed,relcourse){
        var interiorangle = 90 - geomath.distbtwnangle((bearing+540)%360,relcourse);
        var inboundspeed = Math.sin(geomath.degtorad(interiorangle)) * relspeed / Math.sin(geomath.degtorad(90));
        var fzero = fone + (fone * inboundspeed) / (inboundspeed - 3000);
        return fzero;
    }

    getMaxDeivation(fzero,speed){
        let result = {}
        result.high = fzero * (speed - 3000) / (1 + speed)
        result.low = fzero * (-1*speed - 3000) / (1 - speed)

        return result;
    }

    line_intersect(x1, y1, x2, y2, x3, y3, x4, y4)
    {
        var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
        if (denom == 0) {
            return null;
        }
        ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
        ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
        var hit = false;
        if(ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1)
            hit = true;
        return {
            x: x1 + ua*(x2 - x1),
            y: y1 + ua*(y2 - y1),
            seg1: ua >= 0 && ua <= 1,
            seg2: ub >= 0 && ub <= 1,
            hits: hit
        };
    }

    crossProduct(v1, v2) {
        let vR = new Array(3);
        vR[0] =   ( (v1[1] * v2[2]) - (v1[2] * v2[1]) );
        vR[1] = - ( (v1[0] * v2[2]) - (v1[2] * v2[0]) );
        vR[2] =   ( (v1[0] * v2[1]) - (v1[1] * v2[0]) );
        return vR;
    }
      
    vectorAdd(v1, v2){
        let vR = new Array(3);
        vR[0] =   ( (v1[0] + v2[0]));
        vR[1] =   ( (v1[1] + v2[1]));
        vR[2] =   ( (v1[2] + v2[2]));
        return vR;
    }
      
    vectorSub(v1, v2){
        let vR = new Array(3);
        vR[0] =   ( (v1[0] - v2[0]));
        vR[1] =   ( (v1[1] - v2[1]));
        vR[2] =   ( (v1[2] - v2[2]));
        return vR;
    }
      
    vectorMult(v1, scalar){
        let vR = new Array(3);
        vR[0] =   ( (v1[0] * scalar));
        vR[1] =   ( (v1[1] * scalar));
        vR[2] =   ( (v1[2] * scalar));
        return vR; 
    }

    //taken from: https://stackoverflow.com/questions/11935175/sampling-a-random-subset-from-an-array
    getRandomSubarray(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }

    get_guassian_likelihood(mu,x,sigma){
        return Math.exp( -((mu - x) ** 2) / (sigma ** 2) / 2) / Math.sqrt(2 * Math.PI * (sigma ** 2))    
    }

    startLostContact() {
        var lostTracks = [];
        for (var i = 0; i < this.tracks.length; i++) {
            var track = this.tracks[i];
            var direction = Math.random() * 360;
            var distance = Math.random() * .5;
            var course = geomath.gaussian(track.course, 180);
            var speed = Math.random() * 20

            var pos = geomath.rhumbDestination(track.get_position_at_time(new Date()),distance,direction);
            lostTracks.push(new SBTA_Track(pos[0],pos[1],new Date(),course,speed,this.fzero,0))
        }
        this.tracks = lostTracks;
    }

}

class SBTA_Track{
    constructor(lat,long,time,course,speed,fzero,reliability=0){
        this.lat = lat;
        this.long = long;
        this.time = new Date(time);
        this.course = course;
        this.speed = speed;
        this.fzero = fzero;
        this.reliability = reliability;
    }

    get_distance_to_subsurface_track(track_id){
        let now = new Date();
        let sub_track = datastore.subsurface_tracks[track_id];
        let sub_track_pos = sub_track.get_current_position(0);
        let sbta_track_pos = this.get_position_at_time(now);

        let distance = geomath.get_distance_between_points(sub_track_pos[0], sub_track_pos[1], sbta_track_pos[0], sbta_track_pos[1]);
        return distance;

    }

    get_position_at_time(pos_time){
        pos_time = new Date(pos_time);
        let elapsed_time = (pos_time.getTime() - this.time.getTime()) / 1000 / 60 / 60;//hours;
        let distance_traveled = this.speed * elapsed_time;
        let new_pos = geomath.llFromDistance(this.lat, this.long, distance_traveled, this.course);
        return new_pos;
    }

    get_bearing_from_buoy(buoy_id,pos_time){
        pos_time = new Date(pos_time);
        let now = new Date();
        let time_offset = (pos_time.getTime() - now.getTime()) / 1000 / 60 / 60;

        var buoy = datastore.buoys[buoy_id]
        var buoy_pos = buoy.get_current_position(time_offset);
    
        var current_position = this.get_position_at_time(pos_time);
    
        var bearing_from_buoy_to_sub = geomath.get_bearing_between_two_points(buoy_pos[0],buoy_pos[1],current_position[0],current_position[1]);
        return bearing_from_buoy_to_sub;
      }

      get_rel_c_and_s(bearing){
        let buoy = datastore.buoys[bearing.buoy_id];
        let drift_course = buoy.drift_course;
        let drift_speed = buoy.drift_speed;

        let rel_c_and_s = geomath.get_relative_course_and_speed(drift_course,drift_speed,this.course,this.speed)
        return rel_c_and_s;
      }


}