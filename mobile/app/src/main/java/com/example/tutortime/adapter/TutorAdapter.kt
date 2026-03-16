package com.example.tutortime.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.example.tutortime.R
import com.example.tutortime.models.TutorItem

class TutorAdapter(
    private val tutors: List<TutorItem>,
    private val onBook: (TutorItem) -> Unit
) : RecyclerView.Adapter<TutorAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvInitial : TextView     = view.findViewById(R.id.tvTutorInitial)
        val tvName    : TextView     = view.findViewById(R.id.tvTutorName)
        val tvSubject : TextView     = view.findViewById(R.id.tvTutorSubject)
        val tvRating  : TextView     = view.findViewById(R.id.tvRating)
        val tvCount   : TextView     = view.findViewById(R.id.tvRatingCount)
        val tagRow    : LinearLayout = view.findViewById(R.id.tagRow)
        val btnBook   : Button       = view.findViewById(R.id.btnBook)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(LayoutInflater.from(parent.context)
            .inflate(R.layout.item_tutor_card, parent, false))

    override fun getItemCount() = tutors.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val tutor = tutors[position]

        holder.tvInitial.text = tutor.name.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
        holder.tvName.text    = tutor.name
        holder.tvSubject.text = tutor.subject.uppercase()
        holder.tvRating.text  = "⭐ ${tutor.rating}"
        holder.tvCount.text   = "${tutor.sessions} sessions"

        // Build tags dynamically
        holder.tagRow.removeAllViews()
        tutor.tags.take(3).forEach { tag ->
            val tagView = TextView(holder.tagRow.context).apply {
                text     = tag
                textSize = 10f
                setTextColor(Color.parseColor("#0047AB"))
                setBackgroundResource(R.drawable.bg_tag)
                val pad  = (8 * resources.displayMetrics.density).toInt()
                val vPad = (3 * resources.displayMetrics.density).toInt()
                setPadding(pad, vPad, pad, vPad)
                layoutParams = LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
                ).also { it.marginEnd = (4 * resources.displayMetrics.density).toInt() }
            }
            holder.tagRow.addView(tagView)
        }

        holder.btnBook.setOnClickListener { onBook(tutor) }
    }
}