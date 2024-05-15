The Simon Sequence Game is a web-based application that recreates the classic Simon memory game. Players are challenged to remember and replicate sequences of button presses, with each round becoming progressively more difficult. This game is implemented using JavaScript and leverages the SimpleKit library for event handling and animations which was created by professor Daniel Vogel at the University of Waterloo.

Features:

    Interactive Gameplay:
        - Players interact with colored circles that represent the buttons in the Simon game.
        - The game generates a sequence of button presses that the player must replicate.
    
    Visual Feedback:
        - Circles highlight and expand in size to indicate which button is being pressed.

    Dynamic Difficulty:
        - The sequence length increases with each successful round, adding complexity and challenge.
        - The number of possible selections in the sequence can also be increased or decreased by pressing '+' or '-'

    User Input Handling:
        - Supports various input methods including mouse clicks and long presses.
        - Displays messages to guide the player through the game, indicating turns and outcomes.

    Animations:
        - Smooth animations for button presses and visual feedback.
        - Customizable animations for different game states (e.g., winning, losing).

    Cheat Mode:
        - A cheat mode that displays the current sequence for debugging or practice purposes.
        - Can activate the "Cheat" mode by typing '?'