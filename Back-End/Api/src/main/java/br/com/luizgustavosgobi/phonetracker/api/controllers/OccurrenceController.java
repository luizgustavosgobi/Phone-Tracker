package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.FeedbackDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.OccurrenceDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.OccurrenceFilterDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.OccurrenceNotificationDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.OccurrenceResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.mappers.OccurrenceMapper;
import br.com.luizgustavosgobi.phonetracker.api.models.FeedbackModel;
import br.com.luizgustavosgobi.phonetracker.api.models.OccurrenceModel;
import br.com.luizgustavosgobi.phonetracker.api.models.StudentModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.FeedbackRepository;
import br.com.luizgustavosgobi.phonetracker.api.repositories.OccurrenceRepository;
import br.com.luizgustavosgobi.phonetracker.api.repositories.StudentRepository;
import br.com.luizgustavosgobi.phonetracker.api.services.ApiKeyService;
import br.com.luizgustavosgobi.phonetracker.api.services.OccurrenceService;
import br.com.luizgustavosgobi.phonetracker.api.services.ProofsService;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/occurrences")
@Tag(name = "Occurrences", description = "Occurrence management and monitoring endpoints")
@SecurityRequirement(name = "bearerAuth")
public class OccurrenceController {

    @Autowired private OccurrenceRepository occurrenceRepository;
    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private OccurrenceMapper occurrenceMapper;
    @Autowired private StudentRepository studentRepository;

    @Autowired private OccurrenceService occurrenceService;
    @Autowired private ProofsService proofsService;
    @Autowired private TempTokenService tempTokenService;
    @Autowired private ApiKeyService apiKeyService;

    @Autowired private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'TEACHER') or @apiKeyService.isKeyValid(#api_key)")
    @Operation(summary = "Create a new occurrence (External API)", description = "**Required Permissions:** None - Public endpoint")
    public ResponseEntity<Void> createOccurrences(@ModelAttribute @Valid OccurrenceDto occurrenceDto, @ParameterObject String api_key) {
        OccurrenceModel occurrenceModel = new OccurrenceModel();
        BeanUtils.copyProperties(occurrenceDto, occurrenceModel);

        if (occurrenceDto.proof() != null) {
            String fileName = proofsService.saveProofFile(occurrenceDto.proof());
            occurrenceModel.setProof(fileName);
        }

        occurrenceRepository.save(occurrenceModel);

        OccurrenceNotificationDto notification = new OccurrenceNotificationDto(
                occurrenceModel.getId(),
                "CREATED",
                LocalDateTime.now()
        );

        messagingTemplate.convertAndSend("/topic/occurrences", notification);

        return new ResponseEntity<>(HttpStatus.OK);
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or @occurrenceService.isUserAllowedToAccessOccurrence(#id, authentication.principal.username)")
    @Operation(summary = "Retrieve occurrence details by ID",
               description = "**Required Permissions:** ROLE_ADMIN, ROLE_STAFF, or own occurrences")
    public ResponseEntity<OccurrenceResponseDto> getOccurrence(@PathVariable UUID id) {
        OccurrenceResponseDto occurrence = occurrenceRepository.findById(id)
                .map(occurrenceMapper::toDto)
                .map(dto -> dto.getProof() != null ? dto.processFeedbackFile(tempTokenService.generateTempToken(dto.getProof())) : dto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Occurrence Not found"));

        return ResponseEntity.ok(occurrence);
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Retrieve all occurrences with filtering",
               description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Page<OccurrenceResponseDto>> getAllOccurrences(
            @ParameterObject @ModelAttribute OccurrenceFilterDto filters,
            @ParameterObject @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<OccurrenceResponseDto> occurrences = occurrenceRepository.findAll(occurrenceService.buildQuerySpecification(filters), pageable)
                .map(occurrenceMapper::toDto)
                .map(dto -> dto.getProof() != null ? dto.processFeedbackFile(tempTokenService.generateTempToken(dto.getProof())) : dto);

        return ResponseEntity.ok(occurrences);
    }


    @GetMapping("/waiting-feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Retrieve occurrences awaiting feedback",
               description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<List<OccurrenceResponseDto>> getAllWaitingFeedback() {
        List<OccurrenceResponseDto> occurrencesWithoutFeedback = occurrenceRepository.findByFeedbackIsNull()
                .stream()
                .map(occurrenceMapper::toDto)
                .map(dto -> dto.getProof() != null ? dto.processFeedbackFile(tempTokenService.generateTempToken(dto.getProof())) : dto)
                .toList();

        return ResponseEntity.ok(occurrencesWithoutFeedback);
    }


    @PostMapping("/feedback")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Submit feedback for an occurrence",
               description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Void> occurrenceFeedback(@RequestParam UUID occurrenceId, @RequestBody @Valid FeedbackDto feedbackDto) {
        OccurrenceModel occurrence = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "An occurrence with the given ID not found"));

        if (occurrence.getFeedback() != null)
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A feedback for this occurrence already exists");

        FeedbackModel feedbackModel = new FeedbackModel();
        BeanUtils.copyProperties(feedbackDto, feedbackModel);

        if (feedbackDto.studentId() != null) {
            StudentModel user = studentRepository.findById(feedbackDto.studentId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "An student with the given Id not found"));

            feedbackModel.setStudent(user);
        }

        feedbackModel.setOccurrence(occurrence);
        feedbackRepository.save(feedbackModel);

        occurrence.setFeedback(feedbackModel);
        occurrenceRepository.save(occurrence);

        OccurrenceNotificationDto notification = new OccurrenceNotificationDto(
                occurrence.getId(),
                "FEEDBACK",
                LocalDateTime.now()
        );
        messagingTemplate.convertAndSend("/topic/occurrences", notification);

        return new ResponseEntity<>(HttpStatus.OK);
    }


    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Delete an occurrence",
               description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Void> deleteOccurrence(@RequestParam UUID occurrenceId) {
        OccurrenceModel occurrence = occurrenceRepository.findById(occurrenceId)
                .orElseThrow(() -> new  ResponseStatusException(HttpStatus.NOT_FOUND, "An occurrence with the given ID not found"));

        if  (occurrence.getProof() != null)
            proofsService.deleteProofFile(occurrence.getProof());

        occurrenceRepository.deleteById(occurrenceId);

        return new ResponseEntity<>(HttpStatus.OK);
    }
}
