let options = {
    rotateCounterClockwise(snake) {

        switch (snake.direction) {

            case "up":

                snake.direction = "left"
                break

            case "left":

                snake.direction = "down"
                break

            case "down":

                snake.direction = "right"
                break

            case "right":

                snake.direction = "up"
                break
        }
    },
    rotateClockwise(snake) {

        switch (snake.direction) {

            case "up":

                snake.direction = "right"
                break

            case "left":

                snake.direction = "up"
                break

            case "down":

                snake.direction = "left"
                break

            case "right":

                snake.direction = "down"
                break
        }
    },
}