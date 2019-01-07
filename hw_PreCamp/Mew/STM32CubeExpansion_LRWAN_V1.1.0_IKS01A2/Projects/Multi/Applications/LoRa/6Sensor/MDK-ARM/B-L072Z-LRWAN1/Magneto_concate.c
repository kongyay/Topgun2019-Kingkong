#include <stdio.h>
#include <math.h>
#include "bsp.h"
#include "sensor.h"

#define PI 3.14

extern SensorAxes_t MAG_Value;                  /*!< Magnetometer Value */

int mag() {
        //double magX = (double) MAG_Value.AXIS_X;
        //double magY = (double) MAG_Value.AXIS_Y;
				double magX = -454;
        double magY = 124;
        double heading = atan2(magY, magX) * 180 / PI;

        if (heading < 0) {
                heading += 360;
        } else if (heading >360) {
                heading -= 360;
        }

        if (heading > 180) {
                heading = heading - 360;
        }

        //printf("Heading: %lf\n", heading);

        return heading;
}