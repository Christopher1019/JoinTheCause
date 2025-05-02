package com.join.join_the_cause_backend.controller;

import com.join.join_the_cause_backend.dto.DTOMapper;
import com.join.join_the_cause_backend.dto.PostDTO;
import com.join.join_the_cause_backend.dto.UserDTO;
import com.join.join_the_cause_backend.model.Post;
import com.join.join_the_cause_backend.model.User;
import com.join.join_the_cause_backend.repository.PostRepository;
import com.join.join_the_cause_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PostRepository postRepository;


    @GetMapping("/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        UserDTO dto = DTOMapper.toUserDTO(userOpt.get());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/upload-profile")
    public ResponseEntity<?> uploadProfileImage(
        @RequestParam("email") String email,
        @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            if (imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body("No image provided");
            }
    
            String originalFilename = imageFile.getOriginalFilename().toLowerCase();
            if (originalFilename.endsWith(".gif")) {
                return ResponseEntity.badRequest().body("GIFs are not allowed");
            }
    
            String uploadDir = System.getProperty("user.dir") + "/uploads/profile-images";
            File uploadFolder = new File(uploadDir);
            if (!uploadFolder.exists()) uploadFolder.mkdirs();
    
            File dest = new File(uploadFolder, originalFilename);
            imageFile.transferTo(dest);
    
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body("User not found");
            }
    
            User user = userOpt.get();
            user.setProfileImageUrl("/uploads/profile-images/" + originalFilename);
            userRepository.save(user);
    
            return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "filename", originalFilename));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Server error");
        }
    }

    @PutMapping("/update-bio")
    public ResponseEntity<?> updateBio(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String bio = body.get("bio");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();
        user.setBio(bio);
        userRepository.save(user);

        return ResponseEntity.ok(DTOMapper.toUserDTO(user));
    }
   
    @GetMapping("/by-user")
    public ResponseEntity<List<PostDTO>> getPostsByUser(@RequestParam String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        List<Post> posts = postRepository.findByAuthor(userOpt.get());
        List<PostDTO> postDTOs = DTOMapper.toPostDTOList(posts);
        return ResponseEntity.ok(postDTOs);
    }
    
}
