package com.wash.laundry_app.tapis;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class TapisService {

    private final TapisRepository tapisRepository;
    private final TapisMapper tapisMapper;

    // Get all tapis
    public List<TapisDTO> getAllTapis() {
        return tapisRepository.findAll()
                .stream()
                .map(tapisMapper::toDto)
                .toList();
    }

    // Get tapis by ID
    public TapisDTO getTapisById(Long id) {
        Tapis tapis = tapisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tapis non trouvé"));
        return tapisMapper.toDto(tapis);
    }

    // Create tapis
    @Transactional
    public TapisDTO createTapis(CreateTapisRequest request) {
        if (tapisRepository.existsByNom(request.getNom())) {
            throw new RuntimeException("Un tapis avec ce nom existe déjà");
        }

        Tapis tapis = tapisMapper.toEntity(request);
        tapis = tapisRepository.save(tapis);
        return tapisMapper.toDto(tapis);
    }

    // Update tapis
    @Transactional
    public TapisDTO updateTapis(Long id, CreateTapisRequest request) {
        Tapis tapis = tapisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tapis non trouvé"));

        tapis.setNom(request.getNom());
        tapis.setDescription(request.getDescription());
        tapis.setPrixUnitaire(request.getPrixUnitaire());

        tapis = tapisRepository.save(tapis);
        return tapisMapper.toDto(tapis);
    }

    // Delete tapis
    @Transactional
    public void deleteTapis(Long id) {
        Tapis tapis = tapisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tapis non trouvé"));
        tapisRepository.delete(tapis);
    }
}