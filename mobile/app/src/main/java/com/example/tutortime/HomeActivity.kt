package com.example.tutortime

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.widget.FrameLayout
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.example.tutortime.fragments.BookingsFragment
import com.example.tutortime.fragments.DashboardFragment
import com.example.tutortime.fragments.FindTutorsFragment
import com.example.tutortime.fragments.ProfileFragment
import com.google.android.material.bottomnavigation.BottomNavigationView

class HomeActivity : AppCompatActivity() {

    private lateinit var bottomNav: BottomNavigationView
    private lateinit var tvUserName: TextView
    private lateinit var tvUserRole: TextView
    private lateinit var tvAvatarInitial: TextView
    private lateinit var btnNotif: FrameLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        // White status bar with dark icons
        window.statusBarColor = Color.WHITE
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR

        initViews()
        populateUserInfo()
        setupBottomNav()

        // Load default tab
        if (savedInstanceState == null) {
            loadFragment(DashboardFragment())
            bottomNav.selectedItemId = R.id.nav_dashboard
        }
    }

    private fun initViews() {
        bottomNav       = findViewById(R.id.bottomNav)
        tvUserName      = findViewById(R.id.tvUserName)
        tvUserRole      = findViewById(R.id.tvUserRole)
        tvAvatarInitial = findViewById(R.id.tvAvatarInitial)
        btnNotif        = findViewById(R.id.btnNotif)

        btnNotif.setOnClickListener {
            // TODO: show notification panel
        }
    }

    private fun populateUserInfo() {
        val name = intent.getStringExtra("user_name") ?: "Kristine"
        val role = intent.getStringExtra("user_role") ?: "student"

        tvUserName.text      = name.split(" ").firstOrNull() ?: name
        tvUserRole.text      = role.uppercase()
        tvAvatarInitial.text = name.firstOrNull()?.uppercaseChar()?.toString() ?: "K"
    }

    private fun setupBottomNav() {
        bottomNav.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_dashboard   -> { loadFragment(DashboardFragment());   true }
                R.id.nav_find_tutors -> { loadFragment(FindTutorsFragment());  true }
                R.id.nav_bookings    -> { loadFragment(BookingsFragment());    true }
                R.id.nav_profile     -> { loadFragment(ProfileFragment());     true }
                else -> false
            }
        }
    }

    private fun loadFragment(fragment: Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    fun setTopbarUser(name: String, role: String) {
        tvUserName.text      = name.split(" ").firstOrNull() ?: name
        tvUserRole.text      = role.uppercase()
        tvAvatarInitial.text = name.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
    }

    fun logout() {
        val intent = Intent(this, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
    }
}