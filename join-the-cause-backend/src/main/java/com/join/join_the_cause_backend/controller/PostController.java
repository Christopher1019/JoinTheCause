package com.join.join_the_cause_backend.controller;

import com.join.join_the_cause_backend.model.*;
import com.join.join_the_cause_backend.repository.*;
import com.join.join_the_cause_backend.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    @Autowired private PostRepository postRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CommentRepository commentRepository;

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String category,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        try {
            LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
            LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;
            List<Post> filtered = postRepository.search(search, category, startDateTime, endDateTime);
            List<PostDTO> dtoList = DTOMapper.toPostDTOList(filtered);
            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<PostDTO> createPostJson(@RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String description = payload.get("description");
        String email = payload.get("email");
        String categoryStr = payload.get("category");

        System.out.println("==> Received POST /api/posts (JSON)");
        System.out.println("title: " + title);
        System.out.println("description: " + description);
        System.out.println("email: " + email);
        System.out.println("category: " + categoryStr);

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.out.println("❌ No user found for email: " + email);
            return ResponseEntity.badRequest().build();
        }

        Post post = new Post();
        post.setTitle(title);
        post.setDescription(description);
        post.setAuthor(userOpt.get());
        post.setLikes(0);
        post.setCreatedAt(LocalDateTime.now());

        if (categoryStr != null && !categoryStr.isBlank()) {
            try {
                post.setCategory(Category.valueOf(categoryStr));
            } catch (IllegalArgumentException e) {
                System.out.println("❌ Invalid category value: " + categoryStr);
                return ResponseEntity.badRequest().body(null);
            }
        }

        try {
            Post saved = postRepository.save(post);
            PostDTO dto = DTOMapper.toPostDTO(saved);
            System.out.println("✅ Post saved with ID: " + saved.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            System.out.println("❌ Exception while saving post:");
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) throws IOException {
        Path uploadPath = Paths.get(System.getProperty("java.io.tmpdir"), "uploads");
        Path file = uploadPath.resolve(filename);

        if (!Files.exists(file)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new UrlResource(file.toUri());
        String contentType = Files.probeContentType(file);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType != null ? contentType : "application/octet-stream"))
            .body(resource);
    }

@PostMapping(value = "/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<Post> createPostMultipart(
        @RequestParam("title") String title,
        @RequestParam("description") String description,
        @RequestParam("email") String email,
        @RequestParam("category") String categoryString,
        @RequestParam(value = "image", required = false) MultipartFile imageFile
) {
    Optional<User> userOpt = userRepository.findByEmail(email);
    if (userOpt.isEmpty()) return ResponseEntity.badRequest().build();

    Post post = new Post();
    post.setTitle(title);
    post.setDescription(description);
    post.setAuthor(userOpt.get());
    post.setLikes(0);

    try {
        post.setCategory(Category.valueOf(categoryString));
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().build();
    }

    post.setCreatedAt(LocalDateTime.now());

    if (imageFile != null && !imageFile.isEmpty()) {
        String originalFilename = Paths.get(imageFile.getOriginalFilename()).getFileName().toString();
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!List.of("jpg", "jpeg", "png").contains(extension)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File uploadFolder = new File(uploadDir);
            if (!uploadFolder.exists()) uploadFolder.mkdirs();

            File destination = new File(uploadFolder, originalFilename);

            try (InputStream in = imageFile.getInputStream();
                 OutputStream out = new FileOutputStream(destination)) {
                in.transferTo(out);
            }

            post.setImageUrl("/uploads/" + originalFilename);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    Post savedPost = postRepository.save(post);
    return ResponseEntity.ok(savedPost);
}

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(@PathVariable Long postId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        Post post = postOpt.get();
        post.setLikes(post.getLikes() + 1);
        postRepository.save(post);
        return ResponseEntity.ok(Map.of("likes", post.getLikes()));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<?> addComment(
        @PathVariable Long postId,
        @RequestBody Map<String, String> payload
    ) {
        String text = payload.get("text");
        String email = payload.get("email");

        try {
            Optional<Post> postOpt = postRepository.findById(postId);
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (postOpt.isEmpty() || userOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            Comment comment = new Comment();
            comment.setText(text);
            comment.setPost(postOpt.get());
            comment.setAuthor(userOpt.get());

            Comment savedComment = commentRepository.save(comment);
            CommentDTO commentDTO = DTOMapper.toCommentDTO(savedComment);
            return ResponseEntity.ok(commentDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
