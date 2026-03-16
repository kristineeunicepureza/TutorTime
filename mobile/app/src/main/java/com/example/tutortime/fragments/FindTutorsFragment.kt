package com.example.tutortime.fragments

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.EditText
import android.widget.LinearLayout
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.tutortime.R
import com.example.tutortime.adapters.TutorAdapter
import com.example.tutortime.models.TutorItem

class FindTutorsFragment : Fragment() {

    private lateinit var rvTutors: RecyclerView
    private lateinit var emptyState: LinearLayout
    private lateinit var etSearch: EditText

    private val allTutors = listOf(
        TutorItem("Ana Santos",     "Mathematics",  listOf("Algebra", "Calculus"),   4.9f, 48),
        TutorItem("Ryan Cruz",      "Physics",      listOf("Mechanics", "Waves"),    4.7f, 31),
        TutorItem("Lea Villanueva", "Chemistry",    listOf("Organic", "Inorganic"),  4.8f, 25),
        TutorItem("Mark Reyes",     "Programming",  listOf("Java", "Python"),        4.9f, 60),
        TutorItem("Sophia Tan",     "English",      listOf("Writing", "Grammar"),    4.6f, 18),
        TutorItem("Carlo Lim",      "Data Science", listOf("ML", "Python"),          4.8f, 42),
    )

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_find_tutors, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        rvTutors   = view.findViewById(R.id.rvTutors)
        emptyState = view.findViewById(R.id.emptyState)
        etSearch   = view.findViewById(R.id.etSearch)

        rvTutors.layoutManager = GridLayoutManager(requireContext(), 2)
        showTutors(allTutors)

        etSearch.addTextChangedListener(object : TextWatcher {
            override fun afterTextChanged(s: Editable?) {
                val query = s.toString().trim().lowercase()
                val filtered = if (query.isEmpty()) allTutors
                else allTutors.filter {
                    it.name.lowercase().contains(query) ||
                            it.subject.lowercase().contains(query) ||
                            it.tags.any { t -> t.lowercase().contains(query) }
                }
                showTutors(filtered)
            }
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        })
    }

    private fun showTutors(tutors: List<TutorItem>) {
        if (tutors.isEmpty()) {
            rvTutors.visibility   = View.GONE
            emptyState.visibility = View.VISIBLE
        } else {
            rvTutors.visibility   = View.VISIBLE
            emptyState.visibility = View.GONE
            rvTutors.adapter = TutorAdapter(tutors) { _ -> }
        }
    }
}