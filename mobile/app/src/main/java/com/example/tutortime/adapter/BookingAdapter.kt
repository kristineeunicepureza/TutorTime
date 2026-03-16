package com.example.tutortime.adapters

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.tutortime.R
import com.example.tutortime.models.BookingItem

class BookingAdapter(
    private val bookings: List<BookingItem>
) : RecyclerView.Adapter<BookingAdapter.VH>() {

    inner class VH(view: View) : RecyclerView.ViewHolder(view) {
        val tvInitial : TextView = view.findViewById(R.id.tvBookingInitial)
        val tvName    : TextView = view.findViewById(R.id.tvBookingName)
        val tvSubject : TextView = view.findViewById(R.id.tvBookingSubject)
        val tvBadge   : TextView = view.findViewById(R.id.tvBookingBadge)
        val btnCancel : TextView = view.findViewById(R.id.btnCancelBooking)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) =
        VH(LayoutInflater.from(parent.context)
            .inflate(R.layout.item_booking_card, parent, false))

    override fun getItemCount() = bookings.size

    override fun onBindViewHolder(holder: VH, position: Int) {
        val booking = bookings[position]
        val ctx     = holder.itemView.context

        holder.tvInitial.text = booking.tutorName.firstOrNull()?.uppercaseChar()?.toString() ?: "?"
        holder.tvName.text    = booking.tutorName
        holder.tvSubject.text = booking.subject
        holder.tvBadge.text   = booking.status

        // Badge color by status
        when (booking.status) {
            "Confirmed" -> {
                holder.tvBadge.background = ContextCompat.getDrawable(ctx, R.drawable.bg_badge_confirmed)
                holder.tvBadge.setTextColor(Color.parseColor("#0047AB"))
            }
            "Completed" -> {
                holder.tvBadge.background = ContextCompat.getDrawable(ctx, R.drawable.bg_badge_completed)
                holder.tvBadge.setTextColor(Color.parseColor("#10B981"))
            }
            "Cancelled" -> {
                holder.tvBadge.background = ContextCompat.getDrawable(ctx, R.drawable.bg_badge_cancelled)
                holder.tvBadge.setTextColor(Color.parseColor("#DC2626"))
            }
            "Pending" -> {
                holder.tvBadge.background = ContextCompat.getDrawable(ctx, R.drawable.bg_badge_pending)
                holder.tvBadge.setTextColor(Color.parseColor("#F59E0B"))
            }
        }

        // Hide cancel for completed / cancelled
        holder.btnCancel.visibility =
            if (booking.status in listOf("Completed", "Cancelled")) View.GONE else View.VISIBLE

        holder.btnCancel.setOnClickListener {
            Toast.makeText(ctx, "Cancel ${booking.tutorName}'s session?", Toast.LENGTH_SHORT).show()
            // TODO: call API to cancel, then refresh list
        }
    }
}