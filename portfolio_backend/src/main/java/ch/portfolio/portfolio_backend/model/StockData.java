package ch.portfolio.portfolio_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StockData {
    private String symbol;
    private String name;
    private String currency;
    private String close;
    private String change;
    private String percent_change;
    private FiftyTwoWeek fifty_two_week;

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getClose() { return close; }
    public void setClose(String close) { this.close = close; }

    public String getChange() { return change; }
    public void setChange(String change) { this.change = change; }

    public String getPercent_change() { return percent_change; }
    public void setPercent_change(String percent_change) { this.percent_change = percent_change; }

    public FiftyTwoWeek getFifty_two_week() { return fifty_two_week; }
    public void setFifty_two_week(FiftyTwoWeek fifty_two_week) { this.fifty_two_week = fifty_two_week; }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class FiftyTwoWeek {
        private String low;
        private String high;

        public String getLow() { return low; }
        public void setLow(String low) { this.low = low; }

        public String getHigh() { return high; }
        public void setHigh(String high) { this.high = high; }
    }
}