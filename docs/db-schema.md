# Database Schema

## users
column name       | data type | details
------------------|-----------|--------
id                | integer   | not null, primary key
username          | string    | not null, indexed, unique
email             | string    | nullable for legacy accounts, indexed, unique
email_verified_at | datetime  | nullable; set after ownership is verified
password_digest   | string    | not null
session_token     | string    | not null, indexed, unique

## email_verification_tokens
column name  | data type | details
-------------|-----------|--------
id           | bigint    | not null, primary key
user_id      | integer   | not null, foreign key, indexed, unique
token_digest | string    | not null, indexed, unique
expires_at   | datetime  | not null, indexed

## password_reset_tokens
column name  | data type | details
-------------|-----------|--------
id           | bigint    | not null, primary key
user_id      | integer   | not null, foreign key, indexed, unique
token_digest | string    | not null, indexed, unique
expires_at   | datetime  | not null, indexed

## posts
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
title       | string    |
url         | text      |
body        | text      | not null
author_id   | integer   | not null, foreign key, indexed

## comments
column name | data type | details
------------|-----------|--------
id          | bigint    | not null, primary key
body        | text      | nullable for deleted placeholders
user_id     | integer   | nullable for anonymous placeholders, foreign key, indexed
post_id     | integer   | not null, foreign key
parent_id   | bigint    | nullable self-referencing foreign key; null for top-level comments
deleted_at  | datetime  | nullable deletion marker
created_at  | datetime  | not null
updated_at  | datetime  | not null

Multiple comments by the same user on a post are allowed. Composite indexes on
`(post_id, parent_id, created_at, id)` and `(parent_id, created_at, id)` support
thread collections with deterministic ordering. Foreign keys currently restrict
deletion of referenced records; they do not cascade through reply threads.
Phase 1-2 adds active-comment validation and reply rules. Phase 1-3 adds
transactional user/post/comment deletion and anonymous placeholder handling.
Nullable storage alone does not implement that lifecycle.

## tags
column name | data type | details
------------|-----------|--------
id          | bigint    | not null, primary key
name        | string    | not null, indexed, unique

## post_tags
column name | data type | details
------------|-----------|--------
id          | bigint    | not null, primary key
post_id     | integer   | not null, foreign key, indexed, cascades on post deletion
tag_id      | bigint    | not null, foreign key, indexed, cascades on tag deletion

Each post/tag pair is unique. The database removes the corresponding join rows
when a post or tag is deleted. Tags may be shared by many posts, and unused tag
rows are intentionally retained in this version for future reuse.

## follows
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
follower_id | integer   | not null, foreign key, indexed
followee_id | integer   | not null, foreign key, indexed

## likes
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
user_id     | integer   | not null, foreign key, indexed
post_id     | integer   | not null, foreign key, indexed
