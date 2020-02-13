let config = {
    debug: false
};

function setDebug(mode=false){config.debug=mode}
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
    // initialized
    debug('initialized')
}