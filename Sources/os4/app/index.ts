import document from "document";
import * as font from "./simple/font";
// Display & AOD
import * as simpleDisplay from "./simple/display";

// Simpl activities
import * as simpleActivities from "simple-fitbit-activities";

// import clock from "clock";
import * as simpleMinutes from "./simple/clock-strings";

// Device form screen detection
import { me as device } from "device";

// Elements for style
const _container = document.getElementById("container") as GraphicsElement;
const _background = document.getElementById("background") as RectElement;
const _batteryBackground = document.getElementById("battery-bar-background") as GradientArcElement;
const _batteryBarContainer = document.getElementById("battery-bar-container") as GraphicsElement;

// Date
const _dates1Container = document.getElementById("date1-container") as GraphicsElement;
const _dates1 = _dates1Container.getElementsByTagName("image") as ImageElement[];
const _dates2Container = document.getElementById("date2-container") as GraphicsElement;
const _dates2 = _dates2Container.getElementsByTagName("image") as ImageElement[];

// Hours
const _clocks = (document.getElementById("clock-container") as GraphicsElement).getElementsByTagName("image") as ImageElement[];
const _cloksHours = _clocks.slice(0, 2);
const _cloksMinutes = _clocks.slice(3, 5);

const _ampm = (document.getElementById("ampm-container") as GraphicsElement).getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryValue = document.getElementById("battery-bar-value") as GradientRectElement;

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = (document.getElementById("hrm-text-container") as GraphicsElement).getElementsByTagName("image") as ImageElement[];

// Activities
const _statTopContainer = document.getElementById("arcs-container") as GraphicsElement;
const _statTopArcs = _statTopContainer.getElementsByTagName("svg") as GraphicsElement[];
const _stepsTopContainer = _statTopArcs[0];
const _caloriesTopContainer = _statTopArcs[1];
const _activesTopContainer = _statTopArcs[2];
const _distanceTopContainer = _statTopArcs[3];
const _elevationTopContainer = _statTopArcs[4];

// Stats
const _legend = document.getElementById("legend") as GraphicsElement;
const _statsContainer = document.getElementById("stats-container") as GraphicsElement;

const _stepsBottomContainer = document.getElementById("steps-container") as GraphicsElement;
const _caloriesBottomContainer = document.getElementById("cals-container") as GraphicsElement;
const _activesBottomContainer = document.getElementById("am-container") as GraphicsElement;
const _distanceBottomContainer = document.getElementById("dist-container") as GraphicsElement;

// Settings
import { Settings } from "../common";
const _settings = new Settings();

// --------------------------------------------------------------------------------
// Clock
// --------------------------------------------------------------------------------
// Update the clock every seconds
simpleMinutes.initialize("user", (clock) => {
  const folder: font.folder = simpleDisplay.isInAodMode()
    ? "chars-aod"
    : "chars";

  // Hours
  if (clock.Hours) {
    font.print(clock.Hours, _cloksHours, folder);
  }

  // Minutes
  if (clock.Minutes) {
    font.print(clock.Minutes, _cloksMinutes, folder);
  }

  // MA/PM
  if (clock.AmOrPm !== undefined) {
    font.print(clock.AmOrPm, _ampm);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    _dates1Container.x = (device.screen.width) - (clock.Date1.length * 20);
    // Values
    font.print(clock.Date1, _dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    _dates2Container.x = (device.screen.width) - (clock.Date2.length * 20);
    // Values
    font.print(clock.Date2, _dates2);
  }
  // update od stats
  UpdateActivities();
});

function setHoursMinutes(folder: font.folder) {
  // Hours
  font.print(simpleMinutes.last.Hours + ":" + simpleMinutes.last.Minutes, _clocks, folder);
}

// --------------------------------------------------------------------------------
// Power
// --------------------------------------------------------------------------------
import * as batterySimple from "./simple/power-battery";

// Method to update battery level informations
batterySimple.initialize((battery) => {
  // Battery bar
  _batteryValue.width = Math.floor(battery) * device.screen.width / 100;
});

// --------------------------------------------------------------------------------
// Activity
// --------------------------------------------------------------------------------

// Update Style when elevation isnot available
if (simpleActivities.elevationIsAvailable()) {
  _stepsTopContainer.class = "arc0 steps";
  _caloriesTopContainer.class = "arc1 calories";
  _activesTopContainer.class = "arc2 activesminutes";
  _distanceTopContainer.class = "arc3 distance";
  _elevationTopContainer.class = "arc4 elevation";
}
else {
  _stepsTopContainer.class = "arc1 steps";
  _caloriesTopContainer.class = "arc2 calories";
  _activesTopContainer.class = "arc3 activesminutes";
  _distanceTopContainer.class = "arc4 distance";
  // Hide the elevation informations
  _elevationTopContainer.style.display = "none";

  // Move arc uper
  _statTopContainer.y = 10;

  // Move legend
  const legend = document.getElementById("legend") as GraphicsElement;
  legend.x = 34;
  legend.y = 180;
  const legendImage = legend.getElementById("elevation-legend") as ImageElement;
  legendImage.style.display = "none";

  // Move clock 
  (document.getElementById("clock-container") as GraphicsElement).y = 30;
  (document.getElementById("date-container") as GraphicsElement).y = 100;
}

simpleActivities.initialize(UpdateActivities);

// Update Activities informations
function UpdateActivities() {
  const activities = simpleActivities.getNewValues();

  // activities.steps = new simpleActivities.Activity(4562, 10000);
  // activities.calories = new simpleActivities.Activity(2402, 3900);
  // activities.distance = new simpleActivities.Activity(2264, 6000);
  // activities.elevationGain = new simpleActivities.Activity(6, 10);

  updateActivity(_stepsTopContainer, _stepsBottomContainer, activities.steps);
  updateActivity(_caloriesTopContainer, _caloriesBottomContainer, activities.calories);
  updateActivity(_activesTopContainer, _activesBottomContainer, activities.activeZoneMinutes);
  updateActivity(_distanceTopContainer, _distanceBottomContainer, activities.distance);
  if (activities.elevationGain !== undefined) {
    updateActivityTop(_elevationTopContainer, activities.elevationGain);
  }
}

function updateActivity(containerTop: GraphicsElement, containerBottom: GraphicsElement, activity: simpleActivities.Activity | undefined) {
  if (activity === undefined) return;
  updateActivityTop(containerTop, activity);
  updateActivityBottom(containerBottom, activity);
}

// Render circle at top
function updateActivityTop(container: GraphicsElement, activity: simpleActivities.Activity): void {
  const arc = container.getElementsByTagName("arc")[1] as ArcElement;
  arc.sweepAngle = activity.as360Arc();
}

// Render activity at bottom
function updateActivityBottom(container: GraphicsElement, activity: simpleActivities.Activity): void {
  const achievedString = activity.actual.toString();
  const containers = container.getElementsByTagName("svg") as GraphicsElement[];

  // Arc
  updateActivityBottomArc(containers[0], activity, _background.style.fill);

  // Text
  // container.x = device.screen.width / 2 + 20 - (achievedString.toString().length * 20);
  const texts = containers[1].getElementsByTagName("image") as ImageElement[];
  font.print(achievedString, texts);
}

// Render an activity to an arc control (with goal render and colors update)
function updateActivityBottomArc(container: GraphicsElement, activity: simpleActivities.Activity, appBackgroundColor: string): void {
  const arc = container.getElementsByTagName("arc")[1] as ArcElement; // First Arc is used for background
  const circle = container.getElementsByTagName("circle")[0] as CircleElement;
  const image = container.getElementsByTagName("image")[0] as ImageElement;

  // Goals ok
  if (activity.goalReached()) {
    circle.style.display = "inline";
    arc.style.display = "none";
    image.style.fill = appBackgroundColor;
  }
  else {
    circle.style.display = "none";
    arc.style.display = "inline";
    arc.sweepAngle = activity.as360Arc();
    if (container.style.fill)
      image.style.fill = container.style.fill;
  }
}
// --------------------------------------------------------------------------------
// Heart rate manager
// --------------------------------------------------------------------------------
import * as simpleHRM from "simple-fitbit-heartrate";
let lastBpm: number;

simpleHRM.initialize((value) => {
  if (value === undefined) return;
  // Zones
  _imgHRM.href = value.zone === "out-of-range"
    ? "images/stat_hr_open_48px.png"
    : "images/stat_hr_solid_48px.png";

  // Animation
  _iconHRM.animate("highlight");

  // BPM value display
  if (value.heartRate !== lastBpm) {
    font.print(value.heartRate.toString(), _hrmTexts);
    lastBpm = value.heartRate;
  }
});

// --------------------------------------------------------------------------------
// Settings
// --------------------------------------------------------------------------------
import * as simpleSettings from "simple-fitbit-settings/app";

simpleSettings.initialize(
  _settings,
  (settingsNew: Settings) => {
    if (!settingsNew) {
      return;
    }

    if (settingsNew.colorBackground !== undefined) {
      _background.style.fill = settingsNew.colorBackground;
      _batteryBackground.gradient.colors.c2 = settingsNew.colorBackground;
      UpdateActivities(); // For achivement color
    }

    if (settingsNew.colorForeground !== undefined) {
      _container.style.fill = settingsNew.colorForeground;
    }

    if (settingsNew.showBatteryBar !== undefined) {
      _batteryBarContainer.style.display = settingsNew.showBatteryBar
        ? "inline"
        : "none";
    }

    // Display based on 12H or 24H format
    if (settingsNew.clockFormat !== undefined) {
      simpleMinutes.updateHoursFormat(settingsNew.clockFormat.values[0].value as simpleMinutes.HoursFormat);
    }
  });

// --------------------------------------------------------------------------------
// Allway On Display
// --------------------------------------------------------------------------------
simpleDisplay.initialize(onEnteredAOD, onLeavedAOD);

function onEnteredAOD() {
  // Stop sensors
  simpleHRM.stop();

  // Clock
  setHoursMinutes("chars-aod");

  // Hide elements
  _background.style.display = "none";
  _batteryBarContainer.style.display = "none";
  _legend.style.display = "none";
  _statTopContainer.style.display = "none";
  _hrmContainer.style.display = "none";
  _statsContainer.style.display = "none";

}

function onLeavedAOD() {
  // Clock
  setHoursMinutes("chars");

  // Show elements & start sensors
  _background.style.display = "inline";
  if (_settings.showBatteryBar) {
    _batteryBarContainer.style.display = "inline";
  }
  _legend.style.display = "inline";
  _statTopContainer.style.display = "inline";
  _hrmContainer.style.display = "inline";
  _statsContainer.style.display = "inline";

  // Start sensors
  simpleHRM.start();
}
