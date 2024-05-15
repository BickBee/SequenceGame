// Imports
import { 
  startSimpleKit,
  setSKDrawCallback,
  setSKEventListener, 
  SKEvent, 
  SKResizeEvent, 
  SKMouseEvent, 
  SKKeyboardEvent, 
  setSKAnimationCallback, 
  addSKEventTranslator
} from "../../simplekit";
import { SimonLogic } from "./simonlogic";
import { FundamentalEvent } from "../../simplekit/create-loop";

// Helper Functions
function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function square(x : number) {
  return x*x;
}

// Longpress Translator
const longpressTranslator = {
  state: "IDLE",
  movementThreshold: 50,
  timeThreshold: 1000, // milliseconds
  // for tracking thresholds
  startX: 0,
  startY: 0,
  startTime: 0,

  // returns a click event if found
  update(fe: FundamentalEvent): SKMouseEvent | undefined {
    switch (this.state) {
      case "IDLE":
        if (fe.type == "mousedown") {
          this.state = "DOWN";
          this.startX = fe.x || 0;
          this.startY = fe.y || 0;
          this.startTime = fe.timeStamp;
        }
        break;

      case "DOWN":
        if (fe.timeStamp - this.startTime > this.timeThreshold) {
            this.state = "IDLE";
            return new SKMouseEvent("longpress", fe.timeStamp, fe.x || 0, fe.y || 0);
        } else if (fe.type == "mouseup") {
          this.state = "IDLE";
        } else if (fe.x && fe.y && distance(fe.x, fe.y, this.startX, this.startY) > this.movementThreshold) {
          this.state = "IDLE";
        }
        break;
    }
    return;
  },
};
addSKEventTranslator(longpressTranslator);

// Timers
class BasicTimer {
  constructor(public duration: number) {}

  private startTime: number | undefined;

  start(time: number) {
    this.startTime = time;
    this._isRunning = true;
  }

  get isRunning() {
    return this._isRunning;
  }
  _isRunning = false;
  ran_for : number = 0;

  update(time: number) {
    if (!this._isRunning || this.startTime === undefined) return;

    this.ran_for = time - this.startTime;
    if (this.ran_for < 0) {
      this.ran_for = 0;
    }
    const elapsed = time - this.startTime;
    if (elapsed > this.duration) {
      this.startTime = undefined;
      this._isRunning = false;
    }
  }
}

class CallbackTimer extends BasicTimer {
  constructor(public duration: number, public callback: (t: number) => void) {
    super(duration);
  }

  update(time: number) {
    if (this.isRunning) {
      super.update(time);
      // if state switches from running to not running, call the callback
      if (!this.isRunning) {
        this.callback(time);
      }
    }
  }
}

// Circle Class
class Circle {
  x : number;
  y: number;
  radius: number;
  num: number;
  highlight: boolean;

  constructor(x: number, y: number, num: number, radius: number)
  {
    this.x = x;
    this.y = y;
    this.num = num;
    this.highlight = false;
    this.radius = radius;
  }
}

// Event Handler
function handleEvent(e: SKEvent) {
  switch (e.type) {
    case "mousedown":
      //console.log("Mousedown");
      break;
    case "mouseup":
      //console.log("Mouseup");
      break;
    case "longpress":
      //console.log("longpress");
      if (simon.state === "HUMAN") {
        button_to_increase = current_sequence[0] - 1;
        animate_once = true;
        setSKAnimationCallback(func_diameter_increase);
        increase_diameter_animation.start(e.timeStamp);
      }
      break;
    case "mousemove":
      const point2 = e as SKMouseEvent;
      for (let i = 0; i < circle_arr.length; ++i) {
        if (simon.state === "HUMAN" && square(60) > square(circle_arr[i].y - point2.y) + square(circle_arr[i].x - point2.x)) {
          console.log(`Circle ${i+1} Hovered!`);
          circle_arr[i].highlight = true;
        } else {
          circle_arr[i].highlight = false;
        }
      }
      break;
    case "click":
      const point = e as SKMouseEvent;
      for (let i = 0; i < circle_arr.length; ++i) {
        if (square(60) > square(circle_arr[i].y - point.y) + square(circle_arr[i].x - point.x)) {
          //console.log(`Circle ${i+1} Hit!`);
          let button_pressed = i;
          if (simon.state === "HUMAN") {
            if (button_to_increase >= 0 && button_to_increase < circle_arr.length) {
              circle_arr[button_to_increase].radius = 60;
            }
            button_to_increase = button_pressed;
            animate_once = true;
            setSKAnimationCallback(func_diameter_increase);
            increase_diameter_animation.start(e.timeStamp);
            if (simon.verifyButton(button_pressed)) { // If button is correctly pressed
              if (simon.state === "WIN") {
                bottom_message = "You won! Press SPACE to continue";
                simon.newRound();
                start_wave = true;
              } else {
                const [,...temp_sequence] = current_sequence;
                current_sequence = temp_sequence;
                if (cheating) {
                  bottom_message = `${current_sequence}`;
                }
              }
            } else { // If button is incorrectly pressed
              bottom_message = "You lose. Press SPACE to play again";
              simon = new SimonLogic();
              simon.buttons = circle_arr.length;
              simon.newRound();
              start_loss = true;
            }
          }
        }
      }
      break;
    case "drag":
    case "dblclick":
      // const { x, y } = e as SKMouseEvent;
      // console.log(`${e.type} (${x}, ${y}) at ${e.timeStamp} `);
      break;
    case "keydown":
      break;
    case "keyup":
      break;
    case "keypress":
      const { key } = e as SKKeyboardEvent;
      // console.log(`${e.type} '${key}' at ${e.timeStamp} ${simon.state} ${increase_diameter_animation.isRunning}`);
      if (key === 'q') {
        bottom_message = "Press SPACE to play";
        simon = new SimonLogic();
        simon.buttons = circle_arr.length;
        simon.newRound();
        increase_diameter_animation._isRunning = false;
        setSKAnimationCallback(wave_function);
      } else if (key === ' ' && simon.state === "COMPUTER" && !increase_diameter_animation.isRunning) {
        resize = true;
        setSKAnimationCallback(func_diameter_increase);
        bottom_message = "Watch what I do …";
        current_sequence = [];
        if (simon.state === "COMPUTER") {
          button_to_increase = simon.nextButton();
          current_sequence.push(button_to_increase + 1);
          increase_diameter_animation.start(e.timeStamp); // Do radius growth animation
        }
      } else if (key === '+' && simon.state === "COMPUTER" && circle_arr.length < 10) {
        circle_arr.push(new Circle(0, 0, circle_arr.length + 1, 60));
        change_num_of_circles = true;
        bottom_message = "Press SPACE to play";
        simon = new SimonLogic();
        simon.buttons = circle_arr.length;
        simon.newRound();
        increase_diameter_animation._isRunning = false;
        setSKAnimationCallback(wave_function);
      } else if (key === '-' && simon.state === "COMPUTER" && circle_arr.length > 1) {
        circle_arr.pop();
        change_num_of_circles = true;
        bottom_message = "Press SPACE to play";
        simon = new SimonLogic();
        simon.buttons = circle_arr.length;
        simon.newRound();
        increase_diameter_animation._isRunning = false;
        setSKAnimationCallback(wave_function);
      } else if (key === '?') {
        cheating = !cheating;
      }
      break;
    case "resize":
      const { width: w, height: h } = e as SKResizeEvent;
      // console.log(`${e.type} (${w}, ${h}) at ${e.timeStamp} `);
      canvas_height = h;
      resize = true;
      break;
  }
}

// Circle Diameter Increase 25% Animation Callback
function func_diameter_increase (time: number) {
  increase_diameter_animation.update(time);
  if (increase_diameter_animation.isRunning) {
    if (increase_diameter_animation.ran_for <= 500) {
      circle_arr[button_to_increase].radius = 60 + (60 * 0.25 * (increase_diameter_animation.ran_for / 500));
    } else {
      circle_arr[button_to_increase].radius = 60;
    }
  }
}

// Wave Function Animation Callback
function wave_function (time: number) {
  const theta = time / 300;
  for (let i = 0; i < circle_arr.length; ++i) {
    circle_arr[i].y = canvas_height/2.4 + canvas_height/8 * Math.sin(theta - i);
  }
}

// Loss Function Animation Callback
function loss_function (time: number) {
  for (let i = 0; i < circle_arr.length; ++i) {
    circle_arr[i].y = circle_arr[i].y + 10;
  }
}

// START MAIN CODE
startSimpleKit();

// Variables
let bottom_message = "Press SPACE to play";
let current_sequence: number[] = [];
let simon = new SimonLogic();
let resize = false;
let button_to_increase = -1;
simon.newRound();
let canvas_height = 0;
let cheating = false;
let circle_arr: Circle[] = [];
let change_num_of_circles = false;
let animate_once = false;
let start_wave = false;
let start_loss = false;
circle_arr.push(new Circle(0, 0, 1, 60));
circle_arr.push(new Circle(0, 0, 2, 60));
circle_arr.push(new Circle(0, 0, 3, 60));
circle_arr.push(new Circle(0, 0, 4, 60));
setSKAnimationCallback(wave_function);

const increase_diameter_animation = new CallbackTimer(1000, (t) => {
  //console.log(`Timer Callback: ${t}`);
  circle_arr[button_to_increase].radius = 60;
  increase_diameter_animation.ran_for = 0;
  if (animate_once && start_wave) {
    animate_once = false;
    start_wave = false;
    setSKAnimationCallback(wave_function);
    return;
  } else if (animate_once && start_loss) {
    animate_once = false;
    start_wave = false;
    setSKAnimationCallback(loss_function);
    return;
  } else if (animate_once) {
    animate_once = false;
    return;
  }

  if (simon.state === "COMPUTER") {
    bottom_message = "Watch what I do …";
    button_to_increase = simon.nextButton();
    current_sequence.push(button_to_increase + 1);
    increase_diameter_animation.start(t + 500); // Do radius growth animation
  } else {
    if (cheating && simon.state === "HUMAN") {
      bottom_message = `${current_sequence}`;
    } else {
      bottom_message = "Now it’s your turn";
    }
  }
});

// Draw Callback (Only place where we draw to canvas)
setSKDrawCallback((gc, time) => {
  gc.clearRect(0, 0, gc.canvas.width, gc.canvas.height);

  // Draw Text
  gc.font = "32pt sans-serif";
  gc.fillStyle = "blue";
  gc.textAlign = "center";
  gc.textBaseline = "middle";
  gc.fillText(`Score ${simon.score}`, gc.canvas.width/2, (gc.canvas.height/2.4)*0.4);
  gc.fillText(`${bottom_message}`, gc.canvas.width/2, (gc.canvas.height/2.4)*1.6);

  // Update Circles
  if (resize || change_num_of_circles) {
    for (let i = 0; i < circle_arr.length; ++i) {
      circle_arr[i].x = i * (gc.canvas.width/circle_arr.length) + (gc.canvas.width/circle_arr.length)/2;
      circle_arr[i].y = gc.canvas.height/2.4;
    }
    resize = false;
    change_num_of_circles = false;
  }

  // Draw Circles
  gc.strokeStyle= "yellow";
  gc.lineWidth = 10;
  for (let i = 0; i < circle_arr.length; ++i) {
    gc.fillStyle = `hsl(${i * 360 / circle_arr.length}deg 80% 50%)`;
    gc.beginPath();
    gc.arc(circle_arr[i].x, circle_arr[i].y, circle_arr[i].radius, 0, 2 * Math.PI);
    if (circle_arr[i].highlight) {
      gc.stroke();
    }
    gc.fill();

    gc.fillStyle = "black";
    gc.fillText(`${circle_arr[i].num}`, circle_arr[i].x, circle_arr[i].y);
  }

  // Cheating Text
  if (cheating) {
    gc.font = "16pt sans-serif";
    gc.fillStyle = "grey";
    gc.textAlign = "right";
    gc.textBaseline = "bottom";
    gc.fillText("CHEATING", gc.canvas.width, gc.canvas.height);
    if (simon.state === "HUMAN" && !increase_diameter_animation.isRunning) {
      bottom_message = `${current_sequence}`;
    }
  } else {
    if (simon.state === "HUMAN" && !increase_diameter_animation.isRunning) {
      bottom_message = "Now it’s your turn";
    }
  }
});

// Set Event Handler
setSKEventListener(handleEvent);
