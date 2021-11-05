class Map_Controller{
    constructor(){
        this.draw_all_buoys();
        this.buoy_refresh = setInterval(this.draw_all_buoys,15000)
        
        this.draw_all_subs()
        this.sub_refresh = setInterval(this.draw_all_subs,3000)

        this.draw_all_expanding_circles()
        this.expand_circle_refresh = setInterval(this.draw_all_expanding_circles,3000)

        this.drawn_manual_bearings = -1;
        this.draw_all_manual_bearings();
        this.manual_bearing_refresh = setInterval(this.draw_all_manual_bearings,3000);

        this.sbta_refresh = setInterval(this.draw_sbta_heatmap,3000)

        this.midshipmanAlgorithm_refresh = setInterval(this.draw_midshipmanAlgorithm,3000)
    }


    draw_all_expanding_circles(){
      if ($("#jarvis-main").width() == 0){
        return
      }

      var t1 = performance.now();
      for(let circle_id in datastore.expanding_circles){
        datastore.expanding_circles[circle_id].draw(false)
      }
      var t2 = performance.now();
    }

    draw_all_buoys(){
      if ($("#jarvis-main").width() == 0){
        return
      }

        var t1 = performance.now();
        for(let buoy_id in datastore.buoys){
          datastore.buoys[buoy_id].draw(false)
        }
        var t2 = performance.now();
        //console.log("buoy total: " + (t2-t1))
    }

    draw_all_subs(){
      if ($("#jarvis-main").width() == 0){
        return
      }

        var t1 = performance.now();
        for(let track_id in datastore.subsurface_tracks){
          datastore.subsurface_tracks[track_id].draw(false)
        }
        var t2 = performance.now();
        //console.log("track total: " + (t2-t1))
    }

    draw_all_manual_bearings(){
      if ($("#jarvis-main").width() == 0) {
        return
      }

        var t1 = performance.now();
        //console.log("number of bearings: " + datastore.manual_bearings.length)
        for(var i=this.drawn_manual_bearings+1;i<datastore.manual_bearings.length;i++){
          datastore.manual_bearings[i].draw()
        }
        this.drawn_manual_bearings = datastore.manual_bearings.length - 1;
        var t2 = performance.now();
        //console.log("bearing total: " + (t2-t1))
    }

    draw_sbta_heatmap(){
      if ($("#jarvis-main").width() == 0) {
        return
      }

        sbta.draw_heatmap()
    }

  draw_midshipmanAlgorithm() {
    if ($("#jarvis-main").width() == 0) {
      return
    }

    midshipmanAlgorithm.draw()
  }

}