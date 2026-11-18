idf_component_register(SRCS "main.cpp"
                    INCLUDE_DIRS ".")

# add env WIFI_SSID and WIFI_PASS to refister a define
target_compile_definitions(${COMPONENT_LIB} PRIVATE
    WIFI_SSID="$ENV{WIFI_SSID}"
    WIFI_PASS="$ENV{WIFI_PASS}"
)