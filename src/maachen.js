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
        elements: []
    };
    // initialized
    debug('initialized');
    return this
}

maachen.prototype.updateRenderer = function() {
    // find all elements relevant to the renderer
    this.renderer.elements = this.root.querySelectorAll('*[x-template]');
    // store original context for rendering
    this.renderer.elements.forEach(function(el) {
        el.originalContent = el.innerHTML;
    })
};

maachen.prototype.render = function() {
    const start = new Date();
    // keep track of the main scope
    const t = this;
    // execute template on a specific element
    const templateFunc = function(el) {
        const regex = config.template;
        let match = regex.exec(el.originalContent);
        while(match) {
            if(t.renderer.variables[match[1]]) {
                el.innerHTML = el.originalContent.replace(match[0], t.renderer.variables[match[1]]);
            }
            match = regex.exec(el.originalContent)
        }
    };
    // execute template on all relevant elements
    this.renderer.elements.forEach(templateFunc);
    // status info
    const end = new Date();
    debug('render complete in ' + (end - start) + 'ms')
};

maachen.prototype.setVariable = function(tag, value) {
    // set variable
    this.renderer.variables[tag] = value;
    // status info
    debug('registered "' + tag + '"="' + value + '".')
};

maachen.prototype.updateVariable = function(tag, value) {
    // update variable content
    this.setVariable(tag, value);
    // update view
    this.render()
};