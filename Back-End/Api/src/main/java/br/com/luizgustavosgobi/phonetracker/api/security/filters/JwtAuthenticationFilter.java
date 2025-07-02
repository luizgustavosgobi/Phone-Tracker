package br.com.luizgustavosgobi.phonetracker.api.security.filters;

import br.com.luizgustavosgobi.phonetracker.api.exceptions.ExceptionResponse;
import br.com.luizgustavosgobi.phonetracker.api.security.tokens.JwtAuthenticationToken;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired private AuthenticationManager authenticationManager;

    @Autowired ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication() == null) {
            JwtAuthenticationToken authToken = JwtAuthenticationToken.unauthenticated(authHeader.substring(7));

            try {
                Authentication authentication = authenticationManager.authenticate(authToken);

                SecurityContext  context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
            } catch (AuthenticationException ex) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");

                ExceptionResponse exceptionResponse = new ExceptionResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request.getRequestURI());
                objectMapper.writeValue(response.getWriter(), exceptionResponse);
            }
        }

        filterChain.doFilter(request, response);
    }
}
