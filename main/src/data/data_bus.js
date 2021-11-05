var data_bus = new Object;


data_bus.unused_messages = []
data_bus.used_messages = []

data_bus.isXML = function(xmlStr){
    var parseXml;

    if (typeof window.DOMParser != "undefined") {
        parseXml = function (xmlStr) {
            return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
        parseXml = function (xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        return false;
    }

    try {
        parseXml(xmlStr);
    } catch (e) {
        return false;
    }
    return true;
}
data_bus.receive_xml_message = function(xml_message,type){
        if (type == "OnboardAcousticContact") {
            data_bus.used_messages.push(xml_message);
            if (data_bus.find(xml_message,["isManual"])) {
                let buoy_id = data_bus.find(xml_message,["detection","sensorId"]);
                if(datastore.buoys[buoy_id].type == "DIFAR"){
                    this.handle_manual_bearing_message(xml_message)
                }
            }
            return;
        }
        else if (type == "CompositeTrackList") {
            data_bus.used_messages.push(xml_message);
            if(xml_message.documentElement.nodeName == "SingleSourceTrack"){
                if (xml_message.getElementsByTagName("tacticalState")[0].getElementsByTagName("environment")[0].getElementsByTagName("valueText")[0].innerHTML == "4") {//4 is subsurface
                    this.handle_subsurface_track_message(xml_message)
                }   
            }   
            return;
        }
        else if (type == "AcousticMASSonobuoyPosition") {
            data_bus.used_messages.push(xml_message);
            if (xml_message.getElementsByTagName("buoy")[0].getElementsByTagName("type")[0].innerHTML == "SSQ_53G" || xml_message.getElementsByTagName("buoy")[0].getElementsByTagName("type")[0].innerHTML == "SSQ_53F") {
                this.handle_difar_message(xml_message)
            }
            return;
        }
        else if (type == "AreaList") {
            data_bus.used_messages.push(xml_message);
            if (xml_message.getElementsByTagName("ExpandingCircleAreaParentType").length > 0) {
                xml_message = xml_message.getElementsByTagName("ExpandingCircleAreaParentType")[0]
                this.handle_expanding_circle_message(xml_message)
            }
            return;
        }
        else if (type == "PointList") {
            data_bus.used_messages.push(xml_message);
            console.log("no code for points yet, want to add asw fixes")
            return;
        }

        this.unused_messages.push(xml_message)
}


data_bus.find = function(xml,props){
    let el = xml;
    for(let i=0;i<props.length;i++){
        el = el.getElementsByTagName(props[i])[0];
    }
    return el.innerHTML;
}

data_bus.handle_expanding_circle_message = function(xml){
    let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);
    let expansionSpeed = parseFloat(data_bus.find(xml, ["expansionSpeed","metersPerSecond"])) / 1852 * 60 * 60;//convert m/s to kts
    let lastUpdate = new Date(referenceTime.getTime() + data_bus.find(xml, ["lastSensorUpdateTime", "seconds"]) * 1000);
    let timeLate = data_bus.find(xml, ["validTimeLate", "seconds"]);//seconds
    let radius = parseFloat(data_bus.find(xml, ["radius"])) / 1852;//nautical miles
    var lat = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("position")[0].getElementsByTagName("latitudeInRadians")[0].innerHTML) * 180 / Math.PI;
    var long = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("position")[0].getElementsByTagName("longitudeInRadians")[0].innerHTML) * 180 / Math.PI;

    datastore.add_expanding_circle(expansionSpeed,lastUpdate,timeLate,radius,lat,long);
}

data_bus.handle_difar_message = function(xml){
    let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);
    
    var id = data_bus.find(xml, ["buoy", "uniqueId"]);
    var rf = data_bus.find(xml, ["buoy", "state", "rfChannel", "currentRfChannel"]);
    var lat = parseFloat(data_bus.find(xml, ["positionAndDrift", "position", "latitudeInRadians"]) * 180 / Math.PI);
    var long = parseFloat(data_bus.find(xml, ["positionAndDrift", "position", "longitudeInRadians"]) * 180 / Math.PI);
    var deploy_time = new Date(referenceTime.getTime() + data_bus.find(xml, ["positionAndDrift", "lastUpdateTime", "seconds"]) * 1000);
    var lsu_time = new Date(referenceTime.getTime() + data_bus.find(xml, ["positionAndDrift", "lastUpdateTime", "seconds"]) * 1000);
    var type = data_bus.find(xml, ["buoy", "type"]);
    var depth = parseFloat(data_bus.find(xml, ["buoy", "state", "depthInMeters"]));
    var life = parseFloat(data_bus.find(xml, ["buoy", "lifeRemaining", "seconds"]) / 60 / 60);
    var drift_course = parseFloat(data_bus.find(xml, ["positionAndDrift", "motion", "courseInRadians"]) * 180 / Math.PI);
    var drift_speed = parseFloat(data_bus.find(xml, ["positionAndDrift", "motion", "speedInMetersPerSecond"]));
    var props = [];
    
    datastore.add_buoy(id,rf,lat,long,deploy_time,lsu_time,type,depth,life,drift_course,drift_speed,props);
}

data_bus.handle_subsurface_track_message = function(xml){
    let referenceTime = new Date(1970,1,1,0,0,0,0 );

    //(id,primary_track,lat,long,originate_time,lsu_time,course,speed,depth,type,affiliation,source)
    var id = xml.getElementsByTagName("trackNumber")[0].innerHTML;
    var primary_track = true;
    var lat = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("position")[0].getElementsByTagName("latitudeInRadians")[0].innerHTML) * 180 / Math.PI;
    var long = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("position")[0].getElementsByTagName("longitudeInRadians")[0].innerHTML) * 180 / Math.PI;
    var originate_time = new Date(referenceTime.getTime() + parseInt(xml.getElementsByTagName("publishTime")[0].getElementsByTagName("seconds")[0].innerHTML) * 1000);
    var lsu_time = new Date(referenceTime.getTime() + parseInt(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("lastUpdateTime")[0].getElementsByTagName("seconds")[0].innerHTML) * 1000);;
    var course = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("orientation")[0].getElementsByTagName("headingInRadians")[0].innerHTML) * 180 / Math.PI;
    let xSpeed = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("motion")[0].getElementsByTagName("xSpeedInMetersPerSecond")[0].innerHTML)
    let ySpeed = parseFloat(xml.getElementsByTagName("kinematics")[0].getElementsByTagName("motion")[0].getElementsByTagName("ySpeedInMetersPerSecond")[0].innerHTML)
    var speed = Math.pow(xSpeed * xSpeed + ySpeed * ySpeed, .5) * 1.94384;
    var depth = -200;
    var type = "subsurface";
    var affiliation = xml.getElementsByTagName("tacticalState")[0].getElementsByTagName("affiliation")[0].innerHTML;
    var source =  xml.getElementsByTagName("sourceType")[0].innerHTML;

    datastore.add_subsurface_track(id,primary_track,lat,long,originate_time,lsu_time,course,speed,depth,type,affiliation,source)
}

data_bus.handle_manual_bearing_message = function(xml){
    let referenceTime = new Date(1970, 1, 1, 0, 0, 0, 0);


    var id = this.find(xml,["id"]);
    var buoy_id = this.find(xml,["detection","sensorId"])
    var time = new Date(referenceTime.getTime() + parseInt(this.find(xml,["detection","lastUpdateTime","seconds"])) * 1000);
    var error = this.find(xml,["detection","bearingError","bearingUncertaintyAngleInRadians"]) * 180 / Math.PI;
    var bearing = this.find(xml, ["detection", "bearing", "bearingAngleInRadians"]) * 180 / Math.PI;
    var freq = parseFloat(this.find(xml, ["signal", "primaryFrequencyInHertz"]))

    
    datastore.add_manual_bearing(id,buoy_id,time,bearing,error,freq);
}


//not yet implemented for demo. just pass in json for this stage of demo
data_bus.convert_xml_to_json = function(xml_message){
    //should return object with two properties {type,message}
    return xml_message;
}