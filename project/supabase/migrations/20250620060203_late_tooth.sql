/*
  # Sample Data for Educational Platform

  1. Sample Data
    - Insert subjects for Class 11-12
    - Insert sample topics for each subject
    - Insert sample notes and practice questions
*/

-- Insert subjects
INSERT INTO subjects (name, description, icon, color) VALUES
  ('Physics', 'Study of matter, energy, and their interactions', 'atom', '#8b5cf6'),
  ('Chemistry', 'Study of substances and their properties', 'flask-conical', '#06b6d4'),
  ('Mathematics', 'Study of numbers, shapes, and patterns', 'calculator', '#f59e0b'),
  ('Biology', 'Study of living organisms', 'dna', '#10b981'),
  ('Economics', 'Study of production, distribution, and consumption', 'trending-up', '#ef4444'),
  ('Accountancy', 'Study of financial records and transactions', 'receipt', '#6366f1'),
  ('History', 'Study of past events and civilizations', 'scroll', '#8b5a2b'),
  ('Political Science', 'Study of government and political behavior', 'landmark', '#dc2626'),
  ('Geography', 'Study of Earth and its features', 'globe', '#059669'),
  ('English', 'Study of language, literature, and communication', 'book-open', '#7c3aed'),
  ('Business Studies', 'Study of business operations and management', 'briefcase', '#ea580c'),
  ('Computer Science', 'Study of computational systems and programming', 'monitor', '#0ea5e9'),
  ('Information Technology', 'Study of computer systems and technology', 'server', '#6b7280');

-- Insert sample topics for Physics
INSERT INTO topics (subject_id, title, description, order_index)
SELECT 
  s.id,
  topic.title,
  topic.description,
  topic.order_index
FROM subjects s,
(VALUES 
  ('Kinematics', 'Study of motion without considering forces', 1),
  ('Laws of Motion', 'Newton''s laws and their applications', 2),
  ('Work, Energy and Power', 'Concepts of work, energy, and power', 3),
  ('Rotational Motion', 'Motion of objects about an axis', 4),
  ('Gravitation', 'Universal law of gravitation and its applications', 5),
  ('Thermodynamics', 'Heat, temperature, and energy transfer', 6),
  ('Waves', 'Properties and behavior of waves', 7),
  ('Electrostatics', 'Electric charges and electric fields', 8)
) AS topic(title, description, order_index)
WHERE s.name = 'Physics';

-- Insert sample topics for Chemistry
INSERT INTO topics (subject_id, title, description, order_index)
SELECT 
  s.id,
  topic.title,
  topic.description,
  topic.order_index
FROM subjects s,
(VALUES 
  ('Atomic Structure', 'Structure of atoms and electronic configuration', 1),
  ('Chemical Bonding', 'Types of chemical bonds and molecular structure', 2),
  ('States of Matter', 'Solid, liquid, and gaseous states', 3),
  ('Thermodynamics', 'Energy changes in chemical reactions', 4),
  ('Equilibrium', 'Chemical equilibrium and Le Chatelier''s principle', 5),
  ('Redox Reactions', 'Oxidation and reduction reactions', 6),
  ('Organic Chemistry', 'Study of carbon compounds', 7),
  ('Coordination Compounds', 'Complex compounds and their properties', 8)
) AS topic(title, description, order_index)
WHERE s.name = 'Chemistry';

-- Insert sample topics for Mathematics
INSERT INTO topics (subject_id, title, description, order_index)
SELECT 
  s.id,
  topic.title,
  topic.description,
  topic.order_index
FROM subjects s,
(VALUES 
  ('Sets and Functions', 'Set theory and function concepts', 1),
  ('Trigonometry', 'Trigonometric functions and identities', 2),
  ('Coordinate Geometry', 'Geometry using coordinate systems', 3),
  ('Calculus', 'Limits, derivatives, and integrals', 4),
  ('Statistics', 'Data analysis and probability', 5),
  ('Algebra', 'Algebraic expressions and equations', 6),
  ('Sequences and Series', 'Arithmetic and geometric progressions', 7),
  ('Matrices and Determinants', 'Matrix operations and determinants', 8)
) AS topic(title, description, order_index)
WHERE s.name = 'Mathematics';

-- Insert sample notes for Physics - Kinematics
INSERT INTO notes (topic_id, title, content, short_notes, note_type)
SELECT 
  t.id,
  'Introduction to Kinematics',
  'Kinematics is the branch of mechanics that describes the motion of objects without considering the forces that cause the motion. It deals with concepts like displacement, velocity, and acceleration.

Key Concepts:
1. Position: Location of an object in space
2. Displacement: Change in position
3. Velocity: Rate of change of displacement
4. Acceleration: Rate of change of velocity

Equations of Motion:
- v = u + at
- s = ut + (1/2)at²
- v² = u² + 2as

Where:
- u = initial velocity
- v = final velocity
- a = acceleration
- t = time
- s = displacement',
  'Kinematics studies motion without forces. Key equations: v=u+at, s=ut+½at², v²=u²+2as',
  'full'
FROM topics t
JOIN subjects s ON t.subject_id = s.id
WHERE s.name = 'Physics' AND t.title = 'Kinematics';

-- Insert sample practice questions
INSERT INTO practice_questions (topic_id, question, options, correct_answer, explanation, difficulty)
SELECT 
  t.id,
  'A car accelerates from rest at 2 m/s² for 10 seconds. What is its final velocity?',
  '["10 m/s", "20 m/s", "5 m/s", "15 m/s"]'::jsonb,
  1,
  'Using v = u + at, where u = 0, a = 2 m/s², t = 10s. Therefore v = 0 + 2×10 = 20 m/s',
  'easy'
FROM topics t
JOIN subjects s ON t.subject_id = s.id
WHERE s.name = 'Physics' AND t.title = 'Kinematics';

INSERT INTO practice_questions (topic_id, question, options, correct_answer, explanation, difficulty)
SELECT 
  t.id,
  'What is the SI unit of acceleration?',
  '["m/s", "m/s²", "m²/s", "s/m"]'::jsonb,
  1,
  'Acceleration is the rate of change of velocity, so its unit is (m/s)/s = m/s²',
  'easy'
FROM topics t
JOIN subjects s ON t.subject_id = s.id
WHERE s.name = 'Physics' AND t.title = 'Kinematics';