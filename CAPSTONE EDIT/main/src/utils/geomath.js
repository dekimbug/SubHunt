const geomath = {
//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in nm)
  
  yards_to_nm(yards){
    return yards / 2025.37183  
  },
  nm_to_yards(nm){
    return nm * 2025.37183;
  },
  get_distance_between_points(lat1, lon1, lat2, lon2){
    var R = 6371; // km
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180;
    lat1 = (lat1) * Math.PI / 180;
    lat2 = (lat2) * Math.PI / 180;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d / 1.852;
  },

  get_relative_course_and_speed(drift_course,drift_speed,sub_course,sub_speed){
    //get the flipped buoy x,y speed vectors
    var drift_x = Math.sin(this.degtorad(drift_course)) * drift_speed;
    var drift_y = Math.cos(this.degtorad(drift_course)) * drift_speed;

    //get the normal sub x,y speed vectors
    var sub_x = Math.sin(this.degtorad(sub_course)) * sub_speed;
    var sub_y = Math.cos(this.degtorad(sub_course)) * sub_speed;

    //subtract the vectors and get the relative course/speed
    var x = sub_x - drift_x;
    var y = sub_y - drift_y;
    var result = new Object;
    result.course = (720+this.radtodeg(Math.atan2(x,y)))%360;
    result.speed = Math.pow(x*x + y*y,.5);
    return result;
  },

  get_absolute_course_and_speed(drift_course,drift_speed,relative_course,relative_speed){
    //get the flipped buoy x,y speed vectors
    var drift_x = Math.sin(this.degtorad(drift_course)) * drift_speed;
    var drift_y = Math.cos(this.degtorad(drift_course)) * drift_speed;

    //get the normal sub x,y speed vectors
    var relative_x = Math.sin(this.degtorad(relative_course)) * relative_speed;
    var relative_y = Math.cos(this.degtorad(relative_course)) * relative_speed;

    //add the vectors together and get the absolute course/speed
    var x = relative_x + drift_x;
    var y = relative_y + drift_y;

    var result = new Object;
    result.course = (720+this.radtodeg(Math.atan2(x,y)))%360;
    result.speed = Math.pow(x*x + y*y,.5);
    return result;
  },
  //get distance in nm
  llFromDistance(latitude, longitude, distance, bearing) {
    // taken from: https://stackoverflow.com/a/46410871/13549 
    // distance in KM, bearing in degrees
    distance *= 1.852;//converts to KM
    const R = 6378.1; // Radius of the Earth
    const brng = bearing * Math.PI / 180; // Convert bearing to radian
    let lat = latitude * Math.PI / 180; // Current coords to radians
    let lon = longitude * Math.PI / 180;
  
    // Do the math magic
    lat = Math.asin(Math.sin(lat) * Math.cos(distance / R) + Math.cos(lat) * Math.sin(distance / R) * Math.cos(brng));
    lon += Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat), Math.cos(distance / R) - Math.sin(lat) * Math.sin(lat));
  
    // Coords back to degrees and return
    return [(lat * 180 / Math.PI), (lon * 180 / Math.PI)];
  },
  
  get_bearing_between_two_points(lat1,lng1,lat2,lng2){
    let startLat = this.degtorad(lat1);
    let startLng = this.degtorad(lng1);
    let destLat = this.degtorad(lat2);
    let destLng = this.degtorad(lng2);
  
    let y = Math.sin(destLng - startLng) * Math.cos(destLat);
    let x = Math.cos(startLat) * Math.sin(destLat) -
          Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    let brng = Math.atan2(y, x);
    brng = this.radtodeg(brng);
    return (brng + 360) % 360;
  },
  degtorad(deg){
    var rad = deg /180 * Math.PI;
    return rad;
  },
  
  radtodeg(rad){
    var deg = rad * 180 / Math.PI;
    return deg;
  },
  
  distbtwnangle(angle1,angle2){
    var angledist = Math.min((angle1-angle2+360)%360,(angle2-angle1+360)%360);
    return angledist;
  },

  //taken from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
  gaussian(mean, stddev) {
        var V1
        var V2
        var S
        do{
            var U1 = Math.random()
            var U2 = Math.random()
            V1 = 2*U1-1
            V2 = 2*U2-1
            S = V1*V1+V2*V2
        }while(S >= 1)
        if(S===0) return 0
        return mean+stddev*(V1*Math.sqrt(-2*Math.log(S)/S))
  },

  standardDeviation(arr, usePopulation = false){
    const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
    return Math.sqrt(
      arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
        (arr.length - (usePopulation ? 0 : 1))
    );
  },
  rhumbBearing(start, end) {
    let bear360;
    bear360 = geomath.calculateRhumbBearing(start, end);

    const bear180 = (bear360 > 180) ? - (360 - bear360) : bear360;

    return bear180;
  },


  calculateRhumbBearing(from, to) {
    // ?? => phi
    // ???? => deltaLambda
    // ???? => deltaPsi
    // ?? => theta
    const phi1 = geomath.degtorad(from[0]);
    const phi2 = geomath.degtorad(to[0]);
    let deltaLambda = geomath.degtorad((to[1] - from[1]));
    // if deltaLambdaon over 180?? take shorter rhumb line across the anti-meridian:
    if (deltaLambda > Math.PI) { deltaLambda -= 2 * Math.PI; }
    if (deltaLambda < -Math.PI) { deltaLambda += 2 * Math.PI; }

    const deltaPsi = Math.log(Math.tan(phi2 / 2 + Math.PI / 4) / Math.tan(phi1 / 2 + Math.PI / 4));

    const theta = Math.atan2(deltaLambda, deltaPsi);

    return (geomath.radtodeg(theta) + 360) % 360;
  },




  rhumbDestination(origin, distance, bearing) {

    const wasNegativeDistance = distance < 0;
    let distanceInMeters = distance * 1852;
    if (wasNegativeDistance) distanceInMeters = -Math.abs(distanceInMeters);
    const coords = origin;
    const destination = geomath.calculateRhumbDestination(coords, distanceInMeters, bearing);

    // compensate the crossing of the 180th meridian (https://macwright.org/2016/09/26/the-180th-meridian.html)
    // solution from https://github.com/mapbox/mapbox-gl-js/issues/3250#issuecomment-294887678
    destination[1] += (destination[1] - coords[1] > 180) ? -360 : (coords[1] - destination[1] > 180) ? 360 : 0;
    return destination;
  },


  calculateRhumbDestination(origin, distance, bearing) {
    // ?? => phi
    // ?? => lambda
    // ?? => psi
    // ?? => Delta
    // ?? => delta
    // ?? => theta

    const radius = 6371008.8;

    const delta = distance / radius; // angular distance in radians
    const lambda1 = origin[1] * Math.PI / 180; // to radians, but without normalize to ????
    const phi1 = geomath.degtorad(origin[0]);
    const theta = geomath.degtorad(bearing);

    const DeltaPhi = delta * Math.cos(theta);
    let phi2 = phi1 + DeltaPhi;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(phi2) > Math.PI / 2) { phi2 = phi2 > 0 ? Math.PI - phi2 : -Math.PI - phi2; }

    const DeltaPsi = Math.log(Math.tan(phi2 / 2 + Math.PI / 4) / Math.tan(phi1 / 2 + Math.PI / 4));
    // E-W course becomes ill-conditioned with 0/0
    const q = Math.abs(DeltaPsi) > 10e-12 ? DeltaPhi / DeltaPsi : Math.cos(phi1);

    const DeltaLambda = delta * Math.sin(theta) / q;
    const lambda2 = lambda1 + DeltaLambda;

    return [phi2 * 180 / Math.PI, ((lambda2 * 180 / Math.PI) + 540) % 360 - 180]; // normalise to ???180..+180??
  },


  rhumbDistance(from, to) {
    const origin = from;
    const destination = to;

    // compensate the crossing of the 180th meridian (https://macwright.org/2016/09/26/the-180th-meridian.html)
    // solution from https://github.com/mapbox/mapbox-gl-js/issues/3250#issuecomment-294887678
    destination[1] += (destination[1] - origin[1] > 180) ? -360 : (origin[1] - destination[1] > 180) ? 360 : 0;
    const distanceInMeters = geomath.calculateRhumbDistance(origin, destination);
    const distanceInNauticalMiles = distanceInMeters / 1852;
    return distanceInNauticalMiles;
  },


  calculateRhumbDistance(origin, destination) {
    // ?? => phi
    // ?? => lambda
    // ?? => psi
    // ?? => Delta
    // ?? => delta
    // ?? => theta

    const radius = 6371008.8;
    // see www.edwilliams.org/avform.htm#Rhumb

    const R = radius;
    const phi1 = origin[0] * Math.PI / 180;
    const phi2 = destination[0] * Math.PI / 180;
    const DeltaPhi = phi2 - phi1;
    let DeltaLambda = Math.abs(destination[1] - origin[1]) * Math.PI / 180;
    // if dLon over 180?? take shorter rhumb line across the anti-meridian:
    if (DeltaLambda > Math.PI) { DeltaLambda -= 2 * Math.PI; }

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    const DeltaPsi = Math.log(Math.tan(phi2 / 2 + Math.PI / 4) / Math.tan(phi1 / 2 + Math.PI / 4));
    const q = Math.abs(DeltaPsi) > 10e-12 ? DeltaPhi / DeltaPsi : Math.cos(phi1);

    // distance is pythagoras on 'stretched' Mercator projection
    const delta = Math.sqrt(DeltaPhi * DeltaPhi + q * q * DeltaLambda * DeltaLambda); // angular distance in radians
    const dist = delta * R;

    return dist;
  },
}