#include <Arduino.h>
#include <WiFi.h>
#include <ESP_I2S.h>

#define SAMPLE_RATE 16000
#define FREQUENCY 4000

#define BCLK_PIN 26
#define LRC_PIN 27
#define DATA_PIN 25

I2SClass I2S;

void setup()
{
    Serial.begin(115200);
    WiFi.begin(WIFI_SSID, WIFI_PASS);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    
    Serial.printf("Connected to WiFi network with IP Address: %s\n", WiFi.localIP().toString().c_str());
    WiFi.setSleep(false);

    I2S.setPins(BCLK_PIN, LRC_PIN, DATA_PIN);

    if (!I2S.begin(I2S_MODE_STD, SAMPLE_RATE, I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_STEREO)) {
        Serial.println("Failed to initialize I2S");
        while (1) {
            delay(1000);
        }
    }

}

void sendAudioFrame() {
    int16_t samples[256 * 2]; // 256 samples for stereo
    for (int i = 0; i < 256; i++) {
        float angle = 2.0f * PI * FREQUENCY * i / SAMPLE_RATE;
        int16_t sample = sinf(angle) * 4096; // Scale to 12-bit range
        samples[i * 2] = sample;     // Left channel
        samples[i * 2 + 1] = sample; // Right channel
    }

    I2S.write((uint8_t*)samples, sizeof(samples));
}

void loop()
{
    // sendAudioFrame();
    delay(1000);
    Serial.println("Sending audio frame...");
}