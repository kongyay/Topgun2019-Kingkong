/*
 * stm32l475e_iot01_proximity.h
 *
 *  Created on: 9 Á.¤. 2562
 *      Author: maro2895
 */

#ifndef BSP_B_L475E_IOT01_STM32L475E_IOT01_PROXIMITY_H_
#define BSP_B_L475E_IOT01_STM32L475E_IOT01_PROXIMITY_H_

#ifdef __cplusplus
 extern "C" {
#endif

 /* Include---------------------------------------------*/
#include "main.h"

/* Include Proximity component driver */
#include "stm32l4xx_hal.h"
#include "stm32l475e_iot01.h"

#include "vl53l0x_def.h"
#include "vl53l0x_api.h"
#include "vl53l0x_tof.h"

/* Driver---------------------------------------*/
#define PROXIMITY_I2C_ADDRESS         ((uint16_t)0x0052)
#define VL53L0X_ID                    ((uint16_t)0xEEAA)
#define VL53L0X_XSHUT_Pin GPIO_PIN_6
#define VL53L0X_XSHUT_GPIO_Port GPIOC
 /** @addtogroup BSP
   * @{
   */

 /** @addtogroup STM32L475E_IOT01
   * @{
   */

 /** @addtogroup STM32L475E_IOT01_PROXIMITY
   * @{
   */

 /** @defgroup STM32L475_IOT01_PROXIMITY_Exported_Types PROXIMITY Exported Types
   * @{
   */

 /* Exported types ------------------------------------------------------------*/
 /**
   * @}
   */

 /** @defgroup STM32L475E_IOT01_PROXIMITY_Exported_Functions PROXIMITY Exported Functions
   * @{
   */

void VL53L0X_PROXIMITY_MspInit(void);
uint16_t VL53L0X_PROXIMITY_GetDistance(void);
void VL53L0X_PROXIMITY_Init(void);

#ifdef __cplusplus
}
#endif

#endif /* BSP_B_L475E_IOT01_STM32L475E_IOT01_PROXIMITY_H_ */
