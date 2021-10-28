let idIndex = 0

function newID() {

    // Increment idIndex and return the result

    return idIndex += 1
}

let defaults = {
    learningRate: 0.1,
    bias: 0,
}

class Line {
    constructor(opts) {

        // Assign opts

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }

        // Create element

        let x1 = Math.floor(this.perceptron1.visual.getBoundingClientRect().left)
        let y1 = Math.floor(this.perceptron1.visual.getBoundingClientRect().top)

        let x2 = Math.floor(this.perceptron2.visual.getBoundingClientRect().left)
        let y2 = Math.floor(this.perceptron2.visual.getBoundingClientRect().top)

        let el = document.createElementNS('http://www.w3.org/2000/svg', 'line')

        el.setAttribute('x1', x1 + this.perceptron1.visual.offsetWidth / 2 - this.network.visualsParent.getBoundingClientRect().left)
        el.setAttribute('y1', y1 + this.perceptron1.visual.offsetHeight / 2 - this.network.visualsParent.getBoundingClientRect().top)
        el.setAttribute('x2', x2 + this.perceptron2.visual.offsetWidth / 2 - this.network.visualsParent.getBoundingClientRect().left)
        el.setAttribute('y2', y2 + this.perceptron2.visual.offsetHeight / 2 - this.network.visualsParent.getBoundingClientRect().top)

        el.classList.add("line")

        this.network.svg.appendChild(el)
        this.el = el
    }
}

class Perceptron {
    constructor(opts) {

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }
    }
    mutateWeights() {

        // Randomly adjust a value by a set amount

        function mutate(value, amount) {

            // Decide if to subract or add

            let boolean = Math.floor(Math.random() * 2)

            // Random amount to mutate

            let mutation = Math.random() * amount

            // Apply mutation

            if (boolean == 0) value += Math.random() * mutation
            if (boolean == 1) value -= Math.random() * mutation

            return value
        }

        // Mutate weights

        let newWeights = []

        for (let weight of this.weights) newWeights.push(mutate(weight, this.learningRate))

        this.weights = newWeights
    }
    createWeights() {

        // Create one weight perceptron in previous layer

        this.weights = []

        // Find previous layer

        let iterations = this.inputs.length

        // If perceptron's layerName is more than 0

        if (this.layerName > 0) {

            // Find previous layer

            const previousLayer = this.network.layers[this.layerName - 1]

            // Find number of perceptrons in previous layer

            let previousLayerPerceptronCount = Object.keys(previousLayer.perceptrons).length
            
            // Account for bias

            previousLayerPerceptronCount += 1

            // Change iterations to number of perceptrons in previous layer
            
            iterations = previousLayerPerceptronCount
        }

        // Iterate for number of perceptrons in previous layer

        for (let i = 0; i < iterations; i++) {

            // Get a random value relative to the size of learningRate

            let value = Math.random() * this.learningRate

            // Add value to weights

            this.weights.push(value)
        }
    }
    updateWeights() {

        // Reset weight results

        this.weightResults = []

        let i = 0

        for (let input of this.inputs) {

            // Find weight corresponding to input

            const weight = this.weights[i]

            // Assign weight to input and add value to weightResults

            this.weightResults.push(input * weight)

            i++
        }
    }
    applyWeights() {

        // If no weights exist create them

        if (!this.weights) this.createWeights()

        // Update weightResults to match inputs

        this.updateWeights()
    }
    transfer() {

        this.transferValue = 0

        for (let weightResult of this.weightResults) this.transferValue += weightResult
    }
    activate() {

        this.activateValue = Math.max(this.transferValue, 0)
    }
    run(opts) {

        // Assign opts to usable values

        let importantValues = opts.importantValues

        for (let valueName in importantValues) {

            this[valueName] = importantValues[valueName]
        }

        this.inputs = opts.inputs

        // Run commands to take inputs into an end result

        this.applyWeights()

        this.transfer()

        this.activate()
    }
}

class Layer {
    constructor(opts) {

        for (let propertyName in opts) {

            this[propertyName] = opts[propertyName]
        }

        this.lines = {}
    }
    addPerceptron() {

        // Set the requested layer to have the requested inputs

        let layer = this

        // Find number of perceptrons in this layer

        let perceptronCount = Object.keys(layer.perceptrons).length

        // Create and add new perceptron to the layer

        layer.perceptrons[perceptronCount] = new Perceptron({
            network: this.network,
            layerName: this.name,
        })
    }
}

class NeuralNetwork {
    constructor(opts) {

        // Assign default values

        for (let valueName in defaults) {

            this[valueName] = defaults[valueName]
        }

        this.layers = {}


        // Assign opts

        for (let valueName in opts) {

            this[valueName] = opts[valueName]
        }
    }
    addLayer(opts) {

        let layersCount = Object.keys(this.layers).length

        this.layers[layersCount] = new Layer({
            network: this,
            name: layersCount,
            perceptrons: opts.perceptrons || {},
        })

        return this.layers[layersCount]
    }
    getImportantValues() {

        let values = {}

        for (let valueName in defaults) {

            values[valueName] = this[valueName]
        }

        return values
    }
    forwardPropagate(inputs) {

        let network = this

        function findInputs(layerName, perceptron) {

            let newInputs = [network.bias]

            // If in first layer

            if (layerName == 0) {

                // Add values from default inputs

                for (let number of inputs) newInputs.push(number)

                return newInputs
            }

            const previousLayer = network.layers[layerName - 1]

            for (const lineID in previousLayer.lines) {

                const line = previousLayer.lines[lineID]

                // Iterate if line's output perceptron isn't this perceptron

                if (line.perceptron2 != perceptron) continue

                // If line is connected

                if (line.connected) {

                    // Add line's perceptron activateValue to inputs

                    newInputs.push(line.perceptron1.activateValue)
                    continue
                }

                // Add 0 to newInputs

                newInputs.push(0)
            }
            
            return newInputs
        }

        // Loop through layers

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (let perceptronName in layer.perceptrons) {

                let perceptron = layer.perceptrons[perceptronName]

                // Run the perceptron

                perceptron.run({
                    importantValues: this.getImportantValues(),
                    inputs: findInputs(layerName, perceptron),
                })
            }
        }
    }
    learn() {

        // Loop through layers in network

        for (const layerName in this.layers) {

            const layer = this.layers[layerName]

            // Loop through perceptrons in the layer

            for (const perceptronName in layer.perceptrons) {

                const perceptron = layer.perceptrons[perceptronName]

                // Mutate perceptron

                perceptron.mutateWeights()
            }

            // Loop through lines in layer

            for (const lineID in layer.lines) {

                const line = layer.lines[lineID]

                this.mutateLine(line)
            }
        }

        return this
    }
    createVisuals() {

        if (this.visualsParent) return

        // Create visuals parent

        let visualsParent = document.createElement("div")

        visualsParent.classList.add("visualsParent")

        visualsParent.style.width = Object.keys(this.layers).length * 80 + "px"

        document.body.appendChild(visualsParent)
        this.visualsParent = visualsParent

        // Create svg

        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

        svg.classList.add("lineParent")

        this.visualsParent.appendChild(svg)
        this.svg = svg

        // Loop through each layer

        for (let layerName in this.layers) {

            let layer = this.layers[layerName]

            // make sure there isn't already a visual

            if (layer.visual) continue

            // Create visuals for the layer

            let layerVisual = document.createElement("div")

            layerVisual.classList.add("layerVisual")

            this.visualsParent.appendChild(layerVisual)
            layer.visual = layerVisual

            // loop through perceptrons in the layer

            for (let perceptron1Name in layer.perceptrons) {

                let perceptron1 = layer.perceptrons[perceptron1Name]

                // Create visuals for the perceptron

                let perceptronVisual = document.createElement("div")

                perceptronVisual.classList.add("perceptronVisual")

                // Colour first and last perceptrons

                if (layerName == 0) {

                    perceptronVisual.classList.add("inputPerceptron")

                } else if (layerName == Object.keys(this.layers).length - 1) {

                    perceptronVisual.classList.add("outputPerceptron")
                }

                //

                layer.visual.appendChild(perceptronVisual)
                perceptron1.visual = perceptronVisual
            }
        }

        this.createLines()
    }
    createLines() {

        for (const layerName in this.layers) {

            const layer = this.layers[layerName]

            // loop through perceptrons in the layer

            for (const perceptron1Name in layer.perceptrons) {

                const perceptron1 = layer.perceptrons[perceptron1Name]

                // Find layer after this one

                const proceedingLayer = this.layers[parseInt(layerName) + 1]

                if (!proceedingLayer) continue

                // Loop through each perceptron in the next layer and draw a line

                for (const perceptron2Name in proceedingLayer.perceptrons) {

                    const perceptron2 = proceedingLayer.perceptrons[perceptron2Name]

                    const lineID = newID()

                    const line = layer.lines[lineID] = new Line({
                        network: this,
                        perceptron1: perceptron1,
                        perceptron2: perceptron2,
                        id: lineID
                    })

                    line.connected = true
                    line.el.classList.add('lineShow')

                    this.mutateLine(line)
                }
            }
        }
    }
    mutateLine(line) {

        // Get random value influenced by learning rate

        let value = Math.random() * 5 / this.learningRate

        // Stop if value is more than 1

        if (value > 1) return

        // Decide if to subract or add

        let boolean = Math.floor(Math.random() * 2)

        // Enable line if 0

        if (boolean == 0) {
            
            // Stop if line is already connected

            if (line.connected) return

            // Show line element

            line.el.classList.add('lineShow')

            // Record that the line is connected

            line.connected = true
            return
        }

        // Disable line if 1

        if (boolean == 1) {

            // Stop if line is already not connected

            if (!line.connected) return

            // Hide line element

            line.el.classList.remove('lineShow')

            // Record that the line is disconnected

            line.connected = false
            return
        }
    }
    updateLine(line) {

        let el = line.el

        if (line.connected && line.perceptron1.activateValue > 0) {

            el.classList.add("lineConnected")
        } else el.classList.remove("lineConnected")
    }
    updateVisuals() {

        for (const layerName in this.layers) {

            const layer = this.layers[layerName]

            // Loop through perceptrons in the layer

            for (const perceptron1Name in layer.perceptrons) {

                const perceptron1 = layer.perceptrons[perceptron1Name]

                // Show perceptrons activateValue

                perceptron1.visual.innerText = (perceptron1.activateValue).toFixed(2)
            }

            // Loop through lines in layer

            for (const lineID in layer.lines) {

                const line = layer.lines[lineID]

                this.updateLine(line)
            }
        }
    }
}