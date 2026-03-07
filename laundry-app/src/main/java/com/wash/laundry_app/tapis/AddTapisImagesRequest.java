package com.wash.laundry_app.tapis;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddTapisImagesRequest {
    private List<String> imageUrls;
    private TapisImageType type;
}
