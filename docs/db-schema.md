# Database Schema

## users
column name     | data type | details
----------------|-----------|--------
id              | integer   | not null, primary key
username        | string    | not null, indexed, unique
password_digest | string    | not null
session_token   | string    | not null, indexed, unique

## posts
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
title       | string    |
url         | text      |
body        | text      | not null
likes_count | integer   | not null
author_id   | integer   | not null, foreign key, indexed

## follows
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
follower_id | integer   | not null, foreign key, indexed
followed_id | integer   | not null, foreign key, indexed

## likes
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
user_id     | integer   | not null, foreign key, indexed
post_id     | integer   | not null, foreign key, indexed

## tags
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
name        | string    | not null

## taggings
column name | data type | details
------------|-----------|--------
id          | integer   | not null, primary key
post_id     | integer   | not null, foreign key, indexed
tag_id      | integer   | not null, foreign key, indexed
