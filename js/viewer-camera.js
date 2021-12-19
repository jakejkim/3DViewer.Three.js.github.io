/** @namespace */
var CAMERA = CAMERA || {};

CAMERA.initCamera = function (object) {

    var boundingBox = new THREE.Box3().setFromObject(object);

    var distance = getBoundingDistance(boundingBox);
    var radius = distance / 2;
    var near = radius * 0.01;
    var far = radius * 1000.0;

    var fov = 45;
    var aspect = canvas.width / canvas.height;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
};

CAMERA.setCameraPosition = function (object) {

    var boundingBox = new THREE.Box3().setFromObject(object);

    if (typeof boundingBox === 'undefined') {
        var errorMessage = 'Please ';
        console.log(errorMessage);
        $('#alert-message').html(errorMessage);
        return;
    }

    var center = boundingBox.getCenter();

    // set Z axis as up
    camera.up.set(0, 0, 1);

    // set camera to rotate around center of object
    controls = new THREE.OrbitControls(camera, canvas);
    controls.target = center;

    // set camera position depends on mesh's initial position
    var cameraPosition = getCameraPosition(object);
    camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    camera.lookAt(center);
};

function getBoundingDistance(boundingBox) {

    var center = boundingBox.getCenter();
    var max = boundingBox.max;
    var min = boundingBox.min;

    var distanceX = max.x - min.x;
    var distanceY = max.y - min.y;
    var distanceZ = max.z - min.z;

    return Math.sqrt(
          distanceX * distanceX
        + distanceY * distanceY
        + distanceZ * distanceZ);
}

function getCameraPosition(object) {

    var cameraPosition = new THREE.Vector3();
    var json = object.toJSON();
    var points = to_points(json);
    var locs = get_camera(points);

    function to_points(data) {
        var geos = data.geometries;
        var pos = _.map(geos, function (g) {
            return g.data.attributes.position.array;
        });

        var points = _.flatten(pos);

        var out = [];

        for (i = 0; i < points.length; i = i + 3) {
            out.push([points[i], points[i + 1], points[i + 2]]);
        }

        return out;
    }

    function pca(X) {
        var m = X.length;
        var sigma = numeric.div(numeric.dot(numeric.transpose(X), X), m);
        return numeric.svd(sigma).U;
    }

    function get_camera(points) {
        var xy = _.map(points, function (p) {
            return [p[0], p[1]];
        });

        var U = pca(xy);

        var xs = _.map(points, function (p) {
            return p[0];
        });

        var ys = _.map(points, function (p) {
            return p[1];
        });

        var zs = _.map(points, function (p) {
            return p[2];
        });

        // Target positions
        var x = (_.max(xs) + _.min(xs)) / 2;
        var y = (_.max(ys) + _.min(ys)) / 2;
        var z = (_.max(zs) + _.min(zs)) / 2;

        var dx = _.max(xs) - _.min(xs);
        var dy = _.max(ys) - _.min(ys);
        var dz = _.max(zs) - _.min(zs);
        var norm = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        // Camera positions
        var cx = x + U[0][1] * norm;
        var cy = y + U[1][1] * norm;
        var cz = z;

        cameraPosition.set(cx, cy, cz);
    }

    return cameraPosition;
}

// TODO : Not in use - move all vertices
function setObjectPostion(object) {

    var objectArrayLength;
    var lengthArray = [];

    var jsonData = object.toJSON();
    var points = toPoints(jsonData);
    var translatedPoints = translateToCenter(points);
    var result = backToObject(translatedPoints, jsonData);

    // seperate all vertices by x, y, z
    function toPoints(jsonData) {

        var out = [];

        objectArrayLength = jsonData.geometries.length;

        var geometries = _.map(jsonData.geometries, function (geo) {
            var geoArray = geo.data.attributes.position.array;
            lengthArray.push(geoArray.length);
            return geoArray;
        });

        var points = _.flatten(geometries);

        for (i = 0; i < points.length; i = i + 3) {
            out.push([points[i], points[i + 1], points[i + 2]]);
        }

        return out;
    }

    function translateToCenter(points) {
        var translated = [];
        var xyz = _.map(points, function (p) {
            //x = p[0] + 155622;
            //y = p[1] + 66242;
            //z = p[2] - 16590;
            translated.push([x, y, z]);
        });
        return translated;
    }

    function backToObject(translatedPoints, jsonData) {

        var out2 = [];
        var flattenedPoints = _.flatten(translatedPoints);

        for (i = 0; i < objectArrayLength; i++) {
            var j = 0;
            var tempArray = [];
            var eachLength = lengthArray[i];
            while (j < eachLength) {
                tempArray.push(flattenedPoints[j]);
                j++;
            }
            out2.push(tempArray);
        }

        for (geo of jsonData.geometries) {
            for (var array of geo.data.attributes.position.array) {
                for (i = 0; i < out2.length; i++) {
                    array[i] = out2[i];
                }
            }
        }

        var geometries2 = _.map(jsonData.geometries, function (geo) {
            for (i = 0; i < out2.length; i++) {
                geo.data.attributes.position.array = out2[i];
            }
        });

        for (i = 0; i < out2.length; i++) {
            geometries2[i] = out2[i];
        }

        return jsonData;
    }

    return result;
}

// TODO : not in use - change values directly
function setObjectPosition(object) {

    for (var c of object.children) {
        for (i = 0; i < c.geometry.attributes.position.array.length; i = i + 3) {
            c.geometry.attributes.position.array[i] += 155600;
            c.geometry.attributes.position.array[i + 1] += 66200;
            c.geometry.attributes.position.array[i + 2] -= 16590;
        }
    }
  
    return object;
}