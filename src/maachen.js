let config = {
    debug: false,
    template: /{{([^}}]+)}}/g
};

function debug(msg){if(config.debug===true){console.log(msg)}}
function e(id){return document.getElementById(id)}

function maachen(root) {
    // Check for valid instance
    if(!root instanceof Element) {
        console.error('The given element is not an valid DOM Element');
        return;
    }
    // assign values
    this.root = root;
    this.renderer = {
        variables: [],
        elements: [],
        inputs: [],
        listeners: {
            'values': {}
        }
    };
    // initialized
    debug('initialized');
}

maachen.prototype.updateRenderer = function() {
    // keep track of the main scope
    const t = this;
    // find all elements relevant to the renderer
    this.renderer.elements = this.root.querySelectorAll('*[x-template]');
    this.renderer.inputs = this.root.querySelectorAll('*[x-input]');
    // store original context for rendering
    this.renderer.elements.forEach(function(el) {
        el.originalContent = el.innerHTML;
    });
    // register value listeners
    this.renderer.inputs.forEach(function (el) {
        // get variable scope
        const variableName = el.getAttribute('x-input');
        // set value change event
        el.onkeyup = function () {
            t.updateVariable(variableName, el.value);
        };
        // store listener element
        if(!t.renderer.listeners['values'][variableName]) {
            t.renderer.listeners['values'][variableName] = [el];
        } else {
            t.renderer.listeners['values'][variableName].push(el);
        }
    });
};

maachen.prototype.render = function() {
    // track start time
    const start = new Date();
    // keep track of the main scope
    const t = this;
    // execute template on a specific element
    const templateFunc = function(el) {
        const regex = config.template;
        let match = regex.exec(el.originalContent);
        while(match) {
            if(t.renderer.variables[match[1]] !== null) {
                el.innerHTML = el.originalContent.replace(match[0], t.renderer.variables[match[1]]);
            }
            match = regex.exec(el.originalContent)
        }
    };
    // execute template on all relevant elements
    t.renderer.elements.forEach(templateFunc);
    // track end time
    const end = new Date();
    // status info
    debug('render complete in ' + (end - start) + 'ms (' + t.renderer.elements.length + ' elements)')
};

maachen.prototype.setVariable = function(tag, value) {
    // set variable
    this.renderer.variables[tag] = value;
    // run listeners
    if(this.renderer.listeners['values'][tag]) {
        this.renderer.listeners['values'][tag].forEach(function (el) {
            el.value = value;
        });
    }
    // status info
    debug('set "' + tag + '"="' + value + '".')
};

maachen.prototype.updateVariable = function(tag, value) {
    // update variable content
    this.setVariable(tag, value);
    // update view
    this.render()
};