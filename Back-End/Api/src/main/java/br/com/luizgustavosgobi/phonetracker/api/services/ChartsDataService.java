package br.com.luizgustavosgobi.phonetracker.api.services;

import br.com.luizgustavosgobi.phonetracker.api.repositories.FeedbackRepository;
import br.com.luizgustavosgobi.phonetracker.api.repositories.OccurrenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChartsDataService {

    @Autowired private OccurrenceRepository occurrenceRepository;
    @Autowired private FeedbackRepository feedbackRepository;

    // Método para dados de ocorrências por período
    public Map<String, Object> getOccurrencesByPeriod(String period) {
        List<Object[]> rawData;

        if ("day".equals(period)) {
            rawData = occurrenceRepository.countOccurrencesByDay();
        } else if ("hour".equals(period)) {
            rawData = occurrenceRepository.countOccurrencesByHour();
        } else {
            throw new IllegalArgumentException("Período não suportado: " + period);
        }

        Map<String, Object> result = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();

        for (Object[] row : rawData) {
            labels.add(String.valueOf(row[0]));
            data.add(((Number) row[1]).longValue());
        }

        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    public Map<String, Object> getOccurrencesByCamera() {
        List<Object[]> rawData = occurrenceRepository.countOccurrencesByCamera();

        Map<String, Object> result = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();

        for (Object[] row : rawData) {
            labels.add("Câmera " + row[0]);
            data.add(((Number) row[1]).longValue());
        }

        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    // Método para dados de mapa de calor
    public List<Map<String, Object>> getHeatmapData() {
        List<Object[]> rawData = occurrenceRepository.countOccurrencesByLocation();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rawData) {
            if (row[0] != null) {
                Map<String, Object> point = new HashMap<>();
                point.put("location", row[0]);
                point.put("count", ((Number) row[1]).longValue());
                result.add(point);
            }
        }

        return result;
    }

    // Método para dados de feedbacks por estudante
    public Map<String, Object> getFeedbacksByStudent() {
        List<Object[]> rawData = feedbackRepository.countFeedbacksByStudent();

        Map<String, Object> result = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();

        for (Object[] row : rawData) {
            labels.add(String.valueOf(row[1])); // Nome do estudante
            data.add(((Number) row[2]).longValue());
        }

        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    // Método para dados de tipos de ocorrência
    public Map<String, Object> getOccurrencesByType() {
        List<Object[]> rawData = occurrenceRepository.countOccurrencesByType();

        Map<String, Object> result = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<Long> data = new ArrayList<>();

        for (Object[] row : rawData) {
            labels.add(String.valueOf(row[0]));
            data.add(((Number) row[1]).longValue());
        }

        result.put("labels", labels);
        result.put("data", data);
        return result;
    }

    // Método para dados de evolução de tipos ao longo do tempo
    public Map<String, Object> getTypeEvolution() {
        List<Object[]> rawData = occurrenceRepository.countOccurrencesByDateAndType();
        Map<String, List<Long>> typeData = new HashMap<>();
        Set<String> types = new HashSet<>();
        List<String> dates = new ArrayList<>();

        // Agrupar dados por tipo e data
        for (Object[] row : rawData) {
            String date = String.valueOf(row[0]);
            String type = String.valueOf(row[1]);
            Long count = ((Number) row[2]).longValue();

            if (!dates.contains(date)) {
                dates.add(date);
            }

            types.add(type);

            typeData.computeIfAbsent(type, k -> new ArrayList<>()).add(count);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("dates", dates);
        result.put("types", types);
        result.put("data", typeData);

        return result;
    }
}
