let options = {
    flap(bird, tick) {

        // Return if the bird has flapped too recently

        if (bird.lastFlap + flapDelay > tick) return

        // Record that the bird has flapped

        bird.lastFlap = tick

        // Set birds velocity lowest of 0 or itself

        if (bird.velocity > 0) bird.velocity = 0

        // Add onto birds velocity at decreasing amounts

        for (let i = 10; i > 0; i--) {

            bird.velocity -= i / 100
        }
    }
}