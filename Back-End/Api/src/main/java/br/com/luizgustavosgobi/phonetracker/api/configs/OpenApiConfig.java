package br.com.luizgustavosgobi.phonetracker.api.configs;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.HandlerMethod;

import java.util.Collections;
import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Phone Tracker API")
                        .description("API completa para rastreamento e gerenciamento de dispositivos móveis com funcionalidades de autenticação, registro de ocorrências e monitoramento de estudantes.\n" +
                                "Para uma documentação mais detalhada, olhe o openapi.yaml da pasta docs.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Luiz Gustavo")
                                .email("luiz.gustavo@aluno.ifsp.edu.br")
                                .url("https://github.com/luizgustavosgobi"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Servidor de Desenvolvimento")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT obtido através do endpoint de autenticação")));
    }

    @Bean
    public OperationCustomizer operationCustomizer() {
        return (Operation operation, HandlerMethod handlerMethod) -> {
            String methodName = handlerMethod.getMethod().getName();
            String className = handlerMethod.getBeanType().getSimpleName();

            if ((className.equals("AuthenticationController")) ||
                    (className.equals("OccurrenceController") && methodName.equals("createOccurrences"))) {
                operation.setSecurity(Collections.emptyList());
            }
            return operation;
        };
    }
}
