package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.JwtTokenDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.LoginDto;
import br.com.luizgustavosgobi.phonetracker.api.services.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Authentication and session management endpoints")
public class AuthenticationController {

    @Autowired private JwtService jwtService;

    @Autowired private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and generate JWT token")
    public ResponseEntity<Object> login(@RequestBody LoginDto loginDto) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginDto.id(), loginDto.password()));
        if (authentication.isAuthenticated()) {
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            return ResponseEntity.ok(new JwtTokenDto(jwtService.generateToken(authentication)));
        } else throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Credentials");
    }

    @GetMapping("/logout")
    @Operation(summary = "Invalidate JWT token and logout user")
    public ResponseEntity<Void> logout(@RequestParam String token) {
        try { jwtService.invalidateToken(token); }
        catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid token");
        }

        return ResponseEntity.ok().build();
    }
}