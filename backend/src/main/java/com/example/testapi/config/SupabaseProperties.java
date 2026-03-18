package com.example.testapi.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Supabase configuration properties.
 * Registers custom supabase.* properties with Spring Boot.
 */
@Component
@ConfigurationProperties(prefix = "supabase")
public class SupabaseProperties {
    private String url;
    private ApiKey api = new ApiKey();

    public static class ApiKey {
        private String key;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public ApiKey getApi() {
        return api;
    }

    public void setApi(ApiKey api) {
        this.api = api;
    }
}
