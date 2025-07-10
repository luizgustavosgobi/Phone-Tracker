package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<StudentModel, String> {
    List<StudentModel> findByIdStartingWithIgnoreCaseOrNameStartingWithIgnoreCase(String id, String name);
}
