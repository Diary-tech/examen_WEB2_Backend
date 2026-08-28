INSERT INTO users (
    email,
    password_hash,
    full_name,
    role,
    is_active
)
VALUES (
    'student1@example.com',
    '$2b$10$exampleHash',
    'Student One',
    'student',
    true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    email,
    password_hash,
    full_name,
    role,
    is_active
)
VALUES (
    'student2@example.com',
    '$2b$10$exampleHash',
    'Student Two',
    'student',
    true
)
ON CONFLICT (email) DO NOTHING;



INSERT INTO courses (
    code,
    name
)
VALUES
    ('PROG2', 'Programmation Orientée Objet'),
    ('WEB2', 'Développement Web'),
    ('SYS2', 'Systèmes et Réseaux')
ON CONFLICT (code) DO NOTHING;

INSERT INTO exams (
    course_id,
    title,
    description,
    start_at,
    end_at
)
SELECT
    c.id,
    'Examen POO',
    'Examen de programmation orientée objet',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '7 days'
FROM courses c
WHERE c.code = 'PROG2'
AND NOT EXISTS (
    SELECT 1
    FROM exams e
    WHERE e.title = 'Examen POO'
);


INSERT INTO exams (
    course_id,
    title,
    description,
    start_at,
    end_at
)
SELECT
    c.id,
    'Examen Web',
    'Examen de développement Web',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '7 days'
FROM courses c
WHERE c.code = 'WEB2'
AND NOT EXISTS (
    SELECT 1
    FROM exams e
    WHERE e.title = 'Examen Web'
);


INSERT INTO exams (
    course_id,
    title,
    description,
    start_at,
    end_at
)
SELECT
    c.id,
    'Examen Réseaux',
    'Examen de systèmes et réseaux',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '8 days'
FROM courses c
WHERE c.code = 'SYS2'
AND NOT EXISTS (
    SELECT 1
    FROM exams e
    WHERE e.title = 'Examen Réseaux'
);

INSERT INTO questions (
    exam_id,
    statement,
    points,
    position
)
SELECT
    e.id,
    'Quel langage est utilisé dans ce projet ?',
    1,
    1
FROM exams e
WHERE e.title = 'Examen POO'
AND NOT EXISTS (
    SELECT 1
    FROM questions q
    WHERE q.exam_id = e.id
      AND q.position = 1
);

INSERT INTO questions (
    exam_id,
    statement,
    points,
    position
)
SELECT
    e.id,
    'Que signifie POO ?',
    2,
    2
FROM exams e
WHERE e.title = 'Examen POO'
AND NOT EXISTS (
    SELECT 1
    FROM questions q
    WHERE q.exam_id = e.id
      AND q.position = 2
);


INSERT INTO questions (
    exam_id,
    statement,
    points,
    position
)
SELECT
    e.id,
    'Que signifie HTML ?',
    2,
    1
FROM exams e
WHERE e.title = 'Examen Web'
AND NOT EXISTS (
    SELECT 1
    FROM questions q
    WHERE q.exam_id = e.id
      AND q.position = 1
);




INSERT INTO choices (
    question_id,
    label,
    position,
    is_correct
)
SELECT
    q.id,
    'TypeScript',
    1,
    true
FROM questions q
JOIN exams e ON e.id = q.exam_id
WHERE e.title = 'Examen POO'
AND q.position = 1
AND NOT EXISTS (
    SELECT 1
    FROM choices c
    WHERE c.question_id = q.id
      AND c.position = 1
);


INSERT INTO choices (
    question_id,
    label,
    position,
    is_correct
)
SELECT
    q.id,
    'HTML',
    2,
    false
FROM questions q
JOIN exams e ON e.id = q.exam_id
WHERE e.title = 'Examen POO'
AND q.position = 1
AND NOT EXISTS (
    SELECT 1
    FROM choices c
    WHERE c.question_id = q.id
      AND c.position = 2
);


INSERT INTO choices (
    question_id,
    label,
    position,
    is_correct
)
SELECT
    q.id,
    'CSS',
    3,
    false
FROM questions q
JOIN exams e ON e.id = q.exam_id
WHERE e.title = 'Examen POO'
AND q.position = 1
AND NOT EXISTS (
    SELECT 1
    FROM choices c
    WHERE c.question_id = q.id
      AND c.position = 3
);



INSERT INTO choices (
    question_id,
    label,
    position,
    is_correct
)
SELECT
    q.id,
    'Programmation Orientée Objet',
    1,
    true
FROM questions q
JOIN exams e ON e.id = q.exam_id
WHERE e.title = 'Examen POO'
AND q.position = 2
AND NOT EXISTS (
    SELECT 1
    FROM choices c
    WHERE c.question_id = q.id
      AND c.position = 1
);


INSERT INTO choices (
    question_id,
    label,
    position,
    is_correct
)
SELECT
    q.id,
    'Programmation Originale Ordinaire',
    2,
    false
FROM questions q
JOIN exams e ON e.id = q.exam_id
WHERE e.title = 'Examen POO'
AND q.position = 2
AND NOT EXISTS (
    SELECT 1
    FROM choices c
    WHERE c.question_id = q.id
      AND c.position = 2
);


INSERT INTO attempts (
    exam_id,
    student_id,
    submitted_at,
    score
)
SELECT
    e.id,
    u.id,
    NOW(),
    3
FROM exams e
JOIN users u
    ON u.email = 'student1@example.com'
WHERE e.title = 'Examen POO'
AND NOT EXISTS (
    SELECT 1
    FROM attempts a
    WHERE a.exam_id = e.id
      AND a.student_id = u.id
);

INSERT INTO answers (
    attempt_id,
    question_id,
    choice_id
)
SELECT
    a.id,
    q.id,
    c.id
FROM attempts a
JOIN users u
    ON u.id = a.student_id
JOIN exams e
    ON e.id = a.exam_id
JOIN questions q
    ON q.exam_id = e.id
JOIN choices c
    ON c.question_id = q.id
WHERE u.email = 'student1@example.com'
AND e.title = 'Examen POO'
AND q.position = 1
AND c.is_correct = true
AND NOT EXISTS (
    SELECT 1
    FROM answers ans
    WHERE ans.attempt_id = a.id
      AND ans.question_id = q.id
);


INSERT INTO answers (
    attempt_id,
    question_id,
    choice_id
)
SELECT
    a.id,
    q.id,
    c.id
FROM attempts a
JOIN users u
    ON u.id = a.student_id
JOIN exams e
    ON e.id = a.exam_id
JOIN questions q
    ON q.exam_id = e.id
JOIN choices c
    ON c.question_id = q.id
WHERE u.email = 'student1@example.com'
AND e.title = 'Examen POO'
AND q.position = 2
AND c.is_correct = true
AND NOT EXISTS (
    SELECT 1
    FROM answers ans
    WHERE ans.attempt_id = a.id
      AND ans.question_id = q.id
);