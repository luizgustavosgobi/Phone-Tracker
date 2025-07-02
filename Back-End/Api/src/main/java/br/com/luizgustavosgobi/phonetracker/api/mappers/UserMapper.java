package br.com.luizgustavosgobi.phonetracker.api.mappers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.UserResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import br.com.luizgustavosgobi.phonetracker.api.models.UserModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.FeedbackRepository;
import br.com.luizgustavosgobi.phonetracker.api.repositories.StudentRepository;
import org.mapstruct.Mapper;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.Optional;

@Mapper(componentModel = "spring")
public abstract class UserMapper {
    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private StudentRepository studentRepository;

    //@Mapping(target = "occurrencesCount", expression = "java(getOccurrencesCount(model.getId()))")
    public abstract UserResponseDto toDto(UserModel model);

    //@Mapping(target = "occurrencesCount", expression = "java(getOccurrencesCount(model.getId()))")
    public abstract List<UserResponseDto> toDto(List<UserModel> model);

    protected Long getOccurrencesCount(String id) {
        Optional<StudentModel> studentModel = studentRepository.findById(id);
        return studentModel.map(user -> feedbackRepository.countByStudent(user))
                .orElse(0L);
    }
}
