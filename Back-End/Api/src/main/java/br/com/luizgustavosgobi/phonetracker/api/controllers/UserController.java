package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.dtos.ChangePasswordDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.UserDto;
import br.com.luizgustavosgobi.phonetracker.api.dtos.responses.UserResponseDto;
import br.com.luizgustavosgobi.phonetracker.api.mappers.UserMapper;
import br.com.luizgustavosgobi.phonetracker.api.models.UserModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private UserMapper userMapper;

    @Autowired private PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Create a new system user", description = "**Required Permissions:** ROLE_ADMIN")
    public ResponseEntity<Void> createUser(@RequestBody @Valid UserDto userDto) {
        Optional<UserModel> user = userRepository.findById(userDto.id());
        if (user.isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An user with the given Id already exists");

        UserModel userModel = new UserModel();
        BeanUtils.copyProperties(userDto, userModel);

        String userPassword = userDto.name().split(" ")[0] + "_" + userDto.id();
        userModel.setPassword(passwordEncoder.encode(userPassword));

        userRepository.save(userModel);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Delete a system user", description = "**Required Permissions:** ROLE_ADMIN")
    public ResponseEntity<Void> deleteUser(@RequestParam String id) {
        userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/edit")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Update user information", description = "**Required Permissions:** ROLE_ADMIN")
    public ResponseEntity<Void> edit(@RequestBody @Valid UserDto userDto) {
        UserModel userModel = userRepository.findById(userDto.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userModel.setName(userDto.name());
        userModel.setRole(userDto.role());

        userRepository.save(userModel);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/change_password")
    @PreAuthorize("hasAnyRole('ADMIN')")
    @Operation(summary = "Change user password", description = "**Required Permissions:** ROLE_ADMIN")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid ChangePasswordDto passwordDto) {
        UserModel userModel = userRepository.findById(passwordDto.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        userModel.setPassword(passwordEncoder.encode(passwordDto.newPassword()));

        userRepository.save(userModel);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or #id = authentication.principal.username")
    @Operation(summary = "Retrieve user information by ID",
               description = "**Required Permissions:** ROLE_ADMIN, ROLE_STAFF, or own profile")
    public ResponseEntity<UserResponseDto> getUser(@PathVariable String id) {

        UserResponseDto user = userRepository.findById(id)
                .map(userMapper::toDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return ResponseEntity.ok(user);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Retrieve all system users", description = "**Required Permissions:** ROLE_ADMIN or ROLE_STAFF")
    public ResponseEntity<Page<UserResponseDto>> getAllUsers(@ParameterObject @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<UserResponseDto> accounts = userRepository.findAll(pageable)
                .map(userMapper::toDto);
        return ResponseEntity.ok(accounts);
    }
}
