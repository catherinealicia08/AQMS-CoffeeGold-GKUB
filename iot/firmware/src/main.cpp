#include <Arduino.h>
#include "config.h"

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.print("Starting device: ");
  Serial.println(DEVICE_ID);
}

void loop() {
  delay(1000);
}
