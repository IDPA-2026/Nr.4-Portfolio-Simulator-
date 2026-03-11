package ch.portfolio.portfolio_backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StockData {
    private String symbol;
    private String name;
    private String currency;

    @JsonProperty("close") // TwelveData nutzt "close" als aktuellen Preis im Quote
    private String price;

    private String change;

    @JsonProperty("percent_change")
    private String percentChange;

    // Getters & Setters
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }

    public String getChange() { return change; }
    public void setChange(String change) { this.change = change; }

    public String getPercentChange() { return percentChange; }
    public void setPercentChange(String percentChange) { this.percentChange = percentChange; }
}