package com.example.dailyspend.service;

import com.example.dailyspend.entity.User;
import com.example.dailyspend.repository.UserRepository;

import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
public UserDetails loadUserByUsername(String username)
        throws UsernameNotFoundException {

    User user = userRepository.findByUsername(username)
            .orElseThrow(() ->
                    new UsernameNotFoundException("User not found"));

    return new com.example.dailyspend.config.CustomUserDetails(
            user.getId(),
            user.getUsername(),
            user.getPassword(),
            List.of(new SimpleGrantedAuthority("ROLE_USER"))
    );
}

}
