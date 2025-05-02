package com.join.join_the_cause_backend.dto;

import com.join.join_the_cause_backend.model.Post;
import com.join.join_the_cause_backend.model.Comment;
import com.join.join_the_cause_backend.model.User;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DTOMapper {

    public static UserDTO toUserDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setProfileImageUrl(user.getProfileImageUrl());
        dto.setBio(user.getBio());
        return dto;
    }

    public static CommentDTO toCommentDTO(Comment comment) {
        if (comment == null) return null;

        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setText(comment.getText());
        dto.setAuthor(toUserDTO(comment.getAuthor()));
        return dto;
    }

    public static PostDTO toPostDTO(Post post) {
        if (post == null) return null;

        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());
        dto.setLikes(post.getLikes());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setCategory(post.getCategory() != null ? post.getCategory().name() : null);
        dto.setImageUrl(post.getImageUrl());
        dto.setAuthor(toUserDTO(post.getAuthor()));

        if (post.getComments() != null) {
            List<CommentDTO> commentDTOs = post.getComments().stream()
                .map(DTOMapper::toCommentDTO)
                .collect(Collectors.toList());
            dto.setComments(commentDTOs);
        } else {
            dto.setComments(new ArrayList<>());
        }

        return dto;
    }

    public static List<PostDTO> toPostDTOList(List<Post> posts) {
        if (posts == null) return new ArrayList<>();
        return posts.stream()
            .map(DTOMapper::toPostDTO)
            .collect(Collectors.toList());
    }
}
