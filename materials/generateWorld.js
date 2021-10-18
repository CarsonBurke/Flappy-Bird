function initializeMap() {

    map.cr = map.el.getContext("2d")

    // Style map width and height

    map.el.width = mapDimensions
    map.el.height = mapDimensions

    // Dimensions / number of tiles will give size

    globalThis.gridSize = mapDimensions / gridPartSize
}

function createBackground() {

    let el = document.getElementById("background")

    map.cr.drawImage(el, 0, 0)
}

function createBird() {

    let el = document.getElementById("bird")

    map.cr.drawImage(el, 10, map.el.height / 2, 51, 36)
}

function generatePipes() {

    let pipe1Height = Math.min(Math.max(map.el.height / 3, Math.random() * map.el.height), map.el.height / 0.5)

    new Sprite({
        type: "pipe",
        x: 250,
        y: 0,
        width: 80,
        height: pipe1Height,
        image: document.getElementById("pipe"),
    })

    let gap = 50

    new Sprite({
        type: "pipe",
        x: 250,
        y: pipe1Height + gap,
        width: 80,
        height: map.el.height - pipe1Height + gap,
        image: document.getElementById("pipe"),
    })
}

class Sprite {
    constructor(opts) {

        //

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }

        //

        this.id = this.x * 50 + this.y

        //

        if (!objects[this.type]) objects[this.type] = {}

        //

        objects[this.type][this.id] = this

        //

        map.cr.drawImage(this.image, this.x, this.y, this.width, this.height)
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

function generateSnake(opts) {

    let type = "snake"

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

    /* for (let i = 0; i < 100; i++) {

        generateSnake({
            color: randomColor()
        })
    } */
}