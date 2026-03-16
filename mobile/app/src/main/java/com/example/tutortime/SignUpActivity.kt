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

class SignUpActivity : AppCompatActivity() {

    // Views
    private lateinit var btnBack: FrameLayout
    private lateinit var etFullName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnSignUp: Button
    private lateinit var tvLogin: TextView
    private lateinit var tvError: TextView
    private lateinit var layoutError: LinearLayout
    private lateinit var ivTogglePassword: ImageView
    private lateinit var ivToggleConfirmPassword: ImageView

    // Input container fields (for focus border swap)
    private lateinit var fieldName: LinearLayout
    private lateinit var fieldEmail: LinearLayout
    private lateinit var fieldPassword: LinearLayout
    private lateinit var fieldConfirmPassword: LinearLayout

    // Role cards
    private lateinit var cardStudent: LinearLayout
    private lateinit var cardTutor: LinearLayout
    private lateinit var textStudent: TextView
    private lateinit var textTutor: TextView

    // State
    private var selectedRole: String = "student"   // default selection
    private var isPasswordVisible = false
    private var isConfirmPasswordVisible = false
    private var isLoading = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_signup)

        // White status bar with dark icons
        window.statusBarColor = Color.WHITE
        window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR

        initViews()
        selectRole("student")       // pre-select Student on launch
        setupFocusListeners()
        setupClickListeners()
    }

    // ── Init ────────────────────────────────────────────────────────────────
    private fun initViews() {
        btnBack                 = findViewById(R.id.btnBack)
        etFullName              = findViewById(R.id.etFullName)
        etEmail                 = findViewById(R.id.etEmail)
        etPassword              = findViewById(R.id.etPassword)
        etConfirmPassword       = findViewById(R.id.etConfirmPassword)
        btnSignUp               = findViewById(R.id.btnSignUp)
        tvLogin                 = findViewById(R.id.tvLogin)
        tvError                 = findViewById(R.id.tvError)
        layoutError             = findViewById(R.id.layoutError)
        ivTogglePassword        = findViewById(R.id.ivTogglePassword)
        ivToggleConfirmPassword = findViewById(R.id.ivToggleConfirmPassword)
        fieldName               = findViewById(R.id.fieldName)
        fieldEmail              = findViewById(R.id.fieldEmail)
        fieldPassword           = findViewById(R.id.fieldPassword)
        fieldConfirmPassword    = findViewById(R.id.fieldConfirmPassword)
        cardStudent             = findViewById(R.id.cardStudent)
        cardTutor               = findViewById(R.id.cardTutor)
        textStudent             = findViewById(R.id.textStudent)
        textTutor               = findViewById(R.id.textTutor)
    }

    // ── Focus: swap input border ─────────────────────────────────────────────
    private fun setupFocusListeners() {
        mapOf(
            etFullName        to fieldName,
            etEmail           to fieldEmail,
            etPassword        to fieldPassword,
            etConfirmPassword to fieldConfirmPassword
        ).forEach { (editText, container) ->
            editText.setOnFocusChangeListener { _, hasFocus ->
                container.background = ContextCompat.getDrawable(
                    this,
                    if (hasFocus) R.drawable.bg_input_field_focused
                    else          R.drawable.bg_input_field
                )
            }
            editText.addTextChangedListener { hideError() }
        }
    }

    // ── Click listeners ──────────────────────────────────────────────────────
    private fun setupClickListeners() {

        // Back → return to LoginActivity
        btnBack.setOnClickListener {
            finish()
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }

        // Role cards
        cardStudent.setOnClickListener { selectRole("student") }
        cardTutor.setOnClickListener   { selectRole("tutor")   }

        // Toggle password
        ivTogglePassword.setOnClickListener {
            isPasswordVisible = !isPasswordVisible
            togglePasswordVisibility(etPassword, ivTogglePassword, isPasswordVisible)
        }

        ivToggleConfirmPassword.setOnClickListener {
            isConfirmPasswordVisible = !isConfirmPasswordVisible
            togglePasswordVisibility(
                etConfirmPassword,
                ivToggleConfirmPassword,
                isConfirmPasswordVisible
            )
        }

        // Sign Up
        btnSignUp.setOnClickListener {
            if (!isLoading) attemptSignUp()
        }

        // "Sign In" link → go back to LoginActivity (clear top)
        tvLogin.setOnClickListener {
            val intent = Intent(this, LoginActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
            finish()
        }
    }

    // ── Role selection ───────────────────────────────────────────────────────
    private fun selectRole(role: String) {
        selectedRole = role

        // Student card
        val studentSelected = role == "student"
        cardStudent.background = ContextCompat.getDrawable(
            this,
            if (studentSelected) R.drawable.bg_role_card_selected
            else                 R.drawable.bg_role_card_default
        )
        textStudent.setTextColor(
            if (studentSelected) Color.WHITE else Color.parseColor("#0047AB")
        )

        // Tutor card
        val tutorSelected = role == "tutor"
        cardTutor.background = ContextCompat.getDrawable(
            this,
            if (tutorSelected) R.drawable.bg_role_card_selected
            else               R.drawable.bg_role_card_default
        )
        textTutor.setTextColor(
            if (tutorSelected) Color.WHITE else Color.parseColor("#0047AB")
        )
    }

    // ── Validation & sign-up ─────────────────────────────────────────────────
    private fun attemptSignUp() {
        val name     = etFullName.text.toString().trim()
        val email    = etEmail.text.toString().trim()
        val password = etPassword.text.toString()
        val confirm  = etConfirmPassword.text.toString()

        when {
            name.isEmpty() -> {
                showError("Please enter your full name.")
                etFullName.requestFocus(); return
            }
            name.length < 2 -> {
                showError("Name must be at least 2 characters.")
                etFullName.requestFocus(); return
            }
            email.isEmpty() -> {
                showError("Please enter your email address.")
                etEmail.requestFocus(); return
            }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                showError("Please enter a valid email address.")
                etEmail.requestFocus(); return
            }
            password.isEmpty() -> {
                showError("Please enter a password.")
                etPassword.requestFocus(); return
            }
            password.length < 6 -> {
                showError("Password must be at least 6 characters.")
                etPassword.requestFocus(); return
            }
            confirm.isEmpty() -> {
                showError("Please confirm your password.")
                etConfirmPassword.requestFocus(); return
            }
            password != confirm -> {
                showError("Passwords do not match.")
                etConfirmPassword.requestFocus(); return
            }
        }

        setLoading(true)
        simulateSignUp(name, email, password, selectedRole)
    }

    /** Replace with real auth (Firebase / Supabase / Retrofit) */
    private fun simulateSignUp(
        name: String, email: String, password: String, role: String
    ) {
        android.os.Handler(mainLooper).postDelayed({
            setLoading(false)

            // Demo: navigate to HomeActivity on success
            val intent = Intent(this, HomeActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                putExtra("user_name", name)
                putExtra("user_role", role)
            }
            startActivity(intent)
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)
        }, 1500)
    }

    // ── UI helpers ───────────────────────────────────────────────────────────
    private fun togglePasswordVisibility(
        editText: EditText, toggle: ImageView, visible: Boolean
    ) {
        editText.transformationMethod =
            if (visible) HideReturnsTransformationMethod.getInstance()
            else         PasswordTransformationMethod.getInstance()
        editText.setSelection(editText.text.length)
        toggle.setImageResource(
            if (visible) R.drawable.ic_eye_on else R.drawable.ic_eye_off
        )
    }

    private fun setLoading(loading: Boolean) {
        isLoading = loading
        btnSignUp.isEnabled            = !loading
        etFullName.isEnabled           = !loading
        etEmail.isEnabled              = !loading
        etPassword.isEnabled           = !loading
        etConfirmPassword.isEnabled    = !loading
        btnSignUp.text  = if (loading) "Creating account…" else "Create Account"
        btnSignUp.alpha = if (loading) 0.7f else 1f
    }

    private fun showError(message: String) {
        tvError.text = message
        layoutError.visibility = View.VISIBLE
        val shake = AnimationUtils.loadAnimation(this, R.anim.shake)
        layoutError.startAnimation(shake)
    }

    private fun hideError() {
        if (layoutError.visibility == View.VISIBLE)
            layoutError.visibility = View.GONE
    }
}