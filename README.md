# Snake

A tiny dependency-free Snake game built as a static browser app.

## Run

Open `index.html` in a browser, or serve the folder with a simple static server such as:

```powershell
py -m http.server 8000
```

Then open `http://localhost:8000`.

## Manual verification

- Start the game and confirm Arrow keys / WASD change direction.
- Confirm the snake grows and the score increments after eating food.
- Confirm the game ends when the snake hits a wall or itself.
- Confirm `Pause` or `Space` / `P` pauses and resumes the loop.
- Confirm `Restart` resets score, snake size, and food placement.
