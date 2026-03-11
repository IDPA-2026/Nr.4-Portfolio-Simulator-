package ch.portfolio.portfolio_backend.service;

import ch.portfolio.portfolio_backend.config.TwelveDataConfig;
import ch.portfolio.portfolio_backend.model.StockData;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class StockService {

    private final TwelveDataConfig config;
    private final RestTemplate restTemplate;

    public StockService(TwelveDataConfig config) {
        this.config = config;
        this.restTemplate = new RestTemplate();
    }

    public StockData getStockData(String symbol) {
        // Wir nutzen jetzt /quote statt /price für mehr Details
        String url = String.format("https://api.twelvedata.com/quote?symbol=%s&apikey=%s",
                symbol, config.getApiKey());

        try {
            return restTemplate.getForObject(url, StockData.class);
        } catch (Exception e) {
            System.err.println("Fehler beim Abrufen der Daten für " + symbol + ": " + e.getMessage());
            return null;
        }
    }
}