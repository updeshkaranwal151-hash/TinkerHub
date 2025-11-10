import { Category } from '../types.ts';
import type { ImageData } from '../types.ts';

export const imageLibrary: Record<Category, ImageData[]> = {
  [Category.MICROCONTROLLER]: [
    { name: 'Arduino Uno', url: 'https://i.ibb.co/L5B02xT/arduino-uno.png' },
    { name: 'Raspberry Pi', url: 'https://i.ibb.co/hK7f0bM/raspberry-pi.png' },
    { name: 'ESP32', url: 'https://i.ibb.co/bFMRMdd/esp32.png' },
    { name: 'NodeMCU', url: 'https://i.ibb.co/K2T0YqT/nodemcu.png' },
  ],
  [Category.SENSOR]: [
    { name: 'Ultrasonic Sensor', url: 'https://i.ibb.co/d6bQ0n3/ultrasonic-sensor.png' },
    { name: 'DHT11 Sensor', url: 'https://i.ibb.co/P9tPqZD/dht11.png' },
    { name: 'PIR Sensor', url: 'https://i.ibb.co/L8yXG4z/pir-sensor.png' },
    { name: 'IR Sensor', url: 'https://i.ibb.co/c2S3P0V/ir-sensor.png' },
    { name: 'Soil Moisture', url: 'https://i.ibb.co/yQW2Yw6/soil-moisture.png' },
  ],
  [Category.MOTOR]: [
    { name: 'Servo Motor', url: 'https://i.ibb.co/gDFht8M/servo-motor.png' },
    { name: 'DC Motor', url: 'https://i.ibb.co/KqR0bC2/dc-motor.png' },
    { name: 'Stepper Motor', url: 'https://i.ibb.co/k2VwFp4/stepper-motor.png' },
    { name: 'L298N Driver', url: 'https://i.ibb.co/YczNqX4/l298n.png' },
  ],
  [Category.DISPLAY]: [
    { name: '16x2 LCD', url: 'https://i.ibb.co/hY9BqjF/16x2-lcd.png' },
    { name: 'OLED Display', url: 'https://i.ibb.co/c86mQk7/oled.png' },
    { name: '7-Segment', url: 'https://i.ibb.co/qN9HhGz/7-segment.png' },
    { name: 'Dot Matrix', url: 'https://i.ibb.co/tZ5wKPb/dot-matrix.png' },
  ],
  [Category.POWER_SUPPLY]: [
    { name: '9V Battery', url: 'https://i.ibb.co/M7yT7f4/9v-battery.png' },
    { name: 'Breadboard PSU', url: 'https://i.ibb.co/n6Z3bJd/breadboard-psu.png' },
    { name: 'AA Batteries', url: 'https://i.ibb.co/fH7YnDX/aa-batteries.png' },
  ],
  [Category.GENERAL]: [
    { name: 'Breadboard', url: 'https://i.ibb.co/bJcKz1n/breadboard.png' },
    { name: 'Resistor', url: 'https://i.ibb.co/k5tJ2Gv/resistor.png' },
    { name: 'LED', url: 'https://i.ibb.co/v4S8cQ3/led.png' },
    { name: 'Jumper Wires', url: 'https://i.ibb.co/yQJmH0P/jumper-wires.png' },
    { name: 'Buzzer', url: 'https://i.ibb.co/R9mdcPr/buzzer.png' },
    { name: 'Potentiometer', url: 'https://i.ibb.co/QcY91zS/potentiometer.png' },
    { name: 'Push Button', url: 'https://i.ibb.co/55GQRQp/push-button.png' },
    { name: 'Capacitor', url: 'https://i.ibb.co/zX9vN4q/capacitor.png' },
  ],
};
