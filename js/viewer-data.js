var partsArray = [];

$(function () {

    // drop-down settings
    $('#environment').change(function () {
        SetEnvironment();
    });
    
    $('#models').change(function () {
        var modelIndex = document.getElementById('models').selectedIndex;
        LoadModel(modelIndex);
    });

    $('#frameComponents').change(function () {
        FilterComponents();
    });

    // buttons
    $('#filter-chassis').click(function () {
        ButtonComponentFilter('Chassis');
    });

    $('#filter-pads').click(function () {
        ButtonComponentFilter('Pads');
    });

    $('#filter-all').click(function () {
        ButtonComponentFilter('All');
    });

    $('#close-btn').click(function () {
        UTILS.displayPartInfo();
    });

    // reset hightlight when any menu is clicked
    $("[id^='filter-'], .menu-selections").click(function () {
        EVENTS.resetHightlight();
    });

});

//DATA
function LoadModel(index) {
    if (index > 0) {
        modelPath = "Frame_A";
        init3D(modelPath);
    } else {
        removeModel();
    }
}

//DISPLAY
var partsHidden = [];

function ShowEverything() {

    //show all 3d parts
    for (i = 0; i < partsHidden.length; i++) {
        var part3d = scene.getObjectById(partsHidden[i]);

        if (part3d !== undefined) {
            part3d.visible = true;
        }
    }

    partsHidden = [];
}

function HidePart(partName) {  
    var parts = partsDictionary[partName];

    if (parts === undefined) { return; }

    for (var i = 0; i < parts.length; i++) {
        var part3d = scene.getObjectById(parts[i]);

        if (part3d !== undefined) {  
            part3d.visible = false;
        }
    }
}

function ShowPart(partName) {
    var parts = partsDictionary[partName];
    if (parts === undefined) { return; }

    for (var i = 0; i < parts.length; i++) {
        var part3d = scene.getObjectById(parts[i]);
        if (part3d !== undefined) {
            part3d.visible = true;
        }
    }
}

function HideFromFilter(filter) {
    var partClasses = [];

    if (filter === 'Chassis') {
        partClasses.push('ma', 'gg', 'pg', 'pf', 'pp', 'tg', 'ig', 'as', 'tb');
    } else if (filter === 'Pads') {
        partClasses.push('cp', 'pp', 'vm', 'hm');
    }

    for (var [key, value] of partsMap.entries()) {
        for (var partClass of partClasses) {
            if (key.startsWith(partClass.toUpperCase())) {
                if (value.length > 1) {
                    value.forEach(function (v) {
                        partsHidden.push(v);
                    });
                }
                else {
                    partsHidden.push(value[0]);
                }
            }
        }        
    }

    //hide 3d parts
    for (i = 0; i < partsHidden.length; i++) {
        var part3d = scene.getObjectById(partsHidden[i]);

        if (part3d !== undefined) {
            part3d.visible = false;
        }
    }
}

function ButtonComponentFilter(selectedFilter) {
 
    ShowEverything();

    if (selectedFilter !== 'All') {
        HideFromFilter(selectedFilter);
    }
}

function SetMessage(errorMessage) {
    console.log(errorMessage);
    $('#alert-message').html(errorMessage);
}