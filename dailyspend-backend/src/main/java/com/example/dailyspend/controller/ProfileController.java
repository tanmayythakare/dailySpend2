package com.example.dailyspend.controller;

import com.example.dailyspend.dto.UserProfileDto;
import com.example.dailyspend.entity.User;
import com.example.dailyspend.repository.UserRepository;
import com.example.dailyspend.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/profile")
public class ProfileController {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    public ProfileController(UserRepository userRepository, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
    }

    @GetMapping
    public ResponseEntity<UserProfileDto> getProfile() {
        Long userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        return ResponseEntity.ok(new UserProfileDto(
                user.getUsername(),
                user.getUpiId(),
                user.getUpiDisplayName()
        ));
    }

    @PatchMapping
    public ResponseEntity<UserProfileDto> updateProfile(@RequestBody UserProfileDto request) {
        Long userId = securityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getUpiId() != null) {
            user.setUpiId(request.getUpiId().trim());
        }
        if (request.getUpiDisplayName() != null) {
            user.setUpiDisplayName(request.getUpiDisplayName().trim());
        }

        userRepository.save(user);

        return ResponseEntity.ok(new UserProfileDto(
                user.getUsername(),
                user.getUpiId(),
                user.getUpiDisplayName()
        ));
    }
}
