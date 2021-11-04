class BoxController{
    constructor(){
        $.contextMenu({
            selector: '.well',
            zIndex: 1001,
            callback: function (key, options) {

                let el = (options.$trigger[0])
                $(`[data-type="${key}"]`).remove();

                if (key == "Losing/Lost") {
                    boxController.drawLosingLost(el)
                }
                else if (key == "SBTA") {
                    boxController.drawSbta(el)
                }

                else if (key == "D/E") {
                    $(el).html(key)
                }

                else if (key == "ASW Setup") {
                    $(el).html(key)
                }
                else if(key == "cut"){
                    $(el).html("")
                }
                else {
                    $(el).html(key + " is not yet implemented")
                }
            },
            items: {
                "cut": { "name": "Clear", "icon": "delete" },
                "sep1": "---------",
                "fold1": {
                    "name": "Setup",
                    "items": {
                        "ASW Setup": { "name": "ASW" },
                        "SUW Setup": { "name": "SUW" },
                        "ISR Setup": { "name": "ISR" },
                    }
                },
                "sep2": "---------",
                "fold2": {
                    "name": "ASW",
                    "items": {
                        "Losing/Lost": { "name": "Losing/Lost" },
                        "SBTA": { "name": "SBTA" },
                        "D/E": { "name": "D/E" },
                    }
                },
                "fold3": {
                    "name": "SUW",
                    "items": {
                        "fold1a-key1": { "name": "echo" },
                        "fold1a-key2": { "name": "foxtrot" },
                        "fold1a-key3": { "name": "golf" }
                    }
                },

                "fold4": {
                    "name": "ISR",
                    "items": {
                        "fold1a-key1": { "name": "echo" },
                        "fold1a-key2": { "name": "foxtrot" },
                        "fold1a-key3": { "name": "golf" }
                    }
                }
            }
        });
    }

    confirmSbtaReset(){
        let sure = confirm("Are you sure you want to reset the SBTA tracker?")
        if(sure){
            sbta.reset();
        }
    }

    updateSbtaTrackAccurateAlert(accurate){
        let update = this.updateSbta()
        console.log("update",update)
        if(accurate == true && update == true){
            console.log("rewrote")
            $("#sbtaAlertId").html(`<div class="alert alert-success" role="alert">
                Your gen track is accurate
                </div>`
            )
        }
        
        else if (accurate == "inaccurate"){
            $("#sbtaAlertId").html(`<div class="alert alert-danger" role="alert">
                Your gen track doesn't match information
                </div>`
            )
        }
        else{
            console.log("clearSbtaTrackAlert")
            $("#sbtaAlertId").html("No Alert")
        }

    }
    drawSbta(el){
        /*<div class="form-group">
							<label for="exampleFormControlSelect1">Primary Track</label>
							<select class="form-control" id="primarySubsurfaceTrackSelectorId" onchange="datastore.updatePrimaryTrack()">`
                                for (let trackId in datastore.subsurface_tracks) {
                                    html += `<option value="${trackId}">${trackId}</option>`
                                }
                                html += `</select>
						</div>*/
        let html = `<div class="card" data-type="SBTA" style="width: 100%;height:100%;color:white;background: none">
					<div class="card-body">
						<h5 class="card-title">SBTA <button class="btn btn-primary float-right" onclick="boxController.confirmSbtaReset()">Reset</button></h5>
						
                        <h6 class="card-subtitle mb-2 text-muted">Course and Speed Estimate (+/- Error)</h6>
						<p class="card-text" id="sbtaCourseAndSpeedEsimateId"></p>

						<div id="sbtaAlertId">No Alert</div>
					</div>
				</div>`
        $(el).html(html)
        //

        $("#primarySubsurfaceTrackSelectorId").val(datastore.primary_subsurface_track_id);
    }
    updateSbta(){
        let courseSpeedDisplay = $("#sbtaCourseAndSpeedEsimateId");
        if (courseSpeedDisplay.length > 0) {
            let cAndS = sbta.get_course_and_speed_estimates_from_tracks(sbta.tracks);
         
            if(cAndS.course && cAndS.speed){
                $(courseSpeedDisplay).html(Math.round(cAndS.course) + `T (${Math.ceil(cAndS.course_standard_deviation * 2)}) / ` + Math.round(cAndS.speed * 10) / 10 + "kts (" + Math.ceil(cAndS.speed_standard_deviation * 2) + ")")
                return true
            }
            else{
                $(courseSpeedDisplay).html("No estimate yet");
                return false
            }
        }
    }

    drawLosingLost(el) {
        let html = `<div class="card" data-type="Losing/Lost" style="width: 100%;height:100%;color:white;background: none;">
					<div class="card-body">
						<h5 class="card-title">Losing/Lost</h5>
						<div class="form-group">
							<label for="exampleFormControlSelect1">MDR/ODR (yds)</label>
							<input class="form-control" id="odrId" onchange="boxController.updateOdr()" value="${geomath.nm_to_yards(datastore.odr)}">
                            </input>
						</div>
                        <div class="row">
                        <div class="col-12" id="losingAlertId"></div>
                        </div>
					</div>
				</div>`
        $(el).html(html)

    }

    update_losing_and_lost(losing,lost){
        if($("#losingAlertId").length == 0)
            return
        if(lost){
            $("#losingAlertId").html(`<div class="alert alert-danger" role="alert">
                    Lost contact <button class='btn btn-success' onclick='sbta.startLostContact()'>Confirm</button><button onclick='boxController.stillInContact()' class='btn btn-danger'>In Contact</button>
                </div>`)
        }
        else if(losing){
            $("#losingAlertId").html(`<div class="alert alert-danger" role="alert">
                    Losing contact
                </div>`)
        }
        else {
            let count = performance.now();
            let sub = datastore.subsurface_tracks[datastore.primary_subsurface_track_id]
            let lostTime = new Date(sub.predict_lost_contact_to_all_buoys(0))
            let now = new Date();
            let time = lostTime.getTime() - now.getTime();
            
            $("#losingAlertId").html(`<div class="alert alert-success" role="alert">
                    ${Math.round(time/1000)} seconds until lost
                </div>`)

            console.log("alert to time to lost",performance.now() - count)
        }
    }

    stillInContact(){
        let sub = datastore.subsurface_tracks[datastore.primary_subsurface_track_id];
        let minOdr = sub.get_min_distance_to_all_buoys()
        boxController.updateOdr(minOdr*1.1)
        
    }

    confirmNotInContact(){
        $("#losingAlertId").html(`<div class="alert alert-danger" role="alert">
                    Lost contact
                </div>`)
    }

    updateOdr(odr){
        if(!odr){
            let odr = $("#odrId").val();
        }
        else{
            $("#odrId").val(Math.round(2025*odr));
        }
        datastore.update_odr(odr);
    }

    updatePrimarySubsurfaceTrack(){
        let id = $("#primarySubsurfaceTrackSelectorId").val();
        datastore.set_primary_subsurface_track(id)
    }
}