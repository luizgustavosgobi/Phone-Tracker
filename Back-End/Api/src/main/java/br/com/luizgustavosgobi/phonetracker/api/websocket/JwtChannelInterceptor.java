package br.com.luizgustavosgobi.phonetracker.api.websocket;

import br.com.luizgustavosgobi.phonetracker.api.security.tokens.JwtAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class JwtChannelInterceptor implements ChannelInterceptor {
    @Autowired AuthenticationManager authenticationManager;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = (String) accessor.getSessionAttributes().get("token");
            JwtAuthenticationToken authToken = JwtAuthenticationToken.unauthenticated(token);

            Authentication authentication = authenticationManager.authenticate(authToken);
            accessor.setUser(authentication);
        }

        return message;
    }
}
