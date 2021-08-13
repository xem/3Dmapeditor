// pieces encoding (ASCII)
// =======================

// Chars 0-31: various pieces
//
//     0000000: \0  reserved
//     0000001: �   water
//     0000010: �   tree
//     0000011: �   fence
//     ...
//
// Char 35: nothing
//
//     0100011: #   nothing
//
// Chars 32-127: 0b0xxxyyzz
//
// - zz (bits 0-1): rotation
//     0°
//     90°
//     180°
//     270°
//
//  - yy (bits 2-3): texture
//     sand
//     grass
//     rock
//     ice
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

map = {
  w: 10,
  h: 10,
  layers: [

  // Layer 0:

  '##########'+
  '#(((((((#'+
  '#(((((((#'+
  '#(((((((#'+
  '#(((((((#'+
  '#(((((#'+
  '#(((((((#'+
  '#((((((((#'+
  '#((((((((#'+
  '#########',

  // Layer 1:

  '##########'+
  '######'+
  '###666###'+
  '###$$$$7##'+
  '###$$$$7##'+
  '###$$b2c##'+
  '##5$$1$3##'+
  '##U44a0`##'+
  '##########'+
  '##########',

  // Layer 2:

  '##########'+
  '##########'+
  '#########'+
  '###,L#####'+
  '###L######'+
  '##########'+
  '######p###'+
  '##########'+
  '##########'+
  '##########',

  ]
}

// Globals
var token = " ",
rotation = 0,
texture = 0,
w = map.w,
h = map.h,
x = 0,
y = 0,
z = 0,
rx = 45,
rz = 0,
piece = 0,
extrapiece = 0,

// Move the scene
moveScene = (rx, rz) => {
  scene.style.transformOrigin = `50% 50%`;
  scene.style.transform = `translate3D(-50%,-50%,-${Math.max(w*200,h*200)+z*200}px)rotateX(${rx}deg)rotateZ(${rz}deg)`;
  updateSprites();
},

// Return HTML code for current piece, at the given coordinates
drawPiece = (x, y, z) => {
  
  // pieces: 2: cube, 3: slope, 4: 45° wall, 5: slope corner flat, 6: slope corner angled, 7: reverse corner flat
  // extra pieces: 1: water cube, 2: tree, 3: fence, 35: nothing
  if(extrapiece != 35){
    html = `<div class="piece s${piece} r${rotation} t${texture} e${extrapiece}" ${`x=${x} y=${y} z=${z}`} style='transform:translate3d(${x*200}px,${y*200}px,${z*200}px)rotateZ(${rotation*90}deg)'>`;

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
},

// Make all sprites face the camera
updateSprites = () => {
  sprites = document.querySelectorAll(".e2 div");
  for(sprite of sprites){
    sprite.style.transform = `translateY(-100px)rotateZ(${-rz}deg)rotateX(${-rx}deg)`;
  }
},

// Draw scene
drawScene = () => {
  for(Z in map.layers){
    for(i in map.layers[Z]){
      X = i % w;
      Y = ~~(i / w);
      token = map.layers[Z][i].codePointAt();
      if(token != 35){ // # = nothing
        if(token < 32){ // extra piece
          extrapiece = token;
          piece = 0;
          rotation = 0;
          texture = 0;
        }
        else {
          extrapiece = 0;
          piece = token >> 4;
          texture = (token >> 2) & 0b11;
          rotation = token & 0b11;
        }
        scene.insertAdjacentHTML("beforeEnd", drawPiece(X,Y,Z));
      }
      
    }
  }
  
  updateSprites();
}

drawScene();
scene.style.width = floor.style.width = w * 200 + 20 + "px";
scene.style.height = floor.style.height = h * 200 + 20 + "px";
RX.onchange = RX.onupdate = RX.oninput = RZ.onchange = RZ.onupdate = RZ.oninput = () => { moveScene(rx = +RX.value, rz = +RZ.value) }