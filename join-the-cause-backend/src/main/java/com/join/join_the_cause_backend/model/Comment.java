package com.join.join_the_cause_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;

    @ManyToOne
    private User author;

    @ManyToOne
    @JsonIgnore // Prevent circular reference
    private Post post;

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    // Method to get just the author's email for serialization
    public String getAuthorEmail() {
        return author != null ? author.getEmail() : null;
    }

    @JsonIgnore // This method is only for internal use
    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }
}