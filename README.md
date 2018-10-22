# IR Copier Interface App

A hybrid android app to work with the [arduino-ir-copier](https://github.com/ssp5zone/arduino-ir-copier) device.

It was intially written to work with [Droid Script](http://droidscript.org/). But can be modified to make an independent hybrid app for any device.

![](/docs/demo.gif)

## Summary

An app that provides a UI for a serial interface with an Arduino device connected via OTG cable.

It has 3 modes,

**I** - _Input_ - Read Serial input sent by the device. This is used for recording the IR signal.

**O** - _Output_ - Select from stored signals and send a specific command to the device to generate a signal.

**J** - _Jammer_ - Send a burst of 38kHz noise. No other device in the vicinity will work. _Works better if the device has high watt multi-directional LED array configuration._
