const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x000000);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//make window be able to be resized sans gene
window.addEventListener('resize', () => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
});

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 1, 1).normalize();
scene.add(light);

const geometry = new THREE.SphereGeometry(5, 100, 100);
const material = new THREE.MeshPhongMaterial({
  color: 0xfe98a0,
  flatShading: true,
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

//axisHelper
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

camera.position.z = 100;
camera.position.x = 100;
camera.position.y = 100;
camera.lookAt(scene.position);

//dat.gui objects
const guiControls_X = {
  b: 0,
  k: 10,
  F0: 10,
  w: 1,
};

const guiControls_Y = {
  b: 0,
  k: 20,
  F0: 10,
  w: 1,
};

const guiControls_Z = {
  b: 0,
  k: 30,
  F0: 10,
  w: 1,
};

const guiMass = {
  m: 1,
};

const colour = {
  color: 0xfe98a0,
};

const gui = new dat.GUI();
const gui_X = gui.addFolder('X_motion');
const gui_Y = gui.addFolder('Y_motion');
const gui_Z = gui.addFolder('Z_motion');

gui.add(guiMass, 'm', 0.1, 10);

gui_X.add(guiControls_X, 'b', 0, 10);
gui_X.add(guiControls_X, 'k', 0, 100);
gui_X.add(guiControls_X, 'F0', 0, 100);
gui_X.add(guiControls_X, 'w', 0, 100);

gui_Y.add(guiControls_Y, 'b', 0, 10);
gui_Y.add(guiControls_Y, 'k', 0, 100);
gui_Y.add(guiControls_Y, 'F0', 0, 100);
gui_Y.add(guiControls_Y, 'w', 0, 100);

gui_Z.add(guiControls_Z, 'b', 0, 10);
gui_Z.add(guiControls_Z, 'k', 0, 100);
gui_Z.add(guiControls_Z, 'F0', 0, 100);
gui_Z.add(guiControls_Z, 'w', 0, 100);

gui.addColor(colour, 'color').onChange(() => {
  sphere.material.color.set(colour.color);
});

class Data {
  constructor(location, accel, vel) {
    this.location = location;
    this.accel = accel;
    this.vel = vel;
  }
}

const dt = 0.025;

let t = 0;

//define X,Y,Z
let X = new Data(20, 0, 0);
let Y = new Data(20, 0, 0);
let Z = new Data(50, 0, 0);

sphere.position.set(X.location, Y.location, Z.location);

//draw scene
const render = () => {
  renderer.render(scene, camera);
};

const rk4 = (f) => (u, v, t, dt) => {
  const k1 = f(t, u, v);
  const k2 = f(t + dt / 2, u + (dt * k1) / 2, v + (dt * k1) / 2);
  const k3 = f(t + dt / 2, u + (dt * k2) / 2, v + (dt * k2) / 2);
  const k4 = f(t + dt, u + dt * k3, v + dt * k3);

  return u + (1 / 6) * dt * (k1 + 2 * k2 + 2 * k3 + k4);
};

const objectMotion = (obj, guiControls, index, t, dt) => {
  obj.vel = rk4(
    (t_, v_, x_) =>
      (guiControls.F0 * Math.cos(guiControls.w * t_) -
        guiControls.b * v_ +
        -guiControls.k * x_) /
      guiMass.m,
  )(obj.vel, obj.location, t, dt);

  switch (index) {
    case 0:
      sphere.position.x = rk4((t_, x_, v_) => v_)(obj.location, obj.vel, t, dt);
      break;
    case 1:
      sphere.position.y = rk4((t_, x_, v_) => v_)(obj.location, obj.vel, t, dt);
      break;
    case 2:
      sphere.position.z = rk4((t_, x_, v_) => v_)(obj.location, obj.vel, t, dt);
      break;
  }
  obj.location = sphere.position.getComponent(index);
};

//game loop
const GameLoop = () => {
  requestAnimationFrame(GameLoop);

  objectMotion(X, guiControls_X, 0, t, dt);
  objectMotion(Y, guiControls_Y, 1, t, dt);
  objectMotion(Z, guiControls_Z, 2, t, dt);

  t += dt;
  render();
};

GameLoop();
