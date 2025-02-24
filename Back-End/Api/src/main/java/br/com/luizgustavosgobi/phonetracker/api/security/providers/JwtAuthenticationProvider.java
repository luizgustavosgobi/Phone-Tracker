package br.com.luizgustavosgobi.phonetracker.api.security.providers;

import br.com.luizgustavosgobi.phonetracker.api.security.tokens.JwtAuthenticationToken;
import br.com.luizgustavosgobi.phonetracker.api.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationProvider implements AuthenticationProvider {

    @Autowired private JwtService jwtService;

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (!(authentication instanceof JwtAuthenticationToken)) return null;

        String token = authentication.getCredentials().toString();
        UserDetails user = jwtService.validateAndGetUserDetails(token);
        return JwtAuthenticationToken.authenticated(user, token, user.getAuthorities());
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(JwtAuthenticationToken.class);
    }
}
