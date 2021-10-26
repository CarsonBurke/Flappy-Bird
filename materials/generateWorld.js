function initializeMap() {

    map.cr = map.el.getContext("2d")

    // Style map width and height

    map.el.width = mapDimensions
    map.el.height = mapDimensions

    // Dimensions / number of tiles will give size

    globalThis.gridSize = mapDimensions / gridPartSize
}

function createBackground() {

    new Sprite({
        type: "background",
        x: 0,
        y: 0,
        width: map.el.width,
        height: map.el.height,
        image: document.getElementById("background"),
    }).draw()
}

function createBird() {

    new Sprite({
        type: "bird",
        x: map.el.width * 0.25,
        y: Math.random() * map.el.height / 2,
        width: 51,
        height: 36,
        image: document.getElementById("bird"),
        velocity: 0,
        lastFlap: 0,
        avoidSides: true,
    }).draw()
}

function generatePipes() {

    let gap = 100

    let el = document.getElementById("pipeTop")

    //

    let pipe1Y = Math.random() * el.naturalHeight * -1

    // Don't allow to be less than 0.3x map height

    pip1Y = Math.max(el.naturalHeight * -1 + el.naturalHeight * 0.3, pipe1Y)

    pipe1Y = Math.min(el.naturalHeight * -1 + el.naturalHeight * 0.7, pipe1Y)

    //

    new Sprite({
        type: "pipe",
        x: map.el.width + 80,
        y: pipe1Y,
        width: 50,
        height: el.naturalHeight,
        image: el,
        passed: false,
    }).draw()

    el = document.getElementById("pipeBottom")

    //

    let pipe2Y = el.naturalHeight + pipe1Y + gap

    //

    new Sprite({
        type: "pipe",
        x: map.el.width + 80,
        y: pipe2Y,
        width: 50,
        height: el.naturalHeight,
        image: el,
        passed: false,
    }).draw()
}

class Sprite {
    constructor(opts) {

        //

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }

        //

        this.id = newId()

        //

        if (!objects[this.type]) objects[this.type] = {}

        //

        objects[this.type][this.id] = this
    }
    draw() {

        map.cr.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
    move(opts) {

        //

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }

        //

        if (this.avoidSides) {

            if (this.x <= 0) this.x = 0
            if (this.x + this.width >= map.el.width) this.x = map.el.width - this.width

            //

            if (this.y <= 0) this.y = 0
            if (this.y + this.height >= map.el.height) this.y = map.el.height - this.height
        }
    }
}

function reDrawAll() {

    for (let type in objects) {

        for (let id in objects[type]) {

            let object = objects[type][id]

            object.draw()
        }
    }
}

function randomColor() {

    let value = Math.floor(Math.random() * Object.keys(colors).length)

    let key = Object.keys(colors)[value]

    let color = colors[key]
    return color
}

// Place game objects

function placeObject(opts) {

    // Create object

    let object = {}

    // Add property to objects

    for (let propertyName in opts) {

        object[propertyName] = opts[propertyName]
    }

    let type = object.type

    object.id = newId()
    let id = object.id

    // Style element

    object.el = document.createElement("div")
    let el = object.el

    el.classList.add(type)
    el.id = id

    el.style.position = "absolute"

    el.style.top = gridPartSize * object.y + "px"
    el.style.left = gridPartSize * object.x + "px"

    el.style.width = gridPartSize + "px"
    el.style.height = gridPartSize + "px"

    let color = object.color
    if (color) el.style.backgroundColor = color

    //

    if (!objects[type]) objects[type] = {}
    objects[type][id] = object

    //

    map.el.appendChild(el)
}

function findRandomPos() {

    let posAmount = Object.values(map.positions).length - 1
    let posId = Math.floor(Math.random() * posAmount)

    let pos = map.positions[posId]
    return pos
}

function generateBird(opts) {

    let type = "bird"

    let pos = { x: gridSize / 2, y: gridSize / 2 }
        /* let pos = { x: 0, y: 0 } */

    placeObject({
        type: type,
        x: pos.x,
        y: pos.y,
        direction: "up",
        score: 0,
        color: opts.color,
        network: opts.network
    })
}

function generateFood(opts) {

    let type = "food"

    let pos = findRandomPos()

    placeObject({
        type: type,
        x: pos.x,
        y: pos.y,
        color: opts.color
    })
}

function initWorld() {

    initializeMap()

    createBackground()

    createBird()

    generatePipes()
}