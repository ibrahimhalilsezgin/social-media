# Social Media Platform — Full Stack Development Specification

## 1. Proje Amacı

Instagram, X ve Facebook gibi modern sosyal medya platformlarının temel özelliklerini tek bir platform altında birleştiren, yüksek trafik ve yüksek kullanıcı sayısı düşünülerek tasarlanmış, ölçeklenebilir ve production-ready bir sosyal medya uygulaması geliştir.

Platformun backend tarafında **NestJS + TypeScript**, frontend tarafında **Next.js + TypeScript** kullanılacaktır.

Sistem monolithic bir uygulama olarak başlayabilir ancak mimari kesinlikle ileride microservice yapısına ayrılabilecek şekilde tasarlanmalıdır.

Amaç sadece çalışan bir MVP oluşturmak değil, gerçek dünyadaki büyük sosyal medya platformlarının kullandığı caching, distributed storage, event-driven architecture, message queue, search, realtime communication ve database partitioning gibi teknolojileri doğru yerlerde kullanarak profesyonel bir sistem oluşturmaktır.

---

# 2. Ana Teknoloji Stack

## Backend

* NestJS
* TypeScript
* REST API
* WebSocket
* Socket.IO
* JWT Authentication
* OAuth
* Passport
* Swagger
* class-validator
* class-transformer
* BullMQ
* Redis
* Kafka veya RabbitMQ
* WebRTC altyapısına uygun yapı

## Frontend

* Next.js
* TypeScript
* App Router
* React
* Server Components
* Client Components
* React Query veya TanStack Query
* Zustand
* Tailwind CSS
* WebSocket client
* Responsive design

## Veritabanları

Sistemde tek bir database kullanma.

Her veritabanını kullanım amacına göre konumlandır.

### PostgreSQL

İlişkisel ve kritik transactional veriler:

* users
* accounts
* profiles
* sessions
* permissions
* roles
* settings
* subscriptions
* reports
* moderation data

### Cassandra

Yüksek hacimli ve dağıtık sosyal medya verileri:

* posts
* feeds
* likes
* comments
* shares
* follows
* notifications
* messages
* message history
* story metadata

Cassandra tablolarını access pattern odaklı tasarla.

Geleneksel relational normalization yerine query-driven denormalization kullanılabilir.

Partition key ve clustering key tasarımına özellikle dikkat et.

### Redis

Redis'i sistemin cache ve realtime altyapısı olarak kullan.

Kullanım alanları:

* session cache
* user cache
* profile cache
* feed cache
* trending cache
* rate limiting
* online users
* typing indicators
* unread message counters
* notification counters
* temporary story data
* distributed locks
* job queues
* websocket state
* hot content cache

Redis PubSub veya Streams kullanılabilir.

### Elasticsearch veya OpenSearch

Arama sistemi için kullanılacak.

Arama özellikleri:

* kullanıcı arama
* username arama
* post arama
* hashtag arama
* mention arama
* trending search
* full text search

### Object Storage

Media dosyalarını database içerisinde tutma.

S3 compatible object storage kullan.

Örneğin:

* AWS S3
* Cloudflare R2
* MinIO

Storage yapısı:

users
posts
stories
messages
avatars
covers
videos

şeklinde ayrılmalıdır.

---

# 3. Genel Mimari

Sistemi aşağıdaki mantıksal servisler şeklinde tasarla:

Auth Service

User Service

Profile Service

Social Graph Service

Post Service

Feed Service

Story Service

Comment Service

Like Service

Media Service

Messaging Service

Notification Service

Search Service

Recommendation Service

Moderation Service

Admin Service

Analytics Service

Her servis başlangıçta aynı NestJS repository içerisinde module olarak bulunabilir.

Ancak servislerin birbirine doğrudan database bağımlılığı oluşturma.

Her domain kendi repository veya service katmanı üzerinden çalışmalıdır.

İleride gerçek microservice mimarisine geçiş mümkün olmalıdır.

---

# 4. Authentication

Modern ve güvenli authentication sistemi oluştur.

Desteklenecek yöntemler:

* email
* username
* password
* OAuth
* Google
* GitHub
* Apple

JWT access token ve refresh token sistemi kullan.

Refresh token rotation uygula.

Password:

* Argon2 veya bcrypt

ile hashlenmelidir.

Brute force saldırılarına karşı rate limiting uygula.

Login işlemlerinde:

* IP tracking
* device tracking
* session management
* refresh token revocation

özelliklerini destekle.

Kullanıcı aktif sessionlarını görebilmeli ve istediği sessionı kapatabilmelidir.

---

# 5. Kullanıcı Sistemi

Kullanıcı modeli aşağıdaki özellikleri desteklemeli:

* id
* username
* email
* passwordHash
* displayName
* avatar
* bio
* website
* verified
* privateAccount
* createdAt
* updatedAt

Kullanıcı adı unique olmalıdır.

Profil:

* takipçi sayısı
* takip edilen sayısı
* post sayısı

gibi sayaçları desteklemelidir.

Sayaçların tamamını her sorguda COUNT ile hesaplama.

Redis veya Cassandra üzerinde counter stratejisi uygula.

---

# 6. Follow Sistemi

Kullanıcılar birbirini takip edebilir.

Desteklenmesi gereken işlemler:

* follow
* unfollow
* follow request
* accept request
* reject request
* remove follower
* block
* unblock
* mute
* restrict

Private hesaplarda follow request sistemi kullanılmalıdır.

Social graph yüksek trafik düşünülerek tasarlanmalıdır.

---

# 7. Post Sistemi

Kullanıcılar post paylaşabilmeli.

Post türleri:

* text
* image
* multiple images
* video
* link
* poll

Post özellikleri:

* caption
* hashtags
* mentions
* location
* visibility
* comments enabled
* likes enabled
* createdAt
* updatedAt

Carousel post desteği olmalı.

Bir post içerisinde birden fazla media bulunabilir.

Media dosyaları Object Storage üzerinde tutulmalıdır.

Database içerisinde yalnızca metadata ve URL veya object key tutulmalıdır.

---

# 8. Feed Sistemi

Feed sistemi platformun en önemli parçalarından biri olmalıdır.

Ana feed:

* takip edilen kullanıcıların postları
* önerilen postlar
* trending içerikler

içermelidir.

Feed için Redis cache kullanılmalıdır.

Yüksek takipçi sayısına sahip kullanıcılar için fan-out stratejisini düşün.

Normal kullanıcılar için:

Fan-out on write

Celebrity veya yüksek takipçili hesaplar için:

Fan-out on read

veya hybrid feed architecture kullan.

Feed generation asynchronous olarak yapılabilir.

Kafka veya BullMQ üzerinden event üret:

PostCreated

UserFollowed

PostLiked

PostCommented

UserUnfollowed

gibi eventler oluştur.

---

# 9. Story Sistemi

Instagram Stories benzeri sistem oluştur.

Story özellikleri:

* image
* video
* text
* mention
* hashtag
* location
* music metadata
* stickers
* polls

Storyler varsayılan olarak 24 saat sonra expire olmalıdır.

Redis TTL kullan.

Story view sistemi:

* story viewer
* viewedAt
* viewer count

desteklemelidir.

Story sıralaması için kullanıcı ilişkileri ve engagement kullanılabilir.

---

# 10. Reels veya Short Video

Kısa video sistemi oluştur.

Özellikler:

* vertical video
* video thumbnail
* caption
* hashtags
* music
* likes
* comments
* shares
* views

Video upload işlemini API server üzerinden doğrudan taşıma.

Presigned URL kullan.

Video processing asynchronous yapılmalıdır.

Örneğin:

upload

↓

object storage

↓

queue

↓

video processing worker

↓

thumbnail generation

↓

multiple resolutions

↓

CDN

Media pipeline buna uygun tasarlanmalıdır.

---

# 11. Like Sistemi

Post, comment ve story için like desteği oluştur.

Like işlemleri:

* like
* unlike

olmalıdır.

Idempotent endpoint tasarla.

Aynı kullanıcının aynı içeriği iki kere like etmesi mümkün olmamalıdır.

Like count cachelenebilir.

---

# 12. Comment Sistemi

Yorum sistemi oluştur.

Özellikler:

* comment
* reply
* delete
* edit
* like
* mention

Nested comment desteği olmalı.

Çok derin recursive query yapmaktan kaçın.

Comment pagination cursor based olmalıdır.

Örneğin:

createdAt + id

üzerinden cursor pagination kullan.

---

# 13. Share Sistemi

Post paylaşma sistemi oluştur.

Kullanıcı:

* kendi profilinde paylaşabilir
* başka kullanıcıya DM ile gönderebilir
* link olarak paylaşabilir

Share counter tutulmalıdır.

---

# 14. Hashtag Sistemi

Hashtag desteği ekle.

Örneğin:

#technology

#javascript

#nestjs

#nextjs

Hashtag sayfasında:

* popular
* recent

postları göster.

Hashtag araması Elasticsearch veya OpenSearch üzerinden yapılmalıdır.

---

# 15. Mention Sistemi

Kullanıcılar:

@username

şeklinde mention edilebilmelidir.

Mention edildiğinde notification oluştur.

Örneğin:

"Ahmet seni bir gönderide etiketledi."

Notification event-driven şekilde oluşturulmalıdır.

---

# 16. Direct Message Sistemi

Gerçek zamanlı DM sistemi oluştur.

Tekli mesaj:

User A → User B

şeklinde çalışmalıdır.

Mesaj türleri:

* text
* image
* video
* audio
* file
* sticker
* GIF
* shared post
* shared profile
* reply

desteklemelidir.

---

# 17. Grup DM

Grup sohbet sistemi oluştur.

Grup özellikleri:

* group name
* group avatar
* description
* members
* admins
* moderators
* createdAt

Grup işlemleri:

* create group
* add member
* remove member
* leave group
* promote admin
* demote admin
* rename group
* change avatar
* mute group

desteklemelidir.

---

# 18. Message System

Mesajlarda:

* sent
* delivered
* read

durumları bulunmalıdır.

Ayrıca:

* typing
* online
* last seen
* message reactions
* reply
* forward
* edit
* delete

özellikleri bulunmalıdır.

Mesajlar WebSocket üzerinden realtime gönderilmelidir.

WebSocket serverları birden fazla instance olarak çalışabileceği için Redis adapter kullanılmalıdır.

---

# 19. Notification System

Notification sistemi event-driven olmalıdır.

Notification türleri:

* new follower
* follow request
* like
* comment
* reply
* mention
* message
* story mention
* group invitation
* post share

Notificationlar:

* realtime
* persistent

olmalıdır.

Redis realtime delivery için kullanılabilir.

Cassandra notification history için kullanılabilir.

---

# 20. Search

Global search sistemi oluştur.

Arama:

* users
* posts
* hashtags
* mentions

desteklemelidir.

Elasticsearch veya OpenSearch kullan.

Search sonuçlarını Redis ile cachele.

Autocomplete desteği oluştur.

---

# 21. Explore

Instagram Explore benzeri keşfet sayfası oluştur.

İçerik sıralamasında:

* engagement
* likes
* comments
* shares
* views
* freshness
* user interests
* followed accounts
* trending topics

gibi sinyaller kullanılabilir.

Başlangıçta basit scoring algoritması yeterlidir.

Sistemi ileride ML recommendation engine eklenebilecek şekilde tasarla.

---

# 22. Trending

Trending sistemi oluştur.

Trending:

* hashtags
* posts
* users
* topics

içerebilir.

Redis Sorted Sets kullanarak trend score hesaplanabilir.

Örneğin:

engagement × freshness

temelli bir scoring sistemi kullanılabilir.

---

# 23. Realtime Architecture

WebSocket veya Socket.IO kullan.

Realtime eventler:

message:new

message:read

message:delivered

user:typing

user:online

user:offline

notification:new

story:viewed

post:liked

gibi eventleri desteklemelidir.

Multiple backend instance çalışabileceği için:

NestJS WebSocket

*

Redis Adapter

kullan.

---

# 24. Queue System

Uzun süren işlemleri HTTP request içerisinde çalıştırma.

BullMQ veya Kafka kullan.

Queue örnekleri:

media-processing

video-processing

image-processing

notification

email

feed-generation

search-indexing

analytics

cleanup

moderation

gibi queue'lar oluştur.

Worker mimarisi kullanılmalıdır.

---

# 25. Media Processing

Image upload sonrası:

* resize
* compression
* WebP veya AVIF
* thumbnail

oluştur.

Video için:

* thumbnail
* transcoding
* multiple resolutions
* metadata extraction

yap.

Media CDN üzerinden servis edilmelidir.

---

# 26. Rate Limiting

API endpointlerini abuse'a karşı koru.

Özellikle:

* login
* register
* password reset
* message
* post creation
* comment
* follow
* search

endpointlerinde rate limiting uygula.

Redis tabanlı distributed rate limiter kullanılabilir.

---

# 27. Security

Sistemi production security standartlarına göre geliştir.

Özellikler:

* Helmet
* CORS
* CSRF protection gerektiği yerde
* input validation
* DTO validation
* SQL injection protection
* NoSQL injection protection
* XSS protection
* rate limiting
* brute force protection
* secure cookies
* refresh token rotation
* authorization guards

Her endpoint authorization kontrolünden geçmelidir.

IDOR açıklarına karşı özellikle dikkat et.

Kullanıcının başka kullanıcıya ait kaynaklara erişmesi engellenmelidir.

---

# 28. API Tasarımı

REST API düzenli ve versioned olmalıdır.

Örnek:

/api/v1/auth

/api/v1/users

/api/v1/profiles

/api/v1/posts

/api/v1/stories

/api/v1/comments

/api/v1/follows

/api/v1/messages

/api/v1/groups

/api/v1/notifications

/api/v1/search

/api/v1/explore

şeklinde organize et.

Swagger documentation oluştur.

---

# 29. Pagination

Offset pagination yerine mümkün olduğunca cursor based pagination kullan.

Örneğin:

GET /posts?cursor=xxx&limit=20

Cursor pagination:

* feed
* posts
* comments
* followers
* following
* messages
* notifications

için kullanılmalıdır.

---

# 30. Frontend

Next.js App Router kullan.

Sayfalar:

/

explore

search

notifications

messages

profile/[username]

post/[id]

story/[id]

settings

login

register

oluştur.

Responsive tasarım:

* mobile
* tablet
* desktop

desteklemelidir.

---

# 31. Ana Feed UI

Instagram benzeri modern feed tasarla.

Feed card içerisinde:

* avatar
* username
* verified badge
* media
* like
* comment
* share
* bookmark
* caption
* hashtags
* comments
* timestamp

göster.

Infinite scrolling kullan.

Optimistic UI uygula.

Like işlemlerinde kullanıcı server response beklememelidir.

---

# 32. Messaging UI

Modern realtime chat interface oluştur.

Sol tarafta:

conversation list

Sağ tarafta:

active conversation

göster.

Mobile cihazlarda conversation ve chat ekranları ayrı navigation davranışı göstermelidir.

Mesaj gönderme:

* optimistic
* realtime
* retry

desteklemelidir.

---

# 33. State Management

Server state için:

TanStack Query

Client state için:

Zustand

kullan.

Global state'i gereksiz yere büyütme.

Server state ile client state'i birbirine karıştırma.

---

# 34. Cache Strategy

Cache invalidation stratejisi açıkça tanımlanmalıdır.

Örneğin:

User profile

Redis TTL

Feed

Redis TTL

Trending

Redis Sorted Set

Notifications

Redis + Cassandra

Messages

Redis realtime + Cassandra persistence

Search

OpenSearch + Redis

şeklinde tasarla.

---

# 35. Event Driven Architecture

Domain event sistemi oluştur.

Örnek:

UserFollowed

PostCreated

PostLiked

PostCommented

MessageSent

StoryCreated

StoryViewed

UserMentioned

gibi eventler oluştur.

Event consumerlar ilgili işlemleri bağımsız şekilde gerçekleştirmelidir.

Örneğin:

PostCreated

↓

Feed Service

Search Service

Notification Service

Analytics Service

aynı event'i tüketebilir.

---

# 36. Database Principles

Database'leri tek bir ORM altında zorla birleştirme.

Her database kendi kullanım amacına göre abstraction layer üzerinden kullanılmalı.

Cassandra için Cassandra driver veya uygun bir data access layer kullan.

PostgreSQL için Prisma veya TypeORM tercih edilebilir.

Redis için ioredis veya NestJS Redis integration kullanılabilir.

Search için OpenSearch veya Elasticsearch client kullanılabilir.

---

# 37. Observability

Production sisteminde observability bulunmalıdır.

Implement:

* structured logging
* request tracing
* metrics
* health checks
* error tracking

Health endpoints:

/health

/health/live

/health/ready

oluştur.

OpenTelemetry altyapısını eklenebilir şekilde tasarla.

---

# 38. Docker

Tüm development environment Docker Compose ile ayağa kalkabilmelidir.

Docker Compose servisleri:

* postgres
* cassandra
* redis
* opensearch
* kafka
* minio
* backend
* frontend

şeklinde olabilir.

Environment variable sistemi kullan.

Secretları source code içerisine yazma.

---

# 39. Monorepo

Projeyi monorepo olarak tasarla.

Önerilen yapı:

apps

backend

frontend

workers

packages

shared

database

types

config

ui

events

utils

şeklinde organize edilebilir.

pnpm workspace veya Turborepo kullanılabilir.

---

# 40. Önerilen Backend Yapısı

NestJS tarafında domain driven bir yapı kullan.

Örneğin:

src

modules

auth

users

profiles

posts

stories

comments

likes

follows

feed

messages

groups

notifications

search

explore

media

analytics

moderation

admin

common

database

events

queues

config

Her module kendi:

controller

service

repository

dto

entities

events

guards

interfaces

dosyalarına sahip olabilir.

---

# 41. Admin Panel

Admin panel oluştur.

Admin özellikleri:

* kullanıcı yönetimi
* post yönetimi
* report yönetimi
* ban
* suspend
* content moderation
* analytics
* system metrics
* active users
* reports
* flagged content

desteklemelidir.

Admin işlemleri audit log ile kaydedilmelidir.

---

# 42. Moderation

Kullanıcılar:

* post report
* user report
* message report
* comment report

yapabilmelidir.

Report reason:

* spam
* harassment
* violence
* sexual content
* misinformation
* impersonation
* copyright

gibi kategorilere ayrılabilir.

---

# 43. Performance

Performans kritik bir gereksinimdir.

Şunlara dikkat et:

* N+1 query
* unnecessary joins
* excessive database calls
* large payload
* unoptimized images
* missing indexes
* Redis cache miss
* Cassandra partition hotspots
* WebSocket connection scaling
* memory leaks

API response payloadlarını minimize et.

Gereksiz alanları client'a gönderme.

---

# 44. Database Indexing

PostgreSQL'de sorgulanan alanlara uygun indexler oluştur.

Cassandra'da secondary index kullanımını minimumda tut.

Cassandra tablolarını doğrudan sorgu patternlerine göre tasarla.

Örneğin:

user_id + created_at

user_id + conversation_id + created_at

hashtag + created_at

gibi partition stratejileri oluştur.

---

# 45. API Error Handling

Global exception handling sistemi oluştur.

Standart response formatı kullan.

Örneğin:

success

data

error

message

code

timestamp

requestId

alanlarını içerebilir.

Internal error detaylarını production ortamında client'a gönderme.

---

# 46. Testing

Unit test:

* services
* repositories
* business logic

Integration test:

* database
* Redis
* queues

E2E test:

* authentication
* post
* follow
* story
* DM
* group chat

akışlarını test et.

---

# 47. CI CD

GitHub Actions veya benzeri CI sistemi için hazır yapı oluştur.

Pipeline:

lint

typecheck

unit test

integration test

build

docker build

security check

şeklinde ilerleyebilir.

---

# 48. Development Strategy

Projeyi tek seferde devasa şekilde yazma.

Aşamalı geliştir.

## Phase 1

Project infrastructure

Monorepo

Docker

NestJS

Next.js

PostgreSQL

Redis

Cassandra

Environment configuration

## Phase 2

Authentication

Users

Profiles

Sessions

## Phase 3

Follow system

Block

Mute

Private accounts

## Phase 4

Posts

Media upload

Object storage

Likes

Comments

## Phase 5

Stories

Story views

Story expiration

## Phase 6

Feed

Redis caching

Feed generation

Events

Queues

## Phase 7

Messaging

WebSocket

DM

Group chat

Typing

Read receipts

## Phase 8

Notifications

Search

Hashtags

Mentions

## Phase 9

Explore

Trending

Recommendation architecture

## Phase 10

Admin

Moderation

Reports

Analytics

## Phase 11

Performance

Caching

Database optimization

Load testing

Observability

## Phase 12

Production deployment

Docker

CI CD

CDN

Object storage

Horizontal scaling

---

# 49. Kodlama Kuralları

TypeScript strict mode kullanılmalıdır.

any kullanımını minimuma indir.

Clean Architecture ve SOLID prensiplerini uygula.

Business logic controller içerisinde bulunmamalıdır.

Controller yalnızca HTTP katmanını yönetmelidir.

Database erişimi repository veya data access layer üzerinden yapılmalıdır.

DTO validation zorunlu olmalıdır.

Magic stringlerden kaçın.

Centralized configuration kullan.

Environment variable validation oluştur.

Her önemli domain için interface ve abstraction oluştur.

---

# 50. Kritik Mimari Kural

Sistemi "Instagram klonu" olarak basit CRUD uygulaması şeklinde geliştirme.

Amaç:

**yüksek trafik altında çalışabilecek dağıtık sosyal medya platformu mimarisi oluşturmak.**

Bu nedenle:

Post → PostgreSQL'e basit INSERT

Feed → SELECT * FROM posts

Messages → PostgreSQL'de tek tablo

Notifications → PostgreSQL'de tek tablo

gibi basit yaklaşımlar kullanılmamalıdır.

Her veri tipi için doğru storage teknolojisini seç.

Özellikle:

Post ve feed → Cassandra + Redis

Messages → Cassandra + Redis + WebSocket

Sessions → Redis

Transactional data → PostgreSQL

Search → OpenSearch

Media → S3 compatible storage

Queues → Kafka veya BullMQ

Realtime → WebSocket + Redis

şeklinde düşün.

---

# 51. İlk Geliştirme Görevi

Projeye başlamadan önce herhangi bir kod yazma.

Öncelikle:

1. Sistem mimarisini çıkar.
2. Monorepo yapısını oluştur.
3. Tüm database modellerini planla.
4. Cassandra partition stratejisini oluştur.
5. Redis key naming convention oluştur.
6. Event listesini oluştur.
7. Queue listesini oluştur.
8. API endpoint listesini oluştur.
9. WebSocket event listesini oluştur.
10. Domain ilişkilerini çıkar.
11. Docker Compose altyapısını oluştur.
12. Environment configuration sistemini oluştur.
13. Authentication mimarisini planla.
14. Media storage mimarisini planla.
15. Feed algoritmasının ilk versiyonunu planla.

Bunları bir architecture documentation dosyasına kaydet.

Örneğin:

docs

architecture.md

database.md

redis.md

events.md

api.md

websocket.md

feed.md

media.md

deployment.md

roadmap.md

şeklinde dokümantasyon oluştur.

---

# 52. Agent Çalışma Protokolü

Projede çalışan AI coding agent her işlemden önce mevcut proje durumunu analiz etmelidir.

Her önemli işlemden sonra:

* yapılan değişiklikleri
* oluşturulan dosyaları
* değişen mimari kararları
* tamamlanan taskları
* kalan taskları
* karşılaşılan problemleri
* sonraki adımı

dokümante et.

Agent önce mevcut architecture ve task dosyalarını okumadan yeni mimari karar vermemelidir.

Kod yazmadan önce ilgili domain'in mevcut implementasyonunu incelemelidir.

Bir özelliği implement ederken mevcut mimariyi bozmak yerine mevcut abstractionları kullanmalıdır.

---

# 53. Definition of Done

Bir feature tamamlandı kabul edilmesi için:

* backend implementation
* frontend implementation
* database integration
* validation
* authorization
* error handling
* caching
* tests
* API documentation
* gerekli eventler
* gerekli queue işlemleri
* logging

tamamlanmış olmalıdır.

Kod sadece "çalışıyor" seviyesinde bırakılmamalıdır.

Production'a taşınabilecek kalitede olmalıdır.

---

# Son Hedef

Ortaya çıkan sistem:

Instagram + X + Facebook benzeri özellikleri bulunan;

modern,

realtime,

yüksek performanslı,

horizontal scalable,

distributed database kullanan,

event-driven,

cache-first,

WebSocket destekli,

media pipeline bulunan,

microservice mimarisine dönüştürülebilir,

production-ready

bir sosyal medya platformu olmalıdır.

Öncelik sırası:

**Correctness → Security → Scalability → Performance → Maintainability → UX**

Mimari kararları verirken gelecekte milyonlarca kullanıcıya ulaşabilecek bir sistem tasarlıyormuş gibi hareket et.
