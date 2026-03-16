package com.example.tutortime.fragments

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.tutortime.R
import com.example.tutortime.adapters.BookingAdapter
import com.example.tutortime.models.BookingItem

class BookingsFragment : Fragment() {

    private lateinit var rvBookings: RecyclerView
    private lateinit var tabUpcoming: TextView
    private lateinit var tabCompleted: TextView
    private lateinit var tabCancelled: TextView

    private val upcoming = listOf(
        BookingItem("Mark Reyes",     "Mathematics", "Mon, 3:00 PM", "Room 201", "Confirmed"),
        BookingItem("Ana Santos",     "Physics",     "Tue, 1:00 PM", "Room 105", "Confirmed"),
        BookingItem("Lea Villanueva", "Chemistry",   "Wed, 4:30 PM", "Room 312", "Pending"),
    )
    private val completed = listOf(
        BookingItem("Ryan Cruz", "Physics",  "Last Mon", "Room 201", "Completed"),
        BookingItem("Carlo Lim", "Data Sci", "Last Thu", "Online",   "Completed"),
    )
    private val cancelled = listOf(
        BookingItem("Sophia Tan", "English", "Mar 1", "Online", "Cancelled"),
    )

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_bookings, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        rvBookings   = view.findViewById(R.id.rvBookings)
        tabUpcoming  = view.findViewById(R.id.tabUpcoming)
        tabCompleted = view.findViewById(R.id.tabCompleted)
        tabCancelled = view.findViewById(R.id.tabCancelled)

        rvBookings.layoutManager = LinearLayoutManager(requireContext())
        selectTab("upcoming")

        tabUpcoming.setOnClickListener  { selectTab("upcoming")  }
        tabCompleted.setOnClickListener { selectTab("completed") }
        tabCancelled.setOnClickListener { selectTab("cancelled") }
    }

    private fun selectTab(tab: String) {
        listOf(tabUpcoming, tabCompleted, tabCancelled).forEach { t ->
            t.background = ContextCompat.getDrawable(requireContext(), R.drawable.bg_tab_inactive)
            t.setTextColor(Color.parseColor("#6B7280"))
        }

        val activeTab = when (tab) {
            "upcoming"  -> tabUpcoming
            "completed" -> tabCompleted
            else        -> tabCancelled
        }
        activeTab.background = ContextCompat.getDrawable(requireContext(), R.drawable.bg_tab_active)
        activeTab.setTextColor(Color.WHITE)

        val data = when (tab) {
            "upcoming"  -> upcoming
            "completed" -> completed
            else        -> cancelled
        }
        rvBookings.adapter = BookingAdapter(data)
    }
}