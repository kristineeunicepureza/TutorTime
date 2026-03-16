package com.example.tutortime.models

data class BookingItem(
    val tutorName: String,
    val subject: String,
    val time: String,
    val location: String,
    val status: String
)