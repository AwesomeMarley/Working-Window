javascript: (function() {

var style = document.createElement('style');
style.innerHTML = `

body {
overflow: hidden;
}

#pane {
position: absolute;
width: 45%;
height: 45%;
top: 20%;
left: 20%;


margin: 0;
padding: 0;
z-index: 99;
border: 2px solid purple;
background: #fefefe;
}

#title {
font-family: monospace;
background: purple;
color: white;
font-size: 24px;
height: 30px;
text-align: center;
}

#ghostpane {
background: #999;
opacity: 0.2;

width: 45%;
height: 45%;
top: 20%;
left: 20%;

position: absolute;
margin: 0;
padding: 0;
z-index: 98;

-webkit-transition: all 0.25s ease-in-out;
-moz-transition: all 0.25s ease-in-out;
-ms-transition: all 0.25s ease-in-out;
-o-transition: all 0.25s ease-in-out;
transition: all 0.25s ease-in-out;
}
`;
document.head.appendChild(style);


const pane_element = document.createElement('div');
pane_element.id = 'pane';
document.body.append(pane_element);

const title_element = document.createElement('div');
title_element.id = 'title';
title_element.textContent = 'Example Title';
pane_element.append(title_element);

const ghostpane_element = document.createElement('div');
ghostpane_element.id = 'ghostpane';
document.body.append(ghostpane_element);


var minWidth = 60;
var minHeight = 40;


var FULLSCREEN_MARGINS = -10;
var MARGINS = 4;


var clicked = null;
var onRightEdge, onBottomEdge, onLeftEdge, onTopEdge;

var rightScreenEdge, bottomScreenEdge;

var preSnapped;

var b, x, y;

var redraw = false;

var pane = document.getElementById('pane');
var ghostpane = document.getElementById('ghostpane');

function setBounds(element, x, y, w, h) {
  element.style.left = x + 'px';
  element.style.top = y + 'px';
  element.style.width = w + 'px';
  element.style.height = h + 'px';
}

function hintHide() {
setBounds(ghostpane, b.left, b.top, b.width, b.height);
ghostpane.style.opacity = 0;


}


pane.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMove);
document.addEventListener('mouseup', onUp);


pane.addEventListener('touchstart', onTouchDown);
document.addEventListener('touchmove', onTouchMove);
document.addEventListener('touchend', onTouchEnd);


function onTouchDown(e) {
onDown(e.touches[0]);
e.preventDefault();
}

function onTouchMove(e) {
onMove(e.touches[0]);		
}

function onTouchEnd(e) {
if (e.touches.length ==0) onUp(e.changedTouches[0]);
}

function onMouseDown(e) {
onDown(e);
e.preventDefault();
}

function onDown(e) {
calc(e);

var isResizing = onRightEdge || onBottomEdge || onTopEdge || onLeftEdge;

clicked = {
  x: x,
  y: y,
  cx: e.clientX,
  cy: e.clientY,
  w: b.width,
  h: b.height,
  isResizing: isResizing,
  isMoving: !isResizing && canMove(),
  onTopEdge: onTopEdge,
  onLeftEdge: onLeftEdge,
  onRightEdge: onRightEdge,
  onBottomEdge: onBottomEdge
};
}

function canMove() {
return x > 0 && x < b.width && y > 0 && y < b.height
&& y < 30;
}

function calc(e) {
b = pane.getBoundingClientRect();
x = e.clientX - b.left;
y = e.clientY - b.top;

onTopEdge = y < MARGINS;
onLeftEdge = x < MARGINS;
onRightEdge = x >= b.width - MARGINS;
onBottomEdge = y >= b.height - MARGINS;

rightScreenEdge = window.innerWidth - MARGINS;
bottomScreenEdge = window.innerHeight - MARGINS;
}

var e;

function onMove(ee) {
calc(ee);

e = ee;

redraw = true;

}

function animate() {

requestAnimationFrame(animate);

if (!redraw) return;

redraw = false;

if (clicked && clicked.isResizing) {

  if (clicked.onRightEdge) pane.style.width = Math.max(x, minWidth) + 'px';
  if (clicked.onBottomEdge) pane.style.height = Math.max(y, minHeight) + 'px';

  if (clicked.onLeftEdge) {
    var currentWidth = Math.max(clicked.cx - e.clientX  + clicked.w, minWidth);
    if (currentWidth > minWidth) {
      pane.style.width = currentWidth + 'px';
      pane.style.left = e.clientX + 'px';	
    }
  }

  if (clicked.onTopEdge) {
    var currentHeight = Math.max(clicked.cy - e.clientY  + clicked.h, minHeight);
    if (currentHeight > minHeight) {
      pane.style.height = currentHeight + 'px';
      pane.style.top = e.clientY + 'px';	
    }
  }

  hintHide();

  return;
}

if (clicked && clicked.isMoving) {

  if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {

    setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight);
    ghostpane.style.opacity = 0.2;
  } else if (b.top < MARGINS) {

    setBounds(ghostpane, 0, 0, window.innerWidth, window.innerHeight / 2);
    ghostpane.style.opacity = 0.2;
  } else if (b.left < MARGINS) {

    setBounds(ghostpane, 0, 0, window.innerWidth / 2, window.innerHeight);
    ghostpane.style.opacity = 0.2;
  } else if (b.right > rightScreenEdge) {

    setBounds(ghostpane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    ghostpane.style.opacity = 0.2;
  } else if (b.bottom > bottomScreenEdge) {

    setBounds(ghostpane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
    ghostpane.style.opacity = 0.2;
  } else {
    hintHide();
  }

  if (preSnapped) {
    setBounds(pane,
        e.clientX - preSnapped.width / 2,
        e.clientY - Math.min(clicked.y, preSnapped.height),
        preSnapped.width,
        preSnapped.height
    );
    return;
  }


  pane.style.top = (e.clientY - clicked.y) + 'px';
  pane.style.left = (e.clientX - clicked.x) + 'px';

  return;
}


if (onRightEdge && onBottomEdge || onLeftEdge && onTopEdge) {
  pane.style.cursor = 'nwse-resize';
} else if (onRightEdge && onTopEdge || onBottomEdge && onLeftEdge) {
  pane.style.cursor = 'nesw-resize';
} else if (onRightEdge || onLeftEdge) {
  pane.style.cursor = 'ew-resize';
} else if (onBottomEdge || onTopEdge) {
  pane.style.cursor = 'ns-resize';
} else if (canMove()) {
  pane.style.cursor = 'move';
} else {
  pane.style.cursor = 'default';
}
}

animate();

function onUp(e) {
calc(e);

if (clicked && clicked.isMoving) {

  var snapped = {
    width: b.width,
    height: b.height
  };

  if (b.top < FULLSCREEN_MARGINS || b.left < FULLSCREEN_MARGINS || b.right > window.innerWidth - FULLSCREEN_MARGINS || b.bottom > window.innerHeight - FULLSCREEN_MARGINS) {

    setBounds(pane, 0, 0, window.innerWidth, window.innerHeight);
    preSnapped = snapped;
  } else if (b.top < MARGINS) {

    setBounds(pane, 0, 0, window.innerWidth, window.innerHeight / 2);
    preSnapped = snapped;
  } else if (b.left < MARGINS) {

    setBounds(pane, 0, 0, window.innerWidth / 2, window.innerHeight);
    preSnapped = snapped;
  } else if (b.right > rightScreenEdge) {

    setBounds(pane, window.innerWidth / 2, 0, window.innerWidth / 2, window.innerHeight);
    preSnapped = snapped;
  } else if (b.bottom > bottomScreenEdge) {

    setBounds(pane, 0, window.innerHeight / 2, window.innerWidth, window.innerWidth / 2);
    preSnapped = snapped;
  } else {
    preSnapped = null;
  }

  hintHide();

}

clicked = null;

}

})()