var renderer, scene, camera;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 50000);
    camera.position.set(-150, 250, 150);
    camera.rotation.set(-Math.PI/4, -Math.PI/8, -Math.PI/8);

    // Temporal
    //camera.position.set(0, 300, 0);
    //camera.rotation.set(-Math.PI/2, 0, 0);
}

function update() {

}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

function createHand(material) {
    var mesh = new THREE.Geometry();
    var halfHeight = 9.5;
    var halfWidth= 10;
    var halfGirth = 2;
    var halfShortHeight = 7.5;

    var coords = [
        halfWidth, -halfHeight, halfGirth, // Bottom right back
        halfWidth, -halfHeight, -halfGirth, // Bottom right front
        halfWidth, halfHeight, -halfGirth, // Top right front
        halfWidth, halfHeight, halfGirth, // Top right back
        -halfWidth, halfHeight, halfGirth, // Top left back
        -halfWidth, halfHeight, -halfGirth, // Top left front
        -halfWidth, -halfHeight, -halfGirth, // Bottom left front
        -halfWidth, -halfHeight, halfGirth, // Bottom left back
        halfWidth * 2, -halfShortHeight, halfGirth,
        halfWidth * 2, -halfShortHeight, -halfGirth,
        halfWidth * 2, halfShortHeight, -halfGirth,
        halfWidth * 2, halfShortHeight, halfGirth,
    ];

    var indices = [
        0, 3, 7,      7, 3, 4,  0, 1, 2,
        0, 2, 3,      4, 3, 2,  4, 2, 5,
        6, 7, 4,      6, 4, 5,  1, 5, 2,
        1, 6, 5,      7, 6, 1,  7, 1, 0,
        0, 8, 1,      1, 8, 9,  9, 8, 10,
        10, 8, 11,    11, 3, 2,  2, 11, 10,
        10, 3, 1,     10, 9, 1,  3, 0, 8,
        3, 8, 10
    ];

    for (var i = 0; i < coords.length; i += 3) {
        var vertex = new THREE.Vector3(coords[i], coords[i+1], coords[i+2]);
        mesh.vertices.push(vertex);
    }

    for (var i = 0; i < indices.length; i += 3) {
        var triangle = new THREE.Face3(indices[i], indices[i+1], indices[i+2]);
        triangle.vertexColors.push(0xFF0000);
        mesh.faces.push(triangle);
    }

    hand = new THREE.Mesh(mesh, material);
    return hand;
}

function loadScene() {
    var material = new THREE.MeshBasicMaterial({color:0xFF0000, wireframe:true});

    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var baseGeometry = new THREE.CylinderGeometry(50, 50, 15, 32);
    var shoulderGeometry = new THREE.CylinderGeometry(20, 20, 18, 32);
    var armGeometry = new THREE.BoxGeometry(18, 12, 120);
    var elbow1Geometry = new THREE.SphereGeometry(20);
    var elbow2Geometry = new THREE.CylinderGeometry(22, 22, 6, 32);
    var forearmPartGeometry = new THREE.BoxGeometry(4, 80, 4);
    var wristGeometry = new THREE.CylinderGeometry(15, 15, 40, 32);

    var floor = new THREE.Mesh(floorGeometry, material);
    var base = new THREE.Mesh(baseGeometry, material);
    var shoulder = new THREE.Mesh(shoulderGeometry, material);
    var arm = new THREE.Mesh(armGeometry, material);
    var elbow1 = new THREE.Mesh(elbow1Geometry, material);
    var elbow2 = new THREE.Mesh(elbow2Geometry, material);
    var forearm = new THREE.Object3D();
    var wrist = new THREE.Mesh(wristGeometry, material);
    var hand1 = createHand(material);
    var hand2 = createHand(material);

    var forearmParts = [];
    for (var i = 0; i < 4; ++i)
        forearmParts.push(new THREE.Mesh(forearmPartGeometry, material));

    floor.rotation.x = Math.PI / 2;
    shoulder.rotation.x= Math.PI / 2;
    arm.position.z = -60;
    elbow1.position.z = -60;
    elbow2.rotation.x = Math.PI / 2;
    for (var i = 0; i < 4; ++i)
        forearmParts[i].position.y = -40;
    var forearmPartsCentralOffset = 10;
    forearmParts[0].position.x += forearmPartsCentralOffset;
    forearmParts[0].position.z += forearmPartsCentralOffset;
    forearmParts[1].position.x += forearmPartsCentralOffset;
    forearmParts[1].position.z += -forearmPartsCentralOffset;
    forearmParts[2].position.x += -forearmPartsCentralOffset;
    forearmParts[2].position.z += -forearmPartsCentralOffset;
    forearmParts[3].position.x += -forearmPartsCentralOffset;
    forearmParts[3].position.z += forearmPartsCentralOffset;

    wrist.position.y = -80;
    wrist.rotation.z = Math.PI / 2;

    hand1.rotation.x = -Math.PI / 2;
    hand1.rotation.z = Math.PI / 2;
    hand1.position.z -= 20;
    hand1.position.y -= 10


    hand2.rotation.x = -Math.PI / 2;
    hand2.rotation.z = Math.PI / 2;
    hand2.position.z -= 20;
    hand2.position.y += 10


    scene.add(floor);
    scene.add(base);
    base.add(shoulder);
    shoulder.add(arm);
    arm.add(elbow1);
    elbow1.add(elbow2);
    elbow2.add(forearm);
    for (var i = 0; i < 4; ++i)
        forearm.add(forearmParts[i]);
    forearm.add(wrist);
    wrist.add(hand1);
    wrist.add(hand2);
    /*var cube = new THREE.Mesh(cubeGeometry, material);
    var sphere = new THREE.Mesh(sphereGeometry, material);
    var sphereCube = new THREE.Object3D();

    sphereCube.add(sphere);
    sphereCube.add(cube);
    */
}

init();
loadScene();
render();
