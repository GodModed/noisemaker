#include <Arduino.h>
#include <WiFi.h>
#include <ESP_I2S.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

#define SERVER_URL "institutes-pregnancy-freely-consultant.trycloudflare.com"

JsonDocument state;

#define BCLK_PIN 26
#define LRC_PIN 27
#define DATA_PIN 25

I2SClass I2S;
WebSocketsClient webSocket;


void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            Serial.println("WebSocket disconnected");
            break;
        case WStype_CONNECTED:
            Serial.println("WebSocket connected");
            break;
        case WStype_TEXT:
            Serial.printf("WebSocket text message: %s\n", payload);
            deserializeJson(state, payload);

            break;
        case WStype_BIN:
            Serial.printf("WebSocket binary message of length: %u\n", length);
            break;
        default:
            break;
    }
}

void setup()
{

    // set initial config
    state["volume"] = 0.5;
    state["frequency"] = 1000;
    state["playing"] = 0;
    state["sampleRate"] = 16000;

    Serial.begin(115200);

    // set ntp time
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");

    WiFi.begin(WIFI_SSID, WIFI_PASS);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Connecting to WiFi...");
    }
    
    Serial.printf("Connected to WiFi network with IP Address: %s\n", WiFi.localIP().toString().c_str());
    WiFi.setSleep(false);

    I2S.setPins(BCLK_PIN, LRC_PIN, DATA_PIN);

    if (!I2S.begin(I2S_MODE_STD, state["sampleRate"], I2S_DATA_BIT_WIDTH_16BIT, I2S_SLOT_MODE_STEREO)) {
        Serial.println("Failed to initialize I2S");
        while (1) {
            delay(1000);
        }
    }

    webSocket.onEvent(webSocketEvent);
    webSocket.beginSSL(SERVER_URL, 443, "/ws");

}

void sendAudioFrame() {

    int16_t samples[256 * 2]; // 256 samples for stereo
    for (int i = 0; i < 256; i++) {
        float angle = 2.0f * PI * (float) state["frequency"] * i / (float) state["sampleRate"];
        int16_t sample = sinf(angle) * (float) state["volume"] * 32767; // Scale to 12-bit range
        samples[i * 2] = sample;     // Left channel
        samples[i * 2 + 1] = sample; // Right channel
    }

    I2S.write((uint8_t*)samples, sizeof(samples));
}

void loop()
{
    webSocket.loop();
    if (WiFi.isConnected()) {
        sendAudioFrame();
    }
}