package com.example.tutortime.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.example.tutortime.HomeActivity
import com.example.tutortime.R

class ProfileFragment : Fragment() {

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_profile, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        val homeActivity = activity as? HomeActivity
        val name  = homeActivity?.intent?.getStringExtra("user_name") ?: "Kristine Dela Cruz"
        val role  = homeActivity?.intent?.getStringExtra("user_role") ?: "student"
        val email = homeActivity?.intent?.getStringExtra("user_email") ?: "kristine@tutortime.ph"

        view.findViewById<TextView>(R.id.tvProfileInitial).text =
            name.firstOrNull()?.uppercaseChar()?.toString() ?: "K"
        view.findViewById<TextView>(R.id.tvProfileName).text  = name
        view.findViewById<TextView>(R.id.tvProfileEmail).text = email
        view.findViewById<TextView>(R.id.tvDetailName).text   = name
        view.findViewById<TextView>(R.id.tvDetailEmail).text  = email
        view.findViewById<TextView>(R.id.tvDetailRole).text   =
            role.replaceFirstChar { it.uppercase() }

        view.findViewById<LinearLayout>(R.id.rowEditProfile).setOnClickListener {
            Toast.makeText(requireContext(), "Edit Profile coming soon", Toast.LENGTH_SHORT).show()
        }
        view.findViewById<LinearLayout>(R.id.rowChangePassword).setOnClickListener {
            Toast.makeText(requireContext(), "Change Password coming soon", Toast.LENGTH_SHORT).show()
        }
        view.findViewById<LinearLayout>(R.id.rowNotifications).setOnClickListener {
            Toast.makeText(requireContext(), "Notifications coming soon", Toast.LENGTH_SHORT).show()
        }

        view.findViewById<Button>(R.id.btnLogout).setOnClickListener {
            (activity as? HomeActivity)?.logout()
        }
    }
}