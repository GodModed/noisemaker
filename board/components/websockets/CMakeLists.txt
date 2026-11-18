set(websocket_root "${CMAKE_CURRENT_LIST_DIR}/../arduinoWebSockets")

file(GLOB_RECURSE websocket_sources
    "${websocket_root}/src/*.cpp"
    "${websocket_root}/src/*.c"
)

idf_component_register(
    SRCS ${websocket_sources}
    INCLUDE_DIRS "${websocket_root}/src"
    REQUIRES espressif__arduino-esp32
)
