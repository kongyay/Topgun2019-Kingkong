 /*
 / _____)             _              | |
( (____  _____ ____ _| |_ _____  ____| |__
 \____ \| ___ |    (_   _) ___ |/ ___)  _ \
 _____) ) ____| | | || |_| ____( (___| | | |
(______/|_____)_|_|_| \__)_____)\____)_| |_|
    (C)2013 Semtech

Description: Generic lora driver implementation

License: Revised BSD License, see LICENSE.TXT file include in the project

Maintainer: Miguel Luis, Gregory Cristian and Wael Guibene
*/
/******************************************************************************
  * @file    main.c
  * @author  MCD Application Team
  * @version V1.1.0
  * @date    27-February-2017
  * @brief   this is the main!
  ******************************************************************************
  * @attention
  *
  * <h2><center>&copy; Copyright (c) 2017 STMicroelectronics International N.V. 
  * All rights reserved.</center></h2>
  *
  * Redistribution and use in source and binary forms, with or without 
  * modification, are permitted, provided that the following conditions are met:
  *
  * 1. Redistribution of source code must retain the above copyright notice, 
  *    this list of conditions and the following disclaimer.
  * 2. Redistributions in binary form must reproduce the above copyright notice,
  *    this list of conditions and the following disclaimer in the documentation
  *    and/or other materials provided with the distribution.
  * 3. Neither the name of STMicroelectronics nor the names of other 
  *    contributors to this software may be used to endorse or promote products 
  *    derived from this software without specific written permission.
  * 4. This software, including modifications and/or derivative works of this 
  *    software, must execute solely and exclusively on microcontroller or
  *    microprocessor devices manufactured by or for STMicroelectronics.
  * 5. Redistribution and use of this software other than as permitted under 
  *    this license is void and will automatically terminate your rights under 
  *    this license. 
  *
  * THIS SOFTWARE IS PROVIDED BY STMICROELECTRONICS AND CONTRIBUTORS "AS IS" 
  * AND ANY EXPRESS, IMPLIED OR STATUTORY WARRANTIES, INCLUDING, BUT NOT 
  * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
  * PARTICULAR PURPOSE AND NON-INFRINGEMENT OF THIRD PARTY INTELLECTUAL PROPERTY
  * RIGHTS ARE DISCLAIMED TO THE FULLEST EXTENT PERMITTED BY LAW. IN NO EVENT 
  * SHALL STMICROELECTRONICS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
  * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
  * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, 
  * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF 
  * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING 
  * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
  * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  *
  ******************************************************************************
  */

/* Includes ------------------------------------------------------------------*/
#include "hw.h"
#include "low_power.h"
#include "lora.h"
#include "bsp.h"
#include "timeServer.h"
#include "vcom.h"
#include "version.h"
#include "sensor.h"
#include "X-NUCLEO-IDB05A1.h"
#include <stdio.h>
#include <math.h>

/* Private typedef -----------------------------------------------------------*/
/* Private define ------------------------------------------------------------*/
/*!
 * CAYENNE_LPP is myDevices Application server.
 */
#define CAYENNE_LPP	
#define LPP_DATATYPE_DIGITAL_INPUT  0x0
#define LPP_DATATYPE_DIGITAL_OUTPUT 0x1
#define LPP_DATATYPE_ANALOG_INPUT   0x2
#define LPP_DATATYPE_HUMIDITY       0x68
#define LPP_DATATYPE_TEMPERATURE    0x67
#define LPP_DATATYPE_BAROMETER      0x73
#define LPP_DATATYPE_ACCELEROMETER	0x71
#define LPP_DATATYPE_GYROSCOPE			0x86

#define USER_DATATYPE_PRESSURE				0x01 	//2 
#define USER_DATATYPE_TEMPERATURE			0x02 	//2 
#define USER_DATATYPE_HUMIDITY				0x03	//2 
#define USER_DATATYPE_GYROSCOPE				0x04	//6 
#define USER_DATATYPE_ACCELEROMETER		0x05	//6 
#define USER_DATATYPE_MAGNETOMETER		0x06	//6 
#define USER_DATATYPE_LEDS						0x07	//1 
#define USER_DATATYPE_DIGITAL_INPUT_1 0x08	//1 
#define USER_DATATYPE_DIGITAL_INPUT_2 0x09	//1 
#define USER_DATATYPE_DIGITAL_INPUT_3 0x0A	//1 
#define USER_DATATYPE_DIGITAL_INPUT_4 0x0B	//1 
#define USER_DATATYPE_DIGITAL_INPUT_5 0x0C	//1
#define USER_DATATYPE_DIGITAL_OUTPUT 	0xA0	//1 

#define LPP_APP_PORT 99

#define PI 3.14159

/*!
 * Defines the application data transmission duty cycle. 5s, value in [ms].
 */
#define APP_TX_DUTYCYCLE                            30000
/*!
 * LoRaWAN Adaptive Data Rate
 * @note Please note that when ADR is enabled the end-device should be static
 */
#define LORAWAN_ADR_ON                              1
/*!
 * LoRaWAN confirmed messages
 */
#define LORAWAN_CONFIRMED_MSG                    DISABLE
/*!
 * LoRaWAN application port
 * @note do not use 224. It is reserved for certification
 */
#define LORAWAN_APP_PORT                            2

/* Private macro -------------------------------------------------------------*/
/* Private function prototypes -----------------------------------------------*/

/* call back when LoRa will transmit a frame*/
static void LoraTxData( lora_AppData_t *AppData, FunctionalState* IsTxConfirmed);

/* call back when LoRa has received a frame*/
static void LoraRxData( lora_AppData_t *AppData);

/* Private variables ---------------------------------------------------------*/
/* load call backs*/
static LoRaMainCallback_t LoRaMainCallbacks ={ HW_GetBatteryLevel,
                                               HW_GetUniqueId,
                                               HW_GetRandomSeed,
                                               LoraTxData,
                                               LoraRxData};

/*!
 * Specifies the state of the application LED
 */
																							 
static uint8_t AppLedStateOn = RESET;
static int16_t mag_concatenation(int32_t magx , int32_t magy);
static int16_t Magneto_Compasdirection( int32_t magx,int32_t magy, int32_t magz );
																							 
#ifdef USE_B_L072Z_LRWAN1
/*!
 * Timer to handle the application Tx Led to toggle
 */
static TimerEvent_t TxLedTimer;
static void OnTimerLedEvent( void );
#endif
/* !
 *Initialises the Lora Parameters
 */
static  LoRaParam_t LoRaParamInit= {TX_ON_TIMER,
                                    APP_TX_DUTYCYCLE,
                                    CLASS_A,
                                    LORAWAN_ADR_ON,
                                    DR_0,
                                    LORAWAN_PUBLIC_NETWORK };

/* Private functions ---------------------------------------------------------*/

extern SensorAxes_t ACC_Value;                  /*!< Acceleration Value */
extern SensorAxes_t GYR_Value;                  /*!< Gyroscope Value */
extern SensorAxes_t MAG_Value;                  /*!< Magnetometer Value */
																		
extern __IO uint8_t SENSOR_DETECTED;
																		
float Pressure_Value;
float Temperature_Value;
float Humidity_Value;
int Magneto_Value;	
int winddirection_Value ;	
																		
extern void Check_Sensor_Detect(void);
extern void *ACCELERO_handle;																	
																	
/**
  * @brief  Main program
  * @param  None
  * @retval None
  */
int main( void )
{
  /* STM32 HAL library initialization*/
  HAL_Init( );
  
  /* Configure the system clock*/
  SystemClock_Config( );
  
  /* Configure the debug mode*/
  DBG_Init( );
  
  /* Configure the hardware*/
  HW_Init( );
  
  /* USER CODE BEGIN 1 */
	/* USER CODE BEGIN 1 */
  /* USER CODE END 1 */
  
  /* Configure the Lora Stack*/
  lora_Init( &LoRaMainCallbacks, &LoRaParamInit);
  
  PRINTF("VERSION: %X\n\r", VERSION);
	
  /* main loop*/
  while( 1 )
  {
    /* run the LoRa class A state machine*/
    lora_fsm( );
    
    DISABLE_IRQ( );
    /* if an interrupt has occurred after DISABLE_IRQ, it is kept pending 
     * and cortex will not enter low power anyway  */
    if ( lora_getDeviceState( ) == DEVICE_STATE_SLEEP )
    {
#ifndef LOW_POWER_DISABLE
      LowPower_Handler( );
#endif
    }
    ENABLE_IRQ();

    /* USER CODE BEGIN 2 */
		Check_Sensor_Detect();			// Reading TAP status when wake up Modify 4/1/2018
		if(SENSOR_DETECTED==1){
			PRINTF("Sensor Status: Active\n\r");
		}
    /* USER CODE END 2 */
  }
}

static void LoraTxData( lora_AppData_t *AppData, FunctionalState* IsTxConfirmed)
{
  /* USER CODE BEGIN 3 */
  uint16_t pressure = 0;
  int16_t temperature = 0;
  uint16_t humidity = 0;
  uint8_t batteryLevel;
  sensor_t sensor_data;
	
	SensorAxes_t accelero;
	SensorAxes_t gyro;
	SensorAxes_t magneto;
  int16_t winddirection =0;
	
#ifdef USE_B_L072Z_LRWAN1
  TimerInit( &TxLedTimer, OnTimerLedEvent );
  
  TimerSetValue(  &TxLedTimer, 200);
  
  LED_On( LED_RED1 ) ; 
  
  TimerStart( &TxLedTimer );  
#endif
#ifndef CAYENNE_LPP
  int32_t latitude, longitude = 0;
  uint16_t altitudeGps = 0;
#endif
  BSP_sensor_Read( &sensor_data );

#ifdef CAYENNE_LPP
  uint8_t cchannel=0;
	
	//input from bsp.c
  temperature = ( int16_t )( sensor_data.temperature * 10 );     /* in °C * 10 */
  pressure    = ( uint16_t )( sensor_data.pressure * 100 / 10 );  /* in hPa / 10 */
  humidity    = ( uint16_t )( sensor_data.humidity * 2 );        /* in %*2     */
  
	accelero 	= (sensor_data.accelero);
	gyro 			= (sensor_data.gyro);
	magneto		= (sensor_data.magneto);
	winddirection = mag_concatenation(magneto.AXIS_X , magneto.AXIS_Y)*100;
	
	uint32_t i = 0;
	batteryLevel = HW_GetBatteryLevel( );                     /* 1 (very low) to 254 (fully charged) */
	
	//For STMStudio 
	/*Pressure_Value = sensor_data.pressure*10;
	Temperature_Value = sensor_data.temperature*100/10;
	Humidity_Value = sensor_data.humidity*2;
	winddirection_Value = (int) winddirection ;
  */
	
	//Transmit to Cayanne LPP
  AppData->Port = LPP_APP_PORT;
  *IsTxConfirmed =  LORAWAN_CONFIRMED_MSG;
	
	AppData->Buff[i++] = cchannel++;
  AppData->Buff[i++] = LPP_DATATYPE_BAROMETER;
  AppData->Buff[i++] = ( pressure >> 8 ) & 0xFF;
  AppData->Buff[i++] = pressure & 0xFF;
	
  AppData->Buff[i++] = cchannel++;
  AppData->Buff[i++] = LPP_DATATYPE_TEMPERATURE; 
  AppData->Buff[i++] = ( temperature >> 8 ) & 0xFF;
  AppData->Buff[i++] = temperature & 0xFF;
	
  AppData->Buff[i++] = cchannel++;
  AppData->Buff[i++] = LPP_DATATYPE_HUMIDITY;
  AppData->Buff[i++] = humidity & 0xFF;
	
	AppData->Buff[i++] = cchannel++;
	AppData->Buff[i++] = LPP_DATATYPE_ACCELEROMETER;
	AppData->Buff[i++] = (accelero.AXIS_X >> 8) & 0xFF;
	AppData->Buff[i++] = accelero.AXIS_X & 0xFF;
	AppData->Buff[i++] = (accelero.AXIS_Y >> 8) & 0xFF;
	AppData->Buff[i++] = accelero.AXIS_Y & 0xFF;
	AppData->Buff[i++] = (accelero.AXIS_Z >> 8) & 0xFF;
	AppData->Buff[i++] = accelero.AXIS_Z & 0xFF;
	
	AppData->Buff[i++] = cchannel++;
	AppData->Buff[i++] = LPP_DATATYPE_GYROSCOPE;
	AppData->Buff[i++] = (gyro.AXIS_X >> 8) & 0xFF;
	AppData->Buff[i++] = gyro.AXIS_X & 0xFF;
	AppData->Buff[i++] = (gyro.AXIS_Y >> 8) & 0xFF;
	AppData->Buff[i++] = gyro.AXIS_Y & 0xFF;
	AppData->Buff[i++] = (gyro.AXIS_Z >> 8) & 0xFF;
	AppData->Buff[i++] = gyro.AXIS_Z & 0xFF;
	
	AppData->Buff[i++] = cchannel++;
	AppData->Buff[i++] = LPP_DATATYPE_ANALOG_INPUT;
	AppData->Buff[i++] = (winddirection >> 8) & 0xFF;
	AppData->Buff[i++] = winddirection & 0xFF;
	
#if !defined(REGION_US915) && !defined(REGION_US915_HYBRID)
  AppData->Buff[i++] = cchannel++;
  AppData->Buff[i++] = LPP_DATATYPE_DIGITAL_INPUT; 
  AppData->Buff[i++] = batteryLevel*100/254;
  AppData->Buff[i++] = cchannel++;
  AppData->Buff[i++] = LPP_DATATYPE_DIGITAL_OUTPUT; 
  AppData->Buff[i++] = AppLedStateOn;
#endif


#if 1
  PRINTF("\n\r");
  PRINTF("temperature=%d,%d degC : %d\n\r", temperature/10, temperature-(temperature/10)*10,temperature);
  PRINTF("pressure=%d,%d hPa : %d\n\r", pressure/10, pressure - (pressure/10)*10,pressure);
  PRINTF("humidity=%d,%d %% : %d\n\r", humidity/2, (humidity*10)/2-(humidity/2)*10,humidity);
  PRINTF("batteryLevel=%d %% : %d\n\r\n\r", batteryLevel*100/254,batteryLevel);
	
	//my code
  PRINTF ("acelero axis x = %d \n\r",accelero.AXIS_X);
	PRINTF ("acelero axis y = %d \n\r",accelero.AXIS_Y);
	PRINTF ("acelero axis z = %d \n\r\n\r",accelero.AXIS_Z);
	
	PRINTF ("gyroscope axis x = %d \n\r",gyro.AXIS_X);
	PRINTF ("gyroscope axis y = %d \n\r",gyro.AXIS_Y);
	PRINTF ("gyroscope axis z = %d \n\r\n\r",gyro.AXIS_Z);
	
	PRINTF ("magnetometer axis x = %d \n\r",magneto.AXIS_X);
	PRINTF ("magnetometer  axis y = %d \n\r",magneto.AXIS_Y);
	PRINTF ("magnetometer  axis z = %d \n\r\n\r",magneto.AXIS_Z);
	
	PRINTF ("winddirection : %d\n\r\n\r",winddirection);
	//end my code
	
	if ( AppLedStateOn == RESET )
  {
    PRINTF("LED Status: LED OFF\n\r");
  }
  else
  {
    PRINTF("LED Status: LED ON\n\r");
  }
	if(SENSOR_DETECTED==1){		// Check Tap and clear latch Modify 4/1/2018
		PRINTF("Sensor Status: Active\n\r");
		SENSOR_DETECTED=0;
	}
	else {
		PRINTF("Sensor Status: Inactive\n\r");
	}
	
  PRINTF("\n\r");

#endif
	
#else
  temperature = ( int16_t )( sensor_data.temperature * 100 );     /* in °C * 100 */
  pressure    = ( uint16_t )( sensor_data.pressure * 100 / 10 );  /* in hPa / 10 */
  humidity    = ( uint16_t )( sensor_data.humidity * 10 );        /* in %*10     */
	
	accelero 	= (sensor_data.accelero);
	gyro 			= (sensor_data.gyro);
	magneto		= (sensor_data.magneto);
	winddirection = mag_concatenation(magneto.AXIS_X , magneto.AXIS_Y)*100;
	
	latitude = sensor_data.latitude;
  longitude= sensor_data.longitude;
  uint32_t i = 0;

  batteryLevel = HW_GetBatteryLevel( );                     /* 1 (very low) to 254 (fully charged) */

  AppData->Port = LORAWAN_APP_PORT;
  
  *IsTxConfirmed =  LORAWAN_CONFIRMED_MSG;

#if defined( REGION_US915 ) || defined( REGION_US915_HYBRID )
  AppData->Buff[i++] = AppLedStateOn;
  AppData->Buff[i++] = ( pressure >> 8 ) & 0xFF;
  AppData->Buff[i++] = pressure & 0xFF;
  AppData->Buff[i++] = ( temperature >> 8 ) & 0xFF;
  AppData->Buff[i++] = temperature & 0xFF;
  AppData->Buff[i++] = ( humidity >> 8 ) & 0xFF;
  AppData->Buff[i++] = humidity & 0xFF;
  AppData->Buff[i++] = batteryLevel;
  AppData->Buff[i++] = 0;
  AppData->Buff[i++] = 0;
  AppData->Buff[i++] = 0;
#else
  AppData->Buff[i++] = AppLedStateOn;
	AppData->Buff[i++] = USER_DATATYPE_PRESSURE ;
  AppData->Buff[i++] = ( pressure >> 8 ) & 0xFF;
  AppData->Buff[i++] = pressure & 0xFF;
	AppData->Buff[i++] = USER_DATATYPE_TEMPERATURE;
  AppData->Buff[i++] = ( temperature >> 8 ) & 0xFF;
  AppData->Buff[i++] = temperature & 0xFF;
	AppData->Buff[i++] = USER_DATATYPE_HUMIDITY;
  AppData->Buff[i++] = ( humidity >> 8 ) & 0xFF;
  AppData->Buff[i++] = humidity & 0xFF;
	
	AppData->Buff[i++] = USER_DATATYPE_ACCELEROMETER;
	AppData->Buff[i++] = (accelero.AXIS_X >> 8) & 0xFF;
	AppData->Buff[i++] = accelero.AXIS_X & 0xFF;
	AppData->Buff[i++] = (accelero.AXIS_Y >> 8) & 0xFF;
	AppData->Buff[i++] = accelero.AXIS_Y & 0xFF;
	AppData->Buff[i++] = (accelero.AXIS_Z >> 8) & 0xFF;
	AppData->Buff[i++] = accelero.AXIS_Z & 0xFF;
	
	AppData->Buff[i++] = USER_DATATYPE_GYROSCOPE;
	AppData->Buff[i++] = (gyro.AXIS_X >> 8) & 0xFF;
	AppData->Buff[i++] = gyro.AXIS_X & 0xFF;
	AppData->Buff[i++] = (gyro.AXIS_Y >> 8) & 0xFF;
	AppData->Buff[i++] = gyro.AXIS_Y & 0xFF;
	AppData->Buff[i++] = (gyro.AXIS_Z >> 8) & 0xFF;
	AppData->Buff[i++] = gyro.AXIS_Z & 0xFF;
	
	AppData->Buff[i++] = USER_DATATYPE_MAGNETOMETER;
	AppData->Buff[i++] = (magneto.AXIS_X >> 8) & 0xFF;
	AppData->Buff[i++] = magneto.AXIS_X & 0xFF;
	AppData->Buff[i++] = (magneto.AXIS_Y >> 8) & 0xFF;
	AppData->Buff[i++] = magneto.AXIS_Y & 0xFF;
	AppData->Buff[i++] = (magneto.AXIS_Z >> 8) & 0xFF;
	AppData->Buff[i++] = magneto.AXIS_Z & 0xFF;
	
  AppData->Buff[i++] = batteryLevel;
  AppData->Buff[i++] = ( latitude >> 16 ) & 0xFF;
  AppData->Buff[i++] = ( latitude >> 8 ) & 0xFF;
  AppData->Buff[i++] = latitude & 0xFF;
  AppData->Buff[i++] = ( longitude >> 16 ) & 0xFF;
  AppData->Buff[i++] = ( longitude >> 8 ) & 0xFF;
  AppData->Buff[i++] = longitude & 0xFF;
  AppData->Buff[i++] = ( altitudeGps >> 8 ) & 0xFF;
  AppData->Buff[i++] = altitudeGps & 0xFF;
#endif

#if 1

	//tera term not Cayanne
  PRINTF("\n\r");
  PRINTF("temperature=%d,%d degC\n\r", temperature/100, temperature-(temperature/100)*100);
  PRINTF("pressure=%d hPa\n\r", pressure/10);
  PRINTF("humidity=%d,%d %%\n\r", humidity/10, humidity-(humidity/10)*10);
  PRINTF("batteryLevel=%d %%\n\r", batteryLevel*100/255);
	
	PRINTF ("acelero axis x = %d \n\r",accelero.AXIS_X);
	PRINTF ("acelero axis y = %d \n\r",accelero.AXIS_Y);
	PRINTF ("acelero axis z = %d \n\r\n\r",accelero.AXIS_Z);
	
	PRINTF ("gyroscope axis x = %d \n\r",gyro.AXIS_X);
	PRINTF ("gyroscope axis y = %d \n\r",gyro.AXIS_Y);
	PRINTF ("gyroscope axis z = %d \n\r\n\r",gyro.AXIS_Z);
	
	PRINTF ("magnetometer axis x = %d \n\r",magneto.AXIS_X);
	PRINTF ("magnetometer  axis y = %d \n\r",magneto.AXIS_Y);
	PRINTF ("magnetometer  axis z = %d \n\r\n\r",magneto.AXIS_Z);
	
	PRINTF ("winddirection : %d\n\r\n\r",winddirection);

  if ( AppLedStateOn == RESET )
  {
    PRINTF("LED Status: LED OFF\n\r");
  }
  else
  {
    PRINTF("LED Status: LED ON\n\r");
  }
  PRINTF("\n\r");
#endif
#endif
  AppData->BuffSize = i;
  //TEST_NUMBER_DATA = AppData->BuffSize;
  /* USER CODE END 3 */
}
    
static void LoraRxData( lora_AppData_t *AppData )
{
  /* USER CODE BEGIN 4 */
  switch (AppData->Port)
  {
  case LORAWAN_APP_PORT:
    if( AppData->BuffSize == 1 )
    {
      AppLedStateOn = AppData->Buff[0] & 0x01;
      if ( AppLedStateOn == RESET )
      {
        PRINTF("LED OFF\n\r");
        LED_Off( LED_BLUE ) ; 
        
      }
      else
      {
        PRINTF("LED ON\n\r");
        LED_On( LED_BLUE ) ; 
      }
      //GpioWrite( &Led3, ( ( AppLedStateOn & 0x01 ) != 0 ) ? 0 : 1 );
    }
    break;
  case LPP_APP_PORT:
  {
    AppLedStateOn= (AppData->Buff[2] == 100) ?  0x01 : 0x00;
      if ( AppLedStateOn == RESET )
      {
        PRINTF("LED OFF\n\r");
        LED_Off( LED_BLUE ) ; 
        
      }
      else
      {
        PRINTF("LED ON\n\r");
        LED_On( LED_BLUE ) ; 
      }
    break;
  }
  default:
    break;
  }
  /* USER CODE END 4 */
}

//calculate magneto 
static int16_t mag_concatenation(int32_t magx, int32_t magy){
  double heading = atan2 (magy, magx) * 180 / PI;

  if (heading < 0) {
		heading += 360;
  } 
	else if (heading >360) {
    heading -= 360;
	}

	if (heading > 180) {
		heading = heading - 360;
	}
	
	return (int16_t) (0-heading);
}

////////////////////////////////////////////////
#ifdef USE_B_L072Z_LRWAN1
static void OnTimerLedEvent( void )
{
  LED_Off( LED_RED1 ) ; 
}
#endif
/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
