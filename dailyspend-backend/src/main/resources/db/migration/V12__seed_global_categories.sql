-- Create unique constraints/indexes to enable ON CONFLICT resolution
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_global ON categories(name) WHERE user_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_user ON categories(name, user_id) WHERE user_id IS NOT NULL;

-- Seed categories
INSERT INTO categories (name, type, user_id, created_at)
VALUES
    ('Groceries',      'EXPENSE', NULL, NOW()),
    ('Transport',      'EXPENSE', NULL, NOW()),
    ('Utilities',      'EXPENSE', NULL, NOW()),
    ('Food',           'EXPENSE', NULL, NOW()),
    ('Dining Out',     'EXPENSE', NULL, NOW()),
    ('Entertainment',  'EXPENSE', NULL, NOW()),
    ('Healthcare',     'EXPENSE', NULL, NOW()),
    ('Education',      'EXPENSE', NULL, NOW()),
    ('Shopping',       'EXPENSE', NULL, NOW()),
    ('Rent',           'EXPENSE', NULL, NOW()),
    ('Salary',         'INCOME',  NULL, NOW()),
    ('Freelance',      'INCOME',  NULL, NOW()),
    ('Investment',     'INCOME',  NULL, NOW()),
    ('Interest',       'INCOME',  NULL, NOW())
ON CONFLICT (name) WHERE user_id IS NULL DO NOTHING;
