// pieces encoding (ASCII)
// =======================

// Chars 0-32: various pieces

//     0000000: \0  reserved
//     0000001: �   water
//     0000010: �   tree
//     0000011: �   fence
//     ...
//     0010000: (space) nothing
//
// Chars 33-127: 0b0xxxyyzz
//
// - zz (bits 0-1): rotation
//     0°
//     90°
//     180°
//     270°
//
//  - yy (bits 2-3): texture (pick 4)
//     sand
//     grass
//     rock
//     ice
//     brick
//     wood
//     ...
//
//  - xxx (bits 4-6): piece
//     000-001 reserved (chars 0-31)
//     010 cube
//     011 slope
//     100 45° wall
//     101 slope corner flat
//     110 slope corner angled
//     111 pyramid


// Globals
rotation = 0;
texture = 0;
piece = 2;
token = " ";
w = 10;
h = 10;
x = y = z = 0;
map = [Array(w*h).fill('#')];

// Firefox detection
fx = navigator.userAgent.includes("Firefox");

W.onchange = W.onupdate = W.oninput = () => { w = +W.value; updateMap(); map[0] = Array(w*h).fill('#'); }
W.onchange = H.onupdate = H.oninput = () => { h = +H.value; updateMap(); map[0] = Array(w*h).fill('#'); }

// Update map
updateMap = () => {
  out.innerHTML = "map = [\n\n";
  for(i in map){
    out.innerHTML += "// Layer " + i + ":\n\n'";
    out.innerHTML += map[i].join("").match(new RegExp(".{"+w+"}","g")).join("'+\n'");
    out.innerHTML += "',\n\n";
  }
  out.innerHTML += "]";
  scene.style.width = floor.style.width = grid.style.width = w * 200 + 20 + "px";
  scene.style.height = floor.style.height = grid.style.height = h * 200 + 20 + "px";
  moveScene(rx, rz);
}

// Move the scene
moveScene = (rx, rz) => {
  scene.style.transformOrigin = `50% 50% ${z*200}px`;
  scene.style.transform = `translate3D(-50%,-50%,-${Math.max(w*200,h*200)+z*200}px)rotateX(${rx}deg)rotateZ(${rz}deg)`;
  scene2.style.transform = `translate3D(-50%,-50%,-2000px)rotateX(${rx}deg)rotateZ(${rz}deg)`;
}

// Mouse globals
leftmousedown = 0;
rightmousedown = 0;
rx = 45;
rz = 0;
mousex = 0;
mousey = 0;

// Mouse down/up: handle right button
onmousedown = onmouseup = e => {
  mousex = e.pageX;
  mousey = e.pageY;
  if(e.which == 1){
    leftmousedown ^= 1;
  }
  if(e.which == 3){
    rightmousedown ^= 1;
    e.preventDefault();
    e.stopPropagation();
    return false; 
  }
}

// Right click: prevent context menu from appearing
oncontextmenu = e => {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

// Mouse move: update camera if right button is pressed
viewport.onmousemove = e => {
 if(rightmousedown){
  rz += (e.pageX - mousex) / 5;
  rx += (e.pageY - mousey) / 5;
  if(rx > 88) rx = 88;
  if(rx < 0) rx = 0;
  
  mousex = e.pageX;
  mousey = e.pageY;
  moveScene(rx, rz);
  updateSprites();
 }
}

// Hover scene: show cursor
// Left mouse button down: add item in the scene
scene.onmousedown = scene.onmousemove = e => {
  x = (~~((fx ? e.layerX : e.offsetX) / 200));
  y = (~~((fx ? e.layerY : e.offsetY) / 200));
  if(x >= 0 && x < w && y >= 0 && y < h){
    if(leftmousedown || e.which == 1){
      old = document.querySelector(`#scene [x='${x}'][y='${y}'][z='${z}']`);
      if(old){
        old.remove();
      }
      scene.insertAdjacentHTML("beforeEnd", drawpiece(x, y, z));
      map[z][y*w+x] = token;
      updateMap()
      updateSprites();
      W.disabled = true;
      H.disabled = true;
    }
    cursor.innerHTML = drawpiece(x, y, z, 1);
    updateMap();
    updateSprites();
  }
}

scene.onmouseout = e => {
  cursor.innerHTML = "";
}

// Preview current token
preview = (t) => {
  if(t){
    token = t;
    piece = 0;
    rotation = 0;
    texture = 0;
    extrapiece = token.codePointAt();
  }
  else {
    token = String.fromCharCode(rotation + (texture << 2) + (piece << 4));
    extrapiece = 0;
  }
  scene2.innerHTML = drawpiece(0,0,0);
  updateSprites();
}

// Return HTML code for current piece, at the given coordinates
drawpiece = (x, y, z, cursor) => {
  
  // pieces: 2: cube, 3: slope, 4: 45° wall, 5: slope corner flat, 6: slope corner angled, 7: reverse corner flat
  // extra pieces: 1: water cube, 2: tree, 3: fence, 35: nothing
  if(extrapiece != 35){
    html = `<div class="piece s${piece} r${rotation} t${texture} e${extrapiece}" ${cursor || `x=${x} y=${y} z=${z}`} style='transform:translate3d(${x*200}px,${y*200}px,${z*200}px)rotateZ(${rotation*90}deg)'>`;

    if(piece || extrapiece == 1){
      if(piece != 3 && piece != 5 && piece != 7 && piece != 6) html += `<div class="face up"></div>`;
      html += `<div class="face left ${["east","north","west","south"][rotation]}"></div>`;
      html += `<div class="face back ${["north","west","south","east"][rotation]}"></div>`;
      if(piece != 4 && piece != 5) html += `<div class="face right ${["west","south","east","north"][rotation]}"></div>`;
      html += `<div class="face front ${["south","east","north","west"][rotation]}"></div>`;
    }
    
    else {
      if(extrapiece == "2"){
        html += `<div>🌳`;
      }
      else if(extrapiece == "3"){
        html += `<div>🚧`;
      }
    }
    return html;
  }
  return "";
}

// Make all sprites face the camera
updateSprites = () => {
  sprites = document.querySelectorAll(".e2 div");
  for(sprite of sprites){
    sprite.style.transform = `translateY(-100px)rotateZ(${-rz}deg)rotateX(${-rx}deg)`;
  }
}

// Change grid height
Z.onchange = Z.onupdate = Z.oninput = e => {
  z = Z.value;
  if(!map[z]){
    map[z] = Array(w*h).fill('#');
  }
  grid.style.transform = `translateZ(${z*200+1}px)`;
  updateMap();
}

updateMap();
preview();