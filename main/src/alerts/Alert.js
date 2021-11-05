class Alert {
  //make time limit in minutes
  constructor(
    title,
    content,
    alert_class,
    create_time,
    bad_alert_callback,
    display_callback
  ) {

    this.title = title;
    this.content = content;
    this.alert_class = alert_class;
    this.bad_alert_callback = bad_alert_callback;
    this.display_callback = display_callback;
    this.create_time = create_time;
    this.id = this.uuidv4();
    this.dom = this.create_alert_html()

  }

  create_alert_html() {
    var start_time = simpleTime(this.create_time, 3);
    var html = `<div id="${this.id}" class="jarvis-alert-${this.alert_class} jarvis-alert-card" role="alert">
                    <div class="jarvis-alert-card-header">
                      <h3> ${ this.title} - <span>${start_time}</span></h3 >
                    </div>
                    <div class="jarvis-alert-card-body>
                      <p>${ this.content}</p>
                    </div>
                    <div class= "jarvis-alert-card-footer">
                      <button class="btn btn-sm btn-danger " onclick="${this.bad_alert_callback}" >Wrong</button> 
                    </div>
                </div > `;

    return html;
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
