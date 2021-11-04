class Subsurface_Track {
    constructor(id, primary_track, lat, long, originate_time, lsu_time, course, speed, depth, type, affiliation, source) {
        this.id = id;
        this.primary_track = primary_track;
        this.lat = lat;
        this.long = long;
        this.originate_time = new Date(originate_time);
        this.lsu_time = new Date(lsu_time)
        this.course = course;
        this.speed = speed;
        this.depth = depth;
        this.type = type;
        this.affiliation = affiliation;
        this.source = source;
    }

    //need a drawing function


    set_primary() {
        for (let track_id in datastore.subsurface_tracks) {
            datastore.subsurface_tracks[track_id].primary_track = false;
        }
        this.primary_track = true;
    }

    update_position(time, lat, long) {
        this.lat = lat;
        this.long = long;
        this.lsu_time = new Date(time);
    }

    update_course_and_speed(time, course, speed) {
        let position = this.get_position_at_time(time);
        this.lsu_time = new Date(time);

        this.lat = position[0]
        this.long = position[1];
        this.course = course;
        this.speed = speed;

    }

    evaluate_sbta_conformity(threshold_distance, threshold_percentage) {
        let number_of_sbta_tracks = sbta.tracks.length;

        if (number_of_sbta_tracks === 0) {
            return { conforms: false }
        }

        let this_id = this.id;
        let in_threshold_count = 0;
        for (let i = 0; i < number_of_sbta_tracks; i++) {
            let track = sbta.tracks[i];
            let distance = track.get_distance_to_subsurface_track(this_id);
            if (distance <= threshold_distance)
                in_threshold_count++;
        }

        let result = new Object;
        result.percent = in_threshold_count / number_of_sbta_tracks;
        result.conforms = (result.percent >= threshold_percentage);
        return result;
    }

    predict_lost_contact_to_a_buoy(buoy_id, time_offset = 0) {
        var result = new Object;

        var buoy = datastore.buoys[buoy_id]
        //check if already lost contact, return that it is lost contact if it is
        var current_distance_to_buoy = this.get_distance_to_a_buoy(buoy_id, time_offset);
        if (current_distance_to_buoy > datastore.odr) {
            result.lost_contact = true;
            return result;
        }
        else {
            result.lost_contact = false;
        }

        var buoy_position = buoy.get_current_position(time_offset);
        var sub_position = this.get_current_position(time_offset);

        var bearing_to_buoy = geomath.get_bearing_between_two_points(sub_position[0], sub_position[1], buoy_position[0], buoy_position[1]);
        var rel_c_and_s = geomath.get_relative_course_and_speed(buoy.drift_course, buoy.drift_speed, this.course, this.speed);

        var aob = geomath.distbtwnangle(rel_c_and_s.course, bearing_to_buoy);

        //math taken from here: https://www.calculator.net/triangle-calculator.html?vc=&vx=1&vy=2&va=45&vz=&vb=&angleunits=d&x=72&y=23
        //angle_b is the angle from the lost contact point, side_b is the current sub_to_buoy distance
        //angle_a is the angle from the current sub posit, side_a is the odr
        //angle_c is the angle from the buoy, side_c is the distance to go until lost contact
        var angle_b = geomath.radtodeg(Math.asin(current_distance_to_buoy * Math.sin(geomath.degtorad(aob)) / datastore.odr));
        var angle_c = 180 - angle_b - aob;
        result.distance_to_lost = datastore.odr * Math.sin(geomath.degtorad(angle_c)) / Math.sin(geomath.degtorad(aob));
        var time_till_lost = result.distance_to_lost / rel_c_and_s.speed * 60 * 60 * 1000; //ms

        var current_time = new Date();
        result.lost_time = new Date(current_time.getTime() + time_offset * 60 * 60 * 1000 + time_till_lost);


        return result
    }

    predict_lost_contact_to_all_buoys(time_offset = 0) {

        //establish the lost_time as right now
        var lost_time = new Date();
        var now = new Date();


        //check if we're curently lost, if we are, return the lost time as a second ago
        var currently_lost = this.check_lost_contact(time_offset);
        if (currently_lost) {
            return new Date(lost_time.getTime() - 1000);//return a second ago
        }

        var max_iterations = 10;
        var iteration = 0;
        //Check for the buoy with the latest continuous contact, move the check time to that, check for the latest contact with that start time, repeat
        while (1 == 1) {

            lost_time = new Date(lost_time)
            //get new time offset, add 1 second to avoid infinite loop issues
            //this moves with the latest lost contact, to get chained buoy patterns
            //we had an issue where it would only check the currently in contact buoys, predicting lost when the next buoy would have had contact
            let temp_time_offset = (time_offset + (lost_time.getTime() - now.getTime()) / 1000) / 60 / 60 + 1 / 60 / 60;


            let number_in_contact = 0
            //if we' re not lost right now, let's check the lost time for every buoy
            for (let buoy_id in datastore.buoys) {
                let lost_result = this.predict_lost_contact_to_a_buoy(buoy_id, temp_time_offset);
                //if the current buoy isn't lost contact, adjust the lost time to the later of the current estimate and this estimate
                if (lost_result.lost_contact === false) {
                    lost_time = Math.max(lost_time, lost_result.lost_time);
                    number_in_contact++;
                }
            }


            if (number_in_contact === 0)
                break;
            iteration++
            if (iteration >= max_iterations)
                break;
        }

        //return the latest lost contact time
        return new Date(lost_time);
    }



    predict_cpa_to_a_buoy(buoy_id, time_offset = 0) {

        var result = new Object;

        var buoy = datastore.buoys[buoy_id]
        //check if already CPAd, return that it is down doppler if it is
        result.up_doppler = this.check_up_doppler_to_a_buoy(buoy_id, time_offset)
        if (!result.up_doppler)
            return result;


        var buoy_position = buoy.get_current_position(time_offset);
        var sub_position = this.get_current_position(time_offset);

        var bearing_to_buoy = geomath.get_bearing_between_two_points(sub_position[0], sub_position[1], buoy_position[0], buoy_position[1]);
        var rel_c_and_s = geomath.get_relative_course_and_speed(buoy.drift_course, buoy.drift_speed, this.course, this.speed);

        var aob = geomath.distbtwnangle(rel_c_and_s.course, bearing_to_buoy);

        var range_to_buoy = geomath.get_distance_between_points(sub_position[0], sub_position[1], buoy_position[0], buoy_position[1]);

        //this math taken from here: https://www.calculator.net/triangle-calculator.html?vc=&vx=2&vy=&va=33&vz=&vb=90&angleunits=d&x=35&y=20
        result.distance_to_cpa = range_to_buoy * Math.sin(geomath.degtorad(90 - aob)) / Math.sin(geomath.degtorad(90));
        result.cpa_range = range_to_buoy * Math.sin(geomath.degtorad(aob)) / Math.sin(geomath.degtorad(90));

        var cpa_time_to_go = result.distance_to_cpa / rel_c_and_s.speed * 60 * 60 * 1000; //ms

        var current_time = new Date();
        result.cpa_time = new Date(current_time.getTime() + time_offset + cpa_time_to_go);

        console.log(result)
        datastore.buoys[buoy_id].cpa_predict = result;
        return result;
        //return distance to cpa, time to cpa, time of cpa, range of cpa OR that the cpa already happened
    }

    get_current_position(time_offset = 0) {

        var current_time = new Date();
        var time_elapsed = (current_time.getTime() - this.lsu_time.getTime()) / 1000 / 60 / 60 + time_offset;//hours
        var distance_traveled = this.speed * time_elapsed;//nm
        var latlong = geomath.llFromDistance(this.lat, this.long, distance_traveled, this.course)
        return latlong;
    }

    get_position_at_time(pos_time) {
        pos_time = new Date(pos_time);
        let elapsed_time = (pos_time.getTime() - this.lsu_time.getTime()) / 1000 / 60 / 60;//hours;
        let distance_traveled = this.speed * elapsed_time;
        let new_pos = geomath.llFromDistance(this.lat, this.long, distance_traveled, this.course);
        return new_pos;
    }


    check_lost_contact(time_offset = 0, excepted_buoy_id) {
        let in_contact_count = 0
        for (let buoy_id in datastore.buoys) {
            if (buoy_id === excepted_buoy_id)
                continue;
            let lost = this.check_lost_contact_to_a_buoy(buoy_id, time_offset)
            if (!lost) {
                in_contact_count++;
            }
            if (time_offset === 0) {
                datastore.buoys[buoy_id].lost = lost;
            }
        }
        if (in_contact_count > 0)
            return false;
        else
            return true;
    }


    check_losing_contact(time_offset = 0) {
        let now = new Date();
        now = new Date(now.getTime() + time_offset * 60 * 60 * 1000);
        let number_in_contact = 0;
        let number_down_doppler = 0;
        let number_up_doppler = 0;
        let max_lost_time = new Date();
        let max_lost_buoy_id = null;
        //check all buoys
        for (let buoy_id in datastore.buoys) {
            //check if buoy is in contact
            let lost = this.check_lost_contact_to_a_buoy(buoy_id, time_offset);
            if (!lost) {
                //increment number in contact
                number_in_contact++;

                //check if buoy is up doppler
                let up_doppler = this.check_up_doppler_to_a_buoy(buoy_id, time_offset)
                if (time_offset === 0) {
                    datastore.buoys[buoy_id].up_doppler = up_doppler;
                }
                if (up_doppler) {
                    console.log("found up dop/in contact")
                    number_down_doppler++
                }
                else {
                    number_down_doppler++;
                    //get lost contact time of buoy
                    let buoy_lost_time = new Date(this.predict_lost_contact_to_a_buoy(buoy_id, time_offset).lost_time);
                    //get the latest lost contact time
                    if (buoy_lost_time > max_lost_time) {
                        max_lost_time = new Date(buoy_lost_time);
                        max_lost_buoy_id = buoy_id;
                    }
                }
            }
        }

        if (number_up_doppler > 0)
            return false;

        //see if in contact with any buoys at lost contact time on this buoy
        let temp_offset = (max_lost_time.getTime() - now.getTime()) / 1000 / 60 / 60;
        let contact_after_lost = this.check_lost_contact(temp_offset, max_lost_buoy_id)

        //if there are no buoys in contact, you are lost, not losing
        if (number_in_contact === 0)
            return false;

        //if you have an up doppler buoy in contact once you're lost on the current buoys, you're not losing
        if (!contact_after_lost)
            return false;


        //if we didn't find an up-doppler, in contact buoy, and we have at least one in contact, we are losing contact
        return true;
    }


    check_up_doppler_to_any_buoys(time_offset = 0) {
        var up_dop_count = 0;
        for (var buoy_id in datastore.buoys) {
            var up_dop = this.check_up_doppler_to_a_buoy(buoy_id, time_offset);
            if (up_dop) {
                up_dop_count++;
            }
        }
        if (up_dop_count === 0)
            return false;

        return up_dop_count
    }

    check_up_doppler_to_a_buoy(buoy_id, time_offset = 0) {
        var buoy = datastore.buoys[buoy_id]

        var lost_contact = this.check_lost_contact_to_a_buoy(buoy_id, time_offset)
        if (lost_contact) {
            if (time_offset == 0) {
                buoy.up_doppler = false;
                buoy.lost = true;
            }
            return false;
        }

        var buoy_pos = buoy.get_current_position(time_offset);

        var current_position = this.get_current_position(time_offset)

        var bearing_from_buoy_to_sub = geomath.get_bearing_between_two_points(buoy_pos[0], buoy_pos[1], current_position[0], current_position[1]);

        var relative_course = geomath.get_relative_course_and_speed(buoy.drift_course, buoy.drift_speed, this.course, this.speed).course

        var up_doppler = Math.abs(geomath.distbtwnangle((720 + relative_course) % 360, (720 + (bearing_from_buoy_to_sub)) % 360)) > 90;

        if (time_offset == 0) {
            buoy.up_doppler = up_doppler;
            buoy.lost = false;
        }

        return up_doppler;
    }

    get_bearing_from_buoy(buoy_id, time_offset = 0) {
        var buoy = datastore.buoys[buoy_id]
        var buoy_pos = buoy.get_current_position(time_offset);

        var current_position = this.get_current_position(time_offset)

        var bearing_from_buoy_to_sub = geomath.get_bearing_between_two_points(buoy_pos[0], buoy_pos[1], current_position[0], current_position[1]);
        return bearing_from_buoy_to_sub;
    }


    get_min_distance_to_all_buoys(time_offset = 0) {
        var min_distance = 99999999999999999999999999999999999999999999999999999999;
        for (var buoy in datastore.buoys) {
            var distance = this.get_distance_to_a_buoy(buoy, time_offset);
            if (distance < min_distance) {
                min_distance = distance;
            }
        }
        return min_distance;
    }

    get_distance_to_a_buoy(buoy_id, time_offset = 0) {
        var buoy = datastore.buoys[buoy_id]
        var buoy_pos = buoy.get_current_position(time_offset);

        var current_position = this.get_current_position(time_offset)

        var distance = geomath.get_distance_between_points(current_position[0], current_position[1], buoy_pos[0], buoy_pos[1])

        return distance;
    }

    check_lost_contact_to_a_buoy(buoy_id, time_offset = 0) {
        let distance = this.get_distance_to_a_buoy(buoy_id, time_offset);
        if (distance <= datastore.odr)
            return false;

        return true;
    }

    get_received_frequency_to_buoy(buoy_id, f_zero, time_offset = 0) {
        var buoy = datastore.buoys[buoy_id]

        var buoy_position = buoy.get_current_position(time_offset);
        var sub_position = this.get_current_position(time_offset);

        var bearing_to_buoy = geomath.get_bearing_between_two_points(sub_position[0], sub_position[1], buoy_position[0], buoy_position[1]);
        var rel_c_and_s = geomath.get_relative_course_and_speed(buoy.drift_course, buoy.drift_speed, this.course, this.speed);

        var aob = geomath.distbtwnangle(rel_c_and_s.course, bearing_to_buoy);

        let interiorangle = 90 - aob;
        let inboundspeed = Math.sin(geomath.degtorad(interiorangle)) * rel_c_and_s.speed / Math.sin(geomath.degtorad(90));
        let freq = (inboundspeed - 3000) * f_zero / 2 / (inboundspeed - 1500);
        return freq;
    }



    draw(fill) {
        if (this.drawing) {
            this.erase_drawing();
        }

        var mysymbol = new ms.Symbol(
            "SSUP--------SVG", {
            direction: this.course,
            size: 20,
        })

        var myicon = L.divIcon({
            className: '',
            html: mysymbol.asSVG(),
            iconAnchor: new L.Point(mysymbol.getAnchor().x, mysymbol.getAnchor().y)
        });



        //L.marker(position, { icon: myicon, draggable: true }).addTo(map);

        var current_pos = this.get_current_position(0);
        var position = { lat: current_pos[0], lng: current_pos[1] };
        var styleOptions = {
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



        this.drawing = ([L.marker(position, styleOptions).addTo(map).on("click", datastore.subsurface_tracks[this.id].show_details), L.marker([position.lat, position.lng - 360], styleOptions).addTo(map).on("click", datastore.subsurface_tracks[this.id].show_details), L.marker([position.lat, position.lng + 360], styleOptions).addTo(map).on("click", datastore.subsurface_tracks[this.id].show_details)]);
    }

    erase_drawing() {
        map.removeLayer(this.drawing[0])
        map.removeLayer(this.drawing[1])
        map.removeLayer(this.drawing[2])
    }

    show_details() {
        console.log(this.id)
    }

}