package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.StudentEmbeddingsModel;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentEmbeddingsRepository extends JpaRepository<StudentEmbeddingsModel, String> {

    @Modifying
    @Query("UPDATE StudentEmbeddingsModel se SET se.student = :student WHERE se.trackingId = :trackingId")
    void linkEmbeddingsToStudent(@Param("student") StudentModel student, @Param("trackingId") Integer trackingId);
}
