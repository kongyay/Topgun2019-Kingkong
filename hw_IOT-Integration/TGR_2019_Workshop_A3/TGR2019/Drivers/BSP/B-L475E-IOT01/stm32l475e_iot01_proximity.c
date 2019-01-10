/**
  ******************************************************************************
  * @file    stm32l475e_iot01_proximity.c
  * @author  Maro2985
  * @brief   This file provides a set of functions needed to manage the proximity sensor
  ******************************************************************************
 */
 /* Include--------------------------------------------------------------------*/
#include "stm32l475e_iot01_proximity.h"
#include "stdio.h"

#ifdef __GNUC__
/* With GCC/RAISONANCE, small msg_info (option LD Linker->Libraries->Small msg_info
   set to 'Yes') calls __io_putchar() */
#define PUTCHAR_PROTOTYPE int __io_putchar(int ch)
#define GETCHAR_PROTOTYPE int __io_getchar(void)
#else
#define PUTCHAR_PROTOTYPE int fputc(int ch, FILE *f)
#define GETCHAR_PROTOTYPE int fgetc(FILE *f)
#endif /* __GNUC__ */

/**
  * @}
  */

/** @defgroup STM32L475E_IOT01_PROXIMITY_Private_Functions PROXIMITY Private Functions
  * @{
  */ 

/**
  * @brief  Initializes peripherals used by the I2C Proximity Sensor driver.
  * @retval PROXIMITYSENSOR status
  */
extern I2C_HandleTypeDef hI2cHandler;
 VL53L0X_Dev_t Dev =
 {
   .I2cHandle = &hI2cHandler,
   .I2cDevAddr = PROXIMITY_I2C_ADDRESS
 };

extern UART_HandleTypeDef hDiscoUart;

void VL53L0X_PROXIMITY_Init(void)
{
  uint16_t vl53l0x_id = 0;
  VL53L0X_DeviceInfo_t VL53L0X_DeviceInfo;

  /* Initialize IO interface */
  SENSOR_IO_Init();
  VL53L0X_PROXIMITY_MspInit();

  memset(&VL53L0X_DeviceInfo, 0, sizeof(VL53L0X_DeviceInfo_t));

  if (VL53L0X_ERROR_NONE == VL53L0X_GetDeviceInfo(&Dev, &VL53L0X_DeviceInfo))
  {
    if (VL53L0X_ERROR_NONE == VL53L0X_RdWord(&Dev, VL53L0X_REG_IDENTIFICATION_MODEL_ID, (uint16_t *) &vl53l0x_id))
    {
      if (vl53l0x_id == VL53L0X_ID)
      {
        if (VL53L0X_ERROR_NONE == VL53L0X_DataInit(&Dev))
        {
          Dev.Present = 1;
          SetupSingleShot(Dev);
        }
        else
        {
          printf("VL53L0X Time of Flight Failed to send its ID!\n\r");
        }
      }
    }
    else
    {
      printf("VL53L0X Time of Flight Failed to Initialize!\n\r");
    }
  }
  else
  {
    printf("VL53L0X Time of Flight Failed to get infos!\n\r");
  }
}

/**
  * @brief  Get distance from VL53L0X proximity sensor.
  * @retval Distance in mm
  */
uint16_t VL53L0X_PROXIMITY_GetDistance(void)
{
  VL53L0X_RangingMeasurementData_t RangingMeasurementData;

  VL53L0X_PerformSingleRangingMeasurement(&Dev, &RangingMeasurementData);

  return RangingMeasurementData.RangeMilliMeter;
}

/**
  * @brief  VL53L0X proximity sensor Msp Initialization.
  */
void VL53L0X_PROXIMITY_MspInit(void)
{
  GPIO_InitTypeDef GPIO_InitStruct;

  /*Configure GPIO pin : VL53L0X_XSHUT_Pin */
  GPIO_InitStruct.Pin = VL53L0X_XSHUT_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_PULLUP;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
  HAL_GPIO_Init(VL53L0X_XSHUT_GPIO_Port, &GPIO_InitStruct);

  HAL_GPIO_WritePin(VL53L0X_XSHUT_GPIO_Port, VL53L0X_XSHUT_Pin, GPIO_PIN_SET);

  HAL_Delay(1000);
}
