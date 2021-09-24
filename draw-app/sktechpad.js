var canvas, dataURL, context, dragging, x, y, brushColor, bgFillColor,
    radius = 10, cPushArray = new Array(), cStep = -1,
    mouseup = false, mousedown = false, eraserOn = false, brushOn = false,
    bgFillOn = false;

init();

function init() {
    var toolbarHeight, toolbar;
    canvas = document.getElementById('myCanvas');
    toolbar = document.getElementById('toolbar');
    toolbarHeight = toolbar.offsetHeight;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - toolbarHeight;

    dataURL = canvas.toDataURL();
    context = canvas.getContext('2d');


    dragging = false;
    context.lineWidth = (radius * 2);

    deselectTool();

 
    var brushButton = document.getElementById('brush');
    brushOn = true;
    brushButton.className += ' set';


    
    addSwatches();
    storeSnapshot();
}

function storeSnapshot() {
    cStep++;
    if (cStep < cPushArray.length) {
        cPushArray.length = cStep;
    }
    cPushArray.push(canvas.toDataURL());
}


var putPoint = (e) => {
    if (dragging && !bgFillOn) {
        x = e.clientX - canvas.offsetLeft;
        y = e.clientY - canvas.offsetTop;
       
        context.lineTo(x, y);

        context.stroke();
        context.beginPath();
        if (eraserOn == true) {
            context.globalCompositeOperation = "destination-out";
        } else {
            context.globalCompositeOperation = "source-over";
        }
       
        context.arc(x, y, radius, 0, 2 * Math.PI);

        context.fill();
        context.beginPath();
       
        context.moveTo(x, y);
    }
}

var engage = (e) => {
    canvas.addEventListener('mousemove', putPoint);
    canvas.addEventListener('touchmove', putPoint);
    if (bgFillOn) {
        context.fillStyle = bgFillColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    if (brushOn || eraserOn) {
        dragging = true;
        putPoint(e);
    }

}

var disengage = () => {
    dragging = false;

    mouseup = true;
    mousedown = false;
    context.beginPath();

    if (eraserOn == true) {
        context.globalCompositeOperation = "source-over";
    }
    storeSnapshot();
}


canvas.addEventListener('mousedown', engage);
canvas.addEventListener('mouseup', disengage);
canvas.addEventListener('touchstart', engage);
canvas.addEventListener('touchend', disengage);

var minRad = 0.5,
    maxRad = 100,
    defaultRad = 20,
    interval = 5,
    radSpan = document.getElementById('radval'),
    decRad = document.getElementById('decrad'),
    incRad = document.getElementById('incrad');

var setRadius = (newRadius) => {
    if (newRadius < minRad)
        newRadius = minRad
    else if (newRadius > maxRad)
        newRadius = maxRad;
    radius = newRadius;
    context.lineWidth = radius * 2;
    radSpan.innerHTML = radius;
}


decRad.addEventListener('click', () => {
    setRadius(radius - interval);
});


incRad.addEventListener('click', () => {
    if (radius % 1 !== 0) {
        setRadius(parseInt(radius) + interval);
    } else {
        setRadius(radius + interval);
    }
});

function addSwatches() {
    var colors = ['black', 'grey', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
   
    for (var i = 0, n = colors.length; i < n; i++) {
        var swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = colors[i];
        swatch.addEventListener('click', setSwatch);
        document.getElementById('colors').appendChild(swatch);
    }
}

function setColor(color) {
    context.fillStyle = color;
    context.strokeStyle = color;
    bgFillColor = color;
    brushColor = color;

    var active = document.getElementsByClassName('active')[0];
    if (active) {
        active.className = 'swatch';
    }
}

function setSwatch(e) {
   
    if (!eraserOn) {
        var swatch = e.target;
        setColor(swatch.style.backgroundColor);
        swatch.className += ' active';

       
        var eraser = document.getElementById('eraser');
        eraser.classList.remove('set');

    }
}


setSwatch({
    target: document.getElementsByClassName('swatch')[0]
});



function deselectTool() {
   
    var drawTools = document.querySelectorAll(".drawTool");

    [].forEach.call(drawTools, function (el) {
        el.classList.remove('set');
    });
}



var brushButton = document.getElementById('brush');
brushButton.addEventListener('click', setBrush);

function setBrush() {
    eraserOn = false;
    bgFillOn = false;
    brushOn = true;

  
    deselectTool();

    if (!brushButton.classList.contains('set')) {
        brushButton.className += ' set';
      
    }
}


var fillButton = document.getElementById('filldrip');
fillButton.addEventListener('click', setBackgroundFill);

function setBackgroundFill(e) {
    eraserOn = false;
    bgFillOn = true;
    deselectTool();

    
    if (!fillButton.classList.contains('set')) {
        fillButton.className += ' set';
        var active = document.getElementsByClassName('active')[0];
        if (active) {
           
        }

    }
   
}


var eraserButton = document.getElementById('eraser');
eraserButton.addEventListener('click', setEraser);

function setEraser(e) {
    eraserOn = true;
    bgFillOn = false;
    brushOn = false;
    deselectTool()

    var eraser = document.getElementById('eraser');
    if (!eraser.classList.contains('set')) {

        eraser.className += ' set';
        var active = document.getElementsByClassName('active')[0];
        if (active) {
            active.className = 'swatch';
        }
    }
}



var clearButton = document.getElementById('clearCanvas');
clearButton.addEventListener('click', clearCanvas);

function clearCanvas(e) {
    storeSnapshot();
    context.clearRect(0, 0, canvas.width, canvas.height);
}


var undoButton = document.getElementById('undo')
undoButton.addEventListener('click', cUndo);

function cUndo() {
    var canvasPic = new Image();
    if (cStep > 0) {
        cStep--;
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(canvasPic, 0, 0);
        }

    } else {
        canvasPic.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(canvasPic.src, 0, 0);
        }
    }
}


var restoreButton = document.getElementById('restore');
restoreButton.addEventListener('click', restoreCanvas);

function restoreCanvas(e) {
    if (cStep >= 0 && (cStep < cPushArray.length - 1)) {
        cStep++;
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(canvasPic, 0, 0);
        }
    }
}

document.onkeydown = KeyPress;



function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}


document.getElementById('save').addEventListener('click', function () {
    downloadCanvas(this, 'myCanvas', 'canvasDrawing.png');
}, false);


function KeyPress(e) {
    var evtobj = window.event ? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
        cUndo();
    } else if (evtobj.keyCode == 89 && evtobj.ctrlKey) {
        restoreCanvas();
    }
}

