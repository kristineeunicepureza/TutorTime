package com.example.tutortime.models

data class Tutor(
    val name: String,
    val subject: String,
    val rating: Double,
    val reviews: Int,
    val isVerified: Boolean = true
)