package com.example.testapi.controller;

import java.util.Map;

import com.example.testapi.exception.BusinessException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    private String safeMessage(Exception ex, String fallback) {
        if (ex == null || ex.getMessage() == null || ex.getMessage().isBlank()) {
            return fallback;
        }
        return ex.getMessage();
    }

    private ResponseEntity<Map<String, Object>> errorResponse(HttpStatus status, String code, String message) {
        return ResponseEntity.status(status).body(Map.of(
            "success", false,
            "message", message,
            "error", Map.of(
                "code", code,
                "message", message
            )
        ));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, Object>> handleBusiness(BusinessException ex) {
        return errorResponse(HttpStatus.CONFLICT, ex.getCode(), safeMessage(ex, "Business rule violation"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "VALIDATION-001", safeMessage(ex, "Invalid request"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(RuntimeException ex) {
        return errorResponse(HttpStatus.BAD_REQUEST, "RUNTIME-001", safeMessage(ex, "Request failed"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "SYSTEM-001", safeMessage(ex, "Internal server error"));
    }
}
