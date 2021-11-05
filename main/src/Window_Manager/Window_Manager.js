

// I need to figure out how to handle the state object with the sort. Right now I zip the state to the windows creating subarrays.
// The merge sort will not work with this method.
// Maybe set it up so that the state is help by the window. have a second array that holds previous state and on change check if the state and the current windows are different
// possible have a is changed flag?
class WindowManager {
	constructor(selector) {
		this.parentNode = document.querySelector(selector);
		this.windows = [];
		this.state = [];
		this.checkWindows();
	}

	get windowsState() {
		return this.state;
	}

	addWindow(h, w, x, y, title, pri, template) {
		let window = new Window(h, w, x, y, title, pri, template).createWindow();
		this.windows.push(window);
		this.parentNode.appendChild(window);

		this.checkWindows();
	}

	checkWindows() {
		// if there are no windows break out
		if (this.windows.length === 0) return;

		let windowSpaces = [];
		// go through each window and get the sizes
		this.windows.forEach((window) => {
			let size = {
				height: window.clientHeight,
				width: window.clientWidth,
				y: window.offsetTop,
				x: window.offsetLeft,
				pri: window.getAttribute("data-pri"),
				percentages: {
					height: window.clientHeight / this.parentNode.clientHeight,
					width: window.clientWidth / this.parentNode.clientWidth,
				},
			};
			windowSpaces.push(size);
		});

		this.state = windowSpaces;
	}

	resetWindows() {
		let windowStatePairs = zip(this.windows, this.state);
		for (let pair of windowStatePairs) {
			let window = pair[0];
			let state = pair[1];
			window.style.height = state.height + "px";
			window.style.width = state.width + "px";
			window.style.top = state.y + "px";
			window.style.left = state.x + "px";
		}
	}

	cascadeWindows() {
		this.checkWindows();
		let x = 0;
		let y = 0;
		for (let window of this.windows) {
			window.style.top = y + "px";
			y += 10;
			window.style.left = x + "px";
			x += 10;
		}
	}
}

class Window {
	constructor(height, width, pos, title, priority, template) {
		this.height = height;
		this.width = width;
		this.top = pos.y;
		this.left = pos.x;
		this.title = title;
		this.priority = priority || 4;
		this.colors = ["red", "yellow", "blue", "black"];
        this.id = null;
        this.template = template
	}

	createWindow(template) {
		let html = `
				<div class="jarvis-window" >
					<div class="jarvis-window-header-bar">
						<div class="jarvis-window-controls">
							<div class="close">
								<a class="closebutton" href="#" data-window-control="close"
									><span><strong>x</strong></span></a
								>
							</div>

							<div class="minimize">
								<a
									class="minimizebutton"
									href="#"
									data-window-control="minimize"
									><span><strong>&ndash;</strong></span></a
								>
							</div>
							<div class="zoom">
								<a class="zoombutton" href="#" data-window-control="zoom"
									><span><strong>+</strong></span></a
								>
							</div>
						</div>
						${this.title}
					</div>
					<div class = "jarvis-window-content"> ${this.template} </div>
				</div>
		
		
		
		
		`;
		let parser = new DOMParser();
		let doc = parser.parseFromString(html, "text/html");
		let window = doc.body.childNodes[0];
		return window;
	}
}
