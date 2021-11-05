class TOMS_Datastore {
  constructor(
  ) {
    this.buoys = {};
    this.expanding_circles = {};
    this.primary_subsurface_track_id = "";
    this.subsurface_tracks = {};
    this.manual_bearings = [];
    this.auto_bearings = [];
    this.asw_fixes = [];

    //this needs to be updated from a user form
    this.odr = geomath.yards_to_nm(1000);//nm
  }

  //create uuid
  uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (
      c
    ) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  //takes yards
  update_odr(odr){
    this.odr = geomath.yards_to_nm(odr);
  }

  //need add, remove, sort, and find utilities for each data type
  add_buoy(id,rf,lat,long,deploy_time,lsu_time,type,depth,life,drift_course,drift_speed,props){

    var keys = Object.keys(this.buoys);
    if (keys.includes(id)){
      return;
    }

    var buoy = new Buoy(id,rf,lat,long,deploy_time,lsu_time,type,depth,life,drift_course,drift_speed,props);
    this.buoys[id] = buoy;


    //run_everything_that_needs_to_be_updated("buoy",id,type)
  }

  update_buoy(id,props){
    
    for(var prop in props){
      this.buoys[id][prop] = props[prop];
    }

    
    //run everything that needs to be updated
  }
  
  add_expanding_circle(expansionSpeed,lastUpdate,timeLate,radius,lat,long){
    let id = this.uuidv4();
    let expandingCircle = new ExpandingCircle(id,expansionSpeed,lastUpdate,timeLate,radius,lat,long);
    this.expanding_circles[id] = expandingCircle

  }

  add_subsurface_track(id,primary_track,lat,long,originate_time,lsu_time,course,speed,depth,type,affiliation,source){
    //set as primary track if it is the first sub
    var keys = Object.keys(this.subsurface_tracks);
    var number_tracks = keys.length;
    if(number_tracks === 0){
      primary_track = true;
      this.primary_subsurface_track_id = id;
    }



    
    var track = new Subsurface_Track(id,primary_track,lat,long,originate_time,lsu_time,course,speed,depth,type,affiliation,source);
    
    //add the track if it isn't already in there
    if(!keys.includes(id))
      this.subsurface_tracks[id] = track;

  }

  set_primary_subsurface_track(id){
    //this storest the primary id in an easily accesible variable
    this.primary_subsurface_track_id = id;

    //this sets the primary_track flag to true in the desired track and false in all others
    this.subsurface_tracks[id].set_primary();
  }



  add_manual_bearing(id,buoy_id,time,bearing,error,freq){
    let new_bearing = new Manual_Bearing(id,buoy_id,time,bearing,error,freq)
    new_bearing.plausible = dynamic_events.bearing_is_plausibile_without_dynamic(new_bearing, this.primary_subsurface_track_id, error)

    this.manual_bearings.push(new_bearing)
    this.buoys[buoy_id].manual_bearings.push(new_bearing)

    sbta.incorporate_new_bearing(buoy_id,20000);
    //midshipmanAlgorithm.incorporate_new_bearing(buoy_id, 20000);

  }

  delete_manual_bearing(id, buoy_id) {
    let bearings = this.buoys[buoy_id].manual_bearings;
    for(let i=0;i<bearings.length;i++){
      if(bearings[i].id == id){
        bearings[i].erase();
        this.buoys[buoy_id].manual_bearings.splice(i,1)
      }
    }

  }

  
}







