package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.ChangePasswordDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.OccurrenceFilterDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.StudentDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.OccurrenceResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.StudentAndFeedbackResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.StudentResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.mappers.OccurrenceMapper;
import br.com.luizgustavosgobi.phonetracker.api.mappers.StudentMapper;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.OccurrenceRepository;
import br.com.luizgustavosgobi.phonetracker.api.repositories.StudentRepository;
import br.com.luizgustavosgobi.phonetracker.api.services.OccurrenceService;
import br.com.luizgustavosgobi.phonetracker.api.services.TempTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/students")
@Tag(name = "Students", description = "Student management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {

    @Autowired OccurrenceRepository occurrenceRepository;
    @Autowired StudentRepository studentRepository;

    @Autowired OccurrenceService occurrenceService;
    @Autowired TempTokenService tempTokenService;

    @Autowired OccurrenceMapper occurrenceMapper;
    @Autowired StudentMapper studentMapper;

    @Autowired PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Create a new student account", description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Void> createStudent(@RequestBody @Valid StudentDto studentDto) {
        Optional<StudentModel> student = studentRepository.findById(studentDto.id());
        if (student.isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An Student with the given Id already exists");

        StudentModel studentModel = new StudentModel();
        BeanUtils.copyProperties(studentDto, studentModel);

        String studentPassword = studentDto.name().split(" ")[0] + "_" + studentDto.id();
        studentModel.setPassword(passwordEncoder.encode(studentPassword));

        studentRepository.save(studentModel);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Delete a student account", description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Void> deleteStudent(@RequestParam String id) {
        studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        studentRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/edit")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Update student information", description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Void> editStudent(@RequestBody @Valid StudentDto studentDto) {
        StudentModel studentModel = studentRepository.findById(studentDto.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        studentModel.setName(studentDto.name());
        studentModel.setCourse(studentDto.course());
        if (studentDto.photo() != null)
            studentModel.setPhoto(studentDto.photo());

        studentRepository.save(studentModel);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/change_password")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Change student password", description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid ChangePasswordDto passwordDto) {
        StudentModel studentModel = studentRepository.findById(passwordDto.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        studentModel.setPassword(passwordEncoder.encode(passwordDto.newPassword()));

        studentRepository.save(studentModel);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/occurrences")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or #id = authentication.principal.username")
    @Operation(summary = "Retrieve student occurrences",
               description = "**Required Permissions:** ROLE_ADMIN, ROLE_STAFF, or own occurrences")
    public ResponseEntity<Page<OccurrenceResponseDto>> getStudentOccurrences(
            @PathVariable String id,
            @ParameterObject @ModelAttribute OccurrenceFilterDto filters,
            @ParameterObject @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        filters.setStudentId(id);

        if (studentRepository.findById(id).isEmpty())
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student with the given id not found");

        Page<OccurrenceResponseDto> occurrencePage = occurrenceRepository.findAll(occurrenceService.buildQuerySpecification(filters), pageable)
                .map(occurrenceMapper::toDto)
                .map(dto -> dto.getProof() != null ? dto.processFeedbackFile(tempTokenService.generateTempToken(dto.getProof())) : dto);
        return ResponseEntity.ok(occurrencePage);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or #id == authentication.principal.username")
    @Operation(summary = "Retrieve student information by ID",
               description = "**Required Permissions:** ROLE_ADMIN, ROLE_STAFF, or own profile")
    public ResponseEntity<StudentAndFeedbackResponseDto> getStudentInfo(@PathVariable String id) {
        StudentModel student = studentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        return ResponseEntity.ok(studentMapper.toStudentAndFeedbackDto(student));
    }

    @GetMapping("/autocomplete")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TEACHER')")
    @Operation(summary = "Student search autocomplete",
               description = "**Required Permissions:** ROLE_ADMIN, ROLE_STAFF, or ROLE_TEACHER")
    public ResponseEntity<List<StudentResponseDto>> studentAutoComplete(@RequestParam("query") String query) {

        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<StudentResponseDto> students = studentRepository.findByIdStartingWithIgnoreCaseOrNameStartingWithIgnoreCase(query, query).stream()
                .map(studentMapper::toStudentDto)
                .toList();

        return ResponseEntity.ok(students);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Retrieve all system Students", description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Page<StudentResponseDto>> getAllUsers(@ParameterObject @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<StudentResponseDto> accounts = studentRepository.findAll(pageable)
                .map(studentMapper::toStudentDto);
        return ResponseEntity.ok(accounts);
    }
}
