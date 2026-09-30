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
post_id     | integer   | not null, foreign key, cascades on post deletion
parent_id   | bigint    | nullable self-referencing foreign key; null for top-level comments
deleted_at  | datetime  | nullable deletion marker
created_at  | datetime  | not null
updated_at  | datetime  | not null

Multiple comments by the same user on a post are allowed. Composite indexes on
`(post_id, parent_id, created_at, id)` and `(parent_id, created_at, id)` support
thread collections with deterministic ordering. Post deletion cascades to the
entire discussion. User and parent foreign keys remain restrictive so they
cannot cascade away another author's replies. `CommentDeletion` handles
childless deletion, anonymous placeholders, and last-reply cleanup;
`User#destroy` invokes that lifecycle for authored comments. Comment writes
and deletions coordinate through post locks. Active comments require body/author;
deleted placeholders require both to be absent.

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
