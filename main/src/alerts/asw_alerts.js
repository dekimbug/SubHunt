class ASW_Alerts{
    constructor(){
        this.lost_contact_alert_id = "";

        this.losing_contact_alert_id = "";

        this.losing_and_lost_contact_alert = setInterval(this.alert_to_losing_and_lost_contact,10000)

        this.sbta_accuracy_alert = setInterval(this.alert_to_accurate_primary_track,3000);
        this.sbta_accuracy_alert_id = "";

        this.sbta_inaccuracy_alert_id = "";

        this.dynamic_event_alert = setInterval(this.alert_to_dynamic_event,10000);
        this.dynamic_event_alert_id = '';
    }



    alert_to_dynamic_event(){
        
        let count = 0;

        for(var i=0;i<datastore.buoys.length;i++){
            let buoy = datastore.buoys[i];
            if(!buoy.lost){
                let thisCount = 0;
                console.log("number of bearings", buoy.manual_bearings.length)
                for (let ii = buoy.manual_bearings.length-1;ii>=0;ii--){
                    let bearing = buoy.manual_bearings[ii]
                    console.log(bearing.plausible, bearing.time, new Date(new Date.getTime() - 60000))
                    if(bearing.plausible == false && bearing.time > new Date(new Date.getTime() - 60000)){
                        thisCount++;
                    }
                }
                if(thisCount > 1){
                    count++;
                }
            }
        }
        console.log("implausible count",count)
        
        if(count <= 1){
            alert_manager.mark_alert_inactive(asw_alerts.dynamic_event_alert_id)
            asw_alerts.dynamic_event_alert_id = "";
            return;
        }
        else if(asw_alerts.dynamic_event_alert_id != ""){
            return;
        }
        else{
            console.log("Dynamic Event")
            alert("dynamic event")
            var alert = alert_manager.add_alert(
                    "Check D/E",
                    "Possible Dynamic Event",
                    "warning",
                    new Date(),
                    "bad_alert_callback",
                    "display_callback"
                  ) 
    
            //display the alert and store the id of the alert in here
            alert_manager.display_single_current_alert(alert.id)
            asw_alerts.dynamic_event_alert_id = alert.id;
        }

    }
    
    //this is a complicated alert - it give
    alert_to_accurate_primary_track(){
        //parameters
        let inaccurate_distance_threshold = .5;//nm
        let accurate_distance_threshold = .2;//nm
        let accurate_percentage_threshold = .8;//percent .8=80%

        //track computational performance metric
        let t1 = performance.now();
        
        let track_id = datastore.primary_subsurface_track_id;
        if(track_id == ""){
            alert_manager.mark_alert_inactive(asw_alerts.sbta_inaccuracy_alert_id)
            asw_alerts.sbta_inaccuracy_alert_id = "";
            return;
        }

        let track = datastore.subsurface_tracks[track_id];
        let accuracy = track.evaluate_sbta_conformity(accurate_distance_threshold,accurate_percentage_threshold)

        //if there is a place to dislpay course/speed data,display it
        boxController.updateSbtaTrackAccurateAlert(false)
        


        if(!accuracy.conforms){
            alert_manager.mark_alert_inactive(asw_alerts.sbta_accuracy_alert_id)
            asw_alerts.sbta_accuracy_alert_id = "";

            let inaccuracy = sbta.get_position_estimate_confidence(sbta.tracks,new Date(),accurate_distance_threshold,accurate_percentage_threshold)
            if(inaccuracy.confident && inaccuracy.distance_to_pri_track > inaccurate_distance_threshold){
                alert_manager.mark_alert_inactive(asw_alerts.sbta_inaccuracy_alert_id)
                asw_alerts.sbta_inaccuracy_alert_id = "";
                console.log("Inaccurate Track")
                var alert = alert_manager.add_alert(
                        "Check Track",
                        "Your Gen Track is inaccurate to SBTA",
                        "danger",
                        new Date(),
                        "bad_alert_callback",
                        "display_callback"
                      ) 
        
                //display the alert and store the id of the alert in here
                alert_manager.display_single_current_alert(alert.id)
                boxController.updateSbtaTrackAccurateAlert("inaccurate");
                asw_alerts.sbta_inaccuracy_alert_id = alert.id;
                let t2 = performance.now();
                console.log("sbta inac alert time: "+(t2-t1)) 
            }

            return;
        }

        //if they are lost contact but there is already an active lost contact alert, do nothing
        else if(asw_alerts.sbta_accuracy_alert_id != ""){
            console.log("good sbta track but already alerted")
            boxController.updateSbtaTrackAccurateAlert(true);
            let t2 = performance.now();
            console.log("sbta alert time: "+(t2-t1))
            return;
        }

        alert_manager.mark_alert_inactive(asw_alerts.sbta_inaccuracy_alert_id)
        asw_alerts.sbta_inaccuracy_alert_id = "";

        console.log("Good Track")
        var alert = alert_manager.add_alert(
                "Accurate Gen Track",
                "Your Gen Track is accurate to SBTA",
                "success",
                new Date(),
                "bad_alert_callback",
                "display_callback"
              ) 

        //display the alert and store the id of the alert in here
        alert_manager.display_single_current_alert(alert.id)
        asw_alerts.sbta_accuracy_alert_id = alert.id;
        boxController.updateSbtaTrackAccurateAlert(true);
        let t2 = performance.now();
        console.log("sbta alert time: "+(t2-t1))
    }

    alert_to_lost_contact(){
        //track computational performance metric
        let t1 = performance.now();

        //get the primary track, stop if there is none
        var track_id = datastore.primary_subsurface_track_id
        if(track_id == ""){
            return;
        }

        //check for lost contact
        var primary_track = datastore.subsurface_tracks[track_id]; 
        var lost_contact = primary_track.check_lost_contact(0)

        //if they are not lost contact, clear any lost contact alert
        if(!lost_contact){
            alert_manager.mark_alert_inactive(asw_alerts.lost_contact_alert_id)
            asw_alerts.lost_contact_alert_id = "";
            console.log("not lost contact")
            let t2 = performance.now();
            console.log("lost time: "+(t2-t1))
            return;
        }
        //if they are lost contact but there is already an active lost contact alert, do nothing
        else if(asw_alerts.lost_contact_alert_id != ""){
            console.log("lost contact but already alerted")
            let t2 = performance.now();
            console.log("lost time: "+(t2-t1))
            return;
        }

        //if they are lost contact and there is no other alert, make a new one
        console.log("LostContact")
        var alert = alert_manager.add_alert(
                "Lost Contact",
                "You lost contact at " + new Date(),
                "danger",
                new Date(),
                "bad_alert_callback",
                "display_callback"
              ) 

        
        //display the alert and store the id of the alert in here
        alert_manager.display_single_current_alert(alert.id)
        asw_alerts.lost_contact_alert_id = alert.id;
        let t2 = performance.now();
        console.log("lost time: "+(t2-t1))
    }

    alert_to_losing_contact(){
        let t1 = performance.now();
        var track_id = datastore.primary_subsurface_track_id
        if(track_id == ""){
            return;
        }
        var primary_track = datastore.subsurface_tracks[track_id]; 
        var losing_contact = primary_track.check_losing_contact(0)
        if(!losing_contact){
            alert_manager.mark_alert_inactive(asw_alerts.losing_contact_alert_id)
            asw_alerts.losing_contact_alert_id = "";
            console.log("not losing contact")
            let t2 = performance.now();
            console.log("losing time: "+(t2-t1))
            return;
        }
        else if(asw_alerts.losing_contact_alert_id != ""){
            console.log("losing contact but already alerted")
            let t2 = performance.now();
            console.log("losing time: "+(t2-t1))
            return;
        }

        console.log("LosingContact")

        //need to implement a system for once an alert is clear we restart the interval
        let alert = alert_manager.add_alert(
                "Losing Contact",
                "You stated losing contact at " + new Date(),
                "warning",
                new Date(),
                "bad_alert_callback",
                "display_callback"
              ) 
        alert_manager.display_single_current_alert(alert.id)
        
        asw_alerts.losing_contact_alert_id = alert.id;
        let t2 = performance.now();
        console.log("losing time: "+(t2-t1))
    }

    alert_to_losing_and_lost_contact(){
        asw_alerts.alert_to_losing_contact();
        asw_alerts.alert_to_lost_contact();

        let losing = true;
        let lost = true;
        if (asw_alerts.losing_contact_alert_id == ""){
            losing = false;
        }

        if (asw_alerts.lost_contact_alert_id == "") {
            lost = false;
        }

        
        boxController.update_losing_and_lost(losing,lost);
    }
}