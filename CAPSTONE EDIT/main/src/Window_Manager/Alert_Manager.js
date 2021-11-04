const alert_template = (title, type) => {
	let alert = `
            <div class="card my-2" data-card-alert>
                <div class="card-header d-flex justify-content-between">
                    <span>${title}</span>
                    <div>
                        <a href="#"  rel="noopener noreferrer" class="m-2" onclick="console.log('clicked')">
                            <i class="fas fa-times" style="color: red;"></i>
                        </a>
                        <a href="#"  rel="noopener noreferrer" class="m-2" onclick="console.log('clicked')">
                            <i class="fas fa-check" style="color: green;"></i>
                        </a>
                    </div>
                </div>
            </div>

`;

	let parser = new DOMParser();
	let doc = parser.parseFromString(alert, "text/html");
	let alert_html= doc.body.childNodes[0];
	return alert_html;
};

class Alert_Manager2 {
	constructor(warning, caution, alert) {
        this.warnings_drawer = document.querySelector(warning);
        console.log(warning)

		this.warnings = new Stack();

		this.cautions_drawer = document.querySelector(caution);

		this.cautions = new Stack();

		this.alerts_drawer = document.querySelector(alert);

		this.alerts = new Stack();

		this.badges = document.querySelectorAll("[data-alert-badge]");
		this.alert_bars = document.querySelectorAll("[data-alert_box]");
	}

	create_alert(category, message) {
		if (category === "warning") {
			this.warnings.push(message);
			this.warnings_drawer.prepend(alert_template(message.title));
		} else if (category === "caution") {
			this.cautions.push(message);
			this.cautions_drawer.prepend(alert_template(message.title));
		} else if (category === "alert") {
			this.alerts.push(message);
			this.alerts_drawer.prepend(alert_template(message.title));
		} else {
			console.log("Error");
        }
        
        
	}

	get allAlerts() {
		return {
			warnings: this.warnings.data,
			cautions: this.cautions.data,
			alerts: this.alerts.data,
		};
	}

	_update_badges() {
		this.badges.forEach((badge) => {
			if (badge.id === "warnings") {
				if (this.warnings.length() === 0) {
					badge.classList.add("d-none");
				} else {
					badge.classList.remove("d-none");
					badge.innerText = this.warnings.length();
				}
			}
			if (badge.id === "cautions") {
				if (this.cautions.length() === 0) {
					badge.classList.add("d-none");
				} else {
					badge.classList.remove("d-none");
					badge.innerHTML = this.cautions.length();
				}
			}
			if (badge.id === "alerts") {
				if (this.alerts.length() === 0) {
					badge.classList.add("d-none");
				} else {
					badge.classList.remove("d-none");
					badge.innerHTML = this.alerts.length();
				}
			}
		});

		$("[data-alert-badge]").effect(
			"shake",
			{ direction: "up", times: 3, distance: 1 },
			1000
		);
	}

	_update_alert_bar() {
		this.alert_bars.forEach((bar) => {
			if (bar.dataset.alert_box === "warning") {
				console.log("WARNING");
				if (this.warnings.isEmpty()) {
					bar.innerText = "All Good";
					bar.parentNode.classList.add("jarvis-bp");
					bar.classList.add("jarvis-primary");
				} else {
					bar.classList.remove("jarvis-primary");
					bar.classList.add("jarvis-warning");
					bar.parentNode.classList.remove("jarvis-bp");
					bar.classList.add("jarvis-alert");
					bar.parentNode.classList.add("jarvis-bw");
					bar.innerText = this.warnings.peek().title;
				}
			}
			if (bar.dataset.alert_box === "caution") {
				if (this.cautions.isEmpty()) {
					bar.innerText = "All Good";
					bar.parentNode.classList.add("jarvis-bp");
					bar.classList.add("jarvis-primary");
				} else {
					bar.classList.remove("jarvis-primary");
					bar.parentNode.classList.remove("jarvis-bp");
					bar.parentNode.classList.add("jarvis-bc");
					bar.classList.add("jarvis-alert");
					bar.innerText = this.cautions.peek().title;
				}
			}
			if (bar.dataset.alert_box === "alert") {
				if (this.alerts.isEmpty()) {
					bar.innerText = "All Good";
					bar.parentNode.classList.add("jarvis-bp");
					bar.classList.add("jarvis-primary");
				} else {
					bar.classList.remove("jarvis-primary");
					bar.parentNode.classList.remove("jarvis-bp");
					bar.parentNode.classList.add("jarvis-ba");
					bar.classList.add("jarvis-alert");
					bar.innerText = this.alerts.peek().title;
				}
			}
		});
	}

	update() {
		this._update_alert_bar();
		this._update_badges();
	}
}





