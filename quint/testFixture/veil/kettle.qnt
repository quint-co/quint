module kettle {
  type KettleState = RoomTemperature | Heating | Cooling | HundredDegrees
  type Reading = { state: KettleState, label: str, pair: (int, bool) }
  var kettle: KettleState
  var reading: Reading
  action init = all { kettle' = RoomTemperature, reading' = { state: RoomTemperature, label: "cold", pair: (0, false) } }
  action turnOn = all { kettle == RoomTemperature, kettle' = Heating, reading' = { ...reading, label: "warm" } }
  action turnOff = all { kettle == Heating, kettle' = Cooling, reading' = reading }
  action step = any { turnOn, turnOff }
  temporal hot = eventually(kettle == HundredDegrees)
}
