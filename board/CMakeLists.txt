# For more information about build system see
# https://docs.espressif.com/projects/esp-idf/en/latest/api-guides/build-system.html
# The following five lines of boilerplate have to be in your project's
# CMakeLists in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.16)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(board)

# Arduino RC1 omits I2S fields added in ESP-IDF 6.1; keep warnings non-fatal.
idf_component_get_property(arduino_lib espressif__arduino-esp32 COMPONENT_LIB)
target_compile_options(${arduino_lib} PRIVATE
    -Wno-error=missing-field-initializers
)
