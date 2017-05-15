(function (global) {
  var camera, scene, renderer;
  var effect, controls;
  var element, container;
  var clock = new THREE.Clock();

  var onUpdate;

  function setup (checkboard) {
    setupScene();
    setupListeners();

    if (checkboard) {
      setupCheckboard();
    }
  }

  function setupScene () {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
    camera.position.set(0, 10, 0);
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    element = renderer.domElement;
    container = document.getElementById('container-3D');
    container.appendChild(element);

    effect = new THREE.StereoEffect(renderer);

    controls = new THREE.OrbitControls(camera, element);
    controls.rotateUp(Math.PI / 4);
    controls.target.set(
      camera.position.x + 0.1,
      camera.position.y,
      camera.position.z
    );
    controls.noZoom = true;
    controls.noPan = true;

    var light = new THREE.HemisphereLight(0x777777, 0x000000, 0.6);
    scene.add(light);
  }

  function setupCheckboard () {
    var texture = THREE.ImageUtils.loadTexture(
      'textures/patterns/checker.png'
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(50, 50);
    texture.anisotropy = renderer.getMaxAnisotropy();

    var material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xffffff,
      shininess: 20,
      shading: THREE.FlatShading,
      map: texture
    });

    var geometry = new THREE.PlaneGeometry(1000, 1000);

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
  }

  function setupListeners() {
    var setOrientationControls = function (e) {
      if (!e.alpha) {
        return;
      }

      controls = new THREE.DeviceOrientationControls(camera, true);
      controls.connect();
      controls.update();

      element.addEventListener('click', fullscreen, false);
      window.removeEventListener('deviceorientation', setOrientationControls, true);
    }
    window.addEventListener('deviceorientation', setOrientationControls, true);

    window.addEventListener('resize', resize, false);
    setTimeout(resize, 1);
  }

  function fullscreen() {
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    }
  }

  function resize () {
    var width = container.offsetWidth;
    var height = container.offsetHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    effect.setSize(width, height);
  }

  function update (dt) {
    if (onUpdate) {
      onUpdate(dt);
    }

    resize();

    camera.updateProjectionMatrix();
    controls.update(dt);
  }

  function animate (t) {
    update(clock.getDelta());
    effect.render(scene, camera);

    requestAnimationFrame(animate);
  }

  global.Cardboard = {
    setup: function(options) {
      options = options || {};

      var checkboard = options.checkboard || true;
      setup(checkboard);

      this.scene    = scene;
      this.renderer = renderer;

      if (options.onSetup) {
        options.onSetup(this);
      }

      onUpdate = options.onUpdate;
    },

    init: animate
  };
})(this);
