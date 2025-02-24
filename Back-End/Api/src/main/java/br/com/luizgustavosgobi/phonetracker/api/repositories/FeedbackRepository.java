package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.FeedbackModel;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface FeedbackRepository extends CrudRepository<FeedbackModel, UUID> {

    @Query("SELECT f.student.id, f.student.name, COUNT(f) FROM FeedbackModel f GROUP BY f.student.id, f.student.name")
    List<Object[]> countFeedbacksByStudent();

    long countByStudent(StudentModel student);
}
