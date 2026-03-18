package com.example.testapi.config;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.ServerSocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.ConfigurableWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.stereotype.Component;

@Component
public class PortFallbackConfig implements WebServerFactoryCustomizer<ConfigurableWebServerFactory> {

    private static final Logger log = LoggerFactory.getLogger(PortFallbackConfig.class);

    @Value("${server.port:8083}")
    private int preferredPort;

    @Override
    public void customize(ConfigurableWebServerFactory factory) {
        // 0 means random port; keep that behavior untouched.
        if (preferredPort <= 0) {
            return;
        }

        if (isPortAvailable(preferredPort)) {
            return;
        }

        int fallbackPort = findNextAvailablePort(preferredPort + 1, preferredPort + 50);
        if (fallbackPort > 0) {
            log.warn("Preferred port {} is in use. Falling back to port {}.", preferredPort, fallbackPort);
            factory.setPort(fallbackPort);
            return;
        }

        log.error("Preferred port {} is in use and no fallback port was found in range {}-{}.",
            preferredPort,
            preferredPort + 1,
            preferredPort + 50);
    }

    private boolean isPortAvailable(int port) {
        try (ServerSocket socket = new ServerSocket()) {
            socket.setReuseAddress(true);
            socket.bind(new InetSocketAddress("0.0.0.0", port));
            return true;
        } catch (IOException ex) {
            return false;
        }
    }

    private int findNextAvailablePort(int start, int end) {
        for (int port = start; port <= end; port++) {
            if (isPortAvailable(port)) {
                return port;
            }
        }
        return -1;
    }
}
