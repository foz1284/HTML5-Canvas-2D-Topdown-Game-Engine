// Last updated November 2010 by Simon Sarris
// www.simonsarris.com
// sarris@acm.org
//
// Free to use and distribute at will
// So long as you are nice to people, etc

// This is a self-executing function that I added only to stop this
// new script from interfering with the old one. It's a good idea in general, but not
// something I wanted to go over during this tutorial

//------------------------//
// Modifications By Mark Forster(Foz1284)
// foz1284@gmail.com


// Select Enabled Boolean
// Re-Size Enabled Boolean
// Move Enabled Boolean
// Move Function
//------------------------//

var CanvasName;


var doubleClickCreateBoxEnabled = false;
var selectEnabled = true;
//The Following are dependant on selectEnabled being true
var resizeEnabled = false;
var moveEnabled = true;

//var moveFunction = function(e) {
//    getMouse(e);
//    mySel.x = mouseX - offsetx;
//    mySel.y = mouseY - offsety;
//};
var moveHandles = [];
var moveBoxSize = 10;

var moveSetupFunction = function () {
    var mySelBoxColor = '#FF0000';
    // set up the selection handle boxes
    for (var i = 0; i < 8; i++) {
        var rect = new Box2;
        rect.fill = mySelBoxColor;
        moveHandles.push(rect);
    }
};

var moveFunction = function (e) {
    getMouse(e);
};

var moveMouseUpFunction = function (e, selectedBox) {
    if (selectedBox != null) {
        getMouse(e);
        //if Mouse is in a moveHandle on mouse up
        for (var i = 0; i < 8; i++) {
            var cur = moveHandles[i];
            if (cur.x < mouseX && mouseX < (cur.x + moveBoxSize)) {
                if (cur.y < mouseY && mouseY < (cur.y + moveBoxSize)) {
                    selectedBox.MoveDirection = i;
                    //TODO: add Copy of move handle as a direction indicator
                    //addRect(95, 60, 25, 25, 'rgba(150,150,250,0.7)', false);
                }
            }
        }
    }
};

var moveDrawFunction = function (context, selectedBox) {
    //TODO: Make the move handles appear a set distance away from the selected Box
    //TODO: Currently on small selected boxes they are too closely packed to select
    
    
    // draw the boxes
    var half = (moveBoxSize / 2);

    // 0  1  2
    // 3     4
    // 5  6  7

    // top left, middle, right
    moveHandles[0].x = selectedBox.x - half;
    moveHandles[0].y = selectedBox.y - half;

    moveHandles[1].x = selectedBox.x + selectedBox.w / 2 - half;
    moveHandles[1].y = selectedBox.y - half;

    moveHandles[2].x = selectedBox.x + selectedBox.w - half;
    moveHandles[2].y = selectedBox.y - half;

    //middle left
    moveHandles[3].x = selectedBox.x - half;
    moveHandles[3].y = selectedBox.y + selectedBox.h / 2 - half;

    //middle right
    moveHandles[4].x = selectedBox.x + selectedBox.w - half;
    moveHandles[4].y = selectedBox.y + selectedBox.h / 2 - half;

    //bottom left, middle, right
    moveHandles[6].x = selectedBox.x + selectedBox.w / 2 - half;
    moveHandles[6].y = selectedBox.y + selectedBox.h - half;

    moveHandles[5].x = selectedBox.x - half;
    moveHandles[5].y = selectedBox.y + selectedBox.h - half;

    moveHandles[7].x = selectedBox.x + selectedBox.w - half;
    moveHandles[7].y = selectedBox.y + selectedBox.h - half;


    for (var i = 0; i < 8; i++) {
        var curr = moveHandles[i];
        curr.fill = '#FF0000';
    }
    if (selectedBox != null && selectedBox.MoveDirection != null) {
        moveHandles[selectedBox.MoveDirection].fill = '#00FF00';
    }
    
    for (var j = 0; j < 8; j++) {
        var cur = moveHandles[j];
        context.fillStyle = cur.fill;
        context.fillRect(cur.x, cur.y, moveBoxSize, moveBoxSize);
    }
};

var InitialiseCanvas = function (canvasId) {
    CanvasName = canvasId;
    init2();
};

var InitialiseCanvasObjects = function () {
    // add a large green rectangle
    addRect(260, 70, 30, 30, 'rgba(0,205,0,0.7)', true);

    // add a green-blue rectangle
    addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)', false);

    // add a smaller purple rectangle
    addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)', false);
};


// holds all our boxes
var boxes2 = [];

// New, holds the 8 tiny boxes that will be our selection handles
// the selection handles will be in this order:
// 0  1  2
// 3     4
// 5  6  7
var selectionHandles = [];

// Hold canvas information
var canvas;
var ctx;
var WIDTH;
var HEIGHT;
var INTERVAL = 20;  // how often, in milliseconds, we check to see if a redraw is needed

var isDrag = false;
var isResizeDrag = false;
var expectResize = -1; // New, will save the # of the selection handle if the mouse is over one.
var mouseX, mouseY; // mouse coordinates

// when set to true, the canvas will redraw everything
// invalidate() just sets this to false right now
// we want to call invalidate() whenever we make a change
var canvasValid = false;

// The node (if any) being selected.
// If in the future we want to select multiple objects, this will get turned into an array
var mySel = null;

// The selection color and width. Right now we have a red selection with a small width
var mySelColor = '#CC0000';
var mySelWidth = 2;
var mySelBoxColor = 'darkred'; // New for selection boxes
var mySelBoxSize = 6;

// we use a fake canvas to draw individual shapes for selection testing
var ghostcanvas;
var gctx; // fake canvas context

// since we can drag from anywhere in a node
// instead of just its x/y corner, we need to save
// the offset of the mouse when we start dragging.
var offsetx, offsety;

// Padding and border style widths for mouse offsets
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;




// Box object to hold data
var Box2 = function () {
    this.x = 0;
    this.y = 0;
    this.w = 1; // default width and height?
    this.h = 1;
    this.fill = '#444444';
};

// New methods on the Box class
Box2.prototype = {
    // we used to have a solo draw function
    // but now each box is responsible for its own drawing
    // mainDraw() will call this with the normal canvas
    // mouseYDown will call this with the ghost canvas with 'black'
    draw: function (context) {
        if (context === gctx) {
            context.fillStyle = 'black'; // always want black for the ghost canvas
        } else {
            context.fillStyle = this.fill;
        }

        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > WIDTH || this.y > HEIGHT) return;
        if (this.x + this.w < 0 || this.y + this.h < 0) return;

        context.fillRect(this.x, this.y, this.w, this.h);

        // draw selection
        // this is a stroke along the box and also 8 new selection handles
        if (mySel === this) {
            context.strokeStyle = mySelColor;
            context.lineWidth = mySelWidth;
            context.strokeRect(this.x, this.y, this.w, this.h);

            if (moveEnabled) {
                if (isDrag) {
                    moveDrawFunction(context, this);
                }
            }

            if (resizeEnabled) {
                // draw the boxes
                var half = mySelBoxSize / 2;

                // 0  1  2
                // 3     4
                // 5  6  7

                // top left, middle, right
                selectionHandles[0].x = this.x - half;
                selectionHandles[0].y = this.y - half;

                selectionHandles[1].x = this.x + this.w / 2 - half;
                selectionHandles[1].y = this.y - half;

                selectionHandles[2].x = this.x + this.w - half;
                selectionHandles[2].y = this.y - half;

                //middle left
                selectionHandles[3].x = this.x - half;
                selectionHandles[3].y = this.y + this.h / 2 - half;

                //middle right
                selectionHandles[4].x = this.x + this.w - half;
                selectionHandles[4].y = this.y + this.h / 2 - half;

                //bottom left, middle, right
                selectionHandles[6].x = this.x + this.w / 2 - half;
                selectionHandles[6].y = this.y + this.h - half;

                selectionHandles[5].x = this.x - half;
                selectionHandles[5].y = this.y + this.h - half;

                selectionHandles[7].x = this.x + this.w - half;
                selectionHandles[7].y = this.y + this.h - half;


                context.fillStyle = mySelBoxColor;
                for (var i = 0; i < 8; i++) {
                    var cur = selectionHandles[i];
                    context.fillRect(cur.x, cur.y, mySelBoxSize, mySelBoxSize);
                }
            }
        }

    } // end draw

};

//Initialize a new Box, add it, and invalidate the canvas
var addRect = function (x, y, w, h, fill, selectable) {
    var rect = new Box2;
    rect.x = x;
    rect.y = y;
    rect.w = w;
    rect.h = h;
    rect.fill = fill;
    rect.selectable = selectable;
    boxes2.push(rect);
    invalidate();
};

// initialize our canvas, add a ghost canvas, set draw loop
// then add everything we want to intially exist on the canvas
function init2() {
    canvas = $("#" + CanvasName)[0];
    HEIGHT = canvas.height;
    WIDTH = canvas.width;
    ctx = canvas.getContext('2d');
    ghostcanvas = document.createElement('canvas');
    ghostcanvas.height = HEIGHT;
    ghostcanvas.width = WIDTH;
    gctx = ghostcanvas.getContext('2d');

    //fixes a problem where double clicking causes text to get selected on the canvas
    canvas.onselectstart = function () { return false; };

    // fixes mouse co-ordinate problems when there's a border or padding
    // see getMouse for more detail
    if (document.defaultView && document.defaultView.getComputedStyle) {
        stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10) || 0;
        stylePaddingTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10) || 0;
        styleBorderLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10) || 0;
        styleBorderTop = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10) || 0;
    }

    // make mainDraw() fire every INTERVAL milliseconds
    setInterval(mainDraw, INTERVAL);

    // set our events. Up and down are for dragging,
    // double click is for making new boxes
    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
    canvas.ondblclick = myDblClick;
    canvas.onmousemove = myMove;

    // set up the selection handle boxes
    for (var i = 0; i < 8; i++) {
        var rect = new Box2;
        selectionHandles.push(rect);
    }

    moveSetupFunction();


    // add custom initialization here:
    InitialiseCanvasObjects();
}


//wipes the canvas context
var clear = function (c) {
    c.clearRect(0, 0, WIDTH, HEIGHT);
};

// Main draw loop.
// While draw is called as often as the INTERVAL variable demands,
// It only ever does something if the canvas gets invalidated by our code
function mainDraw() {
    if (canvasValid == false) {
        clear(ctx);

        // Add stuff you want drawn in the background all the time here

        // draw all boxes
        var l = boxes2.length;
        for (var i = 0; i < l; i++) {
            boxes2[i].draw(ctx); // we used to call drawshape, but now each box draws itself
        }

        // Add stuff you want drawn on top all the time here

        canvasValid = true;
    }
}

// Happens when the mouse is moving inside the canvas
function myMove(e) {
    if (isDrag) {
        if (moveEnabled) {
            moveFunction(e);
            // something is changing position so we better invalidate the canvas!
            invalidate();
        }
    } else if (isResizeDrag) {
        if (resizeEnabled)
        {
        // time to resize!
        var oldx = mySel.x;
        var oldy = mySel.y;

        // 0  1  2
        // 3     4
        // 5  6  7
        switch (expectResize) {
            case 0:
                mySel.x = mouseX;
                mySel.y = mouseY;
                mySel.w += oldx - mouseX;
                mySel.h += oldy - mouseY;
                break;
            case 1:
                mySel.y = mouseY;
                mySel.h += oldy - mouseY;
                break;
            case 2:
                mySel.y = mouseY;
                mySel.w = mouseX - oldx;
                mySel.h += oldy - mouseY;
                break;
            case 3:
                mySel.x = mouseX;
                mySel.w += oldx - mouseX;
                break;
            case 4:
                mySel.w = mouseX - oldx;
                break;
            case 5:
                mySel.x = mouseX;
                mySel.w += oldx - mouseX;
                mySel.h = mouseY - oldy;
                break;
            case 6:
                mySel.h = mouseY - oldy;
                break;
            case 7:
                mySel.w = mouseX - oldx;
                mySel.h = mouseY - oldy;
                break;
        }
        }

        invalidate();
    }
    if (resizeEnabled)
    {
    getMouse(e);
    // if there's a selection see if we grabbed one of the selection handles
    if (mySel !== null && !isResizeDrag) {
        for (var i = 0; i < 8; i++) {
            // 0  1  2
            // 3     4
            // 5  6  7

            var cur = selectionHandles[i];

            // we dont need to use the ghost context because
            // selection handles will always be rectangles
            if (mouseX >= cur.x && mouseX <= cur.x + mySelBoxSize &&
                mouseY >= cur.y && mouseY <= cur.y + mySelBoxSize) {
                // we found one!
                expectResize = i;
                invalidate();

                switch (i) {
                case 0:
                    this.style.cursor = 'nw-resize';
                    break;
                case 1:
                    this.style.cursor = 'n-resize';
                    break;
                case 2:
                    this.style.cursor = 'ne-resize';
                    break;
                case 3:
                    this.style.cursor = 'w-resize';
                    break;
                case 4:
                    this.style.cursor = 'e-resize';
                    break;
                case 5:
                    this.style.cursor = 'sw-resize';
                    break;
                case 6:
                    this.style.cursor = 's-resize';
                    break;
                case 7:
                    this.style.cursor = 'se-resize';
                    break;
                }
                return;
            }

        }
        // not over a selection box, return to normal
        isResizeDrag = false;
        expectResize = -1;
        this.style.cursor = 'auto';
    }
    }

}

// Happens when the mouse is clicked in the canvas
function myDown(e) {
    getMouse(e);
    if (selectEnabled) {
        //we are over a selection box
        if (expectResize !== -1) {
            isResizeDrag = true;
            return;
        }
        clear(gctx);
        var l = boxes2.length;
        for (var i = l - 1; i >= 0; i--) {
            // draw shape onto ghost context
            boxes2[i].draw(gctx, 'black');

            // get image data at the mouse x,y pixel
            var imageData = gctx.getImageData(mouseX, mouseY, 1, 1);

            // if the mouse pixel exists, select and break
            if (imageData.data[3] > 0) {
                if (boxes2[i].selectable) {
                    mySel = boxes2[i];
                    offsetx = mouseX - mySel.x;
                    offsety = mouseY - mySel.y;
                    mySel.x = mouseX - offsetx;
                    mySel.y = mouseY - offsety;
                    if (moveEnabled) {
                        isDrag = true;
                    }

                    invalidate();
                    clear(gctx);
                }
                return;
            }
        }
        // havent returned means we have selected nothing
        mySel = null;
        // clear the ghost canvas for next time
        clear(gctx);
        // invalidate because we might need the selection border to disappear
        invalidate();
    }



}

function myUp(e) {
    invalidate();
    if (moveEnabled) {
        moveMouseUpFunction(e, mySel);
    }
    isDrag = false;
    isResizeDrag = false;
    expectResize = -1;
}

// adds a new node
function myDblClick(e) {
    getMouse(e);
    if (doubleClickCreateBoxEnabled) {
        // for this method width and height determine the starting X and Y, too.
        // so I left them as vars in case someone wanted to make them args for something and copy this code
        var width = 20;
        var height = 20;
        addRect(mouseX - (width / 2), mouseY - (height / 2), width, height, 'rgba(220,205,65,0.7)');
    }
}


function invalidate() {
    canvasValid = false;
}

// Sets mouseX,mouseY to the mouse position relative to the canvas
// unfortunately this can be tricky, we have to worry about padding and borders
function getMouse(e) {
    var element = canvas, offsetX = 0, offsetY = 0;

    if (element.offsetParent) {
        do {
            offsetX += element.offsetLeft;
            offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
    }

    // Add padding and border style widths to offset
    offsetX += stylePaddingLeft;
    offsetY += stylePaddingTop;

    offsetX += styleBorderLeft;
    offsetY += styleBorderTop;

    mouseX = e.pageX - offsetX;
    mouseY = e.pageY - offsetY;
}

// If you dont want to use <body onLoad='init()'>
// You could uncomment this init() reference and place the script reference inside the body tag
//init();
window.init2 = init2;


