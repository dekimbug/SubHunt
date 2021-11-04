$("#largePanelCombinedContent").hide();
$("#largePanelContent").hide();

var alert_manager = new Alert_Manager(); //?
var datastore = new TOMS_Datastore();
var boxController = new BoxController();



function test_callback() {
  console.log("callback");
}

function test_callback2() {
  console.log("callback2");
}

alert_manager.add_alert(
  "title",
  "this is all of the good content",
  "primary",
  new Date(),
  "bad",
  test_callback
);
alert_manager.add_alert(
  "title2",
  "this is all of the good content2",
  "danger",
  new Date(),
  "bad2",
  test_callback2
);




var simulation = new Simulation();

var asw_alerts = new ASW_Alerts();


var sbta = new SBTA();
var midshipmanAlgorithm = new MidshipmanAlgorithm();

var dynamic_events = new Dynamic_Event_Manager();

//simulation.run();

var map_controller = new Map_Controller();


const Alert_Management = new Alert_Manager2(
	"[data-warning-drawer]",
	"[data-cautions-drawer]",
	"[data-alert-drawer]"
);

Alert_Management.create_alert("warning", { title: `Hello 1` });

console.log(Alert_Management.allAlerts);

Alert_Management.create_alert("warning", { title: `Hello 2` });

console.log(Alert_Management.allAlerts);

Alert_Management.update();

let i = 2;
let run = setInterval(() => {
	if (i > 10) stop();
	if (i % 2 === 0) {
		Alert_Management.create_alert("caution", { title: `Hello ${i}` });
		Alert_Management.update();
	} else {
		Alert_Management.create_alert("alert", { title: `Hello ${i}` });
		Alert_Management.update();
	}

	i++;
}, 3000);
let stop = () => clearInterval(run);

const reset_button = document.querySelector("[data-window-reset]");
const stack_button = document.querySelector("[data-window-stack]");
const expand_to_fit_button = document.querySelector(
	"[data-window-expand_to_fit]");
//////////////////////// trying to add a run simulation button KPL
const start_button = document.querySelector("[data-window-run_simulation]");
////////////////////////////////////////////////////////




reset_button.addEventListener("click", (e) => {
	e.preventDefault();
	Window_Manager.resetWindows();
});
stack_button.addEventListener("click", (e) => {
	e.preventDefault();
	Window_Manager.cascadeWindows();
});

expand_to_fit_button.addEventListener("click", (e) => {
	e.preventDefault();
	console.log("still working on this");
});

/////////////////////////////////////////////// KPL
start_button.addEventListener("click", (e) => {
	e.preventDefault();
	console.log("this will be the run simulation button");
	// simulation.run();
});
///////////////////////////////////////////////

$(".jarvis-window").resizable({
	animate: false,
	ghost: true,
	// animateDuration: "fast",
});

$(".jarvis-window").draggable({
	cursor: "move",
	scroll: false,
	containment: "parent",
});

const jarvis_window_buttons = document.querySelectorAll(".jarvis-window");

for (let button of jarvis_window_buttons) {
	button.addEventListener("click", (e) => {
		e.preventDefault();
		let current_window = e.target.parentNode.parentNode.parentNode.parentNode;
		console.log(window);
		let button_selected = e.target.dataset.windowControl;
		let main = document.querySelector("[data-window-container]");
		console.log(button);
		let style = getComputedStyle(main);
		let height = main.clientHeight - parseInt(style.paddingBottom);
		switch (button_selected) {
			case "zoom":
				current_window.classList.remove("minimize");
				current_window.style.height = height + "px";
				minimize_others(current_window.id);
				break;
			case "minimize":
				current_window.classList.remove("maximize");
				current_window.style.height = "20px";
				break;
			case "close":
				console.log("Close selected");
				current_window.style.display = "none";
				main.removeChild(current_window);
				break;
      // case "start":
      //   // simulation.run();
      //   console.log("Keenan");
      //   // current_window.classList.remove("start");
      //   // current_window;
      //   break;
			default:
				console.log("error");
				break;
		}
	});
}

function minimize_others(id) {
	let windows = document.querySelectorAll(".jarvis-window");

	let main = document.querySelector("[data-window-container]");
	let style = getComputedStyle(main);
	let height = main.clientHeight - parseInt(style.paddingBottom);

	for (let window of windows) {
		if (window.id !== id) {
			window.style.height = "20px";
			window.classList.add("minimize");
			window.style.top = height - 20 + "px";
		}
	}
}

let cards = document.querySelectorAll("[data-card-alert]");

cards.forEach((card) => {
	addEventListener("click", () => {

	});
});
