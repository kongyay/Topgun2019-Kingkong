/**
 ******************************************************************************
 * @file    i_nucleo_lrwan1_pressure.h
 * @author  MEMS Application Team
 * @version V1.0.0
 * @date    27-February-2017
 * @brief   This file contains definitions for i_nucleo_lrwan1_pressure.c
 ******************************************************************************
 * @attention
 *
 * <h2><center>&copy; COPYRIGHT(c) 2017 STMicroelectronics</center></h2>
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimer.
 *   2. Redistributions in binary form must reproduce the above copyright notice,
 *      this list of conditions and the following disclaimer in the documentation
 *      and/or other materials provided with the distribution.
 *   3. Neither the name of STMicroelectronics nor the names of its contributors
 *      may be used to endorse or promote products derived from this software
 *      without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 ******************************************************************************
 */

/* Define to prevent recursive inclusion -------------------------------------*/
#ifndef __I_NUCLEO_LRWAN1_PRESSURE_H
#define __I_NUCLEO_LRWAN1_PRESSURE_H

#ifdef __cplusplus
extern "C" {
#endif



/* Includes ------------------------------------------------------------------*/
#include "LPS25HB_Driver_HL.h"
#include "LPS22HB_Driver_HL.h"
#include "i_nucleo_lrwan1.h"
  

/** @addtogroup BSP BSP
 * @{
 */

/** @addtogroup I_NUCLEO_LRWAN1 I_I_NUCLEO_LRWAN1
 * @{
 */

/** @addtogroup I_NUCLEO_LRWAN1_PRESSURE Pressure
 * @{
 */

/** @addtogroup I_NUCLEO_LRWAN1_PRESSURE_Public_Types Public types
  * @{
  */

typedef enum
{
  PRESSURE_SENSORS_AUTO = -1, /* Always first element and equal to -1 */
  LPS25HB_P_0,                /* Default on board. */
  LPS25HB_P_1,                /* DIL24 adapter. */
  LPS22HB_P_0                 /* DIL24 adapter. */
} PRESSURE_ID_t;

/**
 * @}
 */

/** @addtogroup I_NUCLEO_LRWAN1_PRESSURE_Public_Defines Public defines
  * @{
  */

#define PRESSURE_SENSORS_MAX_NUM 3

/**
 * @}
 */

/** @addtogroup I_NUCLEO_LRWAN1_PRESSURE_Public_Function_Prototypes Public function prototypes
 * @{
 */

/* Sensor Configuration Functions */
DrvStatusTypeDef BSP_PRESSURE_Init( PRESSURE_ID_t id, void **handle );
DrvStatusTypeDef BSP_PRESSURE_DeInit( void **handle );
DrvStatusTypeDef BSP_PRESSURE_Sensor_Enable( void *handle );
DrvStatusTypeDef BSP_PRESSURE_Sensor_Disable( void *handle );
DrvStatusTypeDef BSP_PRESSURE_IsInitialized( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_PRESSURE_IsEnabled( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_PRESSURE_IsCombo( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_PRESSURE_Get_Instance( void *handle, uint8_t *instance );
DrvStatusTypeDef BSP_PRESSURE_Get_WhoAmI( void *handle, uint8_t *who_am_i );
DrvStatusTypeDef BSP_PRESSURE_Check_WhoAmI( void *handle );
DrvStatusTypeDef BSP_PRESSURE_Get_Press( void *handle, float *pressure );
DrvStatusTypeDef BSP_PRESSURE_Get_ODR( void *handle, float *odr );
DrvStatusTypeDef BSP_PRESSURE_Set_ODR( void *handle, SensorOdr_t odr );
DrvStatusTypeDef BSP_PRESSURE_Set_ODR_Value( void *handle, float odr );

DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Full_Status_Ext( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Fth_Status_Ext( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Ovr_Status_Ext( void *handle, uint8_t *status );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Data_Ext( void *handle, float *pressure, float *temperature );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Get_Num_Of_Samples_Ext( void *handle, uint8_t *nSamples );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Set_Mode_Ext( void *handle, uint8_t mode );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Set_Interrupt_Ext( void *handle, uint8_t interrupt );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Reset_Interrupt_Ext( void *handle, uint8_t interrupt );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Set_Watermark_Level_Ext( void *handle, uint8_t watermark );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Stop_On_Fth_Ext( void *handle, uint8_t status );
DrvStatusTypeDef BSP_PRESSURE_FIFO_Usage_Ext( void *handle, uint8_t status );

/**
 * @}
 */

/**
 * @}
 */

/**
 * @}
 */

/**
 * @}
 */

#ifdef __cplusplus
}
#endif

#endif /* __I_NUCLEO_LRWAN1_PRESSURE_H */

/************************ (C) COPYRIGHT STMicroelectronics *****END OF FILE****/
