import * as THREE from 'three';

const TWO_PI = 2 * Math.PI;
const ROTATE_SPEED = -0.3;
const DAMPING_FACTOR = 0.9;
const DAMPING_DECAY = 0.005;
const MOMENTUM_EPSILON = 0.25;
const CENTER = new THREE.Vector3(0, 0, 0);

const defaultExecutionContext = (fn) => {
  if (fn && typeof fn === 'function') {
    fn();
  }
};

AFRAME.registerComponent('svr-camera', <any>{
  
  init() {
    this.isDragging = false;
    this.hasMomentum = false;
    this.needRAF = true; //Check if request animation frame is needed.
    this.momentum = new THREE.Vector2();
    this.spherical = new THREE.Spherical();
    this.sphericalDelta = new THREE.Spherical();
    this.rotateStart = new THREE.Vector2();
    this.rotateEnd = new THREE.Vector2();
    this.rotateDelta = new THREE.Vector2();
    this.touchLocation = new THREE.Vector2();
    this.quat = this.getCameraQuaternion();
    this.quatInverse = this.quat.clone().inverse();

    this.canvas = this.el.parentEl
    this.renderer = this.canvas.renderer; //Get renderer from scene
    this.camera = this.el.object3D.children[0]; // Get camera object 3D

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onResize = this.onResize.bind(this)

    this.sphericalDelta.set(0, 0, 0);

    this.canvas.addEventListener('mousedown', this.onMouseDown, false);
    this.canvas.addEventListener('touchstart', this.onTouchStart, false);

    window.addEventListener('resize', this.onResize, false);
    this.el.addEventListener('onResize', this.onResize);    
    this.onMouseUp();
  },
  onResize() {
    this.refreshCamera();
    this.el.emit('afterResize');
  },
  refreshCamera() {
    const DPR = window.devicePixelRatio || 1;
    const rendererWidth = window.innerWidth / DPR;
    const rendererHeight = window.innerHeight / DPR;
    const aspectRatio = rendererWidth / rendererHeight;
    this.renderer.setPixelRatio(DPR);
    this.renderer.setSize(rendererWidth, rendererHeight, false);
    this.camera.aspect = aspectRatio;
    this.camera.updateProjectionMatrix();
  },
  onMouseDown(e) {
    e.preventDefault();
    this.hasMomentum = false;
    this.isDragging = true;
    this.momentum.set(0, 0);
    this.rotateStart.set(e.clientX, e.clientY);
    
    this.canvas.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.canvas.addEventListener('touchend', this.onTouchEnd, false);
    this.canvas.addEventListener('mouseup', this.onMouseUp, false)
    this.canvas.addEventListener('mousemove', this.onMouseMove, false);
  },
  onMouseUp(e) {
    this.hasMomentum = true;
    this.isDragging = false;
    this.canvas.removeEventListener('mousemove', this.onMouseMove, false);
    this.canvas.removeEventListener('mouseup', this.onMouseUp, false);
    this.canvas.removeEventListener('touchmove', this.onTouchMove, false);
    this.canvas.removeEventListener('touchend', this.onTouchEnd, false);
    this.makeUpdate();
  },
  remove() {
    if (this.el.removeAllListeners) {
      this.el.removeAllListeners();
    }
    this.canvas.removeEventListener('mousedown', this.onMouseDown, false);
    this.canvas.removeEventListener('touchstart', this.onTouchStart, false);
    window.removeEventListener('resize', this.onResize, false);

  },
  onTouchStart(event) {
    if (event.touches.length > 1) {
      return;
    }
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    this.touchLocation.x = x;
    this.touchLocation.y = y;
    event.clientX = x;
    event.clientY = y;
    event.movementX = 0;
    event.movementY = 0;
    event.preventDefault = () => {
    };
    this.onMouseDown(event);
  },

  onTouchMove(event) {
    const x = event.touches[0].clientX;
    const y = event.touches[0].clientY;
    event.clientX = x;
    event.clientY = y;
    event.movementX = x - this.touchLocation.x;
    event.movementY = y - this.touchLocation.y;
    this.touchLocation.x = x;
    this.touchLocation.y = y;
    this.onMouseMove(event);
  },
  onTouchEnd(event) {
    if (event.touches.length > 0) {
      return;
    }
    event.clientX = this.touchLocation.x;
    event.clientY = this.touchLocation.y;
    this.onMouseUp(event);
  },
  onMouseMove(e) {
    e.preventDefault();
    if (!this.isDragging) {
      return;
    }
    this.rotateEnd.set(e.clientX, e.clientY);
    this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart);

    const element = document.body;
    this.rotateLeft(TWO_PI * this.rotateDelta.x / element.clientWidth * ROTATE_SPEED);
    this.rotateUp(TWO_PI * this.rotateDelta.y / element.clientHeight * ROTATE_SPEED);
    this.rotateStart.copy(this.rotateEnd);

    if (e.movementX !== undefined && e.movementY !== undefined) {
      this.momentum.x = e.movementX;
      this.momentum.y = e.movementY;
    }
    this.makeUpdate();
  },
  rotateLeft(angle) {
    this.sphericalDelta.theta -= angle
  },
  rotateUp(angle) {
    this.sphericalDelta.phi -= angle
  },
  getCameraQuaternion() {
    const camera = this.el.object3D
    return new THREE.Quaternion().setFromUnitVectors(camera.up, new THREE.Vector3(0, 1, 0));
  },
  /**
   *An update function
  */
  makeUpdate() {
    if (!this.needRAF)
      return
    this.needRAF = false;
    const context = this.el.runContext || defaultExecutionContext;
    context(() =>
      requestAnimationFrame(() => {
        this.needRAF = true;
        this.change();
        this.el.emit('onUpdate');
      })
    );
  },
  change() {
    const quat = this.quat;
    const quatInverse = this.quatInverse;
    const cameraPosition = this.el.object3D.position.clone();
    cameraPosition.applyQuaternion(quat);
    this.spherical.setFromVector3(cameraPosition);

    if (this.hasMomentum) {
      if (Math.abs(this.momentum.x) < MOMENTUM_EPSILON && Math.abs(this.momentum.y) < MOMENTUM_EPSILON) {
        this.hasMomentum = false;
      } else {
        this.momentum.x *= DAMPING_FACTOR;
        this.momentum.y *= DAMPING_FACTOR;
        this.sphericalDelta.theta += DAMPING_DECAY * this.momentum.x;
        this.sphericalDelta.phi += DAMPING_DECAY * this.momentum.y;
      }
    }

    this.spherical.theta += this.sphericalDelta.theta;
    this.spherical.phi += this.sphericalDelta.phi;
    this.spherical.makeSafe();

    cameraPosition.setFromSpherical(this.spherical);
    cameraPosition.applyQuaternion(quatInverse);

    this.el.object3D.position.copy(cameraPosition);
    this.el.object3D.lookAt(CENTER);
    this.sphericalDelta.set(0, 0, 0);

    if (this.hasMomentum) {
      this.makeUpdate();
    }
  },
})