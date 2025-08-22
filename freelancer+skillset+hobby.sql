USE FreelanceDb
SELECT f.*, s.SkillName, h.HobbyName
        FROM Freelancer f
        LEFT JOIN Skillset s ON s.FreelancerId = f.Id
        LEFT JOIN Hobby h ON h.FreelancerId = f.Id
        ORDER BY f.Id