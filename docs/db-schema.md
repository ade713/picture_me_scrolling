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
