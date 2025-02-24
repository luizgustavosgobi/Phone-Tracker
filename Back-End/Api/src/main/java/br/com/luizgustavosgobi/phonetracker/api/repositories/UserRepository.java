package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserModel, String> {
}
