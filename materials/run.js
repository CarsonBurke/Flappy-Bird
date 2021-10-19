let tick = 0
let generation = 0
let lastReset = 0
let score = 0
let bestScore = 0

function createNetwork(bird, opts) {

    // Create neural network

    let network = new NeuralNetwork()

    // Create layers

    let layerCount = 3

    for (let i = 0; i < layerCount; i++) network.addLayer({})

    // Create perceptrons

    // Create input perceptrons

    network.layers[0].addPerceptrons(opts.inputCount)

    // Create hidden perceptrons

    let hiddenPerceptronsNeed = 5

    // Loop through layers

    for (let layerName in network.layers) {

        // Filter only hidden layers

        let layersCount = Object.keys(network.layers).length

        if (layerName > 0 && layerName < layersCount - 1) {

            let layer = network.layers[layerName]

            layer.addPerceptrons(hiddenPerceptronsNeed)
        }
    }

    // Create output perceptrons

    network.layers[layerCount - 1].addPerceptrons(opts.outputCount)

    //

    network.config()

    //

    bird.network = network
}

function moveUp(bird) {

    if (bird.y <= 0) return

    bird.y -= 1

    setPosition(bird)
}

function moveLeft(bird) {

    if (bird.x <= 0) return

    bird.x -= 1

    setPosition(bird)
}

function moveDown(bird) {

    if (bird.y >= gridSize - 1) return

    bird.y += 1

    setPosition(bird)
}

function moveRight(bird) {

    if (bird.x >= gridSize - 1) return

    bird.x += 1

    setPosition(bird)
}

function moveBird(bird) {

    switch (bird.direction) {

        case "up":

            moveUp(bird)
            break

        case "left":

            moveLeft(bird)
            break

        case "down":

            moveDown(bird)
            break

        case "right":

            moveRight(bird)
            break
    }
}


function changeDirection(bird) {

    let lastLayer = bird.network.layers[Object.keys(bird.network.layers).length - 1]

    // Loop through each perceptron in the lastLayer

    for (let perceptronName in lastLayer.perceptrons) {

        let perceptron = lastLayer.perceptrons[perceptronName]

        if (perceptron.activateValue > 0) continue

        //

        let option = options[Object.keys(options)[perceptronName]]

        option(bird)
    }
}

function getFoodArray() {

    let foodArray = []

    for (let foodID in objects.food) {

        let food = objects.food[foodID]

        foodArray.push(food)
    }

    return foodArray
}

function getBirdArray() {

    let birdArray = []

    for (let birdID in objects.bird) {

        let bird = objects.bird[birdID]

        birdArray.push(bird)
    }

    return birdArray
}

function findDistance(pos1, pos2) {

    let distance = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
    return distance
}

function findClosestFood(bird) {

    let foodArray = getFoodArray()

    // 

    let lowestValue = Math.min.apply(Math, foodArray.map(food => findDistance(food, bird)))

    bird.el.innerText = Math.floor(lowestValue)

    //

    let closestFood = foodArray.filter(food => findDistance(food, bird) == lowestValue)[0]

    return closestFood
}


function isBirdOnFood(bird, closestFood) {

    if (closestFood.x == bird.x && closestFood.y == bird.y) return true
}

function findBirdsWithMostScore(birds) {

    // 

    let bestBirds = []

    bestBirds = birds.sort((a, b) => b.score - a.score)

    bestBirds.filter(bird => bird.score > 0)

    bestBirds = bestBirds.slice(0, 10)

    return bestBirds
}

function findBestBirds(birds) {

    //

    let bestBirds = findBirdsWithMostScore(birds)
    if (bestBirds.length > 0) return bestBirds

    // Find bird closest to a food

    let birdsWithDistance = []

    for (let bird of birds) {

        let closestFood = findClosestFood(bird)

        let distance = Math.sqrt(Math.pow(closestFood.x - bird.x, 2) + Math.pow(closestFood.y - bird.y, 2))

        birdsWithDistance.push({ bird: bird, food: closestFood, distance: distance })
    }

    //

    bestBirdsWithDistance = birdsWithDistance.sort((a, b) => b.distance - a.distance)

    //

    bestBirdsWithDistance = bestBirdsWithDistance.slice(0, 10)

    //

    for (let object of bestBirdsWithDistance) {

        bestBirds.push(object.bird)
    }

    return bestBirds
}

function reproduce(bestBirds, birds, tick) {

    // Record stats

    generation++
    lastReset = tick

    if (score > bestScore) bestScore = score

    score = 0

    // Loop through layers

    for (let bird of birds) {

        // Delete el

        let el = bird.el
        el.remove()

        //

        bird.network.visualsParent.classList.remove("visualsParentShow")

        // Delete bird

        delete objects.bird[bird.id]
    }

    // Create new birds

    for (let i = 0; i < bestBirds.length; i++) {

        let bird = bestBirds[i]

        let childAmount = Math.floor(bestBirds.length / 10) * 10

        for (let i = 0; i < childAmount; i++) {

            let duplicateNetwork = _.cloneDeep(bird.network)
            duplicateNetwork.learn()

            generateBird({ network: duplicateNetwork, color: bird.color })
        }
    }
}

function findSprite(bird) {

    if (bird.velocity == 0) return document.getElementById("bird")
    if (bird.velocity < 0) return document.getElementById("birdUp")
    if (bird.velocity > 0) return document.getElementById("birdDown")
}

function movePipes() {

    for (let pipeID in objects.pipe) {

        let pipe = objects.pipe[pipeID]

        pipe.move({
            x: pipe.x - 0.5,
            y: pipe.y,
        })
    }
}

function updateUI() {

    // For each UI display update to current values

    let el

    el = document.getElementById("tick")
    el.innerText = tick

    el = document.getElementById("generation")
    el.innerText = generation

    el = document.getElementById("score")
    el.innerText = score

    el = document.getElementById("bestScore")
    el.innerText = bestScore
}

function run(opts) {

    setInterval(runTick, opts.tickSpeed)

    function runTick() {

        tick += 1

        movePipes()

        if (tick % 500 == 0) generatePipes()

        runBatch()

        updateUI()
    }

    function runBatch() {

        let birds = getBirdArray()

        for (let bird of birds) {

            // Apply gravity

            bird.velocity += 0.005

            // Move bird

            if (tick - 50 > bird.lastFlap) {

                bird.move({
                    x: bird.x,
                    y: bird.y + bird.velocity,
                    image: findSprite(bird),
                })
            }

            //

            document.addEventListener("keydown", moveBird)

            function moveBird(event) {

                let key = event.key

                if (key == "w") {

                    for (let birdID in objects.bird) {

                        let bird = objects.bird[birdID]

                        options.flap(bird, tick)
                    }
                }
            }

            //

            //

            /* let inputs = [bird.lastFlap - flapDelay, ]
            let outputCount = Object.keys(options).length */

            //

            /* if (!bird.network) createNetwork(bird, {
                inputCount: inputs.length,
                outputCount: outputCount,
            }) */

            //

            /* bird.network.run({ inputs: inputs }) */

            //
        }

        //

        /* let bestBird = findBestBird(birds)

        bestBird.network.visualsParent.classList.add("visualsParentShow")

        bestBird.network.updateVisuals()

        if (tick - lastReset >= gridSize * 4) {

            // Reproduce with closest bird

            reproduce(bestBird, birds, tick)
        } */
    }
}

function setPosition(bird) {

    let el = bird.el

    el.style.top = gridPartSize * bird.y + "px"
    el.style.left = gridPartSize * bird.x + "px"
}