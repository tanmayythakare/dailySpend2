package com.example.dailyspend.dto;

import java.math.BigDecimal;

public class UpiQrPayloadDto {
    private String upiId;
    private String payeeName;
    private BigDecimal amount;
    private String note;
    private String txnRef;

    public UpiQrPayloadDto() {}

    public UpiQrPayloadDto(String upiId, String payeeName, BigDecimal amount, String note, String txnRef) {
        this.upiId = upiId;
        this.payeeName = payeeName;
        this.amount = amount;
        this.note = note;
        this.txnRef = txnRef;
    }

    // Getters and Setters
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }

    public String getPayeeName() { return payeeName; }
    public void setPayeeName(String payeeName) { this.payeeName = payeeName; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getTxnRef() { return txnRef; }
    public void setTxnRef(String txnRef) { this.txnRef = txnRef; }
}
