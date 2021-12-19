var position = function () {

    function getCamera(points) {
        var xy = _.map(points, function (p) {
            return [p[0], p[1]];
        });

        var axies = getPca(xy);

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

        var dx = (_.max(xs) - _.min(xs));
        var dy = (_.max(ys) - _.min(ys));
        var dz = (_.max(zs) - _.min(zs));
        var norm = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        // Camera positions
        var cx = x + axies[0][1] * norm * 1.3;
        var cy = y + axies[1][1] * norm * 1.3;
        var cz = z;

        return [cx, cy, cz];
    }

    function getPca(X) {
        var m = X.length;
        var sigma = numeric.div(numeric.dot(numeric.transpose(X), X), m);
        return numeric.svd(sigma).U;
    }

    function flatArrayToPoints(array) {
        var out = [];
        for (var i = 0; i < array.length; i = i + 3) {
            out.push([array[i], array[i + 1], array[i + 2]]);
        }
        return out;
    }

    function getCenter(points) {

        var xs = _.map(points, function (p) {
            return p[0];
        });

        var ys = _.map(points, function (p) {
            return p[1];
        });

        var zs = _.map(points, function (p) {
            return p[2];
        });

        var x = (_.max(xs) + _.min(xs)) / 2;
        var y = (_.max(ys) + _.min(ys)) / 2;
        var z = (_.max(zs) + _.min(zs)) / 2;

        return [x, y, z];
    }

    function extendMesh(mesh) {
        var points = flatArrayToPoints(mesh.geometry.attributes.position.array);
        mesh.points = points;
        mesh.center = getCenter(points);
        mesh.pca = getPca(points);
    }

    function meshPoints(object) {
        return _.flatten(_.map(data.children, function (child) {
            return flatArrayToPoints(child.geometry.attributes.position.array);
        }));
    }

    function load(object) {

        //console.log(object);

        _.forEach(_.where(object.children,
            function (child) {
                return child.type === "Mesh";
            }),
            function (mesh) {
                extendMesh(mesh);
            });

        var pts = _.flatten(_.map(object.children,
            function (child) {
                return child.points;
            }));

        object.pca = getPca(pts);
        object.center = getCenter(pts);
        object.camera = getCamera(pts);

        //console.log(object.pca);
        //console.log(object.center);

        return object;
    }

    function delta(p1, p2) {
        var dx = p2[0] - p1[0];
        var dy = p2[1] - p1[1];
        var dz = p2[2] - p1[2];

        var norm = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));

        return [dx / norm, dy / norm, dz / norm, norm];
    }

    function explodeGroup(group, center, axies, factor) {
        var de = delta(group.center, center);
        var a = [de[0], de[1], de[2]];

        var vec = _.max(axies, function (axis) {
            return Math.abs(numeric.dot(axis, a));
        });

        var sign = 1;
        if (numeric.dot(vec, a) < 0) {
            sign = -1;
        }

        

        var d = de[3] / factor;

        _.forEach(group.items,
            

            function (mesh) {

                if (!mesh.exploded)
                    mesh.exploded = [0, 0, 0];

                mesh.explode_axis = vec;
                mesh.exploded = [
                    mesh.exploded[0] + (-vec[0] * d * sign),
                    mesh.exploded[1] + (-vec[1] * d * sign),
                    mesh.exploded[2] + (-vec[2] * d * sign)
                ];
            });
    }

    function explode(items, center, axies, d, f) {
        var groups = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            var match = _.find(groups,
                function (group) {
                    var del = Math.abs(delta(item.center, group.center)[3]);
                    //console.log(del);
                    return del < d;
                });

            if (!match) {
                groups.push({
                    items: [item],
                    center: item.center
                });
            } else {
                match.items.push(item);
                match.center = getCenter(
                    _.map(match.items,
                        function (x) {
                            return x.center;
                        }));
            }
        }

        //console.log(groups);

        _.forEach(groups,
            function (group) {
                explodeGroup(group, center, axies, f);
            });
        return groups;
    }

    function explodeObject(object, d, f) {

        var axies = object.pca;

        var meshes = _.sortBy(object.children,
            function (item) {
                return -(Math.abs(delta(item.center, object.center)[3]));
            });

        var explodedGroups = explode(meshes, object.center, axies, d, f);

        //object.children.pop();
        //object.children.pop();
        //object.children.pop();
        //object.children.pop();

        _.forEach(explodedGroups,
            function (group) {
                var explodedSubGroups = explode(group.items, group.center, axies, 1, f/4);
                //console.log("explodedSubGroups");
                //console.log(explodedSubGroups);
            });

       // console.log("explodedGroups");
        //console.log(explodedGroups);
    }

    // Expose API
    return {
        load: load,
        explodeObject: explodeObject
    }
}()