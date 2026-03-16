package com.example.testapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
@Bean
public RestTemplate restTemplate() {
    // Use Apache HttpClient 5 to support PATCH requests
    HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory();
    return new RestTemplate(factory);
}
}