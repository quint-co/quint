// @mainModule kettle
// -*- mode: Bluespec; -*-
// The example from the REPL tutorial
module kettle {
    // an example of a definition
    val isThisMyFirstDefinition = true
    // a constant value that always returns 100
    val boilingTemperature = 100

    // a constant value that always returns 0
    val freezingTemperature = 0

    // conversion from Celsius to Fahrenheit
    def fahrenheit(celsius) = celsius * 9 / 5 + 32

    // the low range of a thermometer (fixed)
    val veryCold = fahrenheit(-40)

    // the high range of a thermometer (fixed)
    val veryHot = fahrenheit(40)

    // the current temperature in the kettle
    var temperature: int

    // is the kettle currently heating?
    var heatingOn: bool

    // is the kettle currently beeping?
    var beeping: bool

    // a state initializer
    action init = all {
      temperature' = 20,
      heatingOn' = false,
      beeping' = false,
    }

    // a handy definition that captures the state in a record
    val kettleState = {
      heatingOn: heatingOn,
      beeping: beeping,
      temperature: temperature
    }

    // turn on the heating element
    action pressButton = all {
      not(heatingOn),
      heatingOn' = true,
      beeping' = false,
      temperature' = temperature,
    }

    // turn off the kettle when the temperature is too high
    action failover = all {
      heatingOn,
      temperature >= 100,
      heatingOn' = false,
      beeping' = true,
      temperature' = temperature,
    }

    // heat up the water by 1C
    action heat = all {
      heatingOn,
      temperature < 100,
      temperature' = temperature + 1,
      heatingOn' = true,
      beeping' = false,
    }

    // turn off the heating element
    action depressButton = all {
      heatingOn,
      heatingOn' = false,
      temperature' = temperature,
      beeping' = false,
    }

    // one step of the state machine
    action step = any {
      pressButton,
      heat,
      depressButton,
      failover,
    }

    // initialize the state machine with non-determinism
    action initNondet = all {
      heatingOn' = false,
      nondet temp = oneOf((-40).to(40))
      temperature' = temp,
      beeping' = false,
    }

}
/*! 1 + 3 !*/

/*! Set(1, 2, 3).map(i => i * 2) !*/

/*! fahrenheit(freezingTemperature) !*/

/*! fahrenheit(boilingTemperature) !*/

/*! 0.to(100).exists(celsius => fahrenheit(celsius) == celsius) !*/

/*! (-100).to(100).exists(celsius => fahrenheit(celsius) == celsius) !*/

/*! veryCold !*/

/*! veryHot !*/

/*! temperature !*/

/*! init !*/

/*! temperature !*/

/*! heatingOn !*/

/*! kettleState !*/

/*! pressButton !*/

/*! kettleState !*/

/*! pressButton !*/

/*! failover !*/

/*! temperature !*/

/*! all { temperature' = 100, heatingOn' = true, beeping' = false } !*/

/*! failover !*/

/*! heatingOn !*/

/*! temperature !*/

/*! beeping !*/

/*! init !*/

/*! pressButton !*/

/*! kettleState !*/

/*! heat !*/

/*! temperature !*/

/*! heat !*/

/*! temperature !*/

/*! heat !*/

/*! temperature !*/

/*! init !*/

/*! pressButton !*/

/*! heat !*/

/*! depressButton !*/

/*! kettleState !*/

/*! all { heatingOn' = true, temperature' = 100, beeping' = false } !*/

/*! depressButton !*/

/*! kettleState !*/

/*! all { heatingOn' = true, temperature' = 100, beeping' = false } !*/

/*! failover !*/

/*! kettleState !*/

/*! all { heatingOn' = true, temperature' = 100, beeping' = false } !*/

/*! any {
depressButton,
failover,
} !*/

/*! init !*/

/*! step !*/

/*! step !*/

/*! step !*/

/*! step !*/

/*! initNondet !*/
