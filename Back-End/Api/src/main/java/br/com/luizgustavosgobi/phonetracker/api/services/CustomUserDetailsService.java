package br.com.luizgustavosgobi.phonetracker.api.services;

import br.com.luizgustavosgobi.phonetracker.api.enums.UserRoles;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import br.com.luizgustavosgobi.phonetracker.api.models.UserModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.StudentRepository;
import br.com.luizgustavosgobi.phonetracker.api.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        Optional<UserModel> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return User.builder()
                    .username(user.get().getId())
                    .password(user.get().getPassword())
                    .roles(user.get().getRole().name())
                    .build();
        }

        Optional<StudentModel> student = studentRepository.findById(userId);
        if (student.isPresent()) {
            return User.builder()
                    .username(student.get().getId())
                    .password(student.get().getPassword())
                    .roles((UserRoles.STUDENT).name())
                    .build();
        } else throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Credentials");
    }
}
