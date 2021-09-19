var renderer, scene, camera;

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x0000AA), 1.0);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 50000);
    camera.position.set(0, 200, 250);
    camera.rotation.set(-0.3, 0, 0);

    // Temporal
    //camera.position.set(0, 130, 100);
    //camera.rotation.set(0, 0, 0);
}

function update() {

}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}

function loadScene() {
    var material = new THREE.MeshBasicMaterial({color:0xFF0000, wireframe:true});

    var baseGeometry = new THREE.CylinderGeometry(50, 50, 15, 32);
    var shoulderGeometry = new THREE.CylinderGeometry(20, 20, 18, 32);
    var armGeometry = new THREE.BoxGeometry(18, 12, 120);
    var elbow1Geometry = new THREE.SphereGeometry(20);
    var elbow2Geometry = new THREE.CylinderGeometry(22, 22, 6, 32);
    var forearmPartGeometry = new THREE.BoxGeometry(4, 80, 4);

    var base = new THREE.Mesh(baseGeometry, material);
    var shoulder = new THREE.Mesh(shoulderGeometry, material);
    var arm = new THREE.Mesh(armGeometry, material);
    var elbow1 = new THREE.Mesh(elbow1Geometry, material);
    var elbow2 = new THREE.Mesh(elbow2Geometry, material);
    var forearm = new THREE.Object3D();

    var forearmParts = [];
    for (var i = 0; i < 4; ++i)
        forearmParts.push(new THREE.Mesh(forearmPartGeometry, material));

    shoulder.rotation.x= Math.PI / 2;
    arm.position.z = -60;
    elbow1.position.z = -60;
    elbow2.rotation.x = Math.PI / 2;
    for (var i = 0; i < 4; ++i)
        forearmParts[i].position.y = -40;
    forearmParts[0].position.x += 10;
    forearmParts[0].position.z += 10;
    forearmParts[1].position.x += 10;
    forearmParts[1].position.z += -10;
    forearmParts[2].position.x += -10;
    forearmParts[2].position.z += -10;
    forearmParts[3].position.x += -10;
    forearmParts[3].position.z += 10;

    scene.add(base);
    base.add(shoulder);
    shoulder.add(arm);
    arm.add(elbow1);
    elbow1.add(elbow2);
    elbow2.add(forearm);
    for (var i = 0; i < 4; ++i)
        forearm.add(forearmParts[i]);

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
