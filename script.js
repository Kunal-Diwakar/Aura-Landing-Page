// Basic Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  powerPerference: "high-performance",
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.noToneMapping;
document.querySelector(".corridor").appendChild(renderer.domElement);

// Lighting Setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 0.1);
keyLight.position.set(5, 8, 5);
keyLight.castShadow = true;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x000000, 0.1);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

const light1 = new THREE.PointLight(0xffffff, 0.1, 0.1);
light1.position.set(2, 3, 2);
scene.add(light1);

const light2 = new THREE.PointLight(0xffffff, 0.1, 0.1);
light2.position.set(-2, 3, -2);
scene.add(light2);

// Cmaera and Movement Setup
const initialAngle = Math.PI / 4;
const radius = Math.sqrt(50);
let currentAngle = initialAngle;
let targetAngle = initialAngle;
let currentY = 0;
let targetY = 0;

camera.position.set(5, 0, 5);
camera.lookAt(0, 0, 0);

// Parallax Control Setup
let mouseX = 0;
let mouseY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener("mousemove", (event) => {
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
  targetAngle = initialAngle + mouseX * 0.35;
  targetY = -mouseY * 1.5;
});

// Model Loading and Material Setup
const emissiveColors = {
  screen: new THREE.Color(0x00ff00),
  lamp: new THREE.Color(0xffaa00),
  light: new THREE.Color(0xffffff),
  default: new THREE.Color(0xffffff),
};

const loader = new THREE.GLTFLoader();

loader.load(
  "/assets/scene.gltf",
  function (gltf) {
    const model = gltf.scene;

    // Check if the model is loaded correctly
    if (!model) {
      console.error("Model not loaded");
      return;
    }

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }

      if (child.material) {
        let emissiveColor = emissiveColors.default;

        const newMaterial = new THREE.MeshStandardMaterial({
          color: child.material.color,
          map: child.material.map,
          emissive: emissiveColor,
          emissiveIntensity: 0,
          roughness: 5.0,
          metalness: 0.125,
        });

        if (child.material.map) {
          newMaterial.map.encoding = THREE.sRGBEncoding;
          newMaterial.map.flipY = false;
        }

        child.material = newMaterial;
      }
    });

    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    scene.add(model);

    // Log the model's position to ensure it's in the scene
    console.log("Model position:", model.position);

    document.querySelector(".loading").style.display = "none";
  },
  undefined,
  function (error) {
    console.error("An error occurred while loading the model:", error);
  }
);

// Post-Processing Setup
const renderScene = new THREE.RenderPass(scene, camera);

const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.8,
  0.25,
  0.99
);

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Animation and Render Logo
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function animate() {
  requestAnimationFrame(animate);

  currentAngle = lerp(currentAngle, targetAngle, 0.025);
  currentY = lerp(currentY, targetY, 0.025);

  camera.position.x = Math.cos(currentAngle) * radius;
  camera.position.z = Math.sin(currentAngle) * radius;
  camera.position.y = lerp(camera.position.y, currentY, 0.05);

  camera.lookAt(0, 0, 0);

  composer.render();
}

// Window Resize Handler
animate();

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", onWindowResize, false);

function preloader() {
  const counter = document.querySelector(".counter");
  const preloader = document.querySelector(".preloader");

  const milestones = [0, 15, 30, 45, 60, 75, 95, 100];
  let currentIndex = 0;

  const updateCounter = () => {
    if (currentIndex < milestones.length) {
      counter.textContent = milestones[currentIndex];
      currentIndex++;
      setTimeout(updateCounter, 400);
    } else {
      gsap.to(preloader, {
        duration: 1,
        y: "-100%",
        ease: "power4.inOut",
      });
    }
  };

  window.addEventListener("load", updateCounter);
}

preloader();
