import document from "document";
import * as util from "./simple/utils";

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
const _cloks = document.getElementById("clock-container").getElementsByTagName("image") as ImageElement[];
const _ampm = document.getElementById("ampm-container").getElementsByTagName("image") as ImageElement[];

// Battery
const _batteryValue = document.getElementById("battery-bar-value") as GradientRectElement;

// Heart rate management
const _hrmContainer = document.getElementById("hrm-container") as GroupElement;
const _iconHRM = document.getElementById("iconHRM") as GraphicsElement;
const _imgHRM = document.getElementById("icon") as ImageElement;
const _hrmTexts = document.getElementById("hrm-text-container").getElementsByTagName("image") as ImageElement[];

// Activities
import * as simpleActivities from "simple-fitbit-activities";
const _statTopContainer = document.getElementById("arcs-container") as GraphicsElement;
const _statTopArcs = _statTopContainer.getElementsByTagName("svg") as GraphicsElement[];
// If elevation is not available, the first arc is not used (index 0)
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
simpleMinutes.initialize("seconds", (clock) => {
  // hours="21";
  // mins="38";
  // date = "17 jan";
  // Hours
  if (clock.Hours) {
    _cloks[0].href = util.getImageFromLeft(clock.Hours, 0);
    _cloks[1].href = util.getImageFromLeft(clock.Hours, 1);
  }

  // Minutes
  if (clock.Minutes) {
    _cloks[3].href = util.getImageFromLeft(clock.Minutes, 0);
    _cloks[4].href = util.getImageFromLeft(clock.Minutes, 1);
  }

  // MA/PM
  if (clock.AmOrPm !== undefined) {
    util.display(clock.AmOrPm, _ampm);
  }

  // Date 1
  if (clock.Date1 !== undefined) {
    // Position
    _dates1Container.x = (device.screen.width) - (clock.Date1.length * 20);
    // Values
    util.display(clock.Date1, _dates1);
  }

  // Date 2
  if (clock.Date2 !== undefined) {
    // Position
    _dates2Container.x = (device.screen.width) - (clock.Date2.length * 20);
    // Values
    util.display(clock.Date2, _dates2);
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
  // Battery bar
  _batteryValue.width = Math.floor(battery) * device.screen.width / 100;
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
    if (settingsNew.clockDisplay24 !== undefined) {
      simpleMinutes.updateClockDisplay24(settingsNew.clockDisplay24);
    }
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

  updateActivity(_stepsTopContainer, _stepsBottomContainer, activities.steps);
  updateActivity(_caloriesTopContainer, _caloriesBottomContainer, activities.calories);
  updateActivity(_activesTopContainer, _activesBottomContainer, activities.activeMinutes);
  updateActivity(_distanceTopContainer, _distanceBottomContainer, activities.distance);
  if (activities.elevationGain !== undefined) {
    updateActivityTop(_elevationTopContainer, activities.elevationGain);
  }
}

function updateActivity(containerTop: GraphicsElement, containerBottom: GraphicsElement, activity: simpleActivities.Activity) {
  if (activity === undefined) return;
  updateActivityTop(containerTop, activity);
  updateActivityBottom(containerBottom, activity);
}

// Render circle at top
function updateActivityTop(container: GraphicsElement, activity: simpleActivities.Activity): void {
  let arc = container.getElementsByTagName("arc")[1] as ArcElement;
  arc.sweepAngle = util.activityToAngle(activity.goal, activity.actual);
}

// Render activity at bottom
function updateActivityBottom(container: GraphicsElement, activity: simpleActivities.Activity): void {
  let achievedString = activity.actual.toString();
  let containers = container.getElementsByTagName("svg") as GraphicsElement[];

  // Arc
  updateActivityBottomArc(containers[0], activity, _background.style.fill);

  // Text
  // container.x = device.screen.width / 2 + 20 - (achievedString.toString().length * 20);
  let texts = containers[1].getElementsByTagName("image") as ImageElement[];
  util.display(achievedString, texts);
}

// Render an activity to an arc control (with goal render and colors update)
function updateActivityBottomArc(container: GraphicsElement, activity: simpleActivities.Activity, appBackgroundColor: string): void {
  let arc = container.getElementsByTagName("arc")[1] as ArcElement; // First Arc is used for background
  let circle = container.getElementsByTagName("circle")[0] as CircleElement;
  let image = container.getElementsByTagName("image")[0] as ImageElement;

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
import * as simpleHRM from "./simple/hrm";
let lastBpm: number;

simpleHRM.initialize((newValue, bpm, zone, restingHeartRate) => {
  // Zones
  if (zone === "out-of-range") {
    _imgHRM.href = "images/stat_hr_open_48px.png";
  } else {
    _imgHRM.href = "images/stat_hr_solid_48px.png";
  }

  // Animation
  if (newValue) {
    _iconHRM.animate("highlight");
  }

  // BPM value display
  if (bpm !== lastBpm) {
    if (bpm > 0) {
      _hrmContainer.style.display = "inline";
      let bpmString = bpm.toString();
      _hrmTexts[0].href = util.getImageFromLeft(bpmString, 0);
      _hrmTexts[1].href = util.getImageFromLeft(bpmString, 1);
      _hrmTexts[2].href = util.getImageFromLeft(bpmString, 2);
    } else {
      _hrmContainer.style.display = "none";
    }
  }
});

// --------------------------------------------------------------------------------
// Allway On Display
// --------------------------------------------------------------------------------
import { me } from "appbit";
import { display } from "display";
import clock from "clock"

// does the device support AOD, and can I use it?
if (display.aodAvailable && me.permissions.granted("access_aod")) {
  // tell the system we support AOD
  display.aodAllowed = true;

  // respond to display change events
  display.addEventListener("change", () => {

    // console.info(`${display.aodAvailable} ${display.aodEnabled} ${me.permissions.granted("access_aod")} ${display.aodAllowed} ${display.aodActive}`);

    // Is AOD inactive and the display is on?
    if (!display.aodActive && display.on) {
      clock.granularity = "seconds";

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
    } else {
      clock.granularity = "minutes";

      // Stop sensors
      simpleHRM.stop();

      // Hide elements
      _background.style.display = "none";
      _batteryBarContainer.style.display = "none";
      _legend.style.display = "none";
      _statTopContainer.style.display = "none";
      _hrmContainer.style.display = "none";
      _statsContainer.style.display = "none";
    }
  });
}