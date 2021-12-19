// three.js global variables
var container, canvas, camera, scene, renderer, controls;

// custom global variables
var stats = new Stats();
var mouse = { x: 0, y: 0 };
var partsDictionary = new Object();
var partsMap = new Map();
var widthMargin = 15; // prevent to display scrollbar
var titleBarHeight = 70;
var heightMargin = titleBarHeight + widthMargin;

$(function() {
    modelPath = "Frame_A";
    init3D(modelPath);

    $("#normal-model").click(function() {
        if (scene !== undefined) {
            removeModel();
        }

        init3D(modelPath);
    });
    $("#explode-model").click(function() {
        getExplode();
    });
    $("#part-info").click(function() {
        UTILS.displayPartInfo();
    });
});

function init3D(modelPath) {
    if (!modelPath === "select") return;

    // check if webgl available on user's web browser
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    // canvas
    initCanvas();

    // scene
    scene = new THREE.Scene();

    // renderer
    initRenderer();

    // model
    // initialize the manager to handle all loaded events
    manager = new THREE.LoadingManager();
    manager.onStart = function(url, itemsLoaded, itemsTotal) {
        var message =
            "Started loading file: " +
            url +
            ".\nLoaded " +
            itemsLoaded +
            " of " +
            itemsTotal +
            " files.";
        setAlertMessage(message);
    };

    manager.onProgress = function(url, itemsLoaded, itemsTotal) {
        var message =
            "Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files.";
        setAlertMessage(message);
    };

    manager.onError = function(url) {
        var message = "Error occurred while loading " + url;
        console.log(message);
    };

    manager.onLoad = function() {
        // set camera and control after model is loaded
        setModel();
    };

    THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());

    var mtlLoader = new THREE.MTLLoader(manager);
    mtlLoader.setPath("./models/"); // for HTML
    mtlLoader.load(modelPath + ".mtl", function(materials) {
        materials.preload();

        var objLoader = new THREE.OBJLoader(manager);
        objLoader.setMaterials(materials);
        objLoader.setPath("./models/"); // for HTML
        objLoader.load(modelPath + ".obj", function(object) {
            //build partsDictionnary partName = partGUID
            //first element is ignored
            var tempPartsArray;
            for (var i = 0; i < object.children.length; i++) {
                if (partsDictionary[object.children[i].name] === undefined) {
                    tempPartsArray = [object.children[i].id];
                    partsDictionary[object.children[i].name] = tempPartsArray;
                    partsMap.set(object.children[i].name, tempPartsArray);
                } else {
                    tempPartsArray = partsDictionary[object.children[i].name];
                    tempPartsArray.push(object.children[i].id);
                    partsDictionary[object.children[i].name] = tempPartsArray;
                    partsMap.set(object.children[i].name, tempPartsArray);
                }
            }
            tempPartsArray = null;

            // TODO : use parameter rather than string - for adding multiple object feature (later)
            object.name = "importedObject";
            scene.add(object);
        });
    });
}

function setModel() {

    var object = scene.getObjectByName("importedObject");   

    if (typeof object === 'undefined') {
        var message = 'Part not found - please check it again';
        console.log(message);
        setAlertMessage(message);        

        return false;
    }

    var loadingMessage = 'Loading complete';
    console.log(loadingMessage);
    setAlertMessage(loadingMessage);


    CAMERA.initCamera(object);
    CAMERA.setCameraPosition(object, canvas);

    initLight();

    EVENTS.setHighlight(object);   
    EVENTS.windowResize(renderer, camera);

    // for debug - FPS
    canvas.appendChild(stats.dom);

    animate();
}

function removeModel() {
    var selectedObject = scene.getObjectByName("importedObject");  

    scene.remove(selectedObject);
    animate();
}

function getExplode() {

    EVENTS.resetHightlight();

    var importedObject;
    importedObject = scene.getObjectByName("importedObject");

    if (typeof importedObject === 'undefined') {
        LoadPart();
        importedObject = scene.getObjectByName("importedObject");
    }

    object = position.load(importedObject);

    CAMERA.setCameraPosition(object, canvas);

    position.explodeObject(object, 500, 5);

    for (var x = 0; x < object.children.length; x++) {
        var mesh = object.children[x];
        mesh.translateX(mesh.exploded[0]);
        mesh.translateY(mesh.exploded[1]);
        mesh.translateZ(mesh.exploded[2]);
    }

    EVENTS.setHighlight(object);
    EVENTS.windowResize(renderer, camera);

    animate();
}

function animate() {

    requestAnimationFrame(animate);
    render();

    // for debug - FPS
    stats.update();
}

function render() {
    renderer.render(scene, camera);
}

// initializations
function initCanvas() {
    canvas = document.getElementById('viewer');

    // prevent displaying scroll bar
    canvas.width = window.innerWidth - widthMargin;
    canvas.height = window.innerHeight - heightMargin;

    while (canvas.hasChildNodes()) {
        canvas.removeChild(canvas.lastChild);
    }
}

function initLight() {
    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);
}

function initRenderer() {
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);
    canvas.appendChild(renderer.domElement);
}

function setAlertMessage(message) {
    $('#alert-message').html(message);
}