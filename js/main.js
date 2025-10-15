// ----------------------------
// Scene Setup
// ----------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0,5,15);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lights
scene.add(new THREE.AmbientLight(0xffffff,0.6));
const dirLight = new THREE.DirectionalLight(0xffffff,0.8);
dirLight.position.set(5,10,5);
scene.add(dirLight);

// ----------------------------
// Track (Circular)
const trackPoints = [];
const radius = 20;
for(let i=0;i<=360;i+=5){
    let angle = i * Math.PI/180;
    trackPoints.push(new THREE.Vector3(Math.cos(angle)*radius,0,Math.sin(angle)*radius));
}
const trackGeometry = new THREE.BufferGeometry().setFromPoints(trackPoints);
const trackMaterial = new THREE.LineBasicMaterial({color:0x555555});
const track = new THREE.LineLoop(trackGeometry, trackMaterial);
scene.add(track);

// ----------------------------
// Player Car (cube placeholder)
const carGeometry = new THREE.BoxGeometry(1,0.5,2);
const carMaterial = new THREE.MeshStandardMaterial({color:0xff0000});
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.y = 0.25;
scene.add(car);

// ----------------------------
// AI Cars
const aiCars = [];
for(let i=0;i<2;i++){
    const aiCar = new THREE.Mesh(
        new THREE.BoxGeometry(1,0.5,2),
        new THREE.MeshStandardMaterial({color:i==0?0x00ff00:0x0000ff})
    );
    aiCar.position.y = 0.25;
    aiCars.push(aiCar);
    scene.add(aiCar);
}

// ----------------------------
// Controls
const keys = {ArrowUp:false,ArrowDown:false,ArrowLeft:false,ArrowRight:false};
window.addEventListener('keydown', e=>{if(keys[e.key]!==undefined) keys[e.key]=true;});
window.addEventListener('keyup', e=>{if(keys[e.key]!==undefined) keys[e.key]=false;});

// ----------------------------
// Game Variables
let speed = 0, lap = 0;

// ----------------------------
// Animate Loop
function animate(){
    requestAnimationFrame(animate);

    // Player Car Movement
    if(keys.ArrowUp) speed += 0.05;
    if(keys.ArrowDown) speed -= 0.03;
    speed *= 0.95; // friction

    if(keys.ArrowLeft) car.rotation.y += 0.03;
    if(keys.ArrowRight) car.rotation.y -= 0.03;

    car.position.x -= Math.sin(car.rotation.y) * speed;
    car.position.z -= Math.cos(car.rotation.y) * speed;

    // Check Lap
    const finish = trackPoints[0];
    if(Math.hypot(car.position.x-finish.x, car.position.z-finish.z)<1 && speed>0.5){
        lap++;
        document.getElementById('lapCounter').innerText = "Lap: "+lap;
    }

    // AI Cars Movement (simple circular)
    aiCars.forEach((ai,i)=>{
        const t = (Date.now()/1000 + i) % 1;
        const angle = t*2*Math.PI;
        ai.position.x = Math.cos(angle)*radius;
        ai.position.z = Math.sin(angle)*radius;
        ai.rotation.y = -angle;
    });

    // Camera follow
    camera.position.x = car.position.x + Math.sin(car.rotation.y)*10;
    camera.position.z = car.position.z + Math.cos(car.rotation.y)*10;
    camera.position.y = car.position.y + 5;
    camera.lookAt(car.position);

    renderer.render(scene, camera);
}
animate();

// ----------------------------
// Resize Handler
window.addEventListener('resize', ()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
