var renderer, scene, camera, before, ground;
var L = 100;

function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth/window.innerHeight;
	camera.updateProjectionMatrix();
}

var buildings = [
    {
        x: 500,
        y: 0,
        z: 0,
        width: 100,
        height: 100,
        depth: 100
    }
];
var world;
var scene;
var player;
var ground;
var ballMaterial
function initPhysics() {
    var imgPath = "images/";
    var loader = new THREE.TextureLoader();
    var ballTexture = loader.load(imgPath+'ball.jpg');
    player = {
        x: 0,
        y: 0,
        z: 0,
        body: new CANNON.Body({mass: 1000, material: playerMaterial}),
        visual: new THREE.Mesh( new THREE.SphereGeometry(15), new THREE.MeshLambertMaterial({color: new THREE.Color(1, 0, 0), map: ballTexture})),
    };
    player.body.position.y = 50;
    player.visual.position.copy(player.body.position);

    world = new CANNON.World();
    world.gravity.set(0,-300,0);
    scene = new THREE.Scene();
    world.solver.iterations = 10;
    world.broadphase = new CANNON.NaiveBroadphase();
    world.addBody(player.body);

    var playerMaterial= new CANNON.Material("playerMaterial");
    var wallMaterial = new CANNON.Material("wallMaterial");
    var groundMaterial = new CANNON.Material("groundMaterial");
    player.body.position.x = player.y = player.z = 0;
    player.body.addShape(new CANNON.Sphere(10));
    world.addMaterial(wallMaterial);

    var floorTexture = loader.load(imgPath+"wood512.jpg");
    var skybox = loader.load(imgPath+'skybox.jpg');
    scene.background = skybox;

    var groundShape = new CANNON.Plane();
    floorTexture.magFilter = THREE.LinearFilter;
    floorTexture.minFilter = THREE.LinearFilter;
    floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
    var groundMaterialVisual = new THREE.MeshLambertMaterial({color:'white', map:floorTexture});
    ground = {
        body: new CANNON.Body({ mass: 0, material: groundMaterial }),
        visual: new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 10, 10), groundMaterialVisual)
    };
    angleX = -Math.PI / 2;
    ground.body.addShape(groundShape)
    ground.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    world.addBody(ground.body);
    scene.add(ground.visual);

    var sphereGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial,playerMaterial, { friction: 0.3, restitution: 0.7 });
    world.addContactMaterial(sphereGroundContactMaterial);

    angX = angZ = 0;

    xTargetCenter = 0;
    xTargetRange = 100;
}

var targetLights = [];
var maxTime = 15.0;
var timeDecrement = 1.0;
var score = 0;
function updateTargetLight() {
    xTargetCenter = Math.random() * 1000 - 500;
    for (i = 0; i < targetLights.length; ++i) {
        targetLights[i].position.z = xTargetCenter;
    }
    score++;
    player.visual.material.color = new THREE.Color(1, 0, 0);
    document.getElementById('score').textContent = score;
}

var textGeometry;
var barMaterial, barGeometry, barMesh, barIncrease;
function initVisual() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);
    renderer.shadowMap.enabled = true;
    renderer.antialias = true;
    document.body.appendChild(renderer.domElement);
    renderer.autoClear = false;

    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 50000);
    camera.position.set(150, 150, 0);
    camera.lookAt(new THREE.Vector3(0,0,0));
    window.addEventListener('resize', updateAspectRatio);


    for (i = 0; i < 20; ++i) {
        var targetLight = new THREE.PointLight(0xFFFFFF, .2);
        targetLight.decay = 2;
        targetLight.position.set(i*100-500, 20, xTargetCenter);
        //targetLight.target.position.set(targetLight.position.x, -100, targetLight.position.z);
        targetLights.push(targetLight);
    }
    document.getElementById('game-over').style.display = 'none';

    // Bar
    barMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff});
    barGeometry = new THREE.RingGeometry(4, 5, 10, 8, 0, Math.PI);
    barMaterial = new THREE.MeshBasicMaterial({color: 0xffff00});
    barMesh = new (THREE.Mesh)(barGeometry, barMaterial)
    scene.add(barMesh);
    barIncrease = Math.PI * 2 / 100;
}

function initGUI() {
    /*
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
    */
}

function stopRotating(event) {
    switch (event.key) {
        case 'ArrowLeft':
            angX= 0;
            break;
        case 'ArrowRight':
            angX= -0;
            break;
    }
}
function startRotating(event) {
    var moveSpeed = 0.3;
    switch (event.key) {
        case 'ArrowLeft':
            angX= moveSpeed;
            break;
        case 'ArrowRight':
            angX= -moveSpeed;
            break;
    }
}

function restart() {
    document.getElementById("counter").style.display = 'block';
    document.getElementById("game-over").style.display = 'none';

    score = 0;
    document.getElementById("score").style.display= 'block';
    document.getElementById("score").textContent = score.toString();


    targetLights = [];
    maxTime = 10.0;
    timeDecrement = 5.0;
    score = 0;
    delta = 0;
    countDown = 0.0;
    angX, angZ;
    angleX, angleZ;
    xTargetCenter, xTargetRange;
    message = '';

    init();
    loadScene();
    render();
}

function init() {
    window.addEventListener('keydown', startRotating, true);
    window.addEventListener('keyup', stopRotating, true);
    initPhysics();
    initVisual();
    initGUI();
    clock = new THREE.Clock();
}

function loose() {
    document.getElementById("game-over").style.display= 'block';
    document.getElementById("counter").style.display = 'none';
    player.body.position.y = 400; // Give it time to reload
    setTimeout(() => { window.location.href = window.location.href; }, 2000);
}

function renderBar() {
    y = Math.sin(counter) / 2 + 0.5
    counter += barIncrease;
    
    ring = new (THREE.RingGeometry)(4, 5, 10, 8, 0, Math.PI * y);
    barMesh.geometry.vertices = ring.vertices;
    barMesh.geometry.verticesNeedUpdate = true;
    barMesh.material.color.setRGB(1.6 - y, y);
    barMesh.rotation.z = (180 - (180 * y)) * (Math.PI / 180);
}

var delta = 0;
var countDown = 0.0;
var angX, angZ;
var angleX, angleZ;
var xTargetCenter, xTargetRange;
var totalTime = 0;
function update() {
    console.log(player.body.position.y);
    delta = clock.getDelta();
    countDown += delta;
    // document.getElementById('time').textContent = 'Time remaining: ' + (maxTime - countDown).toFixed().toString();
    world.step(delta);
    if (Math.abs(player.body.position.y > 500) || Math.abs(player.body.position.z) > 1100) {
        loose();
    }

    if (player.body.position.z > xTargetCenter - xTargetRange && player.body.position.z < xTargetCenter + xTargetRange) {
        totalTime += delta;
        player.visual.material.color.r -= delta / 5;
        player.visual.material.color.g += delta / 5;
    } else {
        totalTime = 0;
        player.visual.material.color = new THREE.Color(1, 0, 0);
    }

    if (totalTime >= 5.0) {
        updateTargetLight();
    }

    player.visual.position.copy(player.body.position);
    player.visual.quaternion.copy(player.body.quaternion);

    angleX += angX * delta;
    ground.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), angleX);
    ground.visual.quaternion.copy(ground.body.quaternion);
}

function render() {
    requestAnimationFrame(render);
    update();

    renderer.clear();
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    var side = Math.min(window.innerWidth, window.innerHeight) / 4;
    renderer.setViewport(0, 0, side, side);
}

function loadScene() {

    var imgPath = "images/";

    var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    var pointLight = new THREE.PointLight(0xFFFFFF, 0.6);

    pointLight.position.set(300, 10, 300);


    scene.add(player.visual);
    //scene.add(pointLight);
    scene.add(ambientLight);

    for (i = 0; i < targetLights.length; ++i) {
        scene.add(targetLights[i]);
    }
}

init();
loadScene();
render();
