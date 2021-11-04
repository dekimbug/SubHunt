const generate_alert = (id, title, content) => {
  return `<div
      id="alert_toast"
      class="toast alert alert-primary"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
  <div class="toast-header">
    <span>${id}</span>
    <strong class="mr-auto">${title}</strong>
    <small class="text-muted">11 mins ago</small>
    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
  </div>
  <div class="toast-body">
    ${content}
  </div>
  </div>
`;
};

class Alert_Manager {
  constructor() {
    this.current_alerts = {
    };
    this.bad_alerts = {};
    this.inactive_alerts = {};
  }
  //make time limit in minutes
  add_alert(
    title,
    content,
    alert_class,
    create_time,
    bad_alert_callback,
    display_callback
  ) {
    alert = new Alert(
      title,
      content,
      alert_class,
      create_time,
      bad_alert_callback,
      display_callback
    );
    this.current_alerts[alert.id] = alert;
    return alert;
  }

  mark_alert_bad(id) {
    if(id === "")
      return;
    alert = this.current_alerts[id];
    this.bad_alerts[id] = alert;
    delete this.current_alerts[id];
    $("#"+id).remove()
  }

  mark_alert_inactive(id) {
    if(id === "")
      return;
    alert = this.current_alerts[id];
    this.inactive_alerts[id] = alert;
    delete this.current_alerts[id];
    $("#"+id).remove()
  }

  acknowledge_alert(evt) {
    var id = $(evt.target).attr("data-id")
    this.mark_alert_inactive(id);
    $(`#${id}`).remove();
    //this makes it fullscreen
    //document.documentElement.webkitRequestFullscreen();
  }

  display_alert_details(evt) {
    document.documentElement.webkitRequestFullscreen();
    var id = $(evt.target).attr("data-id")
    this.current_alerts[id].display_callback();
  }

  hide_alert_details() {
    document.webkitExitFullscreen();
  }

  display_single_current_alert(id) {
    var alert = this.current_alerts[id];
    console.log(this.current_alerts);
    $("#alert_panel").append(alert.dom);

  }

  display_all_active_alerts() {
    let self = this
    let count = 0
    for (var alert_id in this.current_alerts) {
      if (this.current_alerts[alert_id].alert_class === 'danger') {
        count++
        $("#warning_alerts").html(count)
      }
      $("#warning_alerts").html(count)
      this.display_single_current_alert(alert_id);
      $(`.btn-ack[data-id="${alert_id}"]`).on("click", function (evt) {
        self.acknowledge_alert(evt)
      })
      $(`.btn-details[data-id="${alert_id}"]`).on("click", function (evt) {
        self.display_alert_details(evt)
      })
    }

  }

  unshow_inactive_alerts() {
    //go through all of the displayed alerts
    //if the alerts id is not on the current_alert object, delete it
    ///? Should we delete the previous alerts? I would think we would want to keep them for the mission. Maybe store the old ones in a local storage??
  }
}
