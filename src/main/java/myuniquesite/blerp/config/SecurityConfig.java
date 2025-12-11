package myuniquesite.blerp.config;

// ✅ 1. Import these new classes for CORS
import java.util.List;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
// --- End of new imports ---

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.RequestMatcher;
import jakarta.servlet.http.HttpServletRequest;

import myuniquesite.blerp.config.JwtAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public AuthenticationManager authManager(
                        UserDetailsService userDetailsService,
                        PasswordEncoder passwordEncoder) {
                var authProvider = new DaoAuthenticationProvider();
                authProvider.setPasswordEncoder(passwordEncoder);
                authProvider.setUserDetailsService(userDetailsService);
                return new ProviderManager(authProvider);
        }

        @Bean
        @Order(1)
        public SecurityFilterChain apiSecurityFilterChain(HttpSecurity http) throws Exception {
                return http
                                .securityMatcher("/api/**")
                                .cors(withDefaults()) // ✅ 2. Enable CORS configuration for the API
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> {
                                        // Permit all API endpoints - no authentication required
                                        auth.requestMatchers("/api/**").permitAll();
                                        auth.anyRequest().permitAll();
                                })
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .exceptionHandling(ex -> ex
                                                .authenticationEntryPoint(
                                                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                                                .accessDeniedHandler((request, response, accessDeniedException) -> {
                                                        response.setStatus(HttpStatus.FORBIDDEN.value());
                                                }))
                                // Explicitly disable all redirect mechanisms for API endpoints
                                .formLogin(form -> form.disable())
                                .httpBasic(basic -> basic.disable())
                                .logout(logout -> logout.disable())
                                .build();
        }

        @Bean
        @Order(2)
        public SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
                // Exclude /api/** from web security filter chain to prevent redirect loops
                // Only process requests that are NOT under /api/**
                RequestMatcher notApiMatcher = (HttpServletRequest request) -> {
                        String path = request.getRequestURI();
                        return !path.startsWith("/api/");
                };
                return http
                                .securityMatcher(notApiMatcher)
                                .cors(withDefaults()) // ✅ Enable CORS for web security filter chain too
                                .csrf(csrf -> csrf
                                                .ignoringRequestMatchers("/api/**"))
                                .authorizeHttpRequests(auth -> {
                                        auth.requestMatchers(
                                                        "/", "/index",
                                                        "/login", "/register",
                                                        "/public/**",
                                                        "/css/**", "/js/**", "/images/**",
                                                        "/html/**",
                                                        "/favicon.ico",
                                                        "/jwt-client.html").permitAll();
                                        auth.anyRequest().authenticated();
                                })
                                .formLogin(form -> form
                                                .loginPage("/login")
                                                .defaultSuccessUrl("/", true)
                                                .permitAll())
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/login?logout")
                                                .permitAll())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                                .build();
        }

        // ✅ 3. Add this new Bean to define your CORS settings
        // Inside SecurityConfig.java

        @Bean
        CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                // ✅ Update this list to include your Vite port (5177)
                configuration.setAllowedOrigins(List.of(
                                "http://localhost:3000",
                                "http://127.0.0.1:3000",
                                "http://localhost:5500",
                                "http://127.0.0.1:5500",
                                "http://localhost:1000",
                                "http://127.0.0.1:1000",
                                "http://localhost:5171",
                                "http://localhost:5172",
                                "http://localhost:5173",
                                "http://localhost:5174",
                                "http://localhost:5175",
                                "http://localhost:5176",
                                "http://localhost:5177" // <--- ADD THIS LINE
                ));

                configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                configuration.setAllowedHeaders(List.of("*"));
                configuration.setAllowCredentials(true);
                configuration.setMaxAge(3600L);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/api/**", configuration);
                source.registerCorsConfiguration("/login", configuration); // ✅ Also register for /login endpoint
                source.registerCorsConfiguration("/**", configuration); // ✅ Register for all paths to handle redirects

                return source;
        }
}