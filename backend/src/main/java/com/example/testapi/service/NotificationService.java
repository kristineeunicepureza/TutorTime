package com.example.testapi.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.testapi.entity.Notification;
import com.example.testapi.repository.NotificationRepository;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    /**
     * Send booking-related notification
     */
    public void sendBookingNotification(String userId, String fromUserId, String bookingId, String message) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType("BOOKING_NOTIFICATION");
        notification.setMessage(message);
        notification.setRelatedBookingId(bookingId);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    /**
     * Send tutor approval notification
     */
    public void sendApprovalNotification(String tutorUserId, String message) {
        Notification notification = new Notification();
        notification.setUserId(tutorUserId);
        notification.setType("TUTOR_APPROVED");
        notification.setMessage(message);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    /**
     * Send tutor rejection notification
     */
    public void sendRejectionNotification(String tutorUserId, String message) {
        Notification notification = new Notification();
        notification.setUserId(tutorUserId);
        notification.setType("TUTOR_REJECTED");
        notification.setMessage(message);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get unread notifications
     */
    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    /**
     * Mark notification as read
     */
    public void markAsRead(String notificationId) {
        Optional<Notification> opt = notificationRepository.findById(notificationId);
        if (opt.isPresent()) {
            Notification notification = opt.get();
            notification.markAsRead();
            notificationRepository.save(notification);
        }
    }
}
