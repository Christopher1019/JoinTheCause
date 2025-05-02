package com.join.join_the_cause_backend.dto;

public class CommentDTO {
    private Long id;
    private String text;
    private UserDTO author;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public UserDTO getAuthor() { return author; }
    public void setAuthor(UserDTO author) { this.author = author; }
}
