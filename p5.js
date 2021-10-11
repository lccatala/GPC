var renderer, scene, camera, topCamera, controls, before, stats;
var robot, robotX, robotZ, robotController, base, baseAngle, arm, armAngle, forearm, forearmAngle, forearmAngleZ, wrist, wristAngle, hand1, hand2, fingersRotation;
var L = 100;

function setCameras(aspectRatio) {
    if (aspectRatio > 1)
        topCamera = new THREE.OrthographicCamera(-L, L, L, -L, -100, 100);
    else
        topCamera = new THREE.OrthographicCamera(-L, L, L/aspectRatio, -L/aspectRatio, -100, 100);

    topCamera.position.set(0, L, 0);
    topCamera.lookAt(new THREE.Vector3(0,0,0));
    topCamera.up = new THREE.Vector3(0,0,-1);

    scene.add(topCamera);
}

function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

    if (aspectRatio > 1) {
        topCamera.left = -L * aspectRatio;
        topCamera.right = L * aspectRatio;
        topCamera.top = L;
        topCamera.bottom = -L;
    } else {
        topCamera.left = -L;
        topCamera.right = L;
        topCamera.top = L / aspectRatio;
        topCamera.bottom = -L / aspectRatio;
    }

    topCamera.updateProjectionMatrix();
}

var world;
function initPhysics() {
    robotX = robotZ = 0;
    baseAngle = 0;
    armAngle = 90;
    forearmAngle = 0;
    forearmAngleZ = 0;
    wristAngle= 0;
    fingersAngle = 0;
}

function stopRobot(event) {
    switch (event.key) {
        case 'ArrowLeft':
            robotX = 0;
            break;
        case 'ArrowRight':
            robotX = 0;
            break;
        case 'ArrowDown':
            robotZ = 0;
            break;
        case 'ArrowUp':
            robotZ = 0;
            break;
    }
}
function updateRobotPosition(event) {
    var moveSpeed = 1;
    switch (event.key) {
        case 'ArrowLeft':
            robotX = moveSpeed;
            break;
        case 'ArrowRight':
            robotX = -moveSpeed;
            break;
        case 'ArrowDown':
            robotZ = -moveSpeed;
            break;
        case 'ArrowUp':
            robotZ = moveSpeed;
            break;
    }
}

function initVisual() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    renderer.shadowMap.enabled = true;
    renderer.antialias = true;
    document.body.appendChild(renderer.domElement);
    renderer.autoClear = false;

    scene = new THREE.Scene();

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 50000);
    camera.position.set(-150, 300, 150);
    camera.lookAt(new THREE.Vector3(0,0,0));
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    setCameras(aspectRatio);
    window.addEventListener('resize', updateAspectRatio);
    window.addEventListener('keydown', updateRobotPosition, true);
    window.addEventListener('keyup', stopRobot, true);

    stats = new Stats();
    stats.showPanel(0);
    document.getElementById('container').appendChild(stats.domElement);


}

function initGUI() {
    robotController = {
        giro_base: 0.0,
        giro_brazo: 0.0,
        giro_rotula: 0.0,
        giro_rotulaZ: 0.0,
        giro_pinza: 0.0,
        separacion_pinza: 0.0
    };
    var gui = new dat.GUI({autoPlace: true, width: 300});
    var folder = gui.addFolder('controls');
    var baseRotation = folder.add(robotController, 'giro_base', -180, 180, 5).name('Giro Base');
    var armRotation= folder.add(robotController, 'giro_brazo', 45, 135, 5).name('Giro Brazo');
    var forearmRotation= folder.add(robotController, 'giro_rotula', -180, 180, 5).name('Giro Antebrazo Y');
    var forearmRotationZ= folder.add(robotController, 'giro_rotulaZ', -90, 90, 5).name('Giro Antebrazo Z');
    var wristRotation= folder.add(robotController, 'giro_pinza', -40, 220, 5).name('Giro Pinza');
    var fingersRotation= folder.add(robotController, 'separacion_pinza', -15, 0, 1).name('Giro Pinza');

    baseRotation.onChange(
        function (value) {
            baseAngle = value;
        }
    );

    armRotation.onChange(
        function (value) {
            armAngle = value;
        }
    );

    forearmRotation.onChange(
        function (value) {
            forearmAngle= value;
        }
    );

    forearmRotationZ.onChange(
        function (value) {
            forearmAngleZ= value;
        }
    );

    wristRotation.onChange(
        function (value) {
            wristAngle = value;
        }
    );

    fingersRotation.onChange(
        function (value) {
            fingersAngle = value;
        }
    );
}

function init() {
    before = Date.now();
    initPhysics();
    initVisual();
    initGUI();
    robot = new THREE.Object3D();
}

function update() {
    var now = Date.now();
    var deltaTime = before - now;
    before = now;

    stats.update();
    var x = robot.position.x;
    var z = robot.position.z;
    robot.position.set(x + robotX * deltaTime, 0, z + robotZ * deltaTime);

    base.rotation.y= baseAngle * (Math.PI / 180);
    arm.rotation.x= armAngle * (Math.PI / 180);
    forearm.rotation.z= forearmAngle* (Math.PI / 180);
    forearm.rotation.x= forearmAngleZ* (Math.PI / 180);
    wrist.rotation.x = wristAngle* (Math.PI / 180);
    hand1.rotation.y = fingersAngle* (Math.PI / 180) //- Math.PI / 2;
    hand2.rotation.y = -fingersAngle* (Math.PI / 180) //- Math.PI / 2;
}

function render() {
    requestAnimationFrame(render);
    update();

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    var side = Math.min(window.innerWidth, window.innerHeight) / 4;
    renderer.setViewport(0, 0, side, side);
    renderer.render(scene, topCamera);
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
    var imgPath = "images/";
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));
    console.log(dir);

    var loader = new THREE.TextureLoader();
    var floorTexture = loader.load(imgPath+"chess.jpg");
    console.log(floorTexture);
    floorTexture.magFilter = THREE.LinearFilter;
    floorTexture.minFilter = THREE.LinearFilter;
    floorTexture.repeat.set(3,2);
    floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;

    var material = new THREE.MeshBasicMaterial({color:0xFF0000, wireframe:true});
    var floorMaterial = new THREE.MeshLambertMaterial({color:'green', map:floorTexture});

    arm = new THREE.Object3D();

    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var baseGeometry = new THREE.CylinderGeometry(50, 50, 15, 32);
    var shoulderGeometry = new THREE.CylinderGeometry(20, 20, 18, 32);
    var armGeometry = new THREE.BoxGeometry(18, 12, 120);
    var elbow1Geometry = new THREE.SphereGeometry(20);
    var elbow2Geometry = new THREE.CylinderGeometry(22, 22, 6, 32);
    var forearmPartGeometry = new THREE.BoxGeometry(4, 80, 4);
    var wristGeometry = new THREE.CylinderGeometry(15, 15, 40, 32);

    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    base = new THREE.Mesh(baseGeometry, material);
    var shoulder = new THREE.Mesh(shoulderGeometry, material);
    var sparragus= new THREE.Mesh(armGeometry, material);
    var elbow1 = new THREE.Mesh(elbow1Geometry, material);
    var elbow2 = new THREE.Mesh(elbow2Geometry, material);
    forearm = new THREE.Object3D();
    wrist = new THREE.Mesh(wristGeometry, material);
    hand1 = createHand(material);
    hand2 = createHand(material);

    var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    var pointLight = new THREE.PointLight(0xFFFFFF, 0.2);
    var spotLight = new THREE.SpotLight(0xFFFFFF, 0.7);

    var forearmParts = [];
    for (var i = 0; i < 4; ++i)
        forearmParts.push(new THREE.Mesh(forearmPartGeometry, material));

    floor.rotation.x = Math.PI / 2;
    shoulder.rotation.z= Math.PI / 2;
    sparragus.position.z = -60;
    arm.rotation.x = Math.PI / 2;
    elbow1.position.z = -120;
    elbow2.rotation.x = Math.PI / 2;
    forearm.position.z = -120;

    for (var i = 0; i < 4; ++i) {
        forearmParts[i].position.z = -40;
        forearmParts[i].rotation.x = Math.PI / 2;
    }
    var forearmPartsCentralOffset = 10;
    forearmParts[0].position.x += forearmPartsCentralOffset;
    forearmParts[0].position.z += forearmPartsCentralOffset;
    forearmParts[1].position.x += forearmPartsCentralOffset;
    forearmParts[1].position.z += -forearmPartsCentralOffset;
    forearmParts[2].position.x += -forearmPartsCentralOffset;
    forearmParts[2].position.z += -forearmPartsCentralOffset;
    forearmParts[3].position.x += -forearmPartsCentralOffset;
    forearmParts[3].position.z += forearmPartsCentralOffset;

    wrist.position.z = -80;
    wrist.rotation.z = Math.PI / 2;

    hand1.rotation.x = -Math.PI / 2;
    hand1.position.y = -15;
    hand1.position.x = 20;

    hand2.rotation.x = -Math.PI / 2;
    hand2.position.y = 15;
    hand2.position.x = 20;

    pointLight.position.set(0, 300, 0);

    spotLight.position.set(50, -159, 0);
    spotLight.target.position.set(0, 0, 0);
    spotLight.angle = Math.PI / 10;
    spotLight.penumbra = 0.2;
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 500;
    spotLight.shadow.camera.fov = 50;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(new THREE.CameraHelper(spotLight.shadow.camera));

    //scene.add(pointLight);
    //scene.add(ambientLight);
    scene.add(spotLight);
    scene.add(floor);
    scene.add(robot);
    robot.add(base);
    base.add(arm);
    arm.add(shoulder);
    arm.add(sparragus);
    arm.add(elbow1);
    arm.add(forearm);
    forearm.add(elbow2);
    for (var i = 0; i < 4; ++i)
        forearm.add(forearmParts[i]);
    forearm.add(wrist);
    wrist.add(hand1);
    wrist.add(hand2);
}

init();
loadScene();
render();
