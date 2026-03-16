package com.example.testapi.controller;

import com.example.testapi.entity.Notification;
import com.example.testapi.service.NotificationService;
import com.example.testapi.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuthService authService;

    /**
     * Get all notifications for logged-in user
     * GET /api/notifications
     */
    @GetMapping
    public Map<String, Object> getNotifications(
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        
        List<Notification> notifications = notificationService.getNotifications(userId);
        
        return Map.of(
            "success", true,
            "count", notifications.size(),
            "data", notifications
        );
    }

    /**
     * Get unread notifications
     * GET /api/notifications/unread
     */
    @GetMapping("/unread")
    public Map<String, Object> getUnreadNotifications(
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        String userId = authService.verifyTokenAndGetUid(token);
        
        List<Notification> notifications = notificationService.getUnreadNotifications(userId);
        
        return Map.of(
            "success", true,
            "count", notifications.size(),
            "data", notifications
        );
    }

    /**
     * Mark a notification as read
     * PUT /api/notifications/{notificationId}/read
     */
    @PutMapping("/{notificationId}/read")
    public Map<String, Object> markAsRead(
            @PathVariable String notificationId,
            @RequestHeader("Authorization") String authorization) throws Exception {
        
        String token = authService.extractToken(authorization);
        authService.verifyTokenAndGetUid(token);
        
        notificationService.markAsRead(notificationId);
        
        return Map.of(
            "success", true,
            "message", "Notification marked as read"
        );
    }
}
