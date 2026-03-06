-- ══════════════════════════════════════
-- ATLASS Database — Seed Data
-- ══════════════════════════════════════
-- Password for all seed users: "password123" (bcrypt hash with saltRounds: 12)
-- Hash: $2b$12$LJ3m4Ks2dEVBQ1VfZ8VJHOJkZJzHv5HGbZ8K1VvZ5wR7rZ5bKZVJe

-- ─── Seed Company Users ───
INSERT INTO users (id, email, password, full_name, role) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'hiring@techglobal.com', '$2b$12$LJ3m4Ks2dEVBQ1VfZ8VJHOJkZJzHv5HGbZ8K1VvZ5wR7rZ5bKZVJe', 'TechGlobal Inc.', 'company'),
  ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'jobs@remotefirst.io', '$2b$12$LJ3m4Ks2dEVBQ1VfZ8VJHOJkZJzHv5HGbZ8K1VvZ5wR7rZ5bKZVJe', 'RemoteFirst', 'company'),
  ('a1b2c3d4-e5f6-7890-abcd-333333333333', 'talent@africadev.org', '$2b$12$LJ3m4Ks2dEVBQ1VfZ8VJHOJkZJzHv5HGbZ8K1VvZ5wR7rZ5bKZVJe', 'AfricaDev Foundation', 'company');

-- ─── Seed Developer Users ───
INSERT INTO users (id, email, password, full_name, role) VALUES
  ('b1b2c3d4-e5f6-7890-abcd-444444444444', 'youssef@example.com', '$2b$12$LJ3m4Ks2dEVBQ1VfZ8VJHOJkZJzHv5HGbZ8K1VvZ5wR7rZ5bKZVJe', 'Youssef El Amrani', 'developer'),
  ('b1b2c3d4-e5f6-7890-abcd-555555555555', 'amina@example.com', '$2b$12$LJ3m4Ks2dEVBQ1VfZ8VJHOJkZJzHv5HGbZ8K1VvZ5wR7rZ5bKZVJe', 'Amina Diallo', 'developer');

-- ─── Seed Developer Profiles ───
INSERT INTO developer_profiles (id, user_id, bio, skills, experience_years, location, available_for_remote, github_url) VALUES
  ('c1c2c3c4-e5f6-7890-abcd-666666666666', 'b1b2c3d4-e5f6-7890-abcd-444444444444',
   'Full-stack developer from Casablanca with a passion for building scalable web applications. Experienced in React, Node.js, and cloud infrastructure.',
   ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
   5, 'Casablanca, Morocco', true, 'https://github.com/youssef-dev'),
  ('c1c2c3c4-e5f6-7890-abcd-777777777777', 'b1b2c3d4-e5f6-7890-abcd-555555555555',
   'Backend engineer from Dakar specializing in Python and data engineering. I love building data pipelines and APIs that scale.',
   ARRAY['Python', 'Django', 'PostgreSQL', 'Redis', 'Kubernetes', 'Apache Kafka'],
   4, 'Dakar, Senegal', true, 'https://github.com/amina-dev');

-- ─── Seed Jobs ───
INSERT INTO jobs (id, company_id, title, description, required_skills, location, is_remote, salary_min, salary_max, currency, status) VALUES
  ('d1d2d3d4-e5f6-7890-abcd-888888888888', 'a1b2c3d4-e5f6-7890-abcd-111111111111',
   'Senior Full-Stack Engineer',
   'We are looking for a senior full-stack engineer to join our global team. You will work on our core platform serving millions of users. We value clean code, testing, and continuous delivery. Experience with React and Node.js is a must.',
   ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker'],
   'Remote (Worldwide)', true, 80000, 120000, 'USD', 'open'),

  ('d1d2d3d4-e5f6-7890-abcd-999999999999', 'a1b2c3d4-e5f6-7890-abcd-222222222222',
   'Backend Python Developer',
   'Join our remote-first company to build robust backend services. You will design APIs, manage databases, and build data pipelines. Strong Python and SQL skills required.',
   ARRAY['Python', 'Django', 'PostgreSQL', 'Redis', 'REST API'],
   'Remote (Africa Preferred)', true, 60000, 90000, 'USD', 'open'),

  ('d1d2d3d4-e5f6-7890-abcd-aaaaaaaaaaaa', 'a1b2c3d4-e5f6-7890-abcd-333333333333',
   'Open Source Developer Advocate',
   'Help us grow open-source developer communities across Africa. You will create tutorials, contribute to OSS projects, and mentor junior developers. Strong communication and coding skills needed.',
   ARRAY['JavaScript', 'TypeScript', 'Git', 'Technical Writing', 'Public Speaking'],
   'Nairobi, Kenya', false, 50000, 70000, 'USD', 'open'),

  ('d1d2d3d4-e5f6-7890-abcd-bbbbbbbbbbbb', 'a1b2c3d4-e5f6-7890-abcd-111111111111',
   'DevOps Engineer',
   'We need a DevOps engineer to manage our cloud infrastructure on AWS and GCP. Experience with Terraform, Kubernetes, and CI/CD pipelines is essential.',
   ARRAY['AWS', 'Kubernetes', 'Terraform', 'Docker', 'CI/CD', 'Linux'],
   'Remote (EMEA)', true, 90000, 130000, 'USD', 'open');
