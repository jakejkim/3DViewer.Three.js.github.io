/** @namespace */
var UTILS = UTILS || {};

UTILS.setBoxHelper = function (object) {
    // red box
    var helper = new THREE.BoxHelper(object, 0xff0000);
    helper.update();
    scene.add(helper);
};

UTILS.displayPartInfo = function () {
    $('.ui.sidebar').sidebar('toggle');
};

