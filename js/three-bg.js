let threeRenderer = null;
let threeAnimId = null;

function initThreeBg() {
  const container = document.getElementById('canvas-bg');
  if (!container || !window.THREE) return;
  if (threeRenderer) { container.innerHTML = ''; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  threeRenderer = renderer;

  const count = 1500;
  const pos = new Float32Array(count * 3);
  const vel = [];
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3] = (Math.random() - .5) * 10;
    pos[i3+1] = (Math.random() - .5) * 10;
    pos[i3+2] = (Math.random() - .5) * 10;
    vel.push({ x:(Math.random()-.5)*.003, y:(Math.random()-.5)*.003, z:(Math.random()-.5)*.003 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.025, transparent: true, opacity: 0.6, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  camera.position.z = 5;

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = (e.clientX/window.innerWidth)*2-1; my = -(e.clientY/window.innerHeight)*2+1; });

  function ani() {
    threeAnimId = requestAnimationFrame(ani);
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i*3;
      p[i3] += vel[i].x; p[i3+1] += vel[i].y; p[i3+2] += vel[i].z;
      if (Math.abs(p[i3]) > 5) vel[i].x *= -1;
      if (Math.abs(p[i3+1]) > 5) vel[i].y *= -1;
      if (Math.abs(p[i3+2]) > 5) vel[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;
    pts.rotation.y += mx * 0.0008;
    pts.rotation.x += my * 0.0008;
    renderer.render(scene, camera);
  }
  ani();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function stopThreeBg() {
  if (threeAnimId) { cancelAnimationFrame(threeAnimId); threeAnimId = null; }
  if (threeRenderer) { threeRenderer.dispose(); threeRenderer = null; }
  const c = document.getElementById('canvas-bg');
  if (c) c.innerHTML = '';
}

let threeIdeiasRenderer = null;
let threeIdeiasAnimId = null;

function initThreeForIdeias() {
  const container = document.getElementById('ideias-canvas-bg');
  if (!container || !window.THREE) return;
  
  if (threeIdeiasRenderer) {
    container.innerHTML = '';
    if (threeIdeiasAnimId) cancelAnimationFrame(threeIdeiasAnimId);
    threeIdeiasRenderer.dispose();
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '0';
  container.style.pointerEvents = 'none';
  threeIdeiasRenderer = renderer;

  const count = 250;
  const pos = new Float32Array(count * 3);
  const vel = [];
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    pos[i3] = (Math.random() - .5) * 10;
    pos[i3+1] = (Math.random() - .5) * 10;
    pos[i3+2] = (Math.random() - .5) * 10;
    vel.push({ x:(Math.random()-.5)*.0004, y:(Math.random()-.5)*.0004, z:(Math.random()-.5)*.0004 });
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.04, transparent: true, opacity: 0.4, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  camera.position.z = 5;

  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = (e.clientX/window.innerWidth)*2-1; my = -(e.clientY/window.innerHeight)*2+1; });

  function ani() {
    threeIdeiasAnimId = requestAnimationFrame(ani);
    const p = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i*3;
      p[i3] += vel[i].x; p[i3+1] += vel[i].y; p[i3+2] += vel[i].z;
      if (Math.abs(p[i3]) > 5) vel[i].x *= -1;
      if (Math.abs(p[i3+1]) > 5) vel[i].y *= -1;
      if (Math.abs(p[i3+2]) > 5) vel[i].z *= -1;
    }
    geo.attributes.position.needsUpdate = true;
    pts.rotation.y += mx * 0.0003;
    pts.rotation.x += my * 0.0003;
    renderer.render(scene, camera);
  }
  ani();
}

function stopThreeIdeias() {
  if (threeIdeiasAnimId) { cancelAnimationFrame(threeIdeiasAnimId); threeIdeiasAnimId = null; }
  if (threeIdeiasRenderer) { threeIdeiasRenderer.dispose(); threeIdeiasRenderer = null; }
  const c = document.getElementById('ideias-canvas-bg');
  if (c) c.innerHTML = '';
}