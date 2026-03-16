package com.example.tutortime

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.text.method.HideReturnsTransformationMethod
import android.text.method.PasswordTransformationMethod
import android.view.View
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.widget.addTextChangedListener

class LoginActivity : AppCompatActivity() {

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnSignIn: Button
    private lateinit var tvForgotPassword: TextView
    private lateinit var tvSignUp: TextView
    private lateinit var tvError: TextView
    private lateinit var layoutError: LinearLayout
    private lateinit var ivTogglePassword: ImageView
    private lateinit var fieldEmail: LinearLayout
    private lateinit var fieldPassword: LinearLayout

    private var isPasswordVisible = false
    private var isLoading = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Make status bar white with dark icons
        window.statusBarColor = Color.WHITE
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR

        initViews()
        setupFocusListeners()
        setupClickListeners()
    }

    private fun initViews() {
        etEmail          = findViewById(R.id.etEmail)
        etPassword       = findViewById(R.id.etPassword)
        btnSignIn        = findViewById(R.id.btnSignIn)
        tvForgotPassword = findViewById(R.id.tvForgotPassword)
        tvSignUp         = findViewById(R.id.tvSignUp)
        tvError          = findViewById(R.id.tvError)
        layoutError      = findViewById(R.id.layoutError)
        ivTogglePassword = findViewById(R.id.ivTogglePassword)
        fieldEmail       = findViewById(R.id.fieldEmail)
        fieldPassword    = findViewById(R.id.fieldPassword)
    }

    // ── Focus: highlight input border on focus ──────────────────────────────
    private fun setupFocusListeners() {
        etEmail.setOnFocusChangeListener { _, hasFocus ->
            fieldEmail.background = ContextCompat.getDrawable(
                this,
                if (hasFocus) R.drawable.bg_input_field_focused else R.drawable.bg_input_field
            )
        }

        etPassword.setOnFocusChangeListener { _, hasFocus ->
            fieldPassword.background = ContextCompat.getDrawable(
                this,
                if (hasFocus) R.drawable.bg_input_field_focused else R.drawable.bg_input_field
            )
        }

        // Hide error when user starts typing
        etEmail.addTextChangedListener { hideError() }
        etPassword.addTextChangedListener { hideError() }
    }

    // ── Click listeners ─────────────────────────────────────────────────────
    private fun setupClickListeners() {

        // Toggle password visibility
        ivTogglePassword.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            etPassword.transformationMethod =
                if (isPasswordVisible) HideReturnsTransformationMethod.getInstance()
                else PasswordTransformationMethod.getInstance()
            etPassword.setSelection(etPassword.text.length)
            ivTogglePassword.setImageResource(
                if (isPasswordVisible) R.drawable.ic_eye_on else R.drawable.ic_eye_off
            )
        }

        // Sign In
        btnSignIn.setOnClickListener {
            if (!isLoading) attemptLogin()
        }

        // Forgot Password
        tvForgotPassword.setOnClickListener {
            // TODO: Navigate to ForgotPasswordActivity
            Toast.makeText(this, "Forgot password coming soon", Toast.LENGTH_SHORT).show()
        }

        // Sign Up
        tvSignUp.setOnClickListener {
            startActivity(Intent(this, SignUpActivity::class.java))
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }
    }

    // ── Login logic ─────────────────────────────────────────────────────────
    private fun attemptLogin() {
        val email    = etEmail.text.toString().trim()
        val password = etPassword.text.toString()

        // Basic validation
        when {
            email.isEmpty() -> {
                showError("Please enter your email address.")
                etEmail.requestFocus()
                return
            }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                showError("Please enter a valid email address.")
                etEmail.requestFocus()
                return
            }
            password.isEmpty() -> {
                showError("Please enter your password.")
                etPassword.requestFocus()
                return
            }
            password.length < 6 -> {
                showError("Password must be at least 6 characters.")
                etPassword.requestFocus()
                return
            }
        }

        setLoading(true)

        // TODO: Replace with real auth (e.g. Firebase / Supabase / API call)
        simulateLogin(email, password)
    }

    /** Simulates an async network call — replace with real auth */
    private fun simulateLogin(email: String, password: String) {
        android.os.Handler(mainLooper).postDelayed({
            setLoading(false)

            // Demo: treat any well-formed input as success
            if (password == "wrongpass") {
                showError("Incorrect email or password. Please try again.")
            } else {
                // Navigate to HomeActivity
                startActivity(Intent(this, HomeActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                })
                overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            }
        }, 1500)
    }

    // ── UI helpers ──────────────────────────────────────────────────────────
    private fun setLoading(loading: Boolean) {
        isLoading = loading
        btnSignIn.isEnabled = !loading
        etEmail.isEnabled   = !loading
        etPassword.isEnabled = !loading
        btnSignIn.text = if (loading) "Signing in…" else "Sign In"
        btnSignIn.alpha = if (loading) 0.7f else 1f
    }

    private fun showError(message: String) {
        tvError.text      = message
        layoutError.visibility = View.VISIBLE

        // Shake animation
        val shake = AnimationUtils.loadAnimation(this, R.anim.shake)
        layoutError.startAnimation(shake)
    }

    private fun hideError() {
        if (layoutError.visibility == View.VISIBLE) {
            layoutError.visibility = View.GONE
        }
    }
}