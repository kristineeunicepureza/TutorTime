package com.example.testapi.controller;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.anyString;
import org.mockito.Mockito;
import static org.mockito.Mockito.when;

import com.example.testapi.model.BookingDetailResponse;
import com.example.testapi.service.AuthService;
import com.example.testapi.service.BookingService;

class BookingControllerWebMvcTest {

    private static void setField(Object target, String fieldName, Object value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (NoSuchFieldException | IllegalAccessException e) {
            throw new RuntimeException("Failed to set field: " + fieldName, e);
        }
    }

    private BookingController buildController(AuthService authService, BookingService bookingService) {
        BookingController controller = new BookingController();
        setField(controller, "authService", authService);
        setField(controller, "bookingService", bookingService);
        return controller;
    }

    @Test
    void getStudentBookings_returnsRoleScopedData() throws Exception {
        AuthService authService = Mockito.mock(AuthService.class);
        BookingService bookingService = Mockito.mock(BookingService.class);
        BookingController controller = buildController(authService, bookingService);

        BookingDetailResponse booking = new BookingDetailResponse();
        booking.setId("student-booking-1");
        booking.setStatus("CONFIRMED");

        when(authService.extractToken(anyString())).thenReturn("student-token");
        when(authService.verifyTokenAndGetUid("student-token")).thenReturn("student-user-id");
        when(bookingService.getStudentBookingsWithDetails("student-user-id")).thenReturn(
            List.of(booking)
        );

        Map<String, Object> response = controller.getStudentBookings("Bearer student-token");

        assertEquals(Boolean.TRUE, response.get("success"));
        List<?> data = (List<?>) response.get("data");
        assertTrue(data.size() == 1);
        BookingDetailResponse first = (BookingDetailResponse) data.getFirst();
        assertEquals("student-booking-1", first.getId());
    }

    @Test
    void getTutorBookings_returnsRoleScopedData() throws Exception {
        AuthService authService = Mockito.mock(AuthService.class);
        BookingService bookingService = Mockito.mock(BookingService.class);
        BookingController controller = buildController(authService, bookingService);

        BookingDetailResponse booking = new BookingDetailResponse();
        booking.setId("tutor-booking-1");
        booking.setStatus("PENDING");

        when(authService.extractToken(anyString())).thenReturn("tutor-token");
        when(authService.verifyTokenAndGetUid("tutor-token")).thenReturn("tutor-user-id");
        when(bookingService.getTutorBookingsWithDetails("tutor-user-id")).thenReturn(
            List.of(booking)
        );

        Map<String, Object> response = controller.getTutorBookings("Bearer tutor-token");

        assertEquals(Boolean.TRUE, response.get("success"));
        List<?> data = (List<?>) response.get("data");
        assertTrue(data.size() == 1);
        BookingDetailResponse first = (BookingDetailResponse) data.getFirst();
        assertEquals("tutor-booking-1", first.getId());
    }
}
