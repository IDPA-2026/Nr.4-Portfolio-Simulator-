package ch.portfolio.portfolio_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TwelveDataConfig {
    @Value("${TWELVEDATA_API_KEY}")
    private String apiKey;

    public String getApiKey() {
        return apiKey;
    }
}