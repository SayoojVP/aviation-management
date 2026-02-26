package com.pilotlogbook.dto;

import com.pilotlogbook.model.enums.UserRole;

import java.util.UUID;

public record AuthResponse(
        String token,
        UUID userId,
        String name,
        String email,
        UserRole role,
        String avatarInitials) {
}
