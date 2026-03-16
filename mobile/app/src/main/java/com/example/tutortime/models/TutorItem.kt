package com.example.tutortime.models

data class TutorItem(
    val name: String,
    val subject: String,
    val tags: List<String>,
    val rating: Float,
    val sessions: Int
)