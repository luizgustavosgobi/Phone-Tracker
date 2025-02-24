package br.com.luizgustavosgobi.phonetracker.api.configs;

import br.com.luizgustavosgobi.phonetracker.api.security.providers.JwtAuthenticationProvider;
import br.com.luizgustavosgobi.phonetracker.api.security.providers.UserIdPasswordAuthenticationProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class AuthenticationConfig {

    @Autowired private UserIdPasswordAuthenticationProvider userIdPasswordAuthenticationProvider;
    @Autowired private JwtAuthenticationProvider jwtAuthenticationProvider;

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(userIdPasswordAuthenticationProvider, jwtAuthenticationProvider);
    }
}

