import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

// --- 1. INISIALISASI SCENE & CAMERA ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0.1); // Kamera di tengah

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true; // Aktifkan mode VR
document.body.appendChild(renderer.domElement);

// Tambahkan Tombol VR ke Halaman
document.body.appendChild(VRButton.createButton(renderer));

// --- 2. OBJEK PANORAMA 360 ---
const geometry = new THREE.SphereGeometry(500, 60, 40);
geometry.scale(-1, 1, 1); // Membalik bola agar tekstur di dalam

const loader = new THREE.TextureLoader();
// Pastikan file 'lab.jpg' ada di folder yang sama
const texture = loader.load('lab.jpg'); 
const material = new THREE.MeshBasicMaterial({ map: texture });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// --- 3. INTERAKSI: HOTSPOT (BOLA MERAH) ---
const hotspotGeom = new THREE.SphereGeometry(2, 32, 32);
const hotspotMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const hotspot = new THREE.Mesh(hotspotGeom, hotspotMat);

// Silakan ubah angka posisi ini agar pas di meja lab kalian
hotspot.position.set(30, -10, -50); 
hotspot.name = "HotspotPC";
scene.add(hotspot);

// --- 4. KONTROL & RAYCASTER (DETEKSI KLIK) ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
    // Mengonversi posisi klik mouse ke koordinat normalisasi (-1 ke +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    // Cek apakah yang diklik adalah hotspot
    for (let i = 0; i < intersects.length; i++) {
        if (intersects[i].object.name === "HotspotPC") {
            alert("Informasi: Ini adalah meja praktikum Lab Komputer.");
        }
    }
}

window.addEventListener('click', onClick);

// --- 5. LOOP ANIMASI ---
function animate() {
    renderer.setAnimationLoop(() => {
        controls.update();
        renderer.render(scene, camera);
    });
}

// Menangani perubahan ukuran browser
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();