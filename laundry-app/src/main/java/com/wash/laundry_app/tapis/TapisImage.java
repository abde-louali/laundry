package com.wash.laundry_app.tapis;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tapis_images")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TapisImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tapis_id", nullable = false)
    private Tapis tapis;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "is_main")
    private Boolean isMain = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "image_type")
    private TapisImageType imageType = TapisImageType.BEFORE;

    // Explicit Getters/Setters to bypass Lombok failures
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tapis getTapis() { return tapis; }
    public void setTapis(Tapis tapis) { this.tapis = tapis; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getIsMain() { return isMain; }
    public void setIsMain(Boolean isMain) { this.isMain = isMain; }
    public TapisImageType getImageType() { return imageType; }
    public void setImageType(TapisImageType imageType) { this.imageType = imageType; }
}