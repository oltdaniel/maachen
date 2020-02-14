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
        forms: [],
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
    this.renderer.inputs = this.root.querySelectorAll('*[x-input][id]');
    this.renderer.forms = this.root.querySelectorAll('form[x-form][id]');
    const formInputs = this.root.querySelectorAll('form[x-form][id] *[x-input][id]');
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
    // handle forms correctly
    this.renderer.forms.forEach(function(el) {
        el.onsubmit = function(e) {
            // stop default submit process
            e.preventDefault();
            // handle validation
            if(t.validateForm(el)) {
                el.submit();
            }
        }
    });
    // assign form inputs correctly
    const formIds = [];
    this.renderer.forms.forEach(function(el) {
        formIds.push(el.id);
    });
    formInputs.forEach(function(el) {
        // find relevant form
        const index = formIds.indexOf(el.form.id);
        // check if form exists
        if(index > -1) {
            // check if anything is defined yet
            if(t.renderer.forms[index].relevantInputs === undefined) {
                // initialize property
                t.renderer.forms[index].relevantInputs = {
                    ids: [el.id],
                    elements: [el]
                };
            } else {
                // make sure the element is not registered yet
                if(t.renderer.forms[index].relevantInputs.ids.indexOf(el.id) === -1) {
                    // keep track of input id
                    t.renderer.forms[index].relevantInputs.ids.push(el.id);
                    // keep track of element
                    t.renderer.forms[index].relevantInputs.elements.push(el);
                }
            }
        }
    })
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
            match = regex.exec(el.originalContent);
        }
    };
    // execute template on all relevant elements
    t.renderer.elements.forEach(templateFunc);
    // track end time
    const end = new Date();
    // status info
    debug('render complete in ' + (end - start) + 'ms (' + t.renderer.elements.length + ' elements)');
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
    debug('set "' + tag + '"="' + value + '".');
};

maachen.prototype.updateVariable = function(tag, value) {
    // update variable content
    this.setVariable(tag, value);
    // update view
    this.render();
};

maachen.prototype.validateForm = function(el) {
    el.querySelectorAll('error-message').forEach(function(el){el.remove();});
    // status info
    debug('validating ' + el.relevantInputs.elements.length + ' inputs');
    // single input validation function
    let errorMessages = [];
    const validateInput = function(el) {
        if(el.hasAttribute('x-required') && el.value.length === 0) {
            errorMessages.push('input ' + el.previousElementSibling.innerText + ' required');
            return false;
        }
        return true;
    };
    // validate all inputs and combine status
    const inputs = el.relevantInputs.elements;
    let status = true;
    inputs.map(validateInput).forEach(function(el){status&=el;});
    // submit if all valid
    if(status) {
        el.submit();
    } else {
        // display error messages
        let errorMessage = document.createElement('error-message');
        errorMessages.forEach(function(el) {
            errorMessage.innerHTML += el + '<br>';
        });
        el.insertBefore(errorMessage, el.childNodes[0]);
    }
};