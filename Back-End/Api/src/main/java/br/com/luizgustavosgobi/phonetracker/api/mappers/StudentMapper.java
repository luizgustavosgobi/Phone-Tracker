package br.com.luizgustavosgobi.phonetracker.api.mappers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.StudentAndFeedbackResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.StudentResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StudentMapper {

    StudentResponseDto toStudentDto(StudentModel model);
    StudentAndFeedbackResponseDto toStudentAndFeedbackDto(StudentModel model);
}
