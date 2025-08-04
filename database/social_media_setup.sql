-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
-- Social features: posts, comments, likes
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    text_content VARCHAR(1000) NOT NULL,
    image_url VARCHAR(500),
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    postid INT NOT NULL,
    userid INT NOT NULL,
    comment_text VARCHAR(500) NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dt_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    b_active BIT,
    FOREIGN KEY (postid) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    postid INT NOT NULL,
    userid INT NOT NULL,
    dt_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postid) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_like (postid, userid)
);

CREATE INDEX idx_posts_userid ON posts(userid);
CREATE INDEX idx_comments_postid ON comments(postid);
CREATE INDEX idx_comments_userid ON comments(userid);
CREATE INDEX idx_likes_postid ON likes(postid);
CREATE INDEX idx_likes_userid ON likes(userid);