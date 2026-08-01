package com.example.dailyspend.util;

import com.example.dailyspend.entity.User;
import com.example.dailyspend.repository.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    private static final Logger logger =
            LoggerFactory.getLogger(SecurityUtils.class);

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            logger.error("Attempt to access user ID without authentication");
            throw new IllegalStateException("No authenticated user found");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof com.example.dailyspend.config.CustomUserDetails customUserDetails) {
            return customUserDetails.getId();
        }

        String username;

        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else {
            logger.error("Unexpected principal type: {}", principal.getClass());
            throw new IllegalStateException("Unexpected principal type");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("Authenticated user not found in database: {}", username);
                    return new IllegalStateException("User not found in DB");
                });
        return user.getId();
    }
}
