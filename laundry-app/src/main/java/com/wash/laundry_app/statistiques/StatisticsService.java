package com.wash.laundry_app.statistiques;

import com.wash.laundry_app.command.Commande;
import com.wash.laundry_app.command.CommandeRepository;
import com.wash.laundry_app.command.CommandeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class StatisticsService {

    private final CommandeRepository commandeRepository;

    // Get today's statistics
    public StatisticsDTO getTodayStatistics() {
        Long totalCommandesToday = commandeRepository.countTodayCommandes();
        Double revenuesToday = commandeRepository.getTodayRevenue();

        return StatisticsDTO.builder()
                .totalCommandesToday(totalCommandesToday)
                .revenuesToday(revenuesToday != null ? BigDecimal.valueOf(revenuesToday) : BigDecimal.ZERO)
                .commandesEnAttente(commandeRepository.countTodayCommandesByStatus(CommandeStatus.en_attente))
                .commandesValidees(commandeRepository.countTodayCommandesByStatus(CommandeStatus.validee))
                .commandesEnTraitement(commandeRepository.countTodayCommandesByStatus(CommandeStatus.en_traitement))
                .commandesPretes(commandeRepository.countTodayCommandesByStatus(CommandeStatus.prete))
                .commandesLivrees(commandeRepository.countTodayCommandesByStatus(CommandeStatus.livree))
                .commandesPayees(commandeRepository.countTodayCommandesByStatus(CommandeStatus.payee))
                .dateDebut(LocalDate.now())
                .dateFin(LocalDate.now())
                .build();
    }

    // Get overall statistics
    public StatisticsDTO getOverallStatistics() {
        List<Commande> allCommandes = commandeRepository.findAll();

        long totalCommandes = allCommandes.size();
        BigDecimal totalRevenues = allCommandes.stream()
                .filter(c -> c.getStatus() == CommandeStatus.payee)
                .map(Commande::getMontantTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> commandesByStatus = new HashMap<>();
        for (CommandeStatus status : CommandeStatus.values()) {
            commandesByStatus.put(status.name(), commandeRepository.countByStatus(status));
        }

        return StatisticsDTO.builder()
                .totalCommandes(totalCommandes)
                .totalRevenues(totalRevenues)
                .commandesByStatus(commandesByStatus)
                .commandesEnAttente(commandeRepository.countByStatus(CommandeStatus.en_attente))
                .commandesValidees(commandeRepository.countByStatus(CommandeStatus.validee))
                .commandesEnTraitement(commandeRepository.countByStatus(CommandeStatus.en_traitement))
                .commandesPretes(commandeRepository.countByStatus(CommandeStatus.prete))
                .commandesLivrees(commandeRepository.countByStatus(CommandeStatus.livree))
                .commandesPayees(commandeRepository.countByStatus(CommandeStatus.payee))
                .build();
    }

    // Get statistics by date range
    public StatisticsDTO getStatisticsByDateRange(LocalDate dateDebut, LocalDate dateFin) {
        LocalDateTime start = dateDebut.atStartOfDay();
        LocalDateTime end = dateFin.atTime(LocalTime.MAX);

        List<Commande> commandes = commandeRepository.findByDateCreationBetween(start, end);

        long totalCommandes = commandes.size();
        BigDecimal totalRevenues = commandes.stream()
                .filter(c -> c.getStatus() == CommandeStatus.payee)
                .map(Commande::getMontantTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> commandesByStatus = new HashMap<>();
        for (CommandeStatus status : CommandeStatus.values()) {
            long count = commandes.stream()
                    .filter(c -> c.getStatus() == status)
                    .count();
            commandesByStatus.put(status.name(), count);
        }

        return StatisticsDTO.builder()
                .totalCommandes(totalCommandes)
                .totalRevenues(totalRevenues)
                .commandesByStatus(commandesByStatus)
                .commandesEnAttente(commandesByStatus.get(CommandeStatus.en_attente.name()))
                .commandesValidees(commandesByStatus.get(CommandeStatus.validee.name()))
                .commandesEnTraitement(commandesByStatus.get(CommandeStatus.en_traitement.name()))
                .commandesPretes(commandesByStatus.get(CommandeStatus.prete.name()))
                .commandesLivrees(commandesByStatus.get(CommandeStatus.livree.name()))
                .commandesPayees(commandesByStatus.get(CommandeStatus.payee.name()))
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .build();
    }

    // Get daily statistics for a specific date
    public DailyStatisticsDTO getDailyStatistics(LocalDate date) {
        Long nombreCommandes = commandeRepository.countCommandesByDate(date);
        Double revenusTotal = commandeRepository.getRevenueByDate(date);

        return DailyStatisticsDTO.builder()
                .date(date)
                .nombreCommandes(nombreCommandes)
                .revenusTotal(revenusTotal != null ? BigDecimal.valueOf(revenusTotal) : BigDecimal.ZERO)
                .nombreTapisTraites(0) // TODO: Calculate from commande_tapis
                .build();
    }

    // Get statistics for last N days
    public List<DailyStatisticsDTO> getLastNDaysStatistics(int days) {
        List<DailyStatisticsDTO> statistics = new java.util.ArrayList<>();

        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            statistics.add(getDailyStatistics(date));
        }

        return statistics;
    }

    // Get statistics by livreur
    public StatisticsDTO getStatisticsByLivreur(Long livreurId, LocalDate dateDebut, LocalDate dateFin) {
        LocalDateTime start = dateDebut.atStartOfDay();
        LocalDateTime end = dateFin.atTime(LocalTime.MAX);

        List<Commande> commandes = commandeRepository.findByLivreurIdAndDateCreationBetween(livreurId, start, end);

        long totalCommandes = commandes.size();
        BigDecimal totalRevenues = commandes.stream()
                .filter(c -> c.getStatus() == CommandeStatus.payee)
                .map(Commande::getMontantTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StatisticsDTO.builder()
                .totalCommandes(totalCommandes)
                .totalRevenues(totalRevenues)
                .dateDebut(dateDebut)
                .dateFin(dateFin)
                .build();
    }
}
