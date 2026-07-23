// ==================== LOADER ====================
const loaderText = document.getElementById('loaderText');
const loaderTextStr = 'Trost Studio';
loaderTextStr.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.animationDelay = `${i * 0.06}s`;
    loaderText.appendChild(span);
});
 
setTimeout(() => {
    document.getElementById('loader').classList.add('done');
}, 1800);
 
// ==================== CUSTOM CURSOR ====================
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
 
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 3 + 'px';
    dot.style.top = mouseY - 3 + 'px';
});
 
function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX - 16 + 'px';
    ring.style.top = ringY - 16 + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();
 
document.querySelectorAll('a, .work-item, .service-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
});
 
// ==================== THREE.JS ====================
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
 
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 18;
 
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0xEBE8E2, 1);
 
// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
 
const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(8, 12, 8);
scene.add(dirLight);
 
const pointLight = new THREE.PointLight(0x1A1A1A, 0.4, 50);
pointLight.position.set(-5, 5, 10);
scene.add(pointLight);
 
// Floating particles
const particleCount = 120;
const particleGeo = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const particleData = [];
 
for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 6 + Math.random() * 10;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    particleData.push({
        speed: 0.002 + Math.random() * 0.004,
        axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
        radius: r,
        phase: Math.random() * Math.PI * 2
    });
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
 
const particleMat = new THREE.PointsMaterial({
    color: 0x1A1A1A,
    size: 0.06,
    transparent: true,
    opacity: 0.25,
    sizeAttenuation: true
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);
 
// Wireframe sphere
const wireGeo = new THREE.IcosahedronGeometry(8, 1);
const wireMat = new THREE.MeshBasicMaterial({
    color: 0x1A1A1A,
    wireframe: true,
    transparent: true,
    opacity: 0.04
});
const wireSphere = new THREE.Mesh(wireGeo, wireMat);
scene.add(wireSphere);
 
// Small floating shapes
const shapes = [];
const shapeGeos = [
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.25, 0),
    new THREE.BoxGeometry(0.25, 0.25, 0.25)
];
 
for (let i = 0; i < 8; i++) {
    const geo = shapeGeos[i % 3];
    const mat = new THREE.MeshPhysicalMaterial({
        color: 0x1A1A1A,
        metalness: 0.2,
        roughness: 0.5,
        transparent: true,
        opacity: 0.3
    });
    const mesh = new THREE.Mesh(geo, mat);
    const theta = (i / 8) * Math.PI * 2;
    mesh.position.set(
        Math.cos(theta) * 7,
        Math.sin(theta * 1.5) * 4,
        Math.sin(theta) * 5
    );
    mesh.userData = {
        basePos: mesh.position.clone(),
        speed: 0.3 + Math.random() * 0.5,
        offset: Math.random() * Math.PI * 2
    };
    scene.add(mesh);
    shapes.push(mesh);
}
 
// Mouse interaction
let targetRotX = 0, targetRotY = 0;
document.addEventListener('mousemove', (e) => {
    targetRotX = (e.clientY / window.innerHeight - 0.5) * 0.4;
    targetRotY = (e.clientX / window.innerWidth - 0.5) * 0.4;
});
 
// Scroll-based camera
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});
 
// Animation loop
const clock = new THREE.Clock();
 
function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
 
    // Wire sphere
    wireSphere.rotation.y = t * 0.03;
    wireSphere.rotation.x = t * 0.02;
 
    // Particles
    const posAttr = particles.geometry.attributes.position;
    for (let i = 0; i < particleCount; i++) {
        const data = particleData[i];
        const angle = t * data.speed + data.phase;
        const r = data.radius + Math.sin(t * 0.5 + data.phase) * 0.5;
        posAttr.array[i * 3] = r * Math.cos(angle) * Math.cos(data.phase);
        posAttr.array[i * 3 + 1] = r * Math.sin(angle * 0.7) + Math.sin(t * 0.3 + i) * 0.3;
        posAttr.array[i * 3 + 2] = r * Math.sin(angle) * Math.sin(data.phase);
    }
    posAttr.needsUpdate = true;
    particles.rotation.y = t * 0.02;
 
    // Floating shapes
    shapes.forEach((shape, i) => {
        const data = shape.userData;
        shape.position.x = data.basePos.x + Math.sin(t * data.speed + data.offset) * 1.5;
        shape.position.y = data.basePos.y + Math.cos(t * data.speed * 0.7 + data.offset) * 1;
        shape.position.z = data.basePos.z + Math.sin(t * data.speed * 0.5 + data.offset) * 0.8;
        shape.rotation.x = t * 0.5 + i;
        shape.rotation.y = t * 0.3 + i * 0.5;
    });
 
    // Camera parallax from scroll
    const scrollFactor = Math.min(scrollY / window.innerHeight, 1);
    camera.position.y = targetRotX * 2 - scrollFactor * 3;
    camera.position.x = targetRotY * 2;
    camera.lookAt(0, -scrollFactor * 1.5, 0);
 
    // Subtle light animation
    pointLight.position.x = Math.sin(t * 0.3) * 8;
    pointLight.position.z = Math.cos(t * 0.3) * 8 + 5;
 
    renderer.render(scene, camera);
}
animate();
 
// Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
 
// ==================== SCROLL REVEAL ====================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
 
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
 
// ==================== COUNTER ANIMATION ====================
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.count);
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target + (target === 98 ? '%' : '+');
                    clearInterval(timer);
                } else {
                    el.textContent = Math.floor(current) + (target === 98 ? '%' : '+');
                }
            }, 30);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
 
document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));
 
// ==================== NAVBAR SCROLL ====================
const navbar = document.getElementById('navbar');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(235, 232, 226, 0.85)';
        navbar.style.backdropFilter = 'blur(20px)';
        navbar.style.webkitBackdropFilter = 'blur(20px)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
        navbar.style.webkitBackdropFilter = 'none';
    }
    lastScroll = currentScroll;
});
 
// ==================== SMOOTH SCROLL FOR NAV LINKS ====================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});