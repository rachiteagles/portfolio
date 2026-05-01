/* ===========================================================
   RACHIT YADAV — 3D PORTFOLIO
   Three.js scenes: background particle universe + skills sphere
   =========================================================== */

// ----- Loader -----
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hide');
  }, 1200);
});

// ----- Custom cursor -----
const cursor = document.getElementById('cursor-glow');
if (cursor) {
  let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  let tx = cx, ty = cy;
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  function animateCursor() {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .stat, .tl-card, .skill-cat, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
}

// ----- Animated stat counters -----
const observerStats = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 40));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
      }, 30);
      observerStats.unobserve(el);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.stat-num').forEach(s => observerStats.observe(s));

/* ============================================================
   SCENE 1 — Background particle universe with floating shapes
   ============================================================ */
(function backgroundScene() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050510, 0.0018);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 250);

  // ----- Circular sprite texture so points render as circles, not squares -----
  function makeCircleTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.85)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.minFilter = THREE.LinearFilter;
    return tex;
  }
  const circleTexture = makeCircleTexture();

  // ----- Particle field (stars) -----
  const PARTICLE_COUNT = 4500;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);

  const palette = [
    new THREE.Color(0x00f0ff), // cyan
    new THREE.Color(0xb026ff), // purple
    new THREE.Color(0xff2e88), // pink
    new THREE.Color(0xffd34d), // gold
    new THREE.Color(0x8a8fff), // soft blue
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 200 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    sizes[i] = Math.random() * 2 + 0.6;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    size: 3.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
    map: circleTexture,
    alphaTest: 0.001
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ----- Floating geometric shapes (data nodes) -----
  const shapes = [];
  const geoTypes = [
    new THREE.IcosahedronGeometry(8, 0),
    new THREE.OctahedronGeometry(7, 0),
    new THREE.TetrahedronGeometry(8, 0),
    new THREE.TorusGeometry(6, 1.5, 8, 24),
    new THREE.BoxGeometry(10, 10, 10),
  ];

  for (let i = 0; i < 14; i++) {
    const geo = geoTypes[i % geoTypes.length];
    const mat = new THREE.MeshBasicMaterial({
      color: palette[i % palette.length],
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 400,
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 300 - 50
    );
    mesh.userData.spin = {
      x: (Math.random() - 0.5) * 0.01,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.005,
    };
    mesh.userData.float = {
      offset: Math.random() * Math.PI * 2,
      speed: 0.0005 + Math.random() * 0.001,
      amp: 6 + Math.random() * 10,
      baseY: mesh.position.y
    };
    scene.add(mesh);
    shapes.push(mesh);
  }

  // ----- Connection lines (data flow lines) -----
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending
  });
  const lineGroup = new THREE.Group();
  for (let i = 0; i < shapes.length; i++) {
    const next = shapes[(i + 1) % shapes.length];
    const points = [shapes[i].position, next.position];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, lineMat);
    line.userData = { a: shapes[i], b: next };
    lineGroup.add(line);
  }
  scene.add(lineGroup);

  // ----- Mouse parallax -----
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ----- Scroll progression -----
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
  });

  // ----- Resize -----
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ----- Animate -----
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    // Particle gentle rotation
    particles.rotation.y = t * 0.02;
    particles.rotation.x = t * 0.01;

    // Floating shapes
    shapes.forEach(s => {
      s.rotation.x += s.userData.spin.x;
      s.rotation.y += s.userData.spin.y;
      s.rotation.z += s.userData.spin.z;
      s.position.y = s.userData.float.baseY + Math.sin(t * s.userData.float.speed * 1000 + s.userData.float.offset) * s.userData.float.amp;
    });

    // Update connection lines positions
    lineGroup.children.forEach(line => {
      const positions = line.geometry.attributes.position.array;
      positions[0] = line.userData.a.position.x;
      positions[1] = line.userData.a.position.y;
      positions[2] = line.userData.a.position.z;
      positions[3] = line.userData.b.position.x;
      positions[4] = line.userData.b.position.y;
      positions[5] = line.userData.b.position.z;
      line.geometry.attributes.position.needsUpdate = true;
    });

    // Camera parallax
    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;
    camera.position.x = mouseX * 30;
    camera.position.y = -mouseY * 20 + scrollY * 80;
    camera.position.z = 250 - scrollY * 60;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   SCENE 2 — Skills sphere (rotating tag cloud in 3D)
   ============================================================ */
(function skillsScene() {
  const container = document.getElementById('skills-3d-container');
  const canvas = document.getElementById('skills-canvas');
  if (!container || !canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
  camera.position.z = 280;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ----- Skills data (from resume) -----
  const skills = [
    { name: 'Python',      color: '#3776ab', size: 1.5 },
    { name: 'SQL',         color: '#f29111', size: 1.4 },
    { name: 'PyTorch',     color: '#ee4c2c', size: 1.4 },
    { name: 'PySpark',     color: '#e25a1c', size: 1.5 },
    { name: 'AWS',         color: '#ff9900', size: 1.5 },
    { name: 'Snowflake',   color: '#29b5e8', size: 1.4 },
    { name: 'Databricks',  color: '#ff3621', size: 1.3 },
    { name: 'Delta Lake',  color: '#00add4', size: 1.2 },
    { name: 'Airflow',     color: '#017cee', size: 1.3 },
    { name: 'Docker',      color: '#2496ed', size: 1.2 },
    { name: 'Terraform',   color: '#7b42bc', size: 1.2 },
    { name: 'Kinesis',     color: '#ffaa00', size: 1.1 },
    { name: 'Lambda',      color: '#ff9900', size: 1.2 },
    { name: 'EMR',         color: '#ff9900', size: 1.2 },
    { name: 'Pandas',      color: '#150458', size: 1.2 },
    { name: 'CNN',         color: '#ff2e88', size: 1.3 },
    { name: 'Redshift',    color: '#8c4fff', size: 1.2 },
    { name: 'BigQuery',    color: '#4285f4', size: 1.2 },
    { name: 'PostgreSQL',  color: '#336791', size: 1.2 },
    { name: 'S3',          color: '#dd344c', size: 1.3 },
    { name: 'dbt',         color: '#ff694a', size: 1.2 },
    { name: 'Parquet',     color: '#50a3a4', size: 1.1 },
    { name: 'Step Fn',     color: '#cd2264', size: 1.1 },
    { name: 'CloudWatch',  color: '#cc2264', size: 1.1 },
    { name: 'GitHub',      color: '#e6e9ff', size: 1.1 },
    { name: 'Hadoop',      color: '#ffaa33', size: 1.1 },
    { name: 'T-SQL',       color: '#cc2927', size: 1.1 },
    { name: 'EC2',         color: '#ff9900', size: 1.1 },
    { name: 'ORC',         color: '#666eff', size: 1.0 },
    { name: 'ML/AI',       color: '#00ffaa', size: 1.4 },
  ];

  // ----- Build text sprites positioned on a sphere (Fibonacci sphere) -----
  const group = new THREE.Group();
  scene.add(group);

  const RADIUS = 130;
  const N = skills.length;
  const sprites = [];

  function makeTextSprite(text, color, scale = 1) {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Glow background
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, color + 'cc');
    grad.addColorStop(0.4, color + '40');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Border ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 12, 0, Math.PI * 2);
    ctx.stroke();

    // Text
    ctx.font = 'bold 36px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.fillText(text, size/2, size/2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(40 * scale, 40 * scale, 1);
    return sprite;
  }

  for (let i = 0; i < N; i++) {
    const phi = Math.acos(-1 + (2 * i) / N);
    const theta = Math.sqrt(N * Math.PI) * phi;
    const x = RADIUS * Math.cos(theta) * Math.sin(phi);
    const y = RADIUS * Math.sin(theta) * Math.sin(phi);
    const z = RADIUS * Math.cos(phi);

    const s = skills[i];
    const sprite = makeTextSprite(s.name, s.color, s.size);
    sprite.position.set(x, y, z);
    group.add(sprite);
    sprites.push(sprite);
  }

  // ----- Inner wireframe sphere -----
  const sphereGeo = new THREE.SphereGeometry(RADIUS - 10, 32, 16);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.08
  });
  const wireSphere = new THREE.Mesh(sphereGeo, sphereMat);
  group.add(wireSphere);

  // ----- Inner core (icosahedron) -----
  const coreGeo = new THREE.IcosahedronGeometry(35, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xb026ff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  group.add(core);

  // ----- Local particle dust around the sphere -----
  const dustCount = 600;
  const dustPos = new Float32Array(dustCount * 3);
  const dustCol = new Float32Array(dustCount * 3);
  const dustPalette = [new THREE.Color(0x00f0ff), new THREE.Color(0xb026ff), new THREE.Color(0xff2e88)];
  for (let i = 0; i < dustCount; i++) {
    const r = RADIUS + 30 + Math.random() * 120;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    dustPos[i*3]   = r * Math.sin(p) * Math.cos(t);
    dustPos[i*3+1] = r * Math.sin(p) * Math.sin(t);
    dustPos[i*3+2] = r * Math.cos(p);
    const c = dustPalette[Math.floor(Math.random() * dustPalette.length)];
    dustCol[i*3] = c.r; dustCol[i*3+1] = c.g; dustCol[i*3+2] = c.b;
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  dustGeo.setAttribute('color',    new THREE.BufferAttribute(dustCol, 3));
  const dustMat = new THREE.PointsMaterial({
    size: 2.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: makeCircleTexture(),
    alphaTest: 0.001
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ----- Drag interaction -----
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let velX = 0.003, velY = 0.001;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true; prevX = e.clientX; prevY = e.clientY;
  });
  canvas.addEventListener('mouseup',    () => isDragging = false);
  canvas.addEventListener('mouseleave', () => isDragging = false);
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    velY = dx * 0.005;
    velX = dy * 0.005;
    prevX = e.clientX; prevY = e.clientY;
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    isDragging = true; prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  });
  canvas.addEventListener('touchend', () => isDragging = false);
  canvas.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    const dx = e.touches[0].clientX - prevX;
    const dy = e.touches[0].clientY - prevY;
    velY = dx * 0.005;
    velX = dy * 0.005;
    prevX = e.touches[0].clientX; prevY = e.touches[0].clientY;
  });

  // Wheel zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z = Math.max(180, Math.min(420, camera.position.z + e.deltaY * 0.15));
  }, { passive: false });

  // ----- Animate -----
  function animate() {
    if (!isDragging) {
      // gentle damping toward default rotation
      velY += (0.003 - velY) * 0.02;
      velX += (0.001 - velX) * 0.02;
    }
    group.rotation.y += velY;
    group.rotation.x += velX;

    core.rotation.y -= 0.008;
    core.rotation.x += 0.005;

    dust.rotation.y += 0.0008;
    dust.rotation.x += 0.0003;

    // Make sprites face camera (sprites do this automatically) — pulse scale slightly
    const t = performance.now() * 0.001;
    sprites.forEach((s, i) => {
      const base = skills[i].size;
      const pulse = 1 + Math.sin(t * 1.5 + i * 0.4) * 0.06;
      s.scale.set(40 * base * pulse, 40 * base * pulse, 1);
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();
