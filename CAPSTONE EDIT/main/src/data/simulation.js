//build simulation code here
class Simulation{
    constructor(){
        this.buoy_ids = [];
        this.sub_ids = [];
        this.buoy_count = 1;
        this.actual_sub = null;
        this.error = 10;//1 standard deviation bearing error (+/- degrees)
    }

    //this has a fast target with a few close buoys
    run(){
        //start subsurface track
        this.generate_subsurface_track(0,-.007,90,30)

        //generate initial buoy field
        this.generate_difar(.1,0,1);
        this.generate_difar(0,.1,2);
        this.generate_difar(-.1,0,3);
        this.generate_difar(0,-.1,4);

        this.generate_difar(-.1,-.1,5);
        this.generate_difar(.1,.1,6);
        this.generate_difar(.1,-.1,7);
        this.generate_difar(-.1,.1,8);
        this.generate_difar(-.002,-0.0025,19);        

        let f_zero = 100;

        //shoot bearings every 20 seconds
        for(let buoy_id in datastore.buoys){
          this.generate_manual_bearing(buoy_id,datastore.primary_subsurface_track_id,f_zero)
        }

        var expandCircles = false
        this.interval = setInterval(function(){
          for(let buoy_id in datastore.buoys){
            simulation.generate_manual_bearing(buoy_id,datastore.primary_subsurface_track_id,f_zero)
          }

          //start expanding circle. this is not for the project
          /*if (asw_alerts.lost_contact_alert_id != "" && !expandCircles){
            var pos = simulation.actual_sub.get_current_position()
            //(expansionSpeed,updateTime,timeLate,radius,lat,lng)
            simulation.generate_expanding_circle(30, new Date(), 0, .3, pos[0], pos[1])
            expandCircles = true
          }*/
        },20000)
        

        setTimeout(function(){
          let time = new Date();
          //simulation.actual_sub.update_course_and_speed(time,180,10)
          console.log("TURN TURN TURN")
        },60000)//180000

    }

  //this has a fast target with many close buoys
  run2() {


    //start subsurface track
    this.generate_subsurface_track(0, -.007, 90, 30)

    //generate initial buoy field
    this.generate_difar(.1, 0, 1);
    this.generate_difar(0, .1, 2);
    this.generate_difar(-.1, 0, 3);
    this.generate_difar(0, -.1, 4);

    this.generate_difar(-.1, -.1, 5);
    this.generate_difar(.1, .1, 6);
    this.generate_difar(.1, -.1, 7);
    this.generate_difar(-.1, .1, 8);
    this.generate_difar(-.002,.008,9);
    this.generate_difar(.002,.0025,9);
    this.generate_difar(-.002, -0.0025, 19);

    let f_zero = 100;

    //shoot bearings every 20 seconds
    for (let buoy_id in datastore.buoys) {
      this.generate_manual_bearing(buoy_id, datastore.primary_subsurface_track_id, f_zero)
    }

    var expandCircles = false
    this.interval = setInterval(function () {
      for (let buoy_id in datastore.buoys) {
        simulation.generate_manual_bearing(buoy_id, datastore.primary_subsurface_track_id, f_zero)
      }

      //start expanding circle. this is not for the project
      /*if (asw_alerts.lost_contact_alert_id != "" && !expandCircles){
        var pos = simulation.actual_sub.get_current_position()
        //(expansionSpeed,updateTime,timeLate,radius,lat,lng)
        simulation.generate_expanding_circle(30, new Date(), 0, .3, pos[0], pos[1])
        expandCircles = true
      }*/
    }, 20000)


    setTimeout(function () {
      let time = new Date();
      //simulation.actual_sub.update_course_and_speed(time,180,10)
      console.log("TURN TURN TURN")
    }, 60000)//180000

  }


  //this starts fast and then slows with a left 90 degree turn
  run3() {


    //start subsurface track
    this.generate_subsurface_track(0, -.007, 90, 30)

    //generate initial buoy field
    this.generate_difar(.1, 0, 1);
    this.generate_difar(0, .1, 2);
    this.generate_difar(-.1, 0, 3);
    this.generate_difar(0, -.1, 4);

    this.generate_difar(-.1, -.1, 5);
    this.generate_difar(.1, .1, 6);
    this.generate_difar(.1, -.1, 7);
    this.generate_difar(-.1, .1, 8);
    this.generate_difar(-.002, .008, 9);
    this.generate_difar(.002, .0025, 9);
    this.generate_difar(-.002, -0.0025, 19);

    let f_zero = 100;

    //shoot bearings every 20 seconds
    for (let buoy_id in datastore.buoys) {
      this.generate_manual_bearing(buoy_id, datastore.primary_subsurface_track_id, f_zero)
    }

    var expandCircles = false
    this.interval = setInterval(function () {
      for (let buoy_id in datastore.buoys) {
        simulation.generate_manual_bearing(buoy_id, datastore.primary_subsurface_track_id, f_zero)
      }

      //start expanding circle. this is not for the project
      /*if (asw_alerts.lost_contact_alert_id != "" && !expandCircles){
        var pos = simulation.actual_sub.get_current_position()
        //(expansionSpeed,updateTime,timeLate,radius,lat,lng)
        simulation.generate_expanding_circle(30, new Date(), 0, .3, pos[0], pos[1])
        expandCircles = true
      }*/
    }, 20000)


    setTimeout(function () {
      let time = new Date();
      simulation.actual_sub.update_course_and_speed(time,0,10)
      console.log("TURN TURN TURN")
    }, 60000)//180000

  }


  //this starts fast and then slows with a left 90 degree turn
  run2() {


    //start subsurface track
    this.generate_subsurface_track(0, -.007, 90, 30)

    //generate initial buoy field
    this.generate_difar(.1, 0, 1);
    this.generate_difar(0, .1, 2);
    this.generate_difar(-.1, 0, 3);
    this.generate_difar(0, -.1, 4);

    this.generate_difar(-.1, -.1, 5);
    this.generate_difar(.1, .1, 6);
    this.generate_difar(.1, -.1, 7);
    this.generate_difar(-.1, .1, 8);
    this.generate_difar(-.002, .008, 9);
    this.generate_difar(.002, .0025, 9);
    this.generate_difar(-.002, -0.0025, 19);

    let f_zero = 100;

    //shoot bearings every 20 seconds
    for (let buoy_id in datastore.buoys) {
      this.generate_manual_bearing(buoy_id, datastore.primary_subsurface_track_id, f_zero)
    }

    var expandCircles = false
    this.interval = setInterval(function () {
      for (let buoy_id in datastore.buoys) {
        simulation.generate_manual_bearing(buoy_id, datastore.primary_subsurface_track_id, f_zero)
      }

      //start expanding circle. this is not for the project
      /*if (asw_alerts.lost_contact_alert_id != "" && !expandCircles){
        var pos = simulation.actual_sub.get_current_position()
        //(expansionSpeed,updateTime,timeLate,radius,lat,lng)
        simulation.generate_expanding_circle(30, new Date(), 0, .3, pos[0], pos[1])
        expandCircles = true
      }*/
    }, 20000)


    setTimeout(function () {
      let time = new Date();
      simulation.actual_sub.update_course_and_speed(time, 0, 10)
      console.log("TURN TURN TURN")
    }, 60000)//180000

  }

    /*
        let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);
    let expansionSpeed = parseFloat(data_bus.find(xml, ["expansionSpeed","metersPerSecond"]));
    let lastUpdate = new Date(referenceTime.getTime() + data_bus.find(xml, ["lastSensorUpdateTime", "seconds"]) * 1000);
    let timeLate = new Date(referenceTime.getTime() + data_bus.find(xml, ["validTimeLate", "seconds"]) * 1000);
    let radius = parseFloat(data_bus.find(xml, ["radius"])) / 1852;//nautical miles
    var lat = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("position")[0].getElementsByTagName("latitudeInRadians")[0].innerHTML) * 180 / Math.PI;
    var long = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("position")[0].getElementsByTagName("longitudeInRadians")[0].innerHTML) * 180 / Math.PI;
    
    */

    createExpandingCircleXML(expansionSpeed,updateTime,timeLate,radius,lat,lng){
      let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);
      
      let doc = document.implementation.createDocument("", "", null);
      let main = doc.createElement("ExpandingCircleAreaParentType");
      doc.appendChild(main);
      main.setAttribute("xlmins", "http://aidm.aba.navair.navy.mil/");

      //add time
      let time = doc.createElement("lastSensorUpdateTime");
      let seconds = doc.createElement("seconds");
      main.appendChild(time);
      seconds.innerHTML = Math.round((new Date(updateTime).getTime() - referenceTime.getTime()) / 1000)
      time.appendChild(seconds);

      //add radius
      let radiusEl = doc.createElement("radius");
      main.appendChild(radiusEl);
      radiusEl.innerHTML = radius * 1852;//meters

      //add timelate
      let timeLateId = doc.createElement("validTimeLate");
      let secondsLate = doc.createElement("seconds");
      main.appendChild(timeLateId);
      secondsLate.innerHTML = timeLate;//seconds
      timeLateId.appendChild(secondsLate);

      //add expansion speed
      let expansion = doc.createElement("expansionSpeed");
      let speed = doc.createElement("metersPerSecond");
      main.appendChild(expansion);
      speed.innerHTML = expansionSpeed / 60 / 60 * 1852;//convert kts to m/s
      expansion.appendChild(speed);

      //add kinematics
      let kinematics = doc.createElement("kinematics");
      main.appendChild(kinematics)
  
          //add position
          let position = doc.createElement("position");
          let latitude = doc.createElement("latitudeInRadians");
          let longitude = doc.createElement("longitudeInRadians");
          kinematics.appendChild(position);
          latitude.innerHTML = lat / 180 * Math.PI;
          longitude.innerHTML = lng / 180 * Math.PI;
          position.appendChild(latitude);
          position.appendChild(longitude);

      return doc;
    }

    generate_expanding_circle(expansionSpeed,updateTime,timeLate,radius,lat,lng){

        var message = new Object;

        message.xml = this.createExpandingCircleXML(expansionSpeed,updateTime,timeLate,radius,lat,lng)
        

        data_bus.receive_xml_message(message.xml,"AreaList")
    }

    createBuoyXML(type, updateTime, course, speed, lat, lng, depth, buoyId, rfChannel, lifeRemaining, pingSecondsLeft) {
      let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);

      let doc = document.implementation.createDocument("", "", null);
      let main = doc.createElement("AcousticMASSonobuoyPosition");
      doc.appendChild(main);
      main.setAttribute("xlmins", "http://aidm.aba.navair.navy.mil/");



      //add buoy data
      let buoy = doc.createElement("buoy");
      main.appendChild(buoy);
      //add unique id
      let id = doc.createElement("uniqueId");
      id.innerHTML = buoyId;
      buoy.appendChild(id);

      //add type
      let typeTag = doc.createElement("type");
      typeTag.innerHTML = type;
      buoy.appendChild(typeTag);

      //add ping seconds
      let pingSecs = doc.createElement("pingLife");
      pingSecs.innerHTML = pingSecondsLeft;
      buoy.appendChild(pingSecs);

      //add life
      let life = doc.createElement("lifeRemaining");
      buoy.appendChild(life);
      //add seconds
      let lifeSeconds = doc.createElement("seconds");
      lifeSeconds.innerHTML = lifeRemaining;
      life.appendChild(lifeSeconds);
      //add state
      let state = doc.createElement("state");
      buoy.appendChild(state);
      //add depth
      let dep = doc.createElement("depthInMeters");
      dep.innerHTML = depth;
      state.appendChild(dep)
      //add rf
      let rf = doc.createElement("rfChannel");
      state.appendChild(rf)
      //add rf channel
      let rfChan = doc.createElement("currentRfChannel");
      rfChan.innerHTML = rfChannel;
      rf.appendChild(rfChan)

      //add positionAndDrift
      let posAndDrift = doc.createElement("positionAndDrift");
      main.appendChild(posAndDrift)

      //add time
      let time = doc.createElement("lastUpdateTime");
      let seconds = doc.createElement("seconds");
      posAndDrift.appendChild(time);
      seconds.innerHTML = Math.round((new Date(updateTime).getTime() - referenceTime.getTime()) / 1000)
      time.appendChild(seconds);

      //add course
      let orientation = doc.createElement("orientation");
      let radians = doc.createElement("headingInRadians");
      posAndDrift.appendChild(orientation);
      radians.innerHTML = course / 180 * Math.PI;
      orientation.appendChild(radians);

      //add speed
      let motion = doc.createElement("motion");
      let x = doc.createElement("courseInRadians")
      x.innerHTML = course / 180 * Math.PI;
      let y = doc.createElement("speedInMetersPerSecond")
      y.innerHTML = speed * 1852 / 60 / 60;
      posAndDrift.appendChild(motion);
      motion.appendChild(x)
      motion.appendChild(y);

      //add position
      let position = doc.createElement("position");
      let latitude = doc.createElement("latitudeInRadians");
      let longitude = doc.createElement("longitudeInRadians");
      posAndDrift.appendChild(position);
      latitude.innerHTML = lat / 180 * Math.PI;
      longitude.innerHTML = lng / 180 * Math.PI;
      position.appendChild(latitude);
      position.appendChild(longitude);


      return doc;
    }
    generate_difar(lat,long,rf){
        var id = simulation.uuidv4();

        var message = new Object;
        message.id = id;
        message.rf = rf;
        message.lat = lat;
        message.long = long;
        message.deploy_time = new Date();
        message.lsu_time = new Date();
        message.type = "DIFAR";
        message.depth = 400;
        message.life = 8.0;
        message.drift_course = Math.random() * 360;
      message.drift_speed = 1;
        message.props = {};
        message.xml = this.createBuoyXML("SSQ_53G", message.lsu_time, message.drift_course, message.drift_speed, lat, long, message.depth, id, rf, message.life * 60 * 60, 0)
        
        //just for internal simulation purposes
        this.buoy_ids.push(id);

        var msg = new Object;
        msg.message = message;
        msg.type = "Sonobuoy"
        data_bus.receive_xml_message(message.xml,"AcousticMASSonobuoyPosition")
    }

    generate_random_difar(lat,long,rf){
        var id = simulation.uuidv4();

        var message = new Object;
        message.id = id;
        message.rf = rf;

        var distance = Math.random() * 10;
        var bearing = Math.random() * 360;
        var lat_long = geomath.llFromDistance(lat, long, distance, bearing)
        message.lat = lat_long[0];
        message.long = lat_long[1];
        message.deploy_time = new Date();
        message.lsu_time = new Date();
        message.type = "DIFAR";
        message.depth = 400;
        message.life = 8.0;
        message.drift_course = Math.random() * 360;
        message.drift_speed = 1;
        message.props = {};
      message.xml = this.createBuoyXML("SSQ_53G", message.lsu_time, message.drift_course, message.drift_speed, lat, long, message.depth, id, rf, message.life * 60 * 60, 0)
        
        //just for internal simulation purposes
        this.buoy_ids.push(id);

        var msg = new Object;
        msg.message = message;
        msg.type = "Sonobuoy"
        data_bus.receive_xml_message(message.xml,"AcousticMASSonobuoyPosition")
    }
    
    createManualTrackXML(updateTime,originateTime,course,speed,lat,lng, affiliation, environment, trackNum, id){
      let referenceTime = new Date(1970,1,1,0,0,0,0 );
  
      let doc = document.implementation.createDocument("", "", null);
      let main = doc.createElement("SingleSourceTrack");
      doc.appendChild(main);
      main.setAttribute("xlmins", "http://aidm.aba.navair.navy.mil/");
  
      //add source type
      let idEl = doc.createElement("id");
      idEl.innerHTML = id;
      main.appendChild(idEl);
      
      //add source type
      let type = doc.createElement("sourceType");
      type.innerHTML = "MANUAL";
      main.appendChild(type);
  
      //add track number
      let tn = doc.createElement("trackNumber");
      tn.innerHTML = trackNum;
      main.appendChild(tn)
      
      //drop track status
      let dt = doc.createElement("dropTrack");
      dt.innerHTML = "false";
      main.appendChild(dt)
      
      //isManual
      let isMan = doc.createElement("isManual");
      isMan.innerHTML = "true";
      main.appendChild(isMan)
  
      //add publish time
      let pubtime = doc.createElement("publishTime");
      let pubseconds = doc.createElement("seconds");
      main.appendChild(pubtime);
      pubseconds.innerHTML = Math.round((new Date(originateTime).getTime() - referenceTime.getTime()) / 1000)
      pubtime.appendChild(pubseconds);

      //add kinematics
      let kinematics = doc.createElement("kinematics");
      main.appendChild(kinematics)
      
          //add time
          let time = doc.createElement("lastUpdateTime");
          let seconds = doc.createElement("seconds");
          kinematics.appendChild(time);
          seconds.innerHTML = Math.round((new Date(updateTime).getTime() - referenceTime.getTime()) / 1000)
          time.appendChild(seconds);
  
          //add course
          let orientation = doc.createElement("orientation");
          let radians = doc.createElement("headingInRadians");
          kinematics.appendChild(orientation);
          radians.innerHTML = course / 180 * Math.PI;
          orientation.appendChild(radians);
  
          //add speed
          let motion = doc.createElement("motion");
          let x = doc.createElement("xSpeedInMetersPerSecond")
          x.innerHTML = speed * 1852 / 60 / 60 * Math.sin(course / 180 * Math.PI)
          let y = doc.createElement("ySpeedInMetersPerSecond")
          y.innerHTML = speed * 1852 / 60 / 60 * Math.cos(course / 180 * Math.PI)
          kinematics.appendChild(motion);
          motion.appendChild(x)
          motion.appendChild(y);
  
          //add position
          let position = doc.createElement("position");
          let latitude = doc.createElement("latitudeInRadians");
          let longitude = doc.createElement("longitudeInRadians");
          kinematics.appendChild(position);
          latitude.innerHTML = lat / 180 * Math.PI;
          longitude.innerHTML = lng / 180 * Math.PI;
          position.appendChild(latitude);
          position.appendChild(longitude);
  
      //add tacticalState
      let state = doc.createElement("tacticalState");
      main.appendChild(state);
          
          //add affiliation
          let affil = doc.createElement("affiliation");
          affil.innerHTML = affiliation;
          state.appendChild(affil)
  
          //add environment
          let env = doc.createElement("environment");
          let envValue = doc.createElement("valueText");
          envValue.innerHTML = environment;
          state.appendChild(env)
          env.appendChild(envValue);
  
      return doc;
  }
  


    generate_subsurface_track(lat,long,course,speed){
        //(id,primary_track,lat,long,originate_time,lsu_time,course,speed,depth,type,affiliation,source)
        var msg = new Object;
        msg.type = "Track";
        
        var message = new Object;
        message.domain = "1";
        message.id = "G" + (1+this.sub_ids.length); 
        message.course = course;//Math.round(Math.random() * 360)
        message.speed = speed;
        message.depth = -200;
        message.type = "Kilo SS";
        message.affiliation = "Hostile";
        message.source = "Gen";
        message.lat = lat;
        message.long = long;
        message.originate_time = new Date();
        message.lsu_time = new Date();
        message.primary_track = false;
        message.xml = this.createManualTrackXML(new Date(),new Date(),course,speed,lat,long, "Hostile", "4", message.id, message.id); //"1" is "SUBSURFACE"
        
        msg.message = message;
        
        //just for internal simulation purposes
        this.sub_ids.push(message.id);

        data_bus.receive_xml_message(message.xml,"CompositeTrackList")
        this.create_actual_sub(message);
    }

    create_actual_sub(m){

      this.actual_sub = new Subsurface_Track(m.id,false,m.lat,m.long,m.originate_time,m.lsu_time,m.course,m.speed,m.depth,m.type,m.affiliation,m.source);
      console.log(this.actual_sub)
    }

  createBearingXML(bearingId, freq, time, error, bearing, buoy_id) {
    let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);

    let doc = document.implementation.createDocument("", "", null);
    let main = doc.createElement("OnboardAcousticContact");
    doc.appendChild(main);
    main.setAttribute("xlmins", "http://aidm.aba.navair.navy.mil/");




    //add unique id
    let id = doc.createElement("id");
    id.innerHTML = bearingId;
    main.appendChild(id);

    //add unique id
    let manual = doc.createElement("isManual");
    manual.innerHTML = "true";
    main.appendChild(manual);

    //add detection
    let detection = doc.createElement("detection");
    main.appendChild(detection);
    //add time
    let timeTag = doc.createElement("lastUpdateTime");
    let seconds = doc.createElement("seconds");
    detection.appendChild(timeTag);
    seconds.innerHTML = Math.round((new Date(time).getTime() - referenceTime.getTime()) / 1000)
    timeTag.appendChild(seconds);
    //add sensor id
    let sensorId = doc.createElement("sensorId");
    sensorId.innerHTML = buoy_id;
    detection.appendChild(sensorId);

    //add bearing
    let brng = doc.createElement("bearing");
    detection.appendChild(brng);
    //add bearing angle
    let brngAngle = doc.createElement("bearingAngleInRadians");
    brngAngle.innerHTML = bearing / 180 * Math.PI;
    brng.appendChild(brngAngle);
    /*
    //add sensor position
    let sensorPos = doc.createElement("sensorPosition");
    brng.appendChild(sensorPos);
    let latitude = doc.createElement("latitudeInRadians");
    let longitude = doc.createElement("longitudeInRadians");
    latitude.innerHTML = buoyLat / 180 * Math.PI;
    longitude.innerHTML = buoyLng / 180 * Math.PI;
    sensorPos.appendChild(latitude);
    sensorPos.appendChild(longitude);
    */

    //add bearing error
    let brngErr = doc.createElement("bearingError");
    detection.append(brngErr)
    //add bearing error value
    let brngErrVal = doc.createElement("bearingUncertaintyAngleInRadians");
    brngErrVal.innerHTML = error / 180 * Math.PI;
    brngErr.appendChild(brngErrVal);

    //add signal
    let signal = doc.createElement("signal");
    main.appendChild(signal);
    //add freq
    let freqTag = doc.createElement("primaryFrequencyInHertz");
    freqTag.innerHTML = freq;
    signal.appendChild(freqTag)




    return doc;
  }

    generate_manual_bearing(buoy_id,track_id,f_zero){
      var track = datastore.subsurface_tracks[track_id];
      track = this.actual_sub;
      var lost = track.check_lost_contact_to_a_buoy(buoy_id,0);
      if(lost)
        return;

      var bearing = track.get_bearing_from_buoy(buoy_id,0)

      var msg = new Object;
      msg.type = "Bearing"

      var message = new Object;
      message.source = "Manual";
      message.id = this.uuidv4(); 
      message.freq = track.get_received_frequency_to_buoy(buoy_id,f_zero,0)
      message.time = new Date();
      message.error = this.error;
      message.bearing = geomath.gaussian(bearing, message.error)
      message.buoy_id = buoy_id;
      message.xml = this.createBearingXML(message.id, message.freq, message.time, message.error, message.bearing, buoy_id);

      msg.message = message;
      data_bus.receive_xml_message(message.xml,"OnboardAcousticContact")
    }

    
    uuidv4() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
          c
        ) {
          var r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    }
    
    


}


class Sim_Sub{
  constructor(){

  }
}


