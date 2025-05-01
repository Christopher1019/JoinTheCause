package com.join.join_the_cause_backend.repository;

import com.join.join_the_cause_backend.model.Post;
import com.join.join_the_cause_backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE "
         + "(:search IS NULL OR :search = '' OR LOWER(p.description) LIKE LOWER(CONCAT('%', :search, '%')) "
         + " OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND "
         + "(:category IS NULL OR :category = '' OR p.category = :category) AND "
         + "(:startDate IS NULL OR p.createdAt >= :startDate) AND "
         + "(:endDate IS NULL OR p.createdAt <= :endDate)")
    List<Post> search(
        @Param("search") String search,
        @Param("category") String category,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    List<Post> findByAuthor(User user);
}
