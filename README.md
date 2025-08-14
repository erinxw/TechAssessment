# Freelancer Database
A simple application to manage freelancers, their skillsets, and hobbies, with archiving/unarchiving and searching functionalities.

## Features
- Create, read, update, and delete freelancer records
- Archive and unarchive freelancers
- Search freelancers by username or email

## Technologies Used
- ASP.NET Core MVC
- Dapper (Micro ORM)
- SQL Server
- C#

## Database Structure
**Freelancer**
- Id (PK)
- Username
- Email
- PhoneNum
- IsArchived (bit)

**Skillset**
- Id (PK)
- FreelancerId (FK)
- SkillName

**Hobby**
- Id (PK)
- FreelancerId (FK)
- HobbyName
