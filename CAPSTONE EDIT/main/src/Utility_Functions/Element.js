// HtmlElement constructor
function HtmlElement(elem) {
	this.element =
		elem instanceof HTMLElement ? elem : document.createElement(elem);
}

// Static method that calls constructor
// and returns chainable object
HtmlElement.create = function (elem) {
	return new HtmlElement(elem);
};

// Add id
HtmlElement.prototype.addId = function (id) {
	this.element.id = id || "";
	return this;
};

// Add a single class
HtmlElement.prototype.addClass = function (className) {
	className && this.element.classList.add(className);
	return this;
};

// Add multiple classes. Use of rest parameter
// allows classNames to be either a comma-
// separated list or an array of args.
HtmlElement.prototype.addClasses = function (...classNames) {
	for (className of classNames) {
		this.addClass(className);
	}

	return this;
};

// Add text content to element
HtmlElement.prototype.addTextContent = function (text = "") {
	this.element.textContent = text;
	return this;
};

// Add single child element and append to parent
HtmlElement.prototype.addChild = function (args = {}) {
	const child = HtmlElement.create(args.elem)
		.addId(args.id)
		.addClasses(args.classes) // addClasses can take an array or a comma-separated list
		.addTextContent(args.textContent);
	this.append(child);
	return this;
};

// Add multiple child elements
// Takes array of objects
HtmlElement.prototype.addChildren = function (children = []) {
	for (child of children) {
		this.addChild(child);
	}

	return this;
};

// Gets child of the current HtmlElement and
// wraps it in an instance of HtmlElement
HtmlElement.prototype.getChild = function (selector) {
	return new HtmlElement(this.element.querySelector(selector));
};

// Appends an HtmlElement's inner element property
// to the current HtmlElement. Not chainable,
// but would be if you add return this.
HtmlElement.prototype.append = function (htmlElement) {
	this.element.appendChild(htmlElement.element);
};

// Appends the current HtmlElement's inner
// element property to a DOM element.
// Return this to make chainable.
HtmlElement.prototype.appendTo = function (domElement) {
	domElement.appendChild(this.element);
};
