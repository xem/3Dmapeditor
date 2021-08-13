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
};

mapscene = [];

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
  
  x = +x;
  y = +y;
  z = +z;
  p = mapscene[z][y][x];
  
  // pieces: 2: cube, 3: slope, 4: 45° wall, 5: slope corner flat, 6: slope corner angled, 7: pyramid
  // extra pieces: 1: water cube, 2: tree, 3: fence, 35: nothing
  html = "";
  html = `<div class="piece s${p.piece} r${p.rotation} t${p.texture} e${p.extrapiece}" ${`x=${x} y=${y} z=${z}`} style='transform:translate3d(${x*200}px,${y*200}px,${z*200}px)rotateZ(${p.rotation*90}deg)'>`;
  
  if(p.extrapiece != 35){

    if(p.piece > 0 || p.extrapiece == 1){
      
      console.log(x,y,z);
      
      // Up face for cubes and 45° walls, if no down solid face on top (or water cube + no water cube on top)
      if(
        ((p.piece != 0 && (p.piece == 2 || p.piece == 4)) && (!mapscene[z+1] || !mapscene[z+1][y][x].d))
        || (p.extrapiece == 1 && (!mapscene[z+1] || mapscene[z+1][y][x].extrapiece != 1))
      ) html += `<div class="face up"></div>`;
      
      // Left face for all pieces, if no right solid face on the left (or water cube + no water cube on left) and force it on slopes
      if(
        (p.piece == 3 || (p.piece != 0 && (!mapscene[z][y][x-1] || !mapscene[z][y][x-1].r)))
        || (p.extrapiece == 1 && (!mapscene[z][y][x-1] || mapscene[z][y][x-1].extrapiece != 1))
      ) html += `<div class="face left ${["east","north","west","south"][p.rotation]}"></div>`;
      
      // Back face for all pieces, if no front solid face on the back (or water cube + no water cube on back) and force it on slopes
      if(
        (p.piece == 3 || (p.piece != 0 && (!mapscene[z][y-1] || !mapscene[z][y-1][x].f)))
        || (p.extrapiece == 1 && (!mapscene[z][y-1] || mapscene[z][y-1][x].extrapiece != 1))
      ) html += `<div class="face back ${["north","west","south","east"][p.rotation]}"></div>`;
      
      // Right face for cubes, slopes, angle2, pyramid, if no left solid face on the right (or water cube + no water cube on right) and force it on slopes
      console.log(mapscene[z], mapscene[z][y], x, mapscene[z][y][x], x+1, mapscene[z][y][x+1])
      if(
        (p.piece == 3 || (p.piece != 0 && p.piece != 4 && p.piece != 5) && (!mapscene[z][y][x+1] || !mapscene[z][y][x+1].l))
        || (p.extrapiece == 1 && (!mapscene[z][y][x+1] || mapscene[z][y][x+1].extrapiece != 1))
      ) html += `<div class="face right ${["west","south","east","north"][p.rotation]}"></div>`;
      
      // Front face for all pieces, if no back solid face on the front (or water cube + no water cube on front) and force it on slopes
      if(
        (p.piece == 3 || (p.piece != 0 && (!mapscene[z][y+1] || !mapscene[z][y+1][x].f)))
        || (p.extrapiece == 1 && (!mapscene[z][y+1] || mapscene[z][y+1][x].extrapiece != 1))
      ) html += `<div class="face front ${["south","east","north","west"][p.rotation]}"></div>`;
      
      // No down face
    }
    
    /*else {
      if(p.extrapiece == "2"){
        html += `<div>🌳`;
      }
      else if(p.extrapiece == "3"){
        html += `<div>🚧`;
      }
    }*/
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

// Build/draw scene
drawScene = () => {
  for(Z in map.layers){
    mapscene[Z] = [];
    for(i in map.layers[Z]){
      X = i % w;
      Y = ~~(i / w);
      if(X == 0){
        mapscene[Z][Y] = [];
      }
      
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
          piece = token >> 4; // 2: cube, 3: slope, 4: 45° wall, 5: angle1, 6: angle2, 7: pyramid 
          texture = (token >> 2) & 0b11; // 0: grass, 1: sand, 2: rock, 3: ice
          rotation = token & 0b11; // multiple of 90°
        }
        mapscene[Z][Y][X] = {piece, extrapiece, rotation, texture, 
          l: (piece == 2) || /*(piece == 3 && rotation == 3) ||*/ (piece == 4 && (rotation == 0 || rotation == 3)), // left face is a solid square in cubes, 270° slopes, 0/270° 45° wall
          b: (piece == 2) || /*(piece == 3 && rotation == 2) ||*/ (piece == 4 && (rotation == 1 || rotation == 0)), // back face is a solid square in cubes, 0° slopes, 0/90° 45° wall
          r: (piece == 2) || /*(piece == 3 && rotation == 1) ||*/ (piece == 4 && (rotation == 2 || rotation == 1)), // right face is a solid square in cubes, 90° slopes, 90/180° 45° wall
          f: (piece == 2) || /*(piece == 3 && rotation == 0) ||*/ (piece == 4 && (rotation == 3 || rotation == 2)), // front face is a solid square in cubes, 180° slopes, 180/270° 45° wall
          u: (piece == 2),                                                                                      // up face is a solid square in cubes
          d: (piece == 2) || (piece == 3) || (piece == 6) || (piece == 7)                                       // down face is a solid square in cubes, slopes, angle2, pyramids
        };
      }
      else {
        mapscene[Z][Y][X] = {extrapiece: 35}
      }
    }
  }
  for(Z in mapscene)for(Y in mapscene[Z])for(X in mapscene[Z][Y]){
    scene.insertAdjacentHTML("beforeEnd", drawPiece(X,Y,Z));
  }
  updateSprites();
}

drawScene();
scene.style.width = floor.style.width = w * 200 + 20 + "px";
scene.style.height = floor.style.height = h * 200 + 20 + "px";
RX.onchange = RX.onupdate = RX.oninput = RZ.onchange = RZ.onupdate = RZ.oninput = () => { moveScene(rx = +RX.value, rz = +RZ.value) }