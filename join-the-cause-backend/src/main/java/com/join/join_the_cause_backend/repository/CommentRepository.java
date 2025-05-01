package com.join.join_the_cause_backend.repository;

import com.join.join_the_cause_backend.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}
