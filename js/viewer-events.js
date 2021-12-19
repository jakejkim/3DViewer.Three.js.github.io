/** @namespace */
var EVENTS = EVENTS || {};

var meshes;
var selectedMesh;
var selectedMeshes;
var containsMulipleMeshes = [];
var materials = {};
var highlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff99 });  // yellow lambert material

EVENTS.setHighlight = function (object) {

    meshes = object.children;
    var selectedId;
    var eventsControl = new EventsControls(camera, renderer.domElement);

    // save original meshes
    object.children.forEach(function (mesh, i) {
        materials[mesh.uuid] = mesh.material;
    });

    // get part contains multiple meshes
    $.each(partsDictionary, function (k, v) {
        if (v.length > 1)
            containsMulipleMeshes.push(k);
    });

    eventsControl.attach(object);
    eventsControl.attachEvent('onclick', function () {

        if (this.focusedChild === null) {
            EVENTS.resetHightlight();
        }
        else {
            EVENTS.resetHightlight();

            this.focusedChild.material = highlightMaterial;
            selectedMesh = this.focusedChild;

            var partNumber = this.focusedChild.name;
            setSelectedPartMessage(partNumber);

            //DisplayPartValues(partNumber);
        }
    });

    // uncomment this if hover event is required
    //setHoverEvent();
    function setHoverEvent() {

        eventsControl.attachEvent('onclick', function () {

            if (this.focusedChild === null) {
                EVENTS.resetHightlight();
            }
            else {
                if (typeof selectedMesh !== 'undefined') {

                    // case when user click a different mesh
                    if (selectedMesh.uuid !== this.focusedChild.uuid) {

                        // find previous mesh and set back to original
                        EVENTS.resetHightlight();

                        this.focusedChild.material = highlightMaterial;
                        selectedMesh = this.focusedChild;
                    }
                } else {
                    this.focusedChild.material = highlightMaterial;
                    selectedMesh = this.focusedChild;
                }

                var partNumber = this.focusedChild.name;
                setSelectedPartMessage(partNumber);

                DisplayPartValues(partNumber);
            }
        });

        eventsControl.attachEvent('mouseOver', function () {

            selectedId = this.mouseOveredChild.uuid;
            this.mouseOveredChild.material = highlightMaterial;
        });

        eventsControl.attachEvent('mouseOut', function () {

            // set back to original except for selected one
            if (selectedMesh !== this.mouseOveredChild) {
                this.mouseOveredChild.material = materials[selectedId];
            }
        });
    }

};

EVENTS.setHighLightByPartNumber = function (partNumber) {

    EVENTS.resetHightlight();

    // contains multiple meshes on a part
    if ($.inArray(partNumber, containsMulipleMeshes) !== -1) {

        selectedMeshes = [];

        // get all meshes
        for (var tempMesh of meshes) {
            if (tempMesh.name === partNumber)
                selectedMeshes.push(tempMesh);
        }

        // set all meshes
        for (var tempSelectedMesh of selectedMeshes)
            tempSelectedMesh.material = highlightMaterial;

        delete tempMesh;
        //console.log(selectedMeshes);
    }
    else {
        for (var tempMesh of meshes) {
            if (tempMesh.name === partNumber) {
                selectedMesh = tempMesh;
                tempMesh.material = highlightMaterial;
                break;
            }
        }
    }

    setSelectedPartMessage(partNumber);
};

EVENTS.resetHightlight = function () {

    if (selectedMesh) {
        for (var tempMesh of meshes) {
            if (tempMesh.uuid === selectedMesh.uuid) {
                tempMesh.material = materials[selectedMesh.uuid];
                break;
            }
        }
        selectedMesh = null;
    }

    if (selectedMeshes) {
        for (var tempMesh of meshes) {
            for (var selected of selectedMeshes) {
                if (tempMesh.uuid === selected.uuid) {
                    tempMesh.material = materials[selected.uuid];
                }
            }
        }
        selectedMeshes = null;
    }

    if (meshes !== null && typeof meshes !== 'undefined')
        setSelectedPartMessage('');
};

// automatically resize as window size
EVENTS.windowResize = function (renderer, camera, dimension) {
    dimension = dimension || function () {
        return {
            width: window.innerWidth - widthMargin,
            height: window.innerHeight - heightMargin
        };
    };
    var resize = function () {

        var rendererSize = dimension();

        renderer.setSize(rendererSize.width, rendererSize.height);

        camera.aspect = rendererSize.width / rendererSize.height;
        camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', resize, false);

    return {
        trigger: function () {
            resize();
        },
        destroy: function () {
            window.removeEventListener('resize', resize);
        }
    };
};

function getDuplicates(propertyName, inputs) {

    var duplicates = [];

    var groupedByCount = _.countBy(inputs, function (input) {
        return input[propertyName];
    });

    for (var input in groupedByCount) {
        if (groupedByCount[input] > 1) {
            _.where(inputs, { name: input })
                .map(function (item) {
                    duplicates.push(item);
            });
        }
    }

    return duplicates;
}

function setSelectedPartMessage(partNumber) {
    $('#alert-message').html('Selected part number :  ' + '<b>' + partNumber + '</b>');
}
