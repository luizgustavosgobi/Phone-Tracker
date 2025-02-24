package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.ChartsDataDto;
import br.com.luizgustavosgobi.phonetracker.api.services.ChartsDataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/charts")
@Tag(name = "Charts", description = "Analytics and data visualization endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ChartsController {

    @Autowired private ChartsDataService chartsDataService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Retrieve comprehensive analytics data",
               description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<ChartsDataDto> getChartsData() {
        ChartsDataDto chartsData = ChartsDataDto.builder()
                .occurrencesByDay(chartsDataService.getOccurrencesByPeriod("day"))
                .occurrencesByHour(chartsDataService.getOccurrencesByPeriod("hour"))

                .occurrencesByCamera(chartsDataService.getOccurrencesByCamera())
                .occurrencesByLocation(chartsDataService.getHeatmapData())

                .occurrencesByType(chartsDataService.getOccurrencesByType())
                .occurrencesTypeEvolution(chartsDataService.getTypeEvolution())

                .feedbacksByStudent(chartsDataService.getFeedbacksByStudent())
                .build();

        return ResponseEntity.ok(chartsData);
    }
}