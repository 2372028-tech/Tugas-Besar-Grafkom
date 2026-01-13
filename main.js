import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"; // GLTFLoader: Memuat model 3D dalam format glTF
import { OrbitControls } from "three/addons/controls/OrbitControls.js"; // OrbitControls: Kontrol kamera dengan mouse

// WebGLRenderer: Render objek 3D ke layar browser
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb); // Background
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Aktifkan shadow
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Shadow
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Lighting
// AmbientLight : Cahaya merata ke semua arah
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// PointLight : Lampu di langit-langit
const pointLight1 = new THREE.PointLight(0xffffff, 20, 20);
pointLight1.position.set(0, 3, -3.3);
pointLight1.castShadow = true;
scene.add(pointLight1);
const pointLight2 = new THREE.PointLight(0xffffff, 20, 20);
pointLight2.position.set(0, 3, 3.3);
pointLight2.castShadow = true;
scene.add(pointLight2);

// Kamera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight,1,100);
// Posisi kamera
camera.position.set(1, 1, 6);

// Kontrol
// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 0.5;
controls.maxDistance = 10;
controls.minPolarAngle = 1; // Batas minimum rotasi vertikal
controls.maxPolarAngle = 1.5; // Batas maksimun rotasi vertikal
controls.autoRotate = true; // Aktifkan auto-rotate
controls.autoRotateSpeed = 0.5; // Kecepatan auto-rotate
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();

// PlaneGeometry : Membuat lantai / alas
const groundGeometry = new THREE.PlaneGeometry(50, 50, 32, 32);
groundGeometry.rotateX(-Math.PI / 2);

// MeshStandardMaterial : Tekstur lantai / alas
const groundMaterial = new THREE.MeshStandardMaterial({
  color: 0x808080, // Warna abu-abu
  roughness: 0.8, // Intensitas tekstur kasar
  metalness: 0.2, // Intensitas tekstur mengkilap
  side: THREE.DoubleSide, // Tampilkan kedua sisi
});

const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
groundMesh.receiveShadow = true; // Terima shadow
scene.add(groundMesh);

// ==================== VARIABEL UNTUK INTERAKSI ====================
let projectorMesh = null; // Menyimpan proyektor setelah di-load
let screenMesh = null; // Menyimpan layar proyektor setelah di-load
let isProjectorOn = false; // Status proyektor (nyala/mati)
const raycaster = new THREE.Raycaster(); // Raycaster: Deteksi klik pada objek 3D
const mouse = new THREE.Vector2(); // Mouse: Posisi mouse dalam koordinat normalized

// ==================== VIDEO TEXTURE ====================
// Buat elemen video (bisa pakai video atau gambar)
const video = document.createElement('video');
video.src = 'public/Komputer.mp4'; // Ganti dengan path video kamu
video.loop = true; // Video akan loop terus
video.muted = false; // Mute agar auto-play bisa jalan
video.playsInline = true;

// VideoTexture: Texture dari elemen video HTML
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;

// Material untuk layar proyektor (awalnya putih polos)
const screenMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xffffff, // Putih (layar mati)
  side: THREE.DoubleSide 
});

const loader = new GLTFLoader();

// 1. Ruangan
loader.load("public/empty_room/scene.gltf", (gltf) => {
    const room = gltf.scene;
    room.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // Sesuaikan posisi dan skala ruangan jika diperlukan
    room.position.set(0, 0, 0);
    scene.add(room);
    console.log("Ruangan berhasil dimuat");
  },
  undefined,
  (error) => console.error("Gagal muat ruangan:", error)
);

// 2. Komputer Mahasiswa
loader.load("public/low_poly_computer_desk/scene.gltf", (gltf) => {
  const originalComputer = gltf.scene;

  originalComputer.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Skala diperkecil agar pas masuk di dalam ruangan
  originalComputer.scale.set(0.15, 0.15, 0.15);

  // --- POSISI PC MAHASISWA ---
  // Gunakan Math.PI agar monitor mahasiswa menghadap ke arah PC Dosen (Z negatif)
  const arahHadapDosen = Math.PI;

  const studentPositions = [
    // {x : minus mundur, plus maju, y : tinggi meja, z : minus kiri, plus kanan}
    // Baris Kanan
    { x: -4, y: 0, z: 3.4 }, // Kiri
    { x: -2, y: 0, z: 3.4 }, // Kiri
    { x: 0, y: 0, z: 3.4 }, // Kiri
    { x: 2, y: 0, z: 3.4 }, // Kiri
    { x: -4, y: 0, z: 5 }, // Kanan
    { x: -2, y: 0, z: 5 }, // Kanan
    { x: 0, y: 0, z: 5 }, // Kanan
    { x: 2, y: 0, z: 5 }, // Kanan
    
    // Baris Tengah
    { x: -4, y: 0, z: -0.85 }, // Kiri
    { x: -2, y: 0, z: -0.85 }, // Kiri
    { x: 0, y: 0, z: -0.85 }, // Kiri
    { x: 2, y: 0, z: -0.85 }, // Kiri
    { x: -4, y: 0, z: 0.75 }, // Kanan
    { x: -2, y: 0, z: 0.75 }, // Kanan
    { x: 0, y: 0, z: 0.75 }, // Kanan
    { x: 2, y: 0, z: 0.75 }, // Kanan

    // Baris Kiri
    { x: -4, y: 0, z: -5 }, // Kiri
    { x: -2, y: 0, z: -5 }, // Kiri
    { x: 0, y: 0, z: -5 }, // Kiri
    { x: 2, y: 0, z: -5 }, // Kiri
    { x: -4, y: 0, z: -3.4 }, // Kanan
    { x: -2, y: 0, z: -3.4 }, // Kanan
    { x: 0, y: 0, z: -3.4 }, // Kanan
    { x: 2, y: 0, z: -3.4 }, // Kanan
  ];

  studentPositions.forEach((pos) => {
    const computerClone = originalComputer.clone();
    computerClone.position.set(pos.x, pos.y, pos.z);
    computerClone.rotation.y = arahHadapDosen;
    scene.add(computerClone);
  });

});

// 3. Komputer Dosen
loader.load("public/office/scene.gltf", (gltf) => {
  const dosenComputer = gltf.scene;

  dosenComputer.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  // Skala diperkecil agar pas masuk di dalam ruangan
  dosenComputer.scale.set(0.8, 0.8, 0.8);
  // Posisi PC dosen
  dosenComputer.position.set(3.8, 0, -3.3);
  // Rotasi 0 agar monitor menghadap ke arah barisan mahasiswa
  dosenComputer.rotation.y = Math.PI;
  scene.add(dosenComputer);
  
});

// 4. Proyektor
loader.load("public/projector/scene.gltf", (gltf) => {
  const projector = gltf.scene;
  projector.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (!projectorMesh) projectorMesh = child;
    }
  });

  projector.scale.set(0.9, 0.9, 0.9);
  projector.position.set(0, 2.7, 0);
  projector.rotation.y = Math.PI / 2;
  scene.add(projector);
  console.log("Proyektor berhasil dimuat - klik untuk nyalakan!");
});

// 5. Layar Proyektor
loader.load("public/projector_screen_7mb/scene.gltf", (gltf) => {
  const screen = gltf.scene;
  screen.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = screenMaterial;
      if (!screenMesh) screenMesh = child;
    }
  });
  screen.scale.set(0.4, 0.4, 0.4);
  screen.position.set(5.5, 2.7, 0);
  screen.rotation.y = Math.PI;
  scene.add(screen);
  console.log("Layar proyektor berhasil dimuat");
});

// 6. Papan Tulis
loader.load("public/whiteboard/scene.gltf", (gltf) => {
  const whiteboard = gltf.scene;
  whiteboard.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  whiteboard.scale.set(0.01, 0.01, 0.01);
  whiteboard.position.set(5.5, 1.5, 0);
  whiteboard.rotation.y = 252 * (Math.PI / 180);
  scene.add(whiteboard);
});

// 7. Pintu
loader.load("public/double_doors/scene.gltf", (gltf) => {
  const door = gltf.scene;
  door.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  door.scale.set(0.005, 0.005, 0.005);
  door.position.set(4, 0, 6);
  door.rotation.y = -Math.PI;
  scene.add(door);
});

// ==================== EVENT KLIK MOUSE ====================
// Fungsi untuk menangani klik mouse
function onMouseClick(event) {
  // Hitung posisi mouse dalam koordinat normalized (-1 sampai +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Set raycaster dari kamera ke arah mouse
  raycaster.setFromCamera(mouse, camera);
  
  // Cek apakah proyektor sudah di-load
  if (!projectorMesh) return;
  
  // Cek objek yang di-intersect oleh raycaster
  const intersects = raycaster.intersectObject(projectorMesh, true);
  
  // Jika proyektor di-klik
  if (intersects.length > 0) {
    console.log("Proyektor diklik!");
    toggleProjector(); // Toggle proyektor nyala/mati
  }
}

// Fungsi untuk nyalakan/matikan proyektor
function toggleProjector() {
  if (!screenMesh) return;
  
  isProjectorOn = !isProjectorOn; // Toggle status
  
  if (isProjectorOn) {
    // NYALAKAN PROYEKTOR
    console.log("Proyektor NYALA - Video dimainkan");
    screenMesh.material.map = videoTexture; // Ganti material jadi video
    screenMesh.material.needsUpdate = true;
    video.play(); // Putar video
  } else {
    // MATIKAN PROYEKTOR
    console.log("Proyektor MATI - Layar putih");
    screenMesh.material.map = null; // Hapus texture video
    screenMesh.material.color.set(0xffffff); // Kembalikan ke putih
    screenMesh.material.needsUpdate = true;
    video.pause(); // Pause video
    video.currentTime = 0; // Reset video ke awal
  }
}

// Tambahkan event listener untuk klik mouse
window.addEventListener('click', onMouseClick);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
