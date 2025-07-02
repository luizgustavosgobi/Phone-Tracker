package br.com.luizgustavosgobi.phonetracker.api.mappers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.OccurrenceResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.models.OccurrenceModel;
import org.mapstruct.Mapper;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OccurrenceMapper {
    OccurrenceResponseDto toDto(OccurrenceModel model);
    List<OccurrenceResponseDto> toDto(List<OccurrenceModel> models);

    default Page<OccurrenceResponseDto> toDto(Page<OccurrenceModel> models) {
        return models.map(this::toDto);
    }
}
