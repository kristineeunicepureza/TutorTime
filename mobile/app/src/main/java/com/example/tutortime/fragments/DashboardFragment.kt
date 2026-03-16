package com.example.tutortime.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.example.tutortime.HomeActivity
import com.example.tutortime.R
import com.google.android.material.bottomnavigation.BottomNavigationView
import java.util.Calendar

class DashboardFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_dashboard, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // 1. Determine the Greeting based on Time
        val greetingRes = when (Calendar.getInstance().get(Calendar.HOUR_OF_DAY)) {
            in 0..11 -> R.string.greeting_morning
            in 12..17 -> R.string.greeting_afternoon
            else -> R.string.greeting_evening
        }
        val greeting = getString(greetingRes)

        // 2. Get User Name from Intent (First Name only)
        val userName = (activity as? HomeActivity)
            ?.intent?.getStringExtra("user_name")
            ?.split(" ")
            ?.firstOrNull()
            ?: getString(R.string.default_name)

        // 3. Set the Greeting using the placeholder resource
        val tvGreeting = view.findViewById<TextView>(R.id.tvGreeting)
        tvGreeting.text = getString(R.string.dashboard_greeting, greeting, userName)

        // 4. Set up Navigation Click Listeners
        view.findViewById<TextView>(R.id.tvSeeAllBookings).setOnClickListener {
            navigateToTab(R.id.nav_bookings)
        }

        view.findViewById<TextView>(R.id.tvSeeAllTutors).setOnClickListener {
            navigateToTab(R.id.nav_find_tutors)
        }
    }

    // Helper to keep code clean
    private fun navigateToTab(itemId: Int) {
        activity?.findViewById<BottomNavigationView>(R.id.bottomNav)?.selectedItemId = itemId
    }
}