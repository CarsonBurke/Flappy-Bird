let tick = 0
let generation = 0
let lastReset = 0
let bestScore = 0

function createNetwork(bird, inputCount, outputCount) {

    // Create neural network

    let network = new NeuralNetwork()

    // Create layers

    let layerCount = 3

    for (let i = 0; i < layerCount; i++) network.addLayer({})

    // Create perceptrons

    // Create input perceptrons

    for (let i = 0; i < inputCount; i++) network.layers[0].addPerceptron()

    // Create hidden perceptrons

    let hiddenPerceptronsNeed = 5

    // Loop through layers

    for (let layerName in network.layers) {

        // Filter only hidden layers

        let layersCount = Object.keys(network.layers).length

        if (layerName > 0 && layerName < layersCount - 1) {

            let layer = network.layers[layerName]

            for (let i = 0; i < hiddenPerceptronsNeed; i++) layer.addPerceptron()
        }
    }

    // Create output perceptrons

    for (let i = 0; i < outputCount; i++) network.layers[layerCount - 1].addPerceptron()

    //

    network.createVisuals()

    //

    bird.network = network
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

function findBestBird(birds) {

    const bestBirds = birds.sort(function(a, b) { a.score - b.score })
    return bestBirds[0]
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
            x: pipe.x - 0.4,
            y: pipe.y,
        })

        // If pipe is to the left of the canvas delete it

        if (pipe.x + pipe.width < 0) delete objects.pipe[pipeID]
    }
}

function updateObjectPositions() {

    // Clear canvas

            // Store the current transformation matrix
            map.cr.save()

            // Use the identity matrix while clearing the canvas
            map.cr.setTransform(1, 0, 0, 1, 0, 0)
            map.cr.clearRect(0, 0, map.el.width, map.el.height)
    
            // Restore the transform
            map.cr.restore()

    // re-draw all objects

    reDrawAll()
}

function updateUI() {

    // For each UI display update to current values

    let el

    el = document.getElementById("tick")
    el.innerText = tick

    el = document.getElementById("generation")
    el.innerText = generation

    el = document.getElementById("bestScore")
    el.innerText = bestScore
}

function run(opts) {

    setInterval(runTick, opts.tickSpeed)

    function runTick() {

        tick += 1

        movePipes()

        // If tick is divisible by 750 spawn new pipes

        if (tick % 750 == 0) generatePipes()

        runBatch()

        updateObjectPositions()

        updateUI()
    }

    function runBatch() {

        let birds = getBirdArray()

        for (let bird of birds) {

            // Stop loop if there is only 1 bird

            if (Object.keys(objects.bird).length == 1) break

            // Apply gravity

            bird.velocity += 0.004

            // Regulate max acceleration

            let maxSpeed = 1.2

            // If birds velocity is greater or equal to maxSpeed set to maxSpeed

            if (bird.velocity >= maxSpeed) bird.velocity = maxSpeed

            // See if bird has passed pipes

            for (let pipeID in objects.pipe) {

                const pipe = objects.pipe[pipeID]
                
                // Iterate is pipe is recorded passed

                if (pipe.passed) continue

                // If pipe was just passed

                if (pipe.x + pipe.width < bird.x) {

                    // Record the pipe is passed
                    
                    pipe.passed = true

                    // Increase bird's score

                    bird.score += 0.5
                }
            }

            function findClosestPipe() {

                for (let pipeID in objects.pipe) {

                    const pipe = objects.pipe[pipeID]

                    // Iterate if pipe is behind bird

                    if (pipe.passed) continue

                    // Return the pipe

                    return pipe
                }
            }

            //

            const closestTopPipe = findClosestPipe()

            //

            const inputs = [bird.y, gapHeight / 2 - (map.el.height + closestTopPipe.y)]
            const outputCount = Object.keys(options).length

            //

            if (!bird.network) createNetwork(bird,  inputs.length, outputCount)

            //

            bird.network.forwardPropagate(inputs)

            //

            const lastLayer = bird.network.layers[Object.keys(bird.network.layers).length - 1]

            // Loop through each perceptron in the lastLayer
        
            for (let perceptronName in lastLayer.perceptrons) {
        
                let perceptron = lastLayer.perceptrons[perceptronName]
        
                if (perceptron.activateValue <= 0) continue
        
                //
        
                options.flap(bird, tick)
                break
            }

            // Move bird based on velocity

            bird.move({
                x: bird.x,
                y: bird.y + bird.velocity,
                image: findSprite(bird),
            })

            // Apply map hitboxes

            if (bird.x == 0) delete objects.bird[bird.id]
            if (bird.x + bird.width == map.el.width) delete objects.bird[bird.id]
            if (bird.y == 0) delete objects.bird[bird.id]
            if (bird.y + bird.height >= map.el.height) delete objects.bird[bird.id]

            // apply pipe hitboxes

            for (let pipeID in objects.pipe) {

                const pipe = objects.pipe[pipeID]

                if (pipe.pipeType == 'top') {

                    // If bird is inside pipe

                    if (bird.x >= pipe.x && bird.x <= pipe.x + pipe.width && bird.y <= map.el.height + pipe.y) {

                        // Delete bird

                        delete objects.bird[bird.id]
                    }

                    continue
                }
                if (pipe.pipeType == 'top') {

                    // If bird is inside pipe

                    if (bird.x >= pipe.x && bird.x <= pipe.x + pipe.width && bird.y >= map.el.height + pipe.y) {

                        // Delete bird

                        delete objects.bird[bird.id]
                    }                    
                }
            }
        }

        //

        let bestBird = findBestBird(birds)

        // Assign bird's score to bestScore if bird's score is better

        if(bird.score > bestScore) bestScore = bestBird.score

        bestBird.network.visualsParent.classList.add("visualsParentShow")

        bestBird.network.updateVisuals()

        /* if (birds.length == 1) {

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