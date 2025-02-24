package br.com.luizgustavosgobi.phonetracker.api.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartsDataDto {
    private Map<String, Object> occurrencesByDay;

    private Map<String, Object> occurrencesByHour;

    private Map<String, Object> occurrencesByCamera;

    private List<Map<String, Object>> occurrencesByLocation;

    private Map<String, Object> occurrencesByType;

    private Map<String, Object> occurrencesTypeEvolution;

    private Map<String, Object> feedbacksByStudent;
}