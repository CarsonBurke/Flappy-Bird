let tick = 0
let generation = 0
let lastReset = 0
let bestScore = 0
let mostPipesPassed = 0

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

function findBirdsWithMostScore(birds) {

    // 

    let bestBirds = []

    bestBirds = birds.sort((a, b) => b.score - a.score)

    bestBirds.filter(bird => bird.score > 0)

    bestBirds = bestBirds.slice(0, 10)

    return bestBirds
}

function reproduce(bestBird, tick) {

    // Record stats

    generation++
    lastReset = tick

    // Delete all game objects

    for (let type in objects) {

        for (let objectID in objects[type]) {

            delete objects[type][objectID]
        }
    }

    createBackground()

    generatePipes()

    // Create new birds

    for (let i = 0; i < 100; i++) {

        const duplicateNetwork = _.cloneDeep(bestBird.network)
        duplicateNetwork.learn()

        createBird({ network: duplicateNetwork })
    }

    // Hide bestBird's visuals

    bestBird.network.visualsParent.classList.remove("visualsParentShow")

    // Delete bestBird

    delete objects.bird[bestBird.id]
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

    el = document.getElementById("mostPipesPassed")
    el.innerText = mostPipesPassed
}

function run(opts) {

    setInterval(runTick, opts.tickSpeed)

    function runTick() {

        tick += 1

        movePipes()

        // If tick is divisible by 750 spawn new pipes

        if (tick - lastReset >= 750 && tick % 750 == 0) generatePipes()

        runBatch()

        updateObjectPositions()

        updateUI()
    }

    function runBatch() {

        const birds = Object.values(objects.bird)

        for (const bird of birds) {

            // Stop loop if there is only 1 bird

            if (Object.keys(objects.bird).length == 1) break

            // Assign score

            bird.score += 1

            // Apply gravity

            bird.velocity += 0.005

            // Regulate max acceleration

            let maxSpeed = 1.2

            // If birds velocity is greater or equal to maxSpeed set to maxSpeed

            if (bird.velocity >= maxSpeed) bird.velocity = maxSpeed

            function findClosestPipe() {

                for (let pipeID in objects.pipe) {

                    const pipe = objects.pipe[pipeID]

                    // Iterate if pipe is behind bird

                    if (pipe.x + pipe.width < bird.x) continue

                    // Return the pipe

                    return pipe
                }
            }

            //

            const closestTopPipe = findClosestPipe()

            //

            /* const inputs = [bird.y, closestTopPipe.y + closestTopPipe.height + map.el.height, bird.velocity] */
            const inputs = [bird.y, gapHeight - (map.el.height + closestTopPipe.y), (bird.x + bird.width) - closestTopPipe.x]
            const outputCount = Object.keys(options).length

            //

            if (!bird.network) createNetwork(bird, inputs.length, outputCount)

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

            //

            function isBirdInsidePipe(pipe) {

                if (bird.x > pipe.x + pipe.width) return

                if (bird.x + bird.width < pipe.x) return

                if (pipe.pipeType == 'top') {

                    if (bird.y > pipe.y + pipe.height) return
                    return true
                }
                if (pipe.pipeType == 'bottom') {

                    if (bird.y + bird.height < pipe.y) return
                    return true
                }
            }

            // apply pipe hitboxes

            for (let pipeID in objects.pipe) {

                const pipe = objects.pipe[pipeID]

                // If pipe hasn't been recorded as passed and is passed

                if (!pipe.passed && bird.x > pipe.x + pipe.width) {

                    // Increase bird's pipePassed

                    bird.pipesPassed += 0.5

                    // Record pipe as passed

                    pipe.passed = true
                }

                if (isBirdInsidePipe(pipe)) {

                    delete objects.bird[bird.id]
                }
            }
        }

        //

        const visibleVisualParents = document.getElementsByClassName('visualsParentShow')

        for (const visibleVisualParent of visibleVisualParents) {

            visibleVisualParent.classList.remove('visualsParentShow')
        }

        //

        const bestBird = findBestBird(birds)

        if (bestBird.pipesPassed > mostPipesPassed) mostPipesPassed = bestBird.pipesPassed

        // Assign bird's score to bestScore if bird's score is better

        if (bestBird.score > bestScore) bestScore = bestBird.score

        bestBird.network.visualsParent.classList.add("visualsParentShow")

        bestBird.network.updateVisuals()

        if (birds.length == 1) {

            // Reproduce with alive bird

            reproduce(bestBird, tick)
        }
    }
}