package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import org.springframework.data.repository.CrudRepository;

import java.util.List;

public interface StudentRepository extends CrudRepository<StudentModel, String> {
    List<StudentModel> findByIdStartingWithIgnoreCaseOrNameStartingWithIgnoreCase(String id, String name);
}
