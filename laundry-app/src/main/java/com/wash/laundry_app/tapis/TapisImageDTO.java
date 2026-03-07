package com.wash.laundry_app.tapis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TapisImageDTO {

    private Long id;
    private String imageUrl;
    private Boolean isMain;
    private TapisImageType imageType;
}