module strongFairness {
  type KettleState = RoomTemperature | Heating | Cooling | HundredDegrees

  var kettle: KettleState

  action init = kettle' = RoomTemperature

  action turnOn = all { kettle == RoomTemperature, kettle' = Heating }

  action turnOff = all { kettle == Heating, kettle' = Cooling }

  action turnOffBySensor = all { kettle == Heating, kettle' = HundredDegrees }

  action stabilize = any {
    all { kettle == HundredDegrees, kettle' = Cooling },
    all { kettle == Cooling, kettle' = RoomTemperature },
  }

  action step = any { turnOn, turnOff, turnOffBySensor, stabilize }

  val vars = kettle

  // Holds with weak fairness over step and strong fairness on turnOffBySensor.
  // turnOffBySensors is infinitely often enabled, but not constantly, so it needs strong fairness.
  temporal eventuallyHundredDegrees =
    (weakFair(step, vars) and strongFair(turnOffBySensor, vars)) implies eventually(kettle == HundredDegrees)

  // Does NOT hold with weak fairness alone,
  // as whe can choose turnOff instead of turnOffBySensor every single time.
  temporal eventuallyHundredDegreesWeakOnly =
    weakFair(step, vars) implies eventually(kettle == HundredDegrees)
}
