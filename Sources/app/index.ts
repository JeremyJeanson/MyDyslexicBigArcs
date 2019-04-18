import document from "document";
import * as util from "./simple/utils";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const container = document.getElementById("container") as GraphicsElement;
const background = document.getElementById("background") as RectElement;
const batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;

// Date
const dateContainer = document.getElementById("date-container") as GraphicsElement;
const dates = dateContainer.getElementsByTagName("image") as ImageElement[];

// Hours
const cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];

// Battery
const batteryValue = document.getElementById("battery-bar-value") as GradientRectElement;

// Stats
// const arcSteps = document.getElementById("arc-steps") as ArcElement;
// const stepsAchivement = document.getElementById("steps-achivement-container") as GraphicsElement;
const stepsContainer = document.getElementById("steps-container") as GraphicsElement;

// Heart rate management
const hrmContainer = document.getElementById("hrm-container") as GroupElement;
const iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const imgHRM = document.getElementById("icon") as ImageElement;
const hrmTexts = document.getElementById("hrm-text-container") .getElementsByTagName("image") as ImageElement[];

// Stats
const _arcsContainer = document.getElementById("arcs-container") as GraphicsElement;
const stats = _arcsContainer.getElementsByTagName("svg") as GraphicsElement[];

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("seconds", (hours, mins, date) => {
  // hours="21";
  // mins="38";
  // date = "17 jan";
  // Hours
  if(hours) {
    cloks[0].href = util.getImageFromLeft(hours,0);
    cloks[1].href = util.getImageFromLeft(hours,1);
  }

  // Minutes
  if(mins) {    
    cloks[3].href = util.getImageFromLeft(mins,0);
    cloks[4].href = util.getImageFromLeft(mins,1);  
  }

  // Date
  if(date) {
    // Position
    dateContainer.x = (device.screen.width) - (date.length * 20);
    // Values
    for(let i=0; i<dates.length; i++){
      dates[i].href = util.getImageFromLeft(date, i);
    }
  }

    // update od stats
    UpdateActivities();
});

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/power-battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  let batteryString = battery.toString() + "%";
  // Battery bar
  batteryValue.width = Math.floor(battery) * device.screen.width / 100;
});
// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "./simple/device-settings";

simpleSettings.initialize((settings:any) => {
  if (!settings) {
    return;
  }

  if (settings.colorBackground) {
    background.style.fill = settings.colorBackground;
    batteryBackground.gradient.colors.c2 = settings.colorBackground;
    UpdateActivities(); // For achivement color
  }

  if (settings.colorForeground) {
    container.style.fill = settings.colorForeground;
  }

  if (settings.showBatteryBar !== undefined) {
    _batteryBarContainer.style.display = settings.showBatteryBar === true
      ? "inline"
      : "none";
  }
});
// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------
import { goals,today } from "user-activity";
import { me as appbit } from "appbit";

// Detect limitations of versa light
const _elevationIsAvailablle = appbit.permissions.granted("access_activity")
  && today.local.elevationGain !== undefined;

let lastStepsGoals=-1;
let lastSteps=-1;

// When goals are reached
goals.onreachgoal = (evt)=>{
  UpdateActivities();
};

// Update Style when elevation isnot available
if(!_elevationIsAvailablle){
  // Hide the elevation informations
  stats[1].style.display = "none";

  // Move arc uper
  _arcsContainer.y = 10;  

  // Resize the first item
  stats[0].height = 180 * 0.8;
  stats[0].width = 180 * 0.8;
  stats[0].x = 18;
  stats[0].y = 18;

  // Move legend
  const legend = document.getElementById("legend") as GraphicsElement;
  legend.x = 34;
  legend.y = 180;
  legend.getElementsByTagName("image")[1].style.display = "none";

  // Move clock 
  (document.getElementById("clock-container") as GraphicsElement).y = 30;
  (document.getElementById("date-container") as GraphicsElement).y = 100;
}

// Update Activities informations
function UpdateActivities()
{
  let actualStepsGoals = goals.steps||0;
  let actualSteps = today.local.steps||0;
  if(actualSteps != lastSteps
    || actualStepsGoals != lastStepsGoals){
    UpdateActivityWithText(stepsContainer, actualStepsGoals, actualSteps);
    lastSteps = actualSteps;
    lastStepsGoals = actualStepsGoals;
  }

  UpdateActivitiesArcs();
}

// Update Activities informations
function UpdateActivitiesArcs():void
{
  RenderActivityArc(stats[0],goals.steps, today.local.steps);
  RenderActivityArc(stats[1],goals.elevationGain, today.local.elevationGain);
  RenderActivityArc(stats[2],goals.calories, today.local.calories);
  RenderActivityArc(stats[3],goals.activeMinutes, today.local.activeMinutes);
  RenderActivityArc(stats[4],goals.distance, today.local.distance);  
}

// Render an activity
function RenderActivityArc(container:GraphicsElement, goal:number, done:number):void
{
  let arc = container.getElementsByTagName("arc")[1] as ArcElement;
  arc.sweepAngle = util.activityToAngle(goal,done);
}

function UpdateActivityWithText(container:GraphicsElement, goal:number, achieved:number) : void { 
  let achievedString = achieved.toString();
  let containers = container.getElementsByTagName("svg") as GraphicsElement[];
  
  // Arc
  RenderActivityTextArc(containers[0], goal, achieved);
  
  // Text
  // container.x = device.screen.width / 2 + 20 - (achievedString.toString().length * 20);
  let texts = containers[1].getElementsByTagName("image") as ImageElement[];
  for (let i = 0; i < texts.length; i++) {
    texts[i].href = util.getImageFromLeft(achievedString, i);
  }
}

// Render an activity
function RenderActivityTextArc(container:GraphicsElement, goal:number, achieved:number):void {
  let arc = container.getElementsByTagName("arc")[1] as ArcElement; // First Arc is used for background
  let circle = container.getElementsByTagName("circle")[0] as CircleElement;
  let image = container.getElementsByTagName("image")[0] as ImageElement;

  // Goals ok
  if(achieved >= goal){
    circle.style.display = "inline";
    arc.style.display= "none";
    image.style.fill = background.style.fill;
  }
  else{
    circle.style.display = "none";
    arc.style.display= "inline";
    arc.sweepAngle = util.activityToAngle(goal, achieved);
    if(container.style.fill)
      image.style.fill = container.style.fill;
  }
}
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "./simple/hrm";
let lastBpm:number;

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate)=> {
  // Zones
  if (zone === "out-of-range") {
    imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    imgHRM.href = "images/stat_hr_solid_48px.png";
  }

  // Animation
  if(newValue){
    iconHRM.animate("highlight");
  }

  // BPM value display
  if(bpm !== lastBpm) {
    if (bpm > 0) {
      hrmContainer.style.display="inline";
      let bpmString = bpm.toString();
      hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
      hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
      hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
    } else {
      hrmContainer.style.display="none";
    }
  }
});