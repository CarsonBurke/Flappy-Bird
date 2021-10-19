let options = {
    flap(bird, tick) {

        // Return if the bird has flapped too recently

        if (bird.lastFlap + flapDelay > tick) return

        // Record that the bird has flapped

        bird.lastFlap = tick

        // Set birds velocity lowest of 0 or itself

        bird.velocity = Math.min(bird.velocity, 0)

        // Limit iterations

        let i = 15

        //

        setInterval(function() {

            if (i <= 0) return

            bird.velocity -= i / 100

            i--
        }, 10)
    }
}