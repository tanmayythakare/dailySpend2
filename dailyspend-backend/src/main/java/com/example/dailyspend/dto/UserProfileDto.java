package com.example.dailyspend.dto;

public class UserProfileDto {

    private String username;
    private String upiId;
    private String upiDisplayName;

    public UserProfileDto() {}

    public UserProfileDto(String username, String upiId, String upiDisplayName) {
        this.username = username;
        this.upiId = upiId;
        this.upiDisplayName = upiDisplayName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiDisplayName() {
        return upiDisplayName;
    }

    public void setUpiDisplayName(String upiDisplayName) {
        this.upiDisplayName = upiDisplayName;
    }
}
