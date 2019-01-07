/*#include "SPI.h"
#include "SPBTLE_RF.h"
#include "beacon_service.h"


#define PIN_BLE_SPI_MOSI   (11)
#define PIN_BLE_SPI_MISO   (12)
#define PIN_BLE_SPI_SCK    (3)

#define PIN_BLE_SPI_nCS    (A1)
#define PIN_BLE_SPI_RESET  (7)
#define PIN_BLE_SPI_IRQ    (A0)

#define PIN_BLE_LED    (0xFF)

#define SerialPort Serial

// Configure BTLE_SPI
SPIClass BTLE_SPI(PIN_BLE_SPI_MOSI, PIN_BLE_SPI_MISO, PIN_BLE_SPI_SCK);

// Configure BTLE pins
SPBTLERFClass BTLE(&BTLE_SPI, PIN_BLE_SPI_nCS, PIN_BLE_SPI_IRQ, PIN_BLE_SPI_RESET, PIN_BLE_LED);

// Mac address
uint8_t SERVER_BDADDR[] = {0x12, 0x34, 0x00, 0xE1, 0x80, 0x03};

//Comment this line to use URL mode
#define USE_UID_MODE

#ifdef USE_UID_MODE
// Beacon ID, the 6 last bytes are used for NameSpace
uint8_t NameSpace[] = "ST BTLE";
uint8_t beaconID[] = {0x1, 0x2, 0x3, 0x4, 0x5, 0x6};
#else
char url[] = "www.st.com";
#endif

void setup() {
  SerialPort.begin(115200);

  if(BTLE.begin())
  {
    SerialPort.println("Bluetooth module configuration error!");
    while(1);
  }

#ifdef USE_UID_MODE
  // Enable the beacon service in UID mode
  if(BeaconService.begin(SERVER_BDADDR, beaconID, NameSpace))
  {
    SerialPort.println("Beacon service configuration error!");
    while(1);
  }
  else
  {
    SerialPort.println("Beacon service started!");
  }
#else
  //Enable the beacon service in URL mode
  if(BeaconService.begin(SERVER_BDADDR, url))
  {
    SerialPort.println("Beacon service configuration error!");
    while(1);
  }
  else
  {
    SerialPort.println("Beacon service started!");
  }
#endif
}

void loop() {
  // Update the BLE module state
  BTLE.update();
}
*/